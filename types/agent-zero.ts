// Agent Zero API Types - Complete type definitions for all endpoints

// ============ Core Types ============

export interface AgentZeroConfig {
  baseUrl: string
  apiKey: string
}

// ============ Message Types ============

export interface Attachment {
  filename: string
  base64: string
}

export interface SendMessageRequest {
  message: string
  context_id?: string
  attachments?: Attachment[]
  lifetime_hours?: number
}

export interface SendMessageResponse {
  response: string
  context_id: string
}

// ============ Log Types ============

export type LogType =
  | "user"
  | "agent"
  | "response"
  | "tool_call"
  | "tool_result"
  | "code_execution"
  | "system"
  | "error"
  | "warning"
  | "info"
  | "thought"
  | "reflection"
  | "delegation"

export interface LogItem {
  id: string
  type: LogType
  heading?: string
  content: string
  kvps?: Record<string, unknown>
  timestamp: string
  agent_id?: string
  agent_name?: string
  tool_name?: string
  tool_args?: Record<string, unknown>
  tool_result?: string
  code_language?: string
  code_output?: string
  streaming?: boolean
}

export interface LogResponse {
  context_id: string
  log: {
    guid: string
    total_items: number
    returned_items: number
    start_position: number
    progress: number
    items: LogItem[]
  }
}

// ============ Chat Types ============

export interface ChatContext {
  id: string
  title?: string
  created_at: string
  updated_at: string
  agent_name?: string
  project_id?: string
  message_count: number
  lifetime_hours: number
}

export interface Message {
  id: string
  role: "user" | "agent" | "system"
  content: string
  timestamp: Date
  agentId?: string
  agentName?: string
  agentLevel?: number
  toolCalls?: ToolCall[]
  codeBlocks?: CodeBlock[]
  isStreaming?: boolean
  error?: string
}

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  result?: string
  status: "pending" | "running" | "completed" | "error"
  startTime?: Date
  endTime?: Date
}

export interface CodeBlock {
  id: string
  language: string
  code: string
  output?: string
  status: "pending" | "running" | "completed" | "error"
}

// ============ Agent Types ============

export interface Agent {
  id: string
  name: string
  level: number
  parentId?: string
  status: "idle" | "thinking" | "executing" | "delegating"
  currentTask?: string
}

export interface AgentHierarchy {
  agents: Map<string, Agent>
  rootAgentId: string
  activeAgentId?: string
}

// ============ Project Types ============

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  chats: string[]
  files: ProjectFile[]
  settings: ProjectSettings
}

export interface ProjectFile {
  path: string
  name: string
  type: "file" | "directory"
  size?: number
  modified?: string
}

export interface ProjectSettings {
  model?: string
  temperature?: number
  max_tokens?: number
  system_prompt?: string
}

// ============ Memory Types ============

export interface Memory {
  id: string
  content: string
  area: "MAIN" | "FRAGMENTS" | "SOLUTIONS" | "INSTRUMENTS" | "custom"
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  similarity?: number
}

export interface MemorySearchRequest {
  query: string
  area?: string
  limit?: number
  threshold?: number
}

export interface MemorySearchResponse {
  results: Memory[]
  total: number
}

// ============ Settings Types ============

export interface ModelConfig {
  provider: string
  model: string
  api_key_env?: string
  api_base?: string
  temperature?: number
  max_tokens?: number
}

export interface AgentZeroSettings {
  // LLM Settings
  chat_model: ModelConfig
  utility_model: ModelConfig
  embedding_model: ModelConfig

  // Authentication
  auth: {
    username: string
    password: string
    api_token: string
  }

  // External Services
  mcp_servers: MCPServerConfig[]
  a2a_enabled: boolean
  a2a_url?: string

  // Agent Behavior
  agent: {
    name: string
    auto_memory: boolean
    knowledge_tool: boolean
    code_execution: boolean
    web_search: boolean
  }

  // UI Settings
  ui: {
    theme: "light" | "dark" | "system"
    code_theme: string
    show_timestamps: boolean
    show_tool_details: boolean
    compact_mode: boolean
  }
}

export interface MCPServerConfig {
  name: string
  type: "sse" | "streamable-http"
  url: string
  enabled: boolean
}

// ============ A2A Types ============

export interface A2AAgentCard {
  name: string
  description?: string
  url: string
  version?: string
  documentationUrl?: string
  capabilities: {
    streaming?: boolean
    pushNotifications?: boolean
    stateTransitionHistory?: boolean
  }
  authentication?: {
    schemes: string[]
  }
  defaultInputModes?: string[]
  defaultOutputModes?: string[]
  skills: A2ASkill[]
}

export interface A2ASkill {
  id: string
  name: string
  description?: string
  tags?: string[]
  examples?: string[]
  inputModes?: string[]
  outputModes?: string[]
}

export interface A2ATask {
  id: string
  contextId?: string
  status: A2ATaskStatus
  artifacts?: A2AArtifact[]
  history?: A2AMessage[]
}

export interface A2ATaskStatus {
  state: "submitted" | "working" | "input-required" | "completed" | "failed" | "canceled"
  message?: A2AMessage
  timestamp: string
}

export interface A2AMessage {
  role: "user" | "agent"
  parts: A2APart[]
  metadata?: Record<string, unknown>
}

export interface A2APart {
  type: "text" | "file" | "data"
  text?: string
  file?: {
    name: string
    mimeType: string
    bytes?: string
    uri?: string
  }
  data?: Record<string, unknown>
}

export interface A2AArtifact {
  name?: string
  description?: string
  parts: A2APart[]
  index?: number
  append?: boolean
  lastChunk?: boolean
}

// ============ SSE Event Types ============

export type SSEEventType =
  | "message_start"
  | "message_content"
  | "message_end"
  | "tool_start"
  | "tool_result"
  | "agent_start"
  | "agent_end"
  | "error"
  | "done"

export interface SSEEvent {
  type: SSEEventType
  data: LogItem
}

// ============ API Response Types ============

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FileGetResponse {
  [path: string]: string // path -> base64 content
}
