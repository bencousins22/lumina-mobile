"use client"

import { useAgentContext } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Cpu, FileText, Wrench } from "lucide-react"

interface AgentDetailSheetProps {
  agentId: string | null
  onClose: () => void
}

const models = [
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { value: "grok-4-fast", label: "Grok 4 Fast" },
  { value: "llama-3.3-70b", label: "Llama 3.3 70B" },
]

export function AgentDetailSheet({ agentId, onClose }: AgentDetailSheetProps) {
  const { agents } = useAgentContext()
  const agent = agents.find((a) => a.id === agentId)

  if (!agent) {
    return null
  }

  return (
    <Sheet open={!!agentId} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto"
        aria-describedby="agent-description"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center" role="img" aria-label="Agent icon">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle>{agent.name}</SheetTitle>
              <SheetDescription id="agent-description">
                Configure agent settings including model, temperature, prompts, and available tools
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Cpu className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="prompts" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input id="agent-name" defaultValue={agent.name} placeholder="Enter agent name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select defaultValue={agent.model}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input id="temperature" type="number" defaultValue="0.7" min="0" max="2" step="0.1" />
              <p className="text-xs text-muted-foreground">Lower values make output more focused and deterministic</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input id="max-tokens" type="number" defaultValue="4096" min="1" max="128000" />
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="Enter custom system prompt..."
                className="min-h-[200px] font-mono text-sm"
                defaultValue="You are Lumina, an autonomous AI assistant with full access to a Linux system. You can write and execute code, install software, browse the web, and create new tools on the fly."
              />
              <p className="text-xs text-muted-foreground">Define the agent's personality and capabilities</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Custom Instructions</Label>
              <Textarea id="custom-instructions" placeholder="Add custom instructions..." className="min-h-[100px]" />
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <div className="space-y-3" role="list" aria-label="Agent tools">
              <Label id="tools-label">Enabled Tools</Label>

              {[
                { id: "code", name: "Code Execution", enabled: true },
                { id: "web", name: "Web Browser", enabled: true },
                { id: "memory", name: "Memory Access", enabled: true },
                { id: "files", name: "File System", enabled: true },
                { id: "search", name: "Web Search", enabled: true },
                { id: "subordinate", name: "Create Subordinates", enabled: false },
              ].map((tool) => (
                <div
                  key={tool.id}
                  role="listitem"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <span className="text-sm font-medium">{tool.name}</span>
                  <Button
                    variant={tool.enabled ? "default" : "outline"}
                    size="sm"
                    aria-label={`${tool.enabled ? 'Disable' : 'Enable'} ${tool.name}`}
                    aria-pressed={tool.enabled}
                  >
                    {tool.enabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1">Save Changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
