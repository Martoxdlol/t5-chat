import { and, desc, eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { type ChatMessage, promptSchema } from '@/lib/models'
import { schema } from '../db'
import { generateMessage, getChatMessages } from '../service/chat'
import { protectedProcedure, router } from '../trpc'

export const chatRouter = router({
    listChats: protectedProcedure
        .input(
            z.object({
                recent: z.boolean().default(false),
            }),
        )
        .output(
            z.array(
                z.object({
                    id: z.string(),
                    title: z.string(),
                    createdAt: z.date(),
                }),
            ),
        )
        .query(async ({ ctx, input }) => {
            const chats = await ctx.db
                .select({
                    id: schema.chats.id,
                    title: schema.chats.title,
                    createdAt: schema.chats.createdAt,
                })
                .from(schema.chats)
                .where(eq(schema.chats.userId, ctx.user.id))
                .orderBy(desc(schema.chats.createdAt))
                .limit(input.recent ? 10 : 5000)

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

            await ctx.db.transaction(async (tx) => {
                await tx.insert(schema.chats).values({
                    id: chatId,
                    userId: ctx.user.id,
                    title: chatTitle,
                    createdAt: new Date(),
                })

                await tx.insert(schema.messages).values({
                    userId: ctx.user.id,
                    chatId: chatId,
                    role: 'user',
                    status: 'completed',
                    index: 0,
                    content: input.prompt.text,
                    createdAt: createdAt,
                })

                await tx.insert(schema.messages).values({
                    userId: ctx.user.id,
                    chatId: chatId,
                    role: 'assistant',
                    status: 'generating',
                    index: 1,
                    content: '',
                    createdAt: createdAt,
                })
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
            }

            return {
                id: chatId,
                title: chatTitle,
                titleGenerator: Promise.resolve(chatTitle),
                createdAt: createdAt,
                firstResponseGenerator: generateMessage(
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

    prompt: protectedProcedure
        .input(
            z.object({
                chatId: z.string(),
                prompt: promptSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { messages, userMessageIndex, responseMessageIndex } = await ctx.db
                .transaction(async (tx) => {
                    const messages = await getChatMessages(tx, ctx.user.id, input.chatId)
                    const lastIndex = Math.max(...messages.map((msg) => msg.index), -1)
                    const userMessageIndex = lastIndex + 1
                    const responseMessageIndex = userMessageIndex + 1

                    for (const msg of messages) {
                        if (msg.status === 'generating') {
                            throw new Error('Cannot prompt while a message is being generated')
                        }
                    }

                    await tx.insert(schema.messages).values({
                        userId: ctx.user.id,
                        chatId: input.chatId,
                        role: 'user',
                        status: 'completed',
                        index: userMessageIndex,
                        content: input.prompt.text,
                        createdAt: new Date(),
                    })

                    await tx.insert(schema.messages).values({
                        userId: ctx.user.id,
                        chatId: input.chatId,
                        role: 'assistant',
                        status: 'generating',
                        index: responseMessageIndex,
                        content: '',
                        createdAt: new Date(),
                    })

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
            }

            return {
                generator: generateMessage(messages, input.prompt.model, handleFinish),
                userMessageIndex,
                responseMessageIndex,
            }
        }),
})
