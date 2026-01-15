// A2A (Agent-to-Agent) Protocol Client

import type { A2AAgentCard, A2ATask, A2AMessage, A2APart } from "@/types/agent-zero"

export interface SendA2AMessageRequest {
  message: A2AMessage
  configuration?: {
    acceptedOutputModes?: string[]
    blocking?: boolean
    historyLength?: number
    pushNotificationConfig?: {
      url: string
      authentication?: {
        schemes: string[]
        credentials?: string
      }
    }
  }
  metadata?: Record<string, unknown>
}

export class A2AClient {
  private baseUrl: string
  private apiToken: string

  constructor(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl
    this.apiToken = apiToken
  }

  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiToken}`,
    }
  }

  /**
   * Discover an agent by fetching its agent card
   */
  async discoverAgent(agentUrl: string): Promise<A2AAgentCard> {
    // Try well-known location first
    let cardUrl = `${agentUrl}/.well-known/agent.json`

    try {
      const response = await fetch(cardUrl, {
        headers: this.getHeaders(),
      })

      if (response.ok) {
        return response.json()
      }
    } catch {
      // Try direct URL
      cardUrl = agentUrl
    }

    const response = await fetch(cardUrl, {
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to discover agent: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Send a message to a remote agent (JSON-RPC)
   */
  async sendMessage(agentUrl: string, request: SendA2AMessageRequest): Promise<{ task: A2ATask }> {
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "message/send",
        params: request,
        id: crypto.randomUUID(),
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "A2A message failed")
    }

    return data.result
  }

  /**
   * Stream messages from a remote agent
   */
  async *streamMessage(
    agentUrl: string,
    request: SendA2AMessageRequest,
  ): AsyncGenerator<{ task: A2ATask }, void, unknown> {
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "message/stream",
        params: request,
        id: crypto.randomUUID(),
      }),
    })

    if (!response.body) {
      throw new Error("No response body")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.result) {
              yield data.result
            }
          } catch {
            // Skip malformed data
          }
        }
      }
    }
  }

  /**
   * Get task status
   */
  async getTask(agentUrl: string, taskId: string): Promise<A2ATask> {
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tasks/get",
        params: { id: taskId },
        id: crypto.randomUUID(),
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "Failed to get task")
    }

    return data.result
  }

  /**
   * Cancel a running task
   */
  async cancelTask(agentUrl: string, taskId: string): Promise<A2ATask> {
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tasks/cancel",
        params: { id: taskId },
        id: crypto.randomUUID(),
      }),
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || "Failed to cancel task")
    }

    return data.result
  }

  /**
   * Update configuration
   */
  updateConfig(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl
    this.apiToken = apiToken
  }
}

// Helper to create a text message part
export function createTextPart(text: string): A2APart {
  return { type: "text", text }
}

// Helper to create a file message part
export function createFilePart(name: string, mimeType: string, bytes: string): A2APart {
  return {
    type: "file",
    file: { name, mimeType, bytes },
  }
}
