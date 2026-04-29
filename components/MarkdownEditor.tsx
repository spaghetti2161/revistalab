'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type Props = {
  value: string
  onChange: (value: string | undefined) => void
}

export default function MarkdownEditor({ value, onChange }: Props) {
  return (
    <div data-color-mode="dark">
      <MDEditor
        value={value}
        onChange={onChange}
        height={500}
        preview="live"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
      />
    </div>
  )
}
