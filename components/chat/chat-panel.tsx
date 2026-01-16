"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useUIContext, useSettings } from "@/components/providers"
import { useChat } from "@/hooks/use-agent-zero"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Menu, Send, StopCircle, Sparkles } from "lucide-react"
import { WelcomeScreen } from "./welcome-screen"
import { VoiceInput } from "./voice-input"
import { ChatHistory } from "./chat-history"
import { FileAttachmentButton } from "./file-attachment-button"
import { cn } from "@/lib/utils"

// --- Child Components ---

const ChatHeader = () => {
  const { setIsSidebarOpen } = useUIContext()
  const { isConnected } = useSettings()
  const { contextId } = useChat()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/70 backdrop-blur-lg z-10 safe-top">
      <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start lg:ml-0">
        <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", isConnected ? "bg-agent-online" : "bg-agent-error")} />
        <span className="font-semibold text-sm">Agent Zero</span>
        <span className="text-xs text-muted-foreground font-mono">
          {contextId ? `${contextId.slice(0, 8)}...` : "New Session"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
          <Sparkles className="h-5 w-5" />
          <span className="sr-only">AI Features</span>
        </Button>
      </div>
    </header>
  )
}

const MessageArea = () => {
  const { messages, isStreaming, sendMessage, editMessage } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
    }
  }, [messages, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <WelcomeScreen onStartChat={(prompt) => sendMessage(prompt)} />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <ChatHistory messages={messages} onEdit={editMessage} />
        {isStreaming && <TypingIndicator />}
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-center gap-3 text-muted-foreground px-4 py-3 bg-muted/30 rounded-2xl border border-border/50 animate-pulse">
    <div className="flex gap-1.5">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
    <span className="text-xs font-medium tracking-wide">Agent is typing...</span>
  </div>
)

const ChatInput = () => {
  const { isStreaming, sendMessage } = useChat()
  const stopStreaming = () => {}
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [input])

  const handleSend = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return
    sendMessage(input.trim(), attachments)
    setInput("")
    setAttachments([])
  }, [input, attachments, isStreaming, sendMessage])

  const handleFileSelect = (file: File) => {
    setAttachments((prev) => [...prev, file]);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])
  
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isStreaming

  return (
    <div className="safe-bottom border-t border-border bg-card/70 backdrop-blur-lg">
      <div className="p-4 flex items-end gap-3 max-w-4xl mx-auto">
        <FileAttachmentButton onFileSelect={handleFileSelect} />
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agent Zero..."
            className="min-h-[44px] max-h-[200px] resize-none pr-20 py-3 bg-muted/40 border-border/50 rounded-2xl focus:bg-background"
            rows={1}
          />
          <div className="absolute right-1.5 bottom-1.5 flex items-center">
             <VoiceInput onTranscript={(text) => setInput(p => p ? `${p} ${text}`: text)} />
          </div>
        </div>
        <Button
          onClick={isStreaming ? stopStreaming : handleSend}
          size="icon"
          className={cn(
            "shrink-0 h-11 w-11 rounded-xl transition-all shadow-sm",
            isStreaming
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : canSend
                ? "bg-primary hover:bg-primary/90 text-primary-foreground scale-100"
                : "bg-muted text-muted-foreground scale-95 opacity-50",
          )}
          disabled={!canSend && !isStreaming}
        >
          {isStreaming ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">{isStreaming ? "Stop Generating" : "Send Message"}</span>
        </Button>
      </div>
      <p className="text-[11px] text-center text-muted-foreground/50 pb-2 px-4 font-medium">
        Agent Zero can make mistakes. Consider checking important information.
      </p>
    </div>
  )
}

// --- Main Chat Panel Component ---

function ChatPanel() {
  return (
    <div className="h-dvh flex flex-col bg-background" role="region" aria-label="Chat Panel">
      <ChatHeader />
      <main className="flex-1 flex flex-col overflow-hidden">
        <MessageArea />
      </main>
      <ChatInput />
    </div>
  )
}

export default ChatPanel
