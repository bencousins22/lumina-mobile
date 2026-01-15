// A2A (Agent-to-Agent) Protocol Hooks

"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { A2AClient, createTextPart } from "@/lib/a2a-client"
import { useA2AStore, useSettingsStore } from "@/stores/app-store"
import type { A2AAgentCard, A2ATask, A2ATaskStatus } from "@/types/agent-zero"

// ============ Agent Discovery Hook ============

export function useAgentDiscovery() {
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { apiKey, a2aAgentUrl } = useSettingsStore()
  const { addConnectedAgent } = useA2AStore()

  const discoverAgent = useCallback(
    async (agentUrl: string): Promise<A2AAgentCard | null> => {
      setIsDiscovering(true)
      setError(null)

      try {
        const client = new A2AClient(a2aAgentUrl, apiKey)
        const card = await client.discoverAgent(agentUrl)

        addConnectedAgent(agentUrl, card)
        return card
      } catch (e) {
        setError(e instanceof Error ? e.message : "Discovery failed")
        return null
      } finally {
        setIsDiscovering(false)
      }
    },
    [apiKey, a2aAgentUrl, addConnectedAgent],
  )

  return {
    discoverAgent,
    isDiscovering,
    error,
  }
}

// ============ A2A Task Hook ============

export function useA2ATask(agentUrl: string | null) {
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { apiKey } = useSettingsStore()
  const { addActiveTask, updateTaskStatus, removeActiveTask } = useA2AStore()

  // Poll for task status
  const { data: taskData, mutate } = useSWR<A2ATask | null>(
    agentUrl && taskId ? ["a2a-task", agentUrl, taskId] : null,
    async () => {
      if (!agentUrl || !taskId) return null

      const client = new A2AClient(agentUrl, apiKey)
      return client.getTask(agentUrl, taskId)
    },
    {
      refreshInterval: (data) => {
        if (!data) return 1000
        const finalStates: A2ATaskStatus["state"][] = ["completed", "failed", "canceled"]
        if (finalStates.includes(data.status.state)) {
          return 0 // Stop polling
        }
        return 1000 // Poll every second
      },
    },
  )

  // Update store when task status changes
  if (taskData && taskId) {
    updateTaskStatus(taskId, taskData.status.state)
  }

  const sendMessage = useCallback(
    async (message: string, skillId?: string): Promise<A2ATask | null> => {
      if (!agentUrl) return null

      setIsLoading(true)
      setError(null)

      try {
        const client = new A2AClient(agentUrl, apiKey)
        const response = await client.sendMessage(agentUrl, {
          message: {
            role: "user",
            parts: [createTextPart(message)],
          },
          ...(skillId && { metadata: { skillId } }),
        })

        setTaskId(response.task.id)
        addActiveTask(response.task.id, agentUrl, response.task.id, response.task.status.state)

        return response.task
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [agentUrl, apiKey, addActiveTask],
  )

  const cancelTask = useCallback(async () => {
    if (!agentUrl || !taskId) return

    try {
      const client = new A2AClient(agentUrl, apiKey)
      await client.cancelTask(agentUrl, taskId)
      removeActiveTask(taskId)
      mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to cancel task")
    }
  }, [agentUrl, taskId, apiKey, removeActiveTask, mutate])

  return {
    task: taskData,
    taskId,
    isLoading,
    error,
    sendMessage,
    cancelTask,
    refresh: mutate,
  }
}

// ============ Connected Agents Hook ============

export function useConnectedAgents() {
  const { connectedAgents, removeConnectedAgent } = useA2AStore()

  return {
    agents: connectedAgents,
    removeAgent: removeConnectedAgent,
    count: connectedAgents.length,
  }
}
