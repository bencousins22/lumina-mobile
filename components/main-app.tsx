"use client"

import { lazy, Suspense, useMemo } from "react"
import { useUIContext } from "@/components/providers"
import { MobileNavigation } from "@/components/navigation/mobile-navigation"
import { MobileSidebar } from "@/components/navigation/mobile-sidebar"
import { 
  ChatSkeleton, 
  AgentsSkeleton, 
  MemorySkeleton, 
  SettingsSkeleton, 
  ProjectsSkeleton 
} from "@/components/ui/panel-skeleton"

// Lazy load panel components for better performance
const ChatPanel = lazy(() => import("@/components/chat/chat-panel"))
const AgentsPanel = lazy(() => import("@/components/agents/agents-panel"))
const MemoryPanel = lazy(() => import("@/components/memory/memory-panel"))
const SettingsPanel = lazy(() => import("@/components/settings/settings-panel"))
const ProjectsPanel = lazy(() => import("@/components/projects/projects-panel"))
const MarketplacePanel = lazy(() => import("@/components/marketplace/marketplace-panel"))
const AgentZeroPanel = lazy(() => import("@/components/agent-zero/agent-zero-deployer"))

// Panel mapping for declarative rendering
const panelMap = {
  chat: { component: ChatPanel, fallback: ChatSkeleton },
  agents: { component: AgentsPanel, fallback: AgentsSkeleton },
  memory: { component: MemoryPanel, fallback: MemorySkeleton },
  settings: { component: SettingsPanel, fallback: SettingsSkeleton },
  projects: { component: ProjectsPanel, fallback: ProjectsSkeleton },
  marketplace: { component: MarketplacePanel, fallback: AgentsSkeleton }, // Note: Using AgentsSkeleton
  "agent-zero": { component: AgentZeroPanel, fallback: SettingsSkeleton }, // Note: Using SettingsSkeleton
}

export function MainApp() {
  const { activePanel, isSidebarOpen, setIsSidebarOpen } = useUIContext()

  const ActivePanel = useMemo(() => {
    const { component: PanelComponent, fallback: FallbackComponent } = 
      panelMap[activePanel] || panelMap.chat
      
    return (
      <Suspense fallback={<FallbackComponent />}>
        <PanelComponent />
      </Suspense>
    )
  }, [activePanel])

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <MobileSidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        {ActivePanel}
      </main>

      <MobileNavigation />
    </div>
  )
}
