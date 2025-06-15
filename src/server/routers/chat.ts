import { TRPCError } from '@trpc/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { type ChatMessage, promptSchema } from '@/lib/types'
import { schema } from '../db'
import {
    generateChatColor,
    generateChatEmoji,
    generateChatTitle,
    generateMessage,
    getChatMessages,
} from '../service/chat'
import { ensureCompletionAsyncGenerator } from '../service/map-generator'
import { protectedProcedure, router } from '../trpc'

export const chatRouter = router({
    listChats: protectedProcedure
        .output(
            z.array(
                z.object({
                    id: z.string(),
                    title: z.string(),
                    createdAt: z.date(),
                    color: z.string().nullable(),
                    emoji: z.string().nullable(),
                    lastMessage: z.string().nullable(),
                }),
            ),
        )
        .query(async ({ ctx }) => {
            const chats = await ctx.db
                .select({
                    id: schema.chats.id,
                    title: schema.chats.title,
                    createdAt: schema.chats.createdAt,
                    color: schema.chats.color,
                    emoji: schema.chats.emoji,
                    lastMessage: sql<string>`(select content from message where user_id = ${ctx.user.id} and chat_id = ${schema.chats.id} order by \`index\` desc limit 1)`,
                })
                .from(schema.chats)
                .where(eq(schema.chats.userId, ctx.user.id))
                .orderBy(desc(schema.chats.createdAt))
                .catch((error) => {
                    console.error('Error fetching chats:', error)
                    throw new Error('Failed to fetch chats')
                })
            return chats
        }),

    createChat: protectedProcedure
        .input(
            z.object({
                prompt: promptSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const chatId = uuidv4()
            const createdAt = new Date()
            const chatTitle = 'New Chat'

            const model = ctx.ai.models.get(input.prompt.model) ?? ctx.ai.defaultModel
            const messageCost = model.cost

            await ctx.db.transaction(async (tx) => {
                const ins1 = tx.insert(schema.chats).values({
                    id: chatId,
                    userId: ctx.user.id,
                    title: chatTitle,
                    createdAt: new Date(),
                })

                const ins2 = tx.insert(schema.messages).values({
                    userId: ctx.user.id,
                    chatId: chatId,
                    role: 'user',
                    status: 'completed',
                    index: 0,
                    content: input.prompt.text,
                    createdAt: createdAt,
                })

                const ins3 = tx.insert(schema.messages).values({
                    userId: ctx.user.id,
                    chatId: chatId,
                    role: 'assistant',
                    status: 'generating',
                    index: 1,
                    content: '',
                    createdAt: createdAt,
                    model: model.id,
                })

                const userQuery = tx
                    .select({
                        credits: schema.user.credits,
                    })
                    .from(schema.user)
                    .where(eq(schema.user.id, ctx.user.id))

                const [user] = await Promise.all([userQuery, ins1, ins2, ins3])

                if (user[0]!.credits < messageCost) {
                    throw new TRPCError({
                        code: 'PAYMENT_REQUIRED',
                        message: 'Not enough credits to create a chat',
                    })
                }
            })

            async function handleFinish(text: string) {
                await ctx.db
                    .update(schema.messages)
                    .set({
                        content: text,
                        status: 'completed',
                    })
                    .where(
                        and(
                            eq(schema.messages.userId, ctx.user.id),
                            eq(schema.messages.chatId, chatId),
                            eq(schema.messages.index, 1),
                        ),
                    )

                await ctx.db
                    .update(schema.user)
                    .set({
                        credits: sql`${schema.user.credits} - ${messageCost}`,
                    })
                    .where(eq(schema.user.id, ctx.user.id))
            }

            async function handlePartial(text: string) {
                await ctx.db
                    .update(schema.messages)
                    .set({
                        content: text,
                    })
                    .where(
                        and(
                            eq(schema.messages.userId, ctx.user.id),
                            eq(schema.messages.chatId, chatId),
                            eq(schema.messages.index, 1),
                            eq(schema.messages.status, 'generating'),
                        ),
                    )
            }

            function updateTitle(newTitle: string) {
                return ctx.db
                    .update(schema.chats)
                    .set({ title: newTitle })
                    .where(and(eq(schema.chats.userId, ctx.user.id), eq(schema.chats.id, chatId)))
            }

            function updateColor(newColor: string) {
                return ctx.db
                    .update(schema.chats)
                    .set({ color: newColor })
                    .where(and(eq(schema.chats.userId, ctx.user.id), eq(schema.chats.id, chatId)))
            }

            function updateEmoji(newEmoji: string) {
                return ctx.db
                    .update(schema.chats)
                    .set({ emoji: newEmoji })
                    .where(and(eq(schema.chats.userId, ctx.user.id), eq(schema.chats.id, chatId)))
            }

            const sanitizedPrompt = input.prompt.text
                .replace(/[\n\r]+/g, '\\n')
                .trim()
                .slice(0, 500)

            return {
                id: chatId,
                title: chatTitle,
                titleGenerator: generateChatTitle(ctx.ai.defaultModel.instance, sanitizedPrompt).then((title) => {
                    updateTitle(title).catch((error) => {
                        console.error('Error updating chat title:', error)
                    })
                    return title
                }),
                colorGenerator: generateChatColor(ctx.ai.defaultModel.instance, sanitizedPrompt).then((color) => {
                    updateColor(color).catch((error) => {
                        console.error('Error updating chat color:', error)
                    })
                    return color
                }),
                emojiGenerator: generateChatEmoji(ctx.ai.defaultModel.instance, sanitizedPrompt).then((emoji) => {
                    updateEmoji(emoji).catch((error) => {
                        console.error('Error updating chat emoji:', error)
                    })
                    return emoji
                }),
                createdAt: createdAt,
                model: model.id,
                firstResponseGenerator: ensureCompletionAsyncGenerator(
                    generateMessage(
                        model.instance,
                        [
                            {
                                content: input.prompt.text,
                                index: 0,
                                role: 'user',
                                status: 'generating',
                                createdAt: createdAt,
                            },
                        ],
                        input.prompt.model,
                        handleFinish,
                        handlePartial,
                    ),
                ),
            }
        }),

    getChatMessages: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            return await getChatMessages(ctx.db, ctx.user.id, input.chatId)
        }),

    getMessage: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                index: z.number(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const r = await ctx.db
                .select({
                    index: schema.messages.index,
                    role: schema.messages.role,
                    status: schema.messages.status,
                    content: schema.messages.content,
                    createdAt: schema.messages.createdAt,
                    model: schema.messages.model,
                })
                .from(schema.messages)
                .where(
                    and(
                        eq(schema.messages.userId, ctx.user.id),
                        eq(schema.messages.chatId, input.chatId),
                        eq(schema.messages.index, input.index),
                    ),
                )
            return r[0] ?? null
        }),

    prompt: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                prompt: promptSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const model = ctx.ai.models.get(input.prompt.model) ?? ctx.ai.defaultModel
            const messageCost = model?.cost || 1

            const { messages, userMessageIndex, responseMessageIndex } = await ctx.db
                .transaction(async (tx) => {
                    const [messages, user] = await Promise.all([
                        getChatMessages(tx, ctx.user.id, input.chatId),
                        tx
                            .select({
                                credits: schema.user.credits,
                            })
                            .from(schema.user)
                            .where(eq(schema.user.id, ctx.user.id)),
                    ])

                    if (user[0]!.credits < messageCost * messages.length) {
                        throw new TRPCError({
                            code: 'PAYMENT_REQUIRED',
                            message: 'Not enough credits to generate a response',
                        })
                    }

                    const lastIndex = Math.max(...messages.map((msg) => msg.index), -1)
                    const userMessageIndex = lastIndex + 1
                    const responseMessageIndex = userMessageIndex + 1

                    for (const msg of messages) {
                        if (msg.status === 'generating') {
                            throw new Error('Cannot prompt while a message is being generated')
                        }
                    }

                    const insertMsg1 = tx.insert(schema.messages).values({
                        userId: ctx.user.id,
                        chatId: input.chatId,
                        role: 'user',
                        status: 'completed',
                        index: userMessageIndex,
                        content: input.prompt.text,
                        createdAt: new Date(),
                    })

                    const insertMsg2 = tx.insert(schema.messages).values({
                        userId: ctx.user.id,
                        chatId: input.chatId,
                        role: 'assistant',
                        status: 'generating',
                        index: responseMessageIndex,
                        content: '',
                        createdAt: new Date(),
                        model: model.id,
                    })

                    await Promise.all([insertMsg1, insertMsg2])

                    return {
                        messages: [
                            ...messages,
                            {
                                userId: ctx.user.id,
                                chatId: input.chatId,
                                role: 'user',
                                status: 'completed',
                                index: userMessageIndex,
                                content: input.prompt.text,
                                createdAt: new Date(),
                            },
                        ] as ChatMessage[],
                        userMessageIndex,
                        responseMessageIndex,
                    }
                })
                .catch((error) => {
                    console.error('Error in transaction:', error)
                    throw error
                })

            async function handleFinish(text: string) {
                await ctx.db
                    .update(schema.messages)
                    .set({
                        content: text,
                        status: 'completed',
                    })
                    .where(
                        and(
                            eq(schema.messages.userId, ctx.user.id),
                            eq(schema.messages.chatId, input.chatId),
                            eq(schema.messages.index, responseMessageIndex),
                        ),
                    )

                await ctx.db
                    .update(schema.user)
                    .set({
                        credits: sql`${schema.user.credits} - ${messageCost * messages.length}`,
                    })
                    .where(eq(schema.user.id, ctx.user.id))
            }

            async function handlePartial(text: string) {
                await ctx.db
                    .update(schema.messages)
                    .set({
                        content: text,
                    })
                    .where(
                        and(
                            eq(schema.messages.userId, ctx.user.id),
                            eq(schema.messages.chatId, input.chatId),
                            eq(schema.messages.index, responseMessageIndex),
                            eq(schema.messages.status, 'generating'),
                        ),
                    )
            }

            const generator = ensureCompletionAsyncGenerator(
                generateMessage(model.instance, messages, input.prompt.model, handleFinish, handlePartial),
            )

            return {
                generator,
                userMessageIndex,
                responseMessageIndex,
            }
        }),

    deleteChat: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.transaction(async (tx) => {
                await tx
                    .delete(schema.messages)
                    .where(and(eq(schema.messages.userId, ctx.user.id), eq(schema.messages.chatId, input.chatId)))

                await tx
                    .delete(schema.chats)
                    .where(and(eq(schema.chats.userId, ctx.user.id), eq(schema.chats.id, input.chatId)))
            })
        }),
})
