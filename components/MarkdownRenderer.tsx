'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { Components } from 'react-markdown'

function preprocessContent(content: string): string {
  // Convert standalone YouTube URLs to iframes
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})([^\s]*)?$/gm
  return content.replace(youtubeRegex, (_match, _p1, _p2, _p3, videoId) => {
    return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
  })
}

const components: Components = {
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      className="rounded-sm max-w-full h-auto my-6"
      loading="lazy"
    />
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-4 my-6 text-text-muted italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-overlay text-accent px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={`${className} font-mono text-sm`} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-overlay border border-border rounded-sm p-4 overflow-x-auto my-6 text-sm font-mono">
      {children}
    </pre>
  ),
  h1: ({ children }) => <h1 className="text-2xl font-light text-text-primary mt-10 mb-4 pb-2 border-b border-border">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-medium text-text-primary mt-8 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-medium text-text-primary mt-6 mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-text-muted leading-relaxed my-4">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-outside ml-6 my-4 space-y-1 text-text-muted">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside ml-6 my-4 space-y-1 text-text-muted">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  hr: () => <hr className="border-border my-8" />,
  strong: ({ children }) => <strong className="text-text-primary font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-text-muted italic">{children}</em>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-border text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border px-4 py-2 text-left text-text-primary bg-overlay font-medium">{children}</th>,
  td: ({ children }) => <td className="border border-border px-4 py-2 text-text-muted">{children}</td>,
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const processed = preprocessContent(content)

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
