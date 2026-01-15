"use client"

import { lazy, Suspense } from "react"
import { useUIContext } from "@/components/providers"
import { MobileNavigation } from "@/components/navigation/mobile-navigation"
import { MobileSidebar } from "@/components/navigation/mobile-sidebar"
import { MobileModeToggle } from "@/components/ui/mobile-mode-toggle"
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

export function MainApp() {
  const { activePanel, isSidebarOpen, setIsSidebarOpen } = useUIContext()

  // Render the appropriate panel with the matching skeleton
  const renderPanel = () => {
    switch (activePanel) {
      case "chat":
        return (
          <Suspense fallback={<ChatSkeleton />}>
            <ChatPanel />
          </Suspense>
        )
      case "agents":
        return (
          <Suspense fallback={<AgentsSkeleton />}>
            <AgentsPanel />
          </Suspense>
        )
      case "memory":
        return (
          <Suspense fallback={<MemorySkeleton />}>
            <MemoryPanel />
          </Suspense>
        )
      case "settings":
        return (
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsPanel />
          </Suspense>
        )
      case "projects":
        return (
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsPanel />
          </Suspense>
        )
      case "marketplace":
        return (
          <Suspense fallback={<AgentsSkeleton />}>
             <MarketplacePanel />
          </Suspense>
        )
      case "agent-zero":
        return (
          <Suspense fallback={<SettingsSkeleton />}>
            <AgentZeroPanel />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<ChatSkeleton />}>
            <ChatPanel />
          </Suspense>
        )
    }
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Sidebar overlay for mobile */}
      <MobileSidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area with lazy loaded panels */}
      <main className="flex-1 overflow-hidden">
        {renderPanel()}
      </main>

      {/* Bottom navigation */}
      <MobileNavigation />
      
      {/* Mobile Mode Toggle */}
      <MobileModeToggle />
    </div>
  )
}
