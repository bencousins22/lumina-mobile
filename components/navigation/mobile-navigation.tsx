"use client"

import { useUIContext, useAgentContext } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/auth/user-profile"
import { MessageSquare, Bot, Brain, Settings, FolderKanban, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "marketplace", label: "Store", icon: Store },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "memory", label: "Memory", icon: Brain },
] as const

export function MobileNavigation() {
  const { activePanel, setActivePanel } = useUIContext()
  const { currentAgent } = useAgentContext()

  return (
    <nav className="border-t border-border bg-card/95 backdrop-blur-md safe-bottom relative z-50">
      <div className="flex items-center justify-between py-2 px-2 relative">
        {navItems.map((item, index) => {
          const isActive = activePanel === item.id
          const Icon = item.icon
          const isChat = item.id === "chat"

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-auto min-w-[64px] rounded-xl transition-all relative",
                isActive && !isChat ? "text-primary" : "text-muted-foreground",
                !isChat && "hover:text-foreground hover:bg-muted/50 py-2",
                isChat && [
                  "h-14 w-14 rounded-2xl -mt-8",
                  "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                  "shadow-lg shadow-primary/40",
                  "border-4 border-background",
                  "hover:scale-105 active:scale-95",
                  isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                ]
              )}
              onClick={() => setActivePanel(item.id)}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isChat && "h-6 w-6")} />
                {item.id === "agents" && currentAgent && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-card",
                      currentAgent.status === "online" && "bg-agent-online",
                      currentAgent.status === "busy" && "bg-agent-busy",
                      currentAgent.status === "error" && "bg-agent-error",
                      currentAgent.status === "offline" && "bg-muted-foreground",
                    )}
                  />
                )}
              </div>
              {!isChat && <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>}
              {isChat && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-foreground opacity-50" />}
            </Button>
          )
        })}
        
        {/* Settings/Profile Button */}
        <div className="flex flex-col items-center justify-center gap-1 min-w-[64px]">
          <UserProfile />
        </div>
      </div>
    </nav>
  )
}
