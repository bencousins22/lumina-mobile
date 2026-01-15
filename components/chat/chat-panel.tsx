"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useUIContext, useSettings } from "@/components/providers"
import { useChat } from "@/hooks/use-agent-zero"
import { useUIStore } from "@/stores/app-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Send, Paperclip, StopCircle, Sparkles, History } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { WelcomeScreen } from "./welcome-screen"
import { VoiceInput } from "./voice-input"
import { FileAttachmentPreview } from "./file-attachment-preview"
import LegacyChatWrapper from "./legacy-chat-wrapper"
import { cn } from "@/lib/utils"

function ChatPanel() {
  const { setIsSidebarOpen } = useUIContext()
  const { isConnected } = useSettings()
  const { 
    messages, 
    isStreaming, 
    sendMessage, 
    clearMessages, 
    contextId 
  } = useChat()
  
  const [input, setInput] = useState("")
  const [showLegacy, setShowLegacy] = useState(false)
  const [attachments, setAttachments] = useState<{ filename: string; base64: string; size?: number; type?: string; file?: File }[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [input])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-slot="scroll-area-viewport"]')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages, isStreaming])

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isStreaming) return

    const files = attachments.map(a => a.file).filter((f): f is File => !!f)
    const content = input.trim()
    
    setInput("")
    setAttachments([])
    
    await sendMessage(content, files)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments = await Promise.all(
      Array.from(files).map(async (file) => {
        return new Promise<{ filename: string; base64: string; size: number; type: string; file: File }>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1]
            resolve({
              filename: file.name,
              base64,
              size: file.size,
              type: file.type,
              file
            })
          }
          reader.readAsDataURL(file)
        })
      }),
    )

    setAttachments((prev) => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (showLegacy) {
    return (
      <div className="h-full flex flex-col bg-background">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start lg:ml-0">
            <History className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm tracking-tight uppercase">Legacy Chat Interface</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLegacy(false)}
            className="text-xs h-8 px-3 rounded-full border-primary/20 hover:bg-primary/5 text-primary"
          >
            Switch to New
          </Button>
        </header>
        <div className="flex-1 overflow-hidden">
          <LegacyChatWrapper 
            projectId="default" 
            conversationId={contextId || "new"} 
            className="h-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" role="region" aria-label="Chat interface">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top" role="banner">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start lg:ml-0">
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-agent-online" : "bg-agent-error")} />
          <span className="font-medium text-sm">Agent Zero</span>
          <span className="text-xs text-muted-foreground">({contextId ? `ID: ${contextId.slice(0, 8)}` : "New Session"})</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowLegacy(true)}
            className="text-xs h-8 px-3 rounded-full text-muted-foreground hover:text-primary"
          >
            Legacy UI
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">AI features</span>
          </Button>
        </div>
      </header>

      {/* Messages area */}
      <ScrollArea ref={scrollRef} className="flex-1" scrollHideDelay={0}>
        {messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <WelcomeScreen
              onStartChat={(prompt) => sendMessage(prompt)}
            />
          </div>
        ) : (
          <div className="p-4 space-y-6 pb-12">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-3 text-muted-foreground p-4 bg-muted/20 rounded-2xl border border-border/50 animate-pulse">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs font-medium tracking-wide">Agent is typing...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-xl p-4 pb-6">
        {attachments.length > 0 && (
          <div className="max-w-3xl mx-auto mb-3">
            <FileAttachmentPreview attachments={attachments} onRemove={handleRemoveAttachment} />
          </div>
        )}
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-11 w-11 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>

          <div className="flex-1 relative group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="min-h-[44px] max-h-[200px] resize-none pr-12 py-3 bg-muted/50 border-border/50 rounded-2xl focus:bg-background transition-colors"
              rows={1}
            />
            <div className="absolute right-1.5 bottom-1.5">
              <VoiceInput 
                onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))} 
              />
            </div>
          </div>

          <Button
            onClick={isStreaming ? () => {} : handleSend}
            size="icon"
            className={cn(
              "shrink-0 h-11 w-11 rounded-xl transition-all shadow-sm",
              isStreaming
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : input.trim() || attachments.length > 0
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground scale-100"
                  : "bg-muted text-muted-foreground scale-95 opacity-50",
            )}
            disabled={(!input.trim() && attachments.length === 0) && !isStreaming}
          >
            {isStreaming ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
            <span className="sr-only">{isStreaming ? "Stop" : "Send"}</span>
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/50 mt-3 font-medium">
          Agent Zero can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}

export default ChatPanel
