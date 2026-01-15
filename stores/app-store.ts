// Global Application State Store using Zustand

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Message, Agent, ChatContext, Project, A2AAgentCard } from "@/types/agent-zero"

// ============ UI State ============

interface UIState {
  // Navigation
  activeView: "chat" | "projects" | "memory" | "agents" | "settings"
  sidebarOpen: boolean
  mobileNavVisible: boolean

  // Panels
  showAgentHierarchy: boolean
  showToolDetails: boolean

  // Modals
  settingsOpen: boolean
  projectPickerOpen: boolean

  // Actions
  setActiveView: (view: UIState["activeView"]) => void
  setSidebarOpen: (open: boolean) => void
  setMobileNavVisible: (visible: boolean) => void
  toggleAgentHierarchy: () => void
  toggleToolDetails: () => void
  setSettingsOpen: (open: boolean) => void
  setProjectPickerOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: "chat",
  sidebarOpen: false,
  mobileNavVisible: true,
  showAgentHierarchy: false,
  showToolDetails: true,
  settingsOpen: false,
  projectPickerOpen: false,

  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileNavVisible: (visible) => set({ mobileNavVisible: visible }),
  toggleAgentHierarchy: () => set((s) => ({ showAgentHierarchy: !s.showAgentHierarchy })),
  toggleToolDetails: () => set((s) => ({ showToolDetails: !s.showToolDetails })),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setProjectPickerOpen: (open) => set({ projectPickerOpen: open }),
}))

// ============ Chat State ============

interface ChatState {
  // Current chat
  contextId: string | null
  messages: Message[]
  isStreaming: boolean
  error: string | null

  // Agents
  agents: Map<string, Agent>
  activeAgentId: string | null

  // Chat history
  chatHistory: ChatContext[]

  // Actions
  setContextId: (id: string | null) => void
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void
  setIsStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void
  addAgent: (agent: Agent) => void
  setActiveAgentId: (id: string | null) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  setChatHistory: (history: ChatContext[]) => void
  addToChatHistory: (chat: ChatContext) => void
}

export const useChatStore = create<ChatState>((set) => ({
  contextId: null,
  messages: [],
  isStreaming: false,
  error: null,
  agents: new Map(),
  activeAgentId: null,
  chatHistory: [],

  setContextId: (id) => set({ contextId: id }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [], agents: new Map(), activeAgentId: null }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setError: (error) => set({ error }),
  addAgent: (agent) =>
    set((s) => {
      const newAgents = new Map(s.agents)
      newAgents.set(agent.id, agent)
      return { agents: newAgents }
    }),
  setActiveAgentId: (id) => set({ activeAgentId: id }),
  updateAgent: (id, updates) =>
    set((s) => {
      const newAgents = new Map(s.agents)
      const existing = newAgents.get(id)
      if (existing) {
        newAgents.set(id, { ...existing, ...updates })
      }
      return { agents: newAgents }
    }),
  setChatHistory: (history) => set({ chatHistory: history }),
  addToChatHistory: (chat) => set((s) => ({ chatHistory: [chat, ...s.chatHistory] })),
}))

// ============ Projects State ============

interface ProjectsState {
  projects: Project[]
  activeProjectId: string | null

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProjectId: (id: string | null) => void
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  activeProjectId: null,

  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    })),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
}))

// ============ A2A State ============

interface A2AState {
  connectedAgents: Array<{ url: string; card: A2AAgentCard }>
  activeTasks: Map<string, { agentUrl: string; taskId: string; status: string }>

  addConnectedAgent: (url: string, card: A2AAgentCard) => void
  removeConnectedAgent: (url: string) => void
  addActiveTask: (id: string, agentUrl: string, taskId: string, status: string) => void
  updateTaskStatus: (id: string, status: string) => void
  removeActiveTask: (id: string) => void
}

export const useA2AStore = create<A2AState>((set) => ({
  connectedAgents: [],
  activeTasks: new Map(),

  addConnectedAgent: (url, card) =>
    set((s) => ({
      connectedAgents: [...s.connectedAgents.filter((a) => a.url !== url), { url, card }],
    })),
  removeConnectedAgent: (url) =>
    set((s) => ({
      connectedAgents: s.connectedAgents.filter((a) => a.url !== url),
    })),
  addActiveTask: (id, agentUrl, taskId, status) =>
    set((s) => {
      const newTasks = new Map(s.activeTasks)
      newTasks.set(id, { agentUrl, taskId, status })
      return { activeTasks: newTasks }
    }),
  updateTaskStatus: (id, status) =>
    set((s) => {
      const newTasks = new Map(s.activeTasks)
      const task = newTasks.get(id)
      if (task) {
        newTasks.set(id, { ...task, status })
      }
      return { activeTasks: newTasks }
    }),
  removeActiveTask: (id) =>
    set((s) => {
      const newTasks = new Map(s.activeTasks)
      newTasks.delete(id)
      return { activeTasks: newTasks }
    }),
}))

// ============ Settings State (Persisted) ============

interface SettingsState {
  // Connection settings
  baseUrl: string
  apiKey: string
  isConnected: boolean

  // UI preferences
  theme: "light" | "dark" | "system"
  showTimestamps: boolean
  showToolDetails: boolean
  compactMode: boolean

  // A2A settings
  a2aEnabled: boolean
  a2aAgentUrl: string

  // Actions
  setConnectionSettings: (baseUrl: string, apiKey: string) => void
  setIsConnected: (connected: boolean) => void
  setTheme: (theme: SettingsState["theme"]) => void
  setShowTimestamps: (show: boolean) => void
  setShowToolDetails: (show: boolean) => void
  setCompactMode: (compact: boolean) => void
  setA2AEnabled: (enabled: boolean) => void
  setA2AAgentUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      baseUrl: process.env.NEXT_PUBLIC_AGENT_ZERO_URL || "http://localhost:50001",
      apiKey: "",
      isConnected: false,
      theme: "dark",
      showTimestamps: true,
      showToolDetails: true,
      compactMode: false,
      a2aEnabled: false,
      a2aAgentUrl: "",

      setConnectionSettings: (baseUrl, apiKey) => set({ baseUrl, apiKey }),
      setIsConnected: (connected) => set({ isConnected: connected }),
      setTheme: (theme) => set({ theme }),
      setShowTimestamps: (show) => set({ showTimestamps: show }),
      setShowToolDetails: (show) => set({ showToolDetails: show }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      setA2AEnabled: (enabled) => set({ a2aEnabled: enabled }),
      setA2AAgentUrl: (url) => set({ a2aAgentUrl: url }),
    }),
    {
      name: "agent-zero-settings",
      partialize: (state) => ({
        baseUrl: state.baseUrl,
        apiKey: state.apiKey,
        theme: state.theme,
        showTimestamps: state.showTimestamps,
        showToolDetails: state.showToolDetails,
        compactMode: state.compactMode,
        a2aEnabled: state.a2aEnabled,
        a2aAgentUrl: state.a2aAgentUrl,
      }),
    },
  ),
)
