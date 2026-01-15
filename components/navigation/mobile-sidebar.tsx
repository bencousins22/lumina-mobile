"use client"

import { useUIContext, useChatContext, useAgentContext } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Plus, MessageSquare, Terminal, Clock, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { setActivePanel } = useUIContext()
  const { chats, currentChat, setCurrentChat, createChat } = useChatContext()
  const { currentAgent } = useAgentContext()

  const handleNewChat = () => {
    createChat("New Chat")
    setActivePanel("chat")
    onClose()
  }

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setCurrentChat(chat)
      setActivePanel("chat")
      onClose()
    }
  }

  const handlePanelNav = (panel: "settings") => {
    setActivePanel(panel)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        <SheetHeader className="p-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-sidebar-foreground text-left text-sm font-bold">Agent Zero</SheetTitle>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    currentAgent?.status === "online" ? "bg-agent-online" : "bg-muted-foreground"
                  )} />
                  <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider font-semibold">
                    {currentAgent?.status || "offline"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="p-3 shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold text-sm">New Chat</span>
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            <p className="text-[10px] font-bold text-sidebar-foreground/40 px-2 py-1 uppercase tracking-widest">Recent Activity</p>
            {chats.length === 0 ? (
              <div className="text-center py-12 px-4 text-sidebar-foreground/30">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium italic">Your chat history will appear here</p>
              </div>
            ) : (
              chats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto py-3 px-3 text-left group",
                    currentChat?.id === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex flex-col items-start gap-0.5 w-full min-w-0">
                    <span className="font-medium truncate w-full text-sm">{chat.title}</span>
                    <span className="text-[10px] text-sidebar-foreground/50 flex items-center gap-1 group-hover:text-sidebar-foreground/70">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-sidebar-border bg-sidebar/50 shrink-0">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => handlePanelNav("settings")}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Log out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
