import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

function CodeBlock(props: { code: string; lang: string }) {
    return (
        <SyntaxHighlighter PreTag='div' language={props.lang} style={dracula}>
            {props.code}
        </SyntaxHighlighter>
    )
}

const CodeBlockMemo = memo(CodeBlock)

export function RenderMarkdown(props: { code: string }) {
    return (
        <article className='markdown-styles select-text'>
            <Markdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code(props) {
                        const { children, className, ...rest } = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            <CodeBlockMemo code={String(children).replace(/\n$/, '')} lang={match[1]} />
                        ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                        )
                    },
                }}
            >
                {props.code}
            </Markdown>
        </article>
    )
}
