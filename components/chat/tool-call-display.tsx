"use client"

import { useState } from 'react'
import type { ToolCall } from '@/types/agent-zero'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, Terminal, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface ToolCallDisplayProps {
  toolCalls: ToolCall[]
}

export function ToolCallDisplay({ toolCalls }: ToolCallDisplayProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      default:
        return <Terminal className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {toolCalls.map((toolCall) => {
        const isExpanded = expandedIds.has(toolCall.id)
        
        return (
          <Collapsible
            key={toolCall.id}
            open={isExpanded}
            onOpenChange={() => toggleExpanded(toolCall.id)}
          >
            <div className="rounded-lg border border-border/50 bg-muted/30">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-3 py-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(toolCall.status)}
                    <span className="font-mono text-sm">{toolCall.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {toolCall.status}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-2">
                  {/* Arguments */}
                  {Object.keys(toolCall.args).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        Arguments:
                      </div>
                      <pre className="text-xs bg-background p-2 rounded border border-border overflow-x-auto">
                        {JSON.stringify(toolCall.args, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Result */}
                  {toolCall.result && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        Result:
                      </div>
                      <pre className="text-xs bg-background p-2 rounded border border-border overflow-x-auto max-h-32">
                        {toolCall.result}
                      </pre>
                    </div>
                  )}

                  {/* Timing */}
                  {toolCall.startTime && (
                    <div className="text-xs text-muted-foreground">
                      Execution time: {
                        toolCall.endTime 
                          ? `${Math.round((toolCall.endTime.getTime() - toolCall.startTime.getTime()) / 1000)}s`
                          : 'In progress...'
                      }
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}
