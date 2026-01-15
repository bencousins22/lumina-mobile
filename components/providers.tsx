"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"

// ============ Settings Context ============

interface SettingsContextType {
  baseUrl: string
  apiKey: string
  setBaseUrl: (url: string) => void
  setApiKey: (key: string) => void
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within Providers")
  }
  return context
}

// ============ Agent Context ============

interface Agent {
  id: string
  name: string
  status: "online" | "busy" | "offline" | "error"
  model: string
  level: number
  parentId?: string
  currentTask?: string
}

interface AgentContextType {
  agents: Agent[]
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  currentAgent: Agent | null
  setCurrentAgent: (agent: Agent | null) => void
  activeAgentId: string | null
  setActiveAgentId: (id: string | null) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function useAgentContext() {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error("useAgentContext must be used within Providers")
  }
  return context
}

// ============ Chat Context ============

interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  result?: string
  status: "pending" | "running" | "completed" | "error"
}

interface CodeBlock {
  id: string
  language: string
  code: string
  output?: string
}

interface Message {
  id: string
  role: "user" | "agent" | "system" | "tool"
  content: string
  timestamp: Date
  agentId?: string
  agentName?: string
  toolCalls?: ToolCall[]
  codeBlocks?: CodeBlock[]
  attachments?: { filename: string; base64: string; size?: number; type?: string }[]
  isStreaming?: boolean
  status?: "pending" | "streaming" | "complete" | "error"
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  chats: Chat[]
  currentChat: Chat | null
  setCurrentChat: (chat: Chat | null) => void
  contextId: string | null
  setContextId: (id: string | null) => void
  messages: Message[]
  setMessages: (messages: Message[]) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  clearMessages: () => void
  createChat: (title: string, projectId?: string) => Chat
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within Providers")
  }
  return context
}

// ============ UI Context ============

interface UIContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  activePanel: "chat" | "agents" | "memory" | "settings" | "projects" | "marketplace" | "agent-zero"
  setActivePanel: (panel: "chat" | "agents" | "memory" | "settings" | "projects" | "marketplace" | "agent-zero") => void
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
  showAgentHierarchy: boolean
  setShowAgentHierarchy: (show: boolean) => void
  compactMode: boolean
  setCompactMode: (compact: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function useUIContext() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error("useUIContext must be used within Providers")
  }
  return context
}

// ============ Providers Component ============

export function Providers({ children }: { children: ReactNode }) {
  // Settings state with localStorage persistence
  const [baseUrl, setBaseUrl] = useState("http://localhost:50001")
  const [apiKey, setApiKey] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark")

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("agentZero_baseUrl")
      const savedKey = localStorage.getItem("agentZero_apiKey")
      const savedTheme = localStorage.getItem("agentZero_theme") as "light" | "dark" | "system"

      if (savedUrl) setBaseUrl(savedUrl)
      if (savedKey) setApiKey(savedKey)
      if (savedTheme) setTheme(savedTheme)
    }
  }, [])

  // Persist settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agentZero_baseUrl", baseUrl)
      localStorage.setItem("agentZero_apiKey", apiKey)
      localStorage.setItem("agentZero_theme", theme)
    }
  }, [baseUrl, apiKey, theme])

  // Agent state
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "0",
      name: "Lumina",
      status: "online",
      model: "gpt-4.1",
      level: 0,
    },
  ])
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(agents[0])
  const [activeAgentId, setActiveAgentId] = useState<string | null>("0")

  const addAgent = (agent: Agent) => {
    setAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id)
      if (exists) return prev
      return [...prev, agent]
    })
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  // Chat state
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [contextId, setContextId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])

    // Also update current chat if exists
    if (currentChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChat.id
            ? { ...chat, messages: [...chat.messages, newMessage], updatedAt: new Date() }
            : chat,
        ),
      )
      setCurrentChat((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMessage], updatedAt: new Date() } : null,
      )
    }
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const clearMessages = () => {
    setMessages([])
    setContextId(null)
    setAgents([
      {
        id: "0",
        name: "Lumina",
        status: "online",
        model: "gpt-4.1",
        level: 0,
      },
    ])
    setActiveAgentId("0")
  }

  const createChat = (title: string, projectId?: string): Chat => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title,
      messages: [],
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChat(newChat)
    clearMessages()
    return newChat
  }

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<"chat" | "agents" | "memory" | "settings" | "projects" | "marketplace" | "agent-zero">("chat")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAgentHierarchy, setShowAgentHierarchy] = useState(false)
  const [compactMode, setCompactMode] = useState(false)

  // Close sidebar on panel change for mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [activePanel])

  return (
    <SettingsContext.Provider
      value={{
        baseUrl,
        apiKey,
        setBaseUrl,
        setApiKey,
        isConnected,
        setIsConnected,
        theme,
        setTheme,
      }}
    >
      <UIContext.Provider
        value={{
          isSidebarOpen,
          setIsSidebarOpen,
          activePanel,
          setActivePanel,
          isAuthenticated,
          setIsAuthenticated,
          showAgentHierarchy,
          setShowAgentHierarchy,
          compactMode,
          setCompactMode,
        }}
      >
        <AgentContext.Provider
          value={{
            agents,
            addAgent,
            updateAgent,
            currentAgent,
            setCurrentAgent,
            activeAgentId,
            setActiveAgentId,
          }}
        >
          <ChatContext.Provider
            value={{
              chats,
              currentChat,
              setCurrentChat,
              contextId,
              setContextId,
              messages,
              setMessages,
              addMessage,
              updateMessage,
              clearMessages,
              createChat,
              isStreaming,
              setIsStreaming,
              error,
              setError,
            }}
          >
            {children}
            <Toaster position="top-center" richColors />
          </ChatContext.Provider>
        </AgentContext.Provider>
      </UIContext.Provider>
    </SettingsContext.Provider>
  )
}
