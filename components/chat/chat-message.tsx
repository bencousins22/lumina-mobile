"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Terminal, User, Copy, Check, RotateCcw } from "lucide-react"
import { useState } from "react"
import type { Message } from "@/types/agent-zero"
import { MarkdownRenderer } from "./markdown-renderer"
import { ToolCallDisplay } from "./tool-call-display"
import { FileAttachmentPreview } from "./file-attachment-preview"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-message-agent text-foreground rounded-tl-md border border-border/50",
            isSystem && "bg-muted/50 text-muted-foreground italic",
          )}
        >
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
        </div>

        {/* Actions */}
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
          {!isUser && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="sr-only">Regenerate response</span>
            </Button>
          )}
        </div>

        {/* Timestamp */}
        <span className={cn("text-[10px] text-muted-foreground mt-0.5 px-2", isUser ? "text-right" : "text-left")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
