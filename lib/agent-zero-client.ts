// Agent Zero API Client - Complete implementation of all endpoints

import type {
  AgentZeroConfig,
  SendMessageRequest,
  SendMessageResponse,
  LogResponse,
  LogItem,
  FileGetResponse,
  APIResponse,
} from "@/types/agent-zero"

export class AgentZeroClient {
  private config: AgentZeroConfig
  private abortController: AbortController | null = null

  constructor(config: AgentZeroConfig) {
    this.config = config
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      "X-API-KEY": this.config.apiKey,
    }
  }

  // ============ Message Endpoints ============

  /**
   * POST /api_message - Send a message and get response
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${this.config.baseUrl}/api_message`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        message: request.message,
        context_id: request.context_id,
        attachments: request.attachments,
        lifetime_hours: request.lifetime_hours ?? 24,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // ============ Log Endpoints ============

  /**
   * GET/POST /api_log_get - Retrieve logs for a context
   */
  async getLogs(contextId: string, length = 100): Promise<LogResponse> {
    const response = await fetch(`${this.config.baseUrl}/api_log_get`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        context_id: contextId,
        length,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // ============ Chat Management Endpoints ============

  /**
   * POST /api_reset_chat - Reset chat but keep context alive
   */
  async resetChat(contextId: string): Promise<APIResponse<{ message: string; context_id: string }>> {
    const response = await fetch(`${this.config.baseUrl}/api_reset_chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ context_id: contextId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * POST /api_terminate_chat - Terminate and delete chat context
   */
  async terminateChat(contextId: string): Promise<APIResponse<{ message: string }>> {
    const response = await fetch(`${this.config.baseUrl}/api_terminate_chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ context_id: contextId }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // ============ File Endpoints ============

  /**
   * POST /api_files_get - Get files by paths
   */
  async getFiles(paths: string[]): Promise<FileGetResponse> {
    const response = await fetch(`${this.config.baseUrl}/api_files_get`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ paths }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // ============ SSE Streaming ============

  /**
   * Subscribe to SSE events for a context
   */
  subscribeToStream(
    contextId: string,
    callbacks: {
      onMessage: (log: LogItem) => void
      onError?: (error: Error) => void
      onClose?: () => void
    },
  ): () => void {
    this.abortController = new AbortController()

    const url = `${this.config.baseUrl}/sse/${contextId}`
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callbacks.onMessage(data)
      } catch (e) {
        console.error("Failed to parse SSE message:", e)
      }
    }

    eventSource.onerror = () => {
      callbacks.onError?.(new Error("SSE connection error"))
      eventSource.close()
      callbacks.onClose?.()
    }

    // Return cleanup function
    return () => {
      eventSource.close()
      this.abortController?.abort()
      callbacks.onClose?.()
    }
  }

  /**
   * Poll for log updates (fallback for SSE)
   */
  async pollLogs(
    contextId: string,
    lastKnownCount: number,
    callbacks: {
      onNewLogs: (logs: LogItem[]) => void
      onError?: (error: Error) => void
    },
  ): Promise<{ totalItems: number; newLogs: LogItem[] }> {
    try {
      const response = await this.getLogs(contextId, 50)
      const newLogs = response.log.items.filter((_, i) => i >= lastKnownCount)

      if (newLogs.length > 0) {
        callbacks.onNewLogs(newLogs)
      }

      return {
        totalItems: response.log.total_items,
        newLogs,
      }
    } catch (error) {
      callbacks.onError?.(error as Error)
      throw error
    }
  }

  // ============ Connection Test ============

  /**
   * Test connection to Agent Zero backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/`, {
        method: "GET",
        headers: { "X-API-KEY": this.config.apiKey },
      })
      return response.ok
    } catch {
      return false
    }
  }

  // ============ Utilities ============

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AgentZeroConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<AgentZeroConfig, "apiKey"> & { apiKey: string } {
    return {
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey ? "***" : "",
    }
  }
}

// Singleton instance with lazy initialization
let clientInstance: AgentZeroClient | null = null

export function getAgentZeroClient(): AgentZeroClient {
  if (!clientInstance) {
    const baseUrl = typeof window !== "undefined" ? localStorage.getItem("agentZero_baseUrl") : null
    const apiKey = typeof window !== "undefined" ? localStorage.getItem("agentZero_apiKey") : null

    clientInstance = new AgentZeroClient({
      baseUrl: baseUrl || process.env.NEXT_PUBLIC_AGENT_ZERO_URL || "http://localhost:50001",
      apiKey: apiKey || process.env.NEXT_PUBLIC_API_KEY || "",
    })
  }
  return clientInstance
}

export function resetAgentZeroClient() {
  clientInstance = null
}
