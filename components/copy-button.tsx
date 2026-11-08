'use client'

import { useState } from 'react'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export default function CopyButton({ value, label = 'Copy', className = 'btn-secondary' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? 'Copied' : label}
    </button>
  )
}