"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Terminal, Globe, Code, FileSearch, Zap, Bot } from "lucide-react"

interface WelcomeScreenProps {
  onStartChat: (prompt: string) => void
}

const suggestions = [
  {
    icon: Code,
    title: "Write Code",
    prompt: "Create a Python script that scrapes product data from a website",
  },
  {
    icon: Globe,
    title: "Browse Web",
    prompt: "Search for the latest news about AI developments",
  },
  {
    icon: FileSearch,
    title: "Analyze Data",
    prompt: "Analyze this CSV file and create a summary report",
  },
  {
    icon: Bot,
    title: "Create Agent",
    prompt: "Create a subordinate agent to handle email management",
  },
]

export function WelcomeScreen({ onStartChat }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 py-8">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Terminal className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground text-balance text-center">How can I help you today?</h1>
        <p className="text-muted-foreground text-sm mt-2 text-center max-w-sm">
          I can execute code, browse the web, manage files, and coordinate with other agents.
        </p>
      </div>

      {/* Capabilities */}
      <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Zap className="h-3 w-3 text-primary" />
          Code Execution
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Globe className="h-3 w-3 text-chart-2" />
          Web Browsing
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Bot className="h-3 w-3 text-chart-3" />
          Multi-Agent
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon
          return (
            <Card
              key={suggestion.title}
              className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50 bg-card/50"
              onClick={() => onStartChat(suggestion.prompt)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm text-foreground">{suggestion.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{suggestion.prompt}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
