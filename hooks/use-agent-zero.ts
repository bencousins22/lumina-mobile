// Custom hooks for Agent Zero API interactions

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { getAgentZeroClient, resetAgentZeroClient } from "@/lib/agent-zero-client"
import { useChatStore, useSettingsStore } from "@/stores/app-store"
import type { Message, LogItem, ToolCall } from "@/types/agent-zero"

// ============ Connection Hook ============

export function useAgentZeroConnection() {
  const { baseUrl, apiKey, setIsConnected } = useSettingsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const client = getAgentZeroClient()
      client.updateConfig({ baseUrl, apiKey })

      const isConnected = await client.testConnection()
      setIsConnected(isConnected)

      if (!isConnected) {
        setError("Failed to connect to Agent Zero")
      }

      return isConnected
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed")
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl, apiKey, setIsConnected])

  const updateConnection = useCallback((newBaseUrl: string, newApiKey: string) => {
    resetAgentZeroClient()
    useSettingsStore.getState().setConnectionSettings(newBaseUrl, newApiKey)
  }, [])

  return {
    isLoading,
    error,
    testConnection,
    updateConnection,
  }
}

// ============ Chat Hook ============

export function useChat() {
  const {
    contextId,
    messages,
    isStreaming,
    error,
    setContextId,
    addMessage,
    updateMessage,
    setMessages,
    clearMessages,
    setIsStreaming,
    setError,
    addAgent,
    setActiveAgentId,
    updateAgent,
  } = useChatStore()

  const { baseUrl, apiKey } = useSettingsStore()
  const cleanupRef = useRef<(() => void) | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Process log items into messages
  const processLogItem = useCallback(
    (log: LogItem) => {
      switch (log.type) {
        case "user":
          addMessage({
            id: log.id || crypto.randomUUID(),
            role: "user",
            content: log.content,
            timestamp: new Date(log.timestamp),
          })
          break

        case "agent":
        case "response":
          const existingMessage = messages.find((m) => m.id === log.id && m.isStreaming)

          if (existingMessage) {
            updateMessage(log.id, {
              content: log.content,
              isStreaming: log.streaming ?? false,
            })
          } else {
            addMessage({
              id: log.id || crypto.randomUUID(),
              role: "agent",
              content: log.content,
              timestamp: new Date(log.timestamp),
              agentId: log.agent_id,
              agentName: log.agent_name,
              isStreaming: log.streaming ?? false,
            })
          }

          if (log.agent_id) {
            setActiveAgentId(log.agent_id)
            addAgent({
              id: log.agent_id,
              name: log.agent_name || `Agent ${log.agent_id}`,
              level: Number.parseInt(log.agent_id) || 0,
              status: log.streaming ? "thinking" : "idle",
            })
          }
          break

        case "tool_call":
          const toolCall: ToolCall = {
            id: log.id || crypto.randomUUID(),
            name: log.tool_name || "unknown",
            args: log.tool_args || {},
            status: "running",
            startTime: new Date(log.timestamp),
          }

          // Add to last agent message
          const lastAgentMsg = [...messages].reverse().find((m) => m.role === "agent")
          if (lastAgentMsg) {
            updateMessage(lastAgentMsg.id, {
              toolCalls: [...(lastAgentMsg.toolCalls || []), toolCall],
            })
          }
          break

        case "tool_result":
          // Update tool call with result
          const agentMsg = [...messages].reverse().find((m) => m.role === "agent" && m.toolCalls?.length)
          if (agentMsg) {
            const updatedToolCalls = agentMsg.toolCalls?.map((tc) =>
              tc.name === log.tool_name
                ? {
                    ...tc,
                    result: log.tool_result || log.content,
                    status: "completed" as const,
                    endTime: new Date(log.timestamp),
                  }
                : tc,
            )
            updateMessage(agentMsg.id, { toolCalls: updatedToolCalls })
          }
          break

        case "delegation":
          if (log.agent_id) {
            addAgent({
              id: log.agent_id,
              name: log.agent_name || `Agent ${log.agent_id}`,
              level: Number.parseInt(log.agent_id) || 0,
              status: "delegating",
              currentTask: log.content,
            })
          }
          break

        case "error":
          setError(log.content)
          break
      }
    },
    [messages, addMessage, updateMessage, addAgent, setActiveAgentId, setError],
  )

  // Send message
  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!content.trim() && !attachments?.length) return

      setError(null)
      setIsStreaming(true)

      // Add user message immediately
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      }
      addMessage(userMessage)

      try {
        const client = getAgentZeroClient()
        client.updateConfig({ baseUrl, apiKey })

        // Convert attachments to base64
        const base64Attachments = attachments
          ? await Promise.all(
              attachments.map(async (file) => ({
                filename: file.name,
                base64: await fileToBase64(file),
              })),
            )
          : undefined

        const response = await client.sendMessage({
          message: content,
          context_id: contextId || undefined,
          attachments: base64Attachments,
          lifetime_hours: 24,
        })

        // Update context ID if new
        if (!contextId) {
          setContextId(response.context_id)
        }

        // Add agent response
        addMessage({
          id: crypto.randomUUID(),
          role: "agent",
          content: response.response,
          timestamp: new Date(),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message")
      } finally {
        setIsStreaming(false)
      }
    },
    [contextId, baseUrl, apiKey, addMessage, setContextId, setIsStreaming, setError],
  )

  // Start new chat
  const startNewChat = useCallback(() => {
    cleanupRef.current?.()
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    clearMessages()
    setContextId(null)
    setError(null)
  }, [clearMessages, setContextId, setError])

  // Reset current chat
  const resetChat = useCallback(async () => {
    if (!contextId) return

    try {
      const client = getAgentZeroClient()
      await client.resetChat(contextId)
      clearMessages()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset chat")
    }
  }, [contextId, clearMessages, setError])

  // Terminate chat
  const terminateChat = useCallback(async () => {
    if (!contextId) return

    try {
      const client = getAgentZeroClient()
      await client.terminateChat(contextId)
      startNewChat()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to terminate chat")
    }
  }, [contextId, startNewChat, setError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  return {
    contextId,
    messages,
    isStreaming,
    error,
    sendMessage,
    startNewChat,
    resetChat,
    terminateChat,
  }
}

// ============ Logs Hook ============

export function useLogs(contextId: string | null) {
  const { baseUrl, apiKey } = useSettingsStore()

  const fetcher = async () => {
    if (!contextId) return null

    const client = getAgentZeroClient()
    client.updateConfig({ baseUrl, apiKey })

    return client.getLogs(contextId, 100)
  }

  const { data, error, isLoading, mutate } = useSWR(contextId ? ["logs", contextId] : null, fetcher, {
    refreshInterval: 0, // Manual refresh only
  })

  return {
    logs: data?.log.items || [],
    totalItems: data?.log.total_items || 0,
    error,
    isLoading,
    refresh: mutate,
  }
}

// ============ Files Hook ============

export function useFiles() {
  const { baseUrl, apiKey } = useSettingsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFiles = useCallback(
    async (paths: string[]) => {
      setIsLoading(true)
      setError(null)

      try {
        const client = getAgentZeroClient()
        client.updateConfig({ baseUrl, apiKey })

        return await client.getFiles(paths)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to get files")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [baseUrl, apiKey],
  )

  return {
    getFiles,
    isLoading,
    error,
  }
}

// ============ Utilities ============

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
