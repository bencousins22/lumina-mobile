"use client"

import { useState } from "react"
import { useAgentContext } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Bot, MoreVertical, Activity, Cpu, Network, Settings2, Trash2, Play, Pause } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AgentDetailSheet } from "./agent-detail-sheet"

function AgentsPanel() {
  const { agents, currentAgent, setCurrentAgent } = useAgentContext()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-agent-online"
      case "busy":
        return "bg-agent-busy"
      case "error":
        return "bg-agent-error"
      default:
        return "bg-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "busy":
        return "Working"
      case "error":
        return "Error"
      default:
        return "Offline"
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Agents</h1>
            <p className="text-xs text-muted-foreground">
              {agents.length} agent{agents.length !== 1 ? "s" : ""} configured
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Agent</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 scrollbar-thin overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Active Agent Card */}
          {currentAgent && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {currentAgent.name}
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Primary
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">{currentAgent.model}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", getStatusColor(currentAgent.status))} />
                    <span className="text-xs text-muted-foreground">{getStatusText(currentAgent.status)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Activity className="h-4 w-4 text-primary mb-1" />
                    <span className="text-xs text-muted-foreground">Active</span>
                    <span className="text-sm font-medium">2h 34m</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Cpu className="h-4 w-4 text-chart-2 mb-1" />
                    <span className="text-xs text-muted-foreground">Tasks</span>
                    <span className="text-sm font-medium">47</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                    <Network className="h-4 w-4 text-chart-3 mb-1" />
                    <span className="text-xs text-muted-foreground">Subs</span>
                    <span className="text-sm font-medium">{agents.filter((a) => a.parentId === currentAgent.id).length}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedAgent(currentAgent.id)}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    {currentAgent.status === "online" ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subordinate Agents */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Subordinate Agents</h2>

            {agents.filter((a) => a.id !== currentAgent?.id).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No subordinate agents yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Create agents to delegate subtasks</p>
                  <Button variant="outline" size="sm" className="mt-4 gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Create Subordinate
                  </Button>
                </CardContent>
              </Card>
            ) : (
              agents
                .filter((a) => a.id !== currentAgent?.id)
                .map((agent) => (
                  <Card key={agent.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Bot className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{agent.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(agent.status))} />
                              <span className="text-xs text-muted-foreground">{agent.model}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Agent options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAgent(agent.id)}>
                              <Settings2 className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCurrentAgent(agent)}>
                              <Play className="h-4 w-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Agent detail sheet */}
      <AgentDetailSheet agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  )
}


export default AgentsPanel
