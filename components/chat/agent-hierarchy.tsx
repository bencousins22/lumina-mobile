"use client"

import type { Agent } from '@/types/agent-zero'
import { Badge } from '@/components/ui/badge'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentHierarchyProps {
  agents: Agent[]
  activeAgentId?: string
}

export function AgentHierarchy({ agents, activeAgentId }: AgentHierarchyProps) {
  // Sort by level (0 is root, higher numbers are delegates)
  const sortedAgents = [...agents].sort((a, b) => a.level - b.level)

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'thinking': return 'bg-blue-500'
      case 'executing': return 'bg-primary'
      case 'delegating': return 'bg-purple-500'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-1">
      {sortedAgents.map((agent, index) => (
        <div key={agent.id} className="flex items-center gap-1 shrink-0">
          {index > 0 && (
            <div className="text-muted-foreground text-xs">→</div>
          )}
          <Badge
            variant={agent.id === activeAgentId ? 'default' : 'outline'}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1",
              agent.id === activeAgentId && "animate-pulse"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", getStatusColor(agent.status))} />
            <Bot className="h-3 w-3" />
            <span className="text-xs">{agent.name}</span>
            {agent.level > 0 && (
              <span className="text-xs text-muted-foreground">L{agent.level}</span>
            )}
          </Badge>
        </div>
      ))}
    </div>
  )
}
