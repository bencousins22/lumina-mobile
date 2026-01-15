# Phase 2: AI Elements SDK v4 Integration with Shadcn

## Overview

Phase 2 focuses on integrating the AI Elements SDK v4 into Lumina, leveraging shadcn components to create a comprehensive, production-ready AI chat interface with advanced features including streaming messages, file attachments, voice input/output, markdown rendering, and code syntax highlighting.

**Timeline:** 3-4 weeks  
**Priority:** High - Core chat functionality enhancement  
**Dependencies:** Phase 1 (Complete ✅)

---

## Success Criteria

### AI Elements SDK Integration
- ✅ AI SDK v4 properly installed and configured
- ✅ shadcn UI components integrated with AI SDK
- ✅ Streaming responses working seamlessly
- ✅ Error handling and recovery mechanisms
- ✅ Type-safe integration throughout

### Chat Features
- ✅ Message persistence with Supabase
- ✅ Real-time streaming responses
- ✅ File attachments (upload, preview, download)
- ✅ Voice input (speech-to-text)
- ✅ Enhanced markdown rendering
- ✅ Code syntax highlighting with copy functionality
- ✅ Message editing and deletion
- ✅ Message search functionality

### Performance
- ✅ Streaming responses with <100ms latency
- ✅ File uploads optimized (max 10MB per file)
- ✅ Search index for fast message retrieval
- ✅ Efficient message pagination

### Testing
- ✅ Unit tests for all new components
- ✅ E2E tests for chat flows
- ✅ Integration tests for AI SDK
- ✅ 80%+ test coverage

---

## Current State Analysis

### Existing Infrastructure ✅
- Next.js 15 with App Router
- TypeScript with strict mode
- Supabase authentication
- Zustand state management
- shadcn/ui component library
- Vitest + Playwright testing

### Chat Implementation Review
**[`components/chat/chat-panel.tsx`](../components/chat/chat-panel.tsx)**
- Currently using mock responses
- Basic textarea input
- No persistence
- No file attachments (UI only)
- No voice input (UI only)
- Basic code block rendering

**[`hooks/use-agent-zero.ts`](../hooks/use-agent-zero.ts)**
- Custom API client for Agent Zero
- WebSocket support scaffolded
- Streaming infrastructure partial

**[`stores/app-store.ts`](../stores/app-store.ts)**
- Messages stored in memory only
- No persistence layer
- No search capabilities

---

## AI Elements SDK v4 Integration

### 1. Installation & Setup

#### Dependencies
```bash
# AI SDK Core
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google

# AI SDK UI (shadcn integration)
npm install @ai-sdk/react @ai-sdk/ui-utils

# Additional dependencies
npm install react-markdown remark-gfm rehype-highlight
npm install react-syntax-highlighter @types/react-syntax-highlighter
npm install @supabase/storage-js file-saver
npm install zustand immer
```

#### Environment Variables
Update [`.env.example`](../.env.example):
```env
# AI SDK Configuration
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_AI_API_KEY=your_google_key_here

# Default AI Provider
NEXT_PUBLIC_DEFAULT_AI_PROVIDER=openai
NEXT_PUBLIC_DEFAULT_MODEL=gpt-4-turbo

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.txt,.md,.doc,.docx,.jpg,.png
```

### 2. AI SDK Configuration

Create new file: `lib/ai-config.ts`
```typescript
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

export const aiProviders = {
  openai: {
    'gpt-4-turbo': openai('gpt-4-turbo'),
    'gpt-4': openai('gpt-4'),
    'gpt-3.5-turbo': openai('gpt-3.5-turbo'),
  },
  anthropic: {
    'claude-3-opus': anthropic('claude-3-opus-20240229'),
    'claude-3-sonnet': anthropic('claude-3-sonnet-20240229'),
    'claude-3-haiku': anthropic('claude-3-haiku-20240307'),
  },
  google: {
    'gemini-pro': google('models/gemini-pro'),
    'gemini-pro-vision': google('models/gemini-pro-vision'),
  },
}

export type AIProvider = keyof typeof aiProviders
export type AIModel<T extends AIProvider> = keyof typeof aiProviders[T]

export function getModelInstance(provider: AIProvider, model: string) {
  const providerModels = aiProviders[provider]
  if (!providerModels || !(model in providerModels)) {
    throw new Error(`Model ${model} not found for provider ${provider}`)
  }
  return providerModels[model as keyof typeof providerModels]
}
```

### 3. API Route for Streaming Chat

Create: `app/api/chat/route.ts`
```typescript
import { streamText, convertToCoreMessages } from 'ai'
import { getModelInstance } from '@/lib/ai-config'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, model, chatId } = await req.json()
    
    // Verify authentication
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get model instance
    const modelInstance = getModelInstance(
      provider || process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER || 'openai',
      model || process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-4-turbo'
    )

    // Stream response
    const result = await streamText({
      model: modelInstance,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      maxTokens: 2048,
      async onFinish({ text, finishReason }) {
        // Save to database
        if (chatId) {
          await supabase
            .from('messages')
            .insert({
              chat_id: chatId,
              user_id: user.id,
              role: 'assistant',
              content: text,
              finish_reason: finishReason,
              provider,
              model,
            })
        }
      },
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

---

## Database Schema (Supabase)

### SQL Migration: `supabase/migrations/002_chat_persistence.sql`

```sql
-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  tool_calls JSONB DEFAULT '[]'::jsonb,
  provider TEXT,
  model TEXT,
  finish_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', content)
  ) STORED
);

-- File attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);
CREATE INDEX idx_attachments_message_id ON attachments(message_id);

-- Row Level Security (RLS)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON chats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON chats FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their chats"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (user_id = auth.uid());

-- Attachment policies
CREATE POLICY "Users can view attachments in their chats"
  ON attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chats c ON m.chat_id = c.id
      WHERE m.id = attachments.message_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments in their chats"
  ON attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET updated_at = NOW() 
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_timestamp_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_timestamp();
```

---

## Component Architecture

### 1. Enhanced Chat Panel with AI SDK

Update `components/chat/chat-panel.tsx`:
```typescript
"use client"

import { useChat } from 'ai/react'
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { FileUpload } from './file-upload'
import { VoiceInput } from './voice-input'
import { ChatHeader } from './chat-header'
import { useAuth } from '@/hooks/use-auth'
import { useChatPersistence } from '@/hooks/use-chat-persistence'
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react'

export default function ChatPanel() {
  const { user } = useAuth()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { currentChatId, saveMessage } = useChatPersistence()
  
  const {
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    stop,
    append,
    reload,
  } = useChat({
    api: '/api/chat',
    body: {
      chatId: currentChatId,
      provider: 'openai',
      model: 'gpt-4-turbo',
    },
    onFinish: async (message) => {
      // Save to database
      if (currentChatId) {
        await saveMessage(currentChatId, message)
      }
    },
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleFileUpload = async (files: File[]) => {
    // Process and upload files
    const attachmentUrls = await uploadFiles(files)
    
    // Add message with attachments
    await append({
      role: 'user',
      content: 'I have uploaded some files',
      attachments: attachmentUrls,
    })
  }

  const handleVoiceInput = async (transcript: string) => {
    await append({
      role: 'user',
      content: transcript,
    })
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader />
      
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onEdit={async (content) => {
                // Handle edit
              }}
              onDelete={async () => {
                // Handle delete
              }}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          {error && <ErrorDisplay error={error} onRetry={reload} />}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <FileUpload onUpload={handleFileUpload} />
          
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Message Lumina..."
              className="min-h-[44px] max-h-[150px] resize-none pr-12"
            />
            <VoiceInput 
              onTranscript={handleVoiceInput}
              className="absolute right-1 bottom-1"
            />
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() && !isLoading}
            onClick={isLoading ? stop : undefined}
          >
            {isLoading ? <StopCircle /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### 2. Enhanced Message Component

Update `components/chat/chat-message.tsx`:
```typescript
"use client"

import { useState } from 'react'
import { Message } from 'ai'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MarkdownRenderer } from './markdown-renderer'
import { MessageActions } from './message-actions'
import { AttachmentPreview } from './attachment-preview'
import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  onEdit?: (content: string) => Promise<void>
  onDelete?: () => Promise<void>
  onRegenerate?: () => Promise<void>
}

export function ChatMessage({ 
  message, 
  onEdit, 
  onDelete, 
  onRegenerate 
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const isUser = message.role === 'user'

  const handleSaveEdit = async () => {
    if (onEdit) {
      await onEdit(editContent)
      setIsEditing(false)
    }
  }

  return (
    <div className={cn(
      "flex gap-3 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message content */}
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-md"
            : "bg-muted rounded-tl-md"
        )}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, i) => (
                    <AttachmentPreview key={i} attachment={attachment} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <MessageActions
          message={message}
          onEdit={() => setIsEditing(true)}
          onDelete={onDelete}
          onRegenerate={onRegenerate}
        />

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1">
          {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
```

### 3. Markdown Renderer

Create `components/chat/markdown-renderer.tsx`:
```typescript
"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from './code-block'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const code = String(children).replace(/\n$/, '')

          return !inline ? (
            <CodeBlock
              language={language}
              code={code}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        a({ children, href }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          )
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse border border-border">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return (
            <th className="border border-border px-4 py-2 bg-muted font-semibold">
              {children}
            </th>
          )
        },
        td({ children }) {
          return (
            <td className="border border-border px-4 py-2">
              {children}
            </td>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

### 4. File Upload Component

Create `components/chat/file-upload.tsx`:
```typescript
"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxSize?: number
  allowedTypes?: string[]
}

export function FileUpload({ 
  onUpload, 
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['.pdf', '.txt', '.md', '.doc', '.docx', '.jpg', '.png']
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`)
        return false
      }
      return true
    })

    setSelectedFiles(validFiles)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    setIsUploading(true)
    try {
      await onUpload(selectedFiles)
      setSelectedFiles([])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        <Paperclip className="h-5 w-5" />
        <span className="sr-only">Attach file</span>
      </Button>

      {selectedFiles.length > 0 && (
        <div className="space-y-1">
          {selectedFiles.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-sm bg-muted px-2 py-1 rounded"
            >
              <span className="flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  )
}
```

### 5. Voice Input Component

Create `components/chat/voice-input.tsx`:
```typescript
"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  className?: string
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscript(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={cn(
        "h-9 w-9",
        isListening && "text-destructive animate-pulse",
        className
      )}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isListening ? 'Stop voice input' : 'Start voice input'}
      </span>
    </Button>
  )
}
```

---

## Custom Hooks

### 1. Chat Persistence Hook

Create `hooks/use-chat-persistence.ts`:
```typescript
"use client"

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Message } from 'ai'

export function useChatPersistence() {
  const { user } = useAuth()
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const createChat = useCallback(async (title: string) => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title,
        })
        .select()
        .single()

      if (error) throw error

      setCurrentChatId(data.id)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create chat')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  const loadChat = useCallback(async (chatId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setCurrentChatId(chatId)
      return messages
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chat')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const saveMessage = useCallback(async (
    chatId: string, 
    message: Message
  ) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          role: message.role,
          content: message.content,
        })

      if (error) throw error
    } catch (e) {
      console.error('Failed to save message:', e)
    }
  }, [user, supabase])

  const searchMessages = useCallback(async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, chats(title)')
        .textSearch('search_vector', query)
        .limit(50)

      if (error) throw error
      return data
    } catch (e) {
      console.error('Search failed:', e)
      return []
    }
  }, [supabase])

  return {
    currentChatId,
    isLoading,
    error,
    createChat,
    loadChat,
    saveMessage,
    searchMessages,
  }
}
```

### 2. File Upload Hook

Create `hooks/use-file-upload.ts`:
```typescript
"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './use-auth'

export function useFileUpload() {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const uploadFile = async (file: File, messageId: string) => {
    if (!user) throw new Error('User not authenticated')

    setIsUploading(true)
    setProgress(0)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${messageId}/${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setProgress((progress.loaded / progress.total) * 100)
          }
        })

      if (uploadError) throw uploadError

      // Save attachment metadata
      const { data: attachmentData, error: dbError } = await supabase
        .from('attachments')
        .insert({
          message_id: messageId,
          user_id: user.id,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
        })
        .select()
        .single()

      if (dbError) throw dbError

      return attachmentData
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const downloadFile = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .download(storagePath)

    if (error) throw error
    return data
  }

  return {
    uploadFile,
    downloadFile,
    isUploading,
    progress,
  }
}
```

---

## Implementation Plan

### Week 1: Foundation & Setup
- [ ] Install AI SDK v4 and dependencies
- [ ] Configure AI providers (OpenAI, Anthropic, Google)
- [ ] Create Supabase database schema
- [ ] Set up storage bucket for attachments
- [ ] Create API route for streaming chat
- [ ] Write unit tests for AI config

### Week 2: Core Chat Features
- [ ] Integrate AI SDK with chat panel
- [ ] Implement message persistence
- [ ] Create enhanced message component
- [ ] Build markdown renderer with syntax highlighting
- [ ] Add message editing functionality
- [ ] Add message deletion functionality
- [ ] Write integration tests

### Week 3: Advanced Features
- [ ] Implement file upload system
- [ ] Create file attachment preview
- [ ] Build voice input component
- [ ] Add speech-to-text functionality
- [ ] Implement message search
- [ ] Create search UI component
- [ ] Write E2E tests

### Week 4: Polish & Testing
- [ ] Optimize streaming performance
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add empty states
- [ ] Complete test coverage
- [ ] Performance testing
- [ ] Documentation

---

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/hooks/use-chat-persistence.test.ts
describe('useChatPersistence', () => {
  it('creates a new chat', async () => {
    // Test chat creation
  })

  it('loads chat messages', async () => {
    // Test message loading
  })

  it('searches messages', async () => {
    // Test search functionality
  })
})
```

### Integration Tests
```typescript
// tests/integration/chat-flow.test.tsx
describe('Chat Flow', () => {
  it('sends message and receives streaming response', async () => {
    // Test full chat flow
  })

  it('uploads file and includes in message', async () => {
    // Test file attachment
  })

  it('uses voice input to send message', async () => {
    // Test voice input
  })
})
```

### E2E Tests
```typescript
// tests/e2e/chat.spec.ts
test('complete chat interaction', async ({ page }) => {
  // Login
  // Create new chat
  // Send message
  // Verify streaming response
  // Upload file
  // Search messages
  // Edit message
  // Delete message
})
```

---

## Performance Optimization

### 1. Message Virtualization
For long chat histories, implement virtual scrolling:
```bash
npm install react-window
```

### 2. Debounced Search
```typescript
import { useMemo } from 'react'
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchMessages(query)
  }, 300),
  []
)
```

### 3. Optimistic Updates
Update UI immediately before database confirmation:
```typescript
// Add message to UI
addMessage(newMessage)

// Then save to database
await saveMessage(newMessage)
```

---

## Security Considerations

### 1. File Upload Validation
- Max file size: 10MB
- Allowed file types only
- Virus scanning (optional)
- User quota limits

### 2. Content Sanitization
- Sanitize markdown to prevent XSS
- Validate message content
- Rate limiting on API endpoints

### 3. Storage Security
- Row Level Security enabled
- Signed URLs for file access
- Automatic file expiration

## Success Metrics
- Streaming response starts < 200ms
- File upload completes < 5s (for 5MB)
- Zero critical security issues
- < 5 ESLint warnings

### User Experience
- Message persistence 100% reliable
- File attachments work across devices
- Voice input accuracy > 90%
- Search relevance > 85%

---

## Migration Path

4. Switch to new implementation
5. Remove old code
-- Migrate existing in-memory messages to database
-- This would be done programmatically
  role,
  content,
---

{
  "dependencies": {
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.24",
    "@ai-sdk/anthropic": "^0.0.12",
    "@ai-sdk/google": "^0.0.10",
    "@ai-sdk/react": "^0.0.5",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "@supabase/storage-js": "^2.5.5",
    "file-saver": "^2.0.5",
    "zustand": "^4.4.7",
    "immer": "^10.0.3"
  },
  "devDependencies": {
    "@types/react-syntax-highlighter": "^15.5.11",
    "@types/file-saver": "^2.0.7"
  }
}
```

---

## Next Steps

After completing Phase 2, the application will have:
- ✅ Full AI SDK v4 integration
- ✅ Persistent chat history
- ✅ Advanced markdown rendering
- ✅ File attachment support
- ✅ Voice input capability
- ✅ Message search functionality
- ✅ Production-ready chat interface

This creates the foundation for Phase 3:
- Agent management enhancements
- Real-time agent collaboration
- Advanced memory features
- Project-specific contexts
