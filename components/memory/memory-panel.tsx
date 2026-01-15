"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Search, Lightbulb, Code, FileText, Trash2, Plus, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Memory {
  id: string
  type: "fact" | "solution" | "behavior"
  content: string
  tags: string[]
  createdAt: Date
  relevance: number
}

const mockMemories: Memory[] = [
  {
    id: "1",
    type: "fact",
    content: "User prefers Python for data analysis tasks",
    tags: ["preferences", "python"],
    createdAt: new Date(Date.now() - 86400000),
    relevance: 0.95,
  },
  {
    id: "2",
    type: "solution",
    content: "Used pandas and matplotlib for sales data visualization",
    tags: ["data", "visualization"],
    createdAt: new Date(Date.now() - 172800000),
    relevance: 0.88,
  },
  {
    id: "3",
    type: "behavior",
    content: "Always ask for confirmation before executing destructive commands",
    tags: ["safety", "behavior"],
    createdAt: new Date(Date.now() - 259200000),
    relevance: 0.92,
  },
]

function MemoryPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [memories] = useState<Memory[]>(mockMemories)
  const [activeTab, setActiveTab] = useState("all")

  const getTypeIcon = (type: Memory["type"]) => {
    switch (type) {
      case "fact":
        return <FileText className="h-4 w-4" />
      case "solution":
        return <Code className="h-4 w-4" />
      case "behavior":
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Memory["type"]) => {
    switch (type) {
      case "fact":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "solution":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "behavior":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
    }
  }

  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = activeTab === "all" || memory.type === activeTab
    return matchesSearch && matchesType
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold">Memory</h1>
            <p className="text-xs text-muted-foreground">{memories.length} memories stored</p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Memory</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-input/50"
          />
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-border">
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-lg font-semibold">{memories.filter((m) => m.type === "fact").length}</p>
                <p className="text-[10px] text-muted-foreground">Facts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Code className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-lg font-semibold">{memories.filter((m) => m.type === "solution").length}</p>
                <p className="text-[10px] text-muted-foreground">Solutions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-lg font-semibold">{memories.filter((m) => m.type === "behavior").length}</p>
                <p className="text-[10px] text-muted-foreground">Behaviors</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="fact" className="text-xs">
              Facts
            </TabsTrigger>
            <TabsTrigger value="solution" className="text-xs">
              Solutions
            </TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs">
              Behavior
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 scrollbar-thin">
          <TabsContent value={activeTab} className="mt-0 p-4 space-y-3">
            {filteredMemories.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Brain className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No memories found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Memories are created as you interact with agents
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMemories.map((memory) => (
                <Card key={memory.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                            getTypeColor(memory.type),
                          )}
                        >
                          {getTypeIcon(memory.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">{memory.content}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {memory.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {Math.round(memory.relevance * 100)}% relevant
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {memory.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete memory</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}


export default MemoryPanel
