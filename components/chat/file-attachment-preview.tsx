"use client"

import { Button } from '@/components/ui/button'
import { X, Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileAttachment {
  filename: string
  base64: string
  size?: number
  type?: string
}

interface FileAttachmentPreviewProps {
  attachments: FileAttachment[]
  onRemove?: (index: number) => void
  readonly?: boolean
}

export function FileAttachmentPreview({ 
  attachments, 
  onRemove,
  readonly = false 
}: FileAttachmentPreviewProps) {
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (['txt', 'md', 'json', 'xml'].includes(ext || '')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const handleDownload = (attachment: FileAttachment) => {
    const blob = base64ToBlob(attachment.base64, attachment.type || 'application/octet-stream')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = attachment.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-border",
            "bg-muted/30 hover:bg-muted/50 transition-colors"
          )}
        >
          {getFileIcon(attachment.filename)}
          <span className="text-sm truncate max-w-[200px]">
            {attachment.filename}
          </span>
          {attachment.size && (
            <span className="text-xs text-muted-foreground">
              ({formatFileSize(attachment.size)})
            </span>
          )}
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDownload(attachment)}
            >
              <Download className="h-3 w-3" />
              <span className="sr-only">Download</span>
            </Button>
            
            {!readonly && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i))
  }

  return new Blob([new Uint8Array(byteArrays)], { type: mimeType })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
