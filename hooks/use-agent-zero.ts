/**
 * Agent Zero Instance Manager Hook
 * 
 * Manages deployment and connection to isolated Agent Zero instances
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/hooks/use-auth"
import { useChatStore, useSettingsStore } from "@/stores/app-store"
import type { Message, LogItem, ToolCall } from "@/types/agent-zero"

export interface AgentZeroInstance {
  instanceId: string
  instanceUrl: string
  projectId: string
  region: string
  accessToken: string
  refreshToken: string
  createdAt: string
  expiresAt: string
}

export interface InstanceConfig {
  userId: string
  userEmail: string
  userName: string
}

export function useAgentZero() {
  const { user } = useAuth()
  const [instance, setInstance] = useState<AgentZeroInstance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deployInstance = useCallback(async () => {
    if (!user) {
      setError('User must be authenticated to deploy Agent Zero')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const config: InstanceConfig = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      }

      const response = await fetch('/api/deploy-agent-zero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deploy instance')
      }

      const newInstance = await response.json()
      setInstance(newInstance)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deploy instance'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const deleteInstance = useCallback(async () => {
    if (!instance) {
      setError('No instance to delete')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deploy-agent-zero?instanceId=${instance.instanceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete instance')
      }

      setInstance(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete instance'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [instance])

  const refreshInstance = useCallback(async () => {
    if (!instance) {
      setError('No instance to refresh')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      // Update instance with new token if needed
      const data = await response.json()
      setInstance(prev => prev ? { ...prev, accessToken: data.accessToken } : null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh instance'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [instance])

  // Auto-load user's instances when authenticated
  useEffect(() => {
    if (!user) return

    const loadInstances = async () => {
      try {
        const response = await fetch(`/api/deploy-agent-zero?userId=${user.id}`, {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch instances')
        }

        const data = await response.json()
        const instances = data.instances || []

        if (instances.length > 0) {
          setInstance(instances[0]) // Use the most recent instance
        }
      } catch (err) {
        console.error('Failed to load instances:', err)
      }
    }

    loadInstances()
  }, [user])

  return {
    instance,
    isLoading,
    error,
    deployInstance,
    deleteInstance,
    refreshInstance,
  }
}

// ============ Connection Hook ============

export function useAgentZeroConnection() {
  const { instance } = useAgentZero()
  const { setIsConnected } = useSettingsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testConnection = useCallback(async () => {
    if (!instance) {
      setError('No Agent Zero instance deployed')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${instance.instanceUrl}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${instance.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const isConnected = response.ok
      setIsConnected(isConnected)

      if (!isConnected) {
        setError('Failed to connect to Agent Zero instance')
      }

      return isConnected
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [instance, setIsConnected])

  return {
    isLoading,
    error,
    testConnection,
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

  const { instance } = useAgentZero()
  const cleanupRef = useRef<(() => void) | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

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
        if (!instance) {
          throw new Error('No Agent Zero instance available')
        }

        // Convert attachments to base64
        const base64Attachments = attachments
          ? await Promise.all(
              attachments.map(async (file) => ({
                filename: file.name,
                base64: await fileToBase64(file),
              })),
            )
          : undefined

        const response = await fetch(`${instance.instanceUrl}/api_message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${instance.accessToken}`,
            'Content-Type': 'application/json',
            'X-API-KEY': 'instance-api-key',
          },
          body: JSON.stringify({
            message: content,
            context_id: contextId || undefined,
            attachments: base64Attachments,
            lifetime_hours: 24,
          }),
        })

        const responseData = await response.json()

        // Update context ID if new
        if (!contextId) {
          setContextId(responseData.context_id)
        }

        // Add agent response
        addMessage({
          id: crypto.randomUUID(),
          role: "agent",
          content: responseData.response,
          timestamp: new Date(),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send message')
      } finally {
        setIsStreaming(false)
      }
    },
    [contextId, instance, addMessage, setContextId, setIsStreaming, setError],
  )

  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        updateMessage(messageId, { ...message, content: newContent, edited: true });
      }
    },
    [messages, updateMessage]
  );

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
    if (!contextId || !instance) return

    try {
      const response = await fetch(`${instance.instanceUrl}/api_reset_chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.accessToken}`,
          'Content-Type': 'application/json',
          'X-API-KEY': 'instance-api-key',
        },
        body: JSON.stringify({
          context_id: contextId,
        }),
      })
      
      clearMessages()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset chat')
    }
  }, [contextId, instance, clearMessages, setError])

  // Terminate chat
  const terminateChat = useCallback(async () => {
    if (!contextId || !instance) return

    try {
      await fetch(`${instance.instanceUrl}/api_terminate_chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instance.accessToken}`,
          'Content-Type': 'application/json',
          'X-API-KEY': 'instance-api-key',
        },
        body: JSON.stringify({
          context_id: contextId,
        }),
      })
      
      startNewChat()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to terminate chat')
    }
  }, [contextId, instance, startNewChat, setError])

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
    editMessage,
    startNewChat,
    resetChat,
    terminateChat,
  }
}

// ============ Logs Hook ============

export function useLogs(contextId: string | null) {
  const { instance } = useAgentZero()

  const fetcher = async () => {
    if (!contextId || !instance) return null

    const response = await fetch(`${instance.instanceUrl}/api_log_get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${instance.accessToken}`,
        'Content-Type': 'application/json',
        'X-API-KEY': 'instance-api-key',
      },
      body: JSON.stringify({
        context_id: contextId,
        length: 100,
      }),
    })

    return response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(contextId && instance ? ["logs", contextId] : null, fetcher, {
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
  const { instance } = useAgentZero()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getFiles = useCallback(
    async (paths: string[]) => {
      setIsLoading(true)
      setError(null)

      try {
        if (!instance) {
          throw new Error('No Agent Zero instance available')
        }

        const response = await fetch(`${instance.instanceUrl}/api_files_get`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${instance.accessToken}`,
            'Content-Type': 'application/json',
            'X-API-KEY': 'instance-api-key',
          },
          body: JSON.stringify({
            paths,
          }),
        })

        return response.json()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to get files')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [instance],
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
