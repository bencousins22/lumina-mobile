"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Terminal, User, Copy, Check, RotateCcw, Pencil, X, Save } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { Message } from "@/types/agent-zero"
import { MarkdownRenderer } from "./markdown-renderer"
import { ToolCallDisplay } from "./tool-call-display"
import { FileAttachmentPreview } from "./file-attachment-preview"

interface ChatMessageProps {
  message: Message
  onEdit: (messageId: string, newContent: string) => void
}

export function ChatMessage({ message, onEdit }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(message.content)
  }

  const handleSaveEdit = () => {
    onEdit(message.id, editedContent)
    setIsEditing(false)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${e.target.scrollHeight}px`
    }
  }

  const isUser = message.role === "user"
  const isAgent = message.role === "agent"
  const isSystem = message.role === "system"

  return (
    <div className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-primary" : "bg-muted")}>
        <AvatarFallback
          className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
        >
          {isUser ? <User className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message content */}
      <div className={cn("flex flex-col max-w-[85%] lg:max-w-[70%]", isUser ? "items-end" : "items-start")}>
        {/* Agent Name / Tool Name */}
        {isAgent && message.agentName && (
          <span className="text-xs text-muted-foreground mb-1 px-2">{message.agentName}</span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl text-sm leading-relaxed w-full",
            !isEditing && "px-4 py-3",
            isUser && !isEditing
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : !isEditing
              ? "bg-message-agent text-foreground rounded-tl-md border border-border/50"
              : "",
            isSystem && !isEditing && "bg-muted/50 text-muted-foreground italic",
          )}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                value={editedContent}
                onChange={handleTextareaChange}
                className="w-full resize-none bg-background focus-visible:ring-1 focus-visible:ring-ring"
                rows={1}
              />
              <div className={cn("flex gap-1", isUser ? "justify-end" : "justify-start")}>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4" />
                  <span className="sr-only">Save</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="markdown-content">
                <MarkdownRenderer content={message.content} />
              </div>
              
              {message.toolCalls && message.toolCalls.length > 0 && (
                <ToolCallDisplay toolCalls={message.toolCalls} />
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2">
                  <FileAttachmentPreview attachments={message.attachments} readonly />
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "flex-row-reverse" : "flex-row",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="sr-only">Copy message</span>
            </Button>
            {isUser && (
               <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleEdit}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit message</span>
              </Button>
            )}
            {!isUser && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="sr-only">Regenerate response</span>
              </Button>
            )}
          </div>
        )}

        {/* Timestamp */}
        {!isEditing && (
            <span className={cn(
                "text-[10px] text-muted-foreground mt-0.5 px-2", 
                isUser ? "text-right" : "text-left",
                message.edited && "italic"
            )}>
                {message.edited ? `(edited) ` : ''}
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
        )}
      </div>
    </div>
  )
}
