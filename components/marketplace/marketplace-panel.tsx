"use client"

import { useEffect, useState } from "react"
import { useMarketplaceStore } from "@/stores/marketplace-store"
import { MarketplaceHeader } from "./marketplace-header"
import { MarketplaceCard } from "./marketplace-card"
import { AgentInstallSheet } from "./agent-install-sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

export default function MarketplacePanel() {
  const { agents, isLoading, fetchAgents, filter } = useMarketplaceStore()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Filter logic
  const filteredAgents = agents.filter(agent => {
    const matchesCategory = filter.category === "All" || agent.categories.includes(filter.category)
    const matchesSearch = agent.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                          agent.description.toLowerCase().includes(filter.search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null

  return (
    <div className="h-full flex flex-col bg-background">
      <MarketplaceHeader />
      
      <ScrollArea className="flex-1">
        <div className="p-4 pb-20"> {/* pb-20 for bottom nav space */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading marketplace...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <p>No agents found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent) => (
                <div key={agent.id} className="h-[220px]">
                  <MarketplaceCard 
                    agent={agent} 
                    onClick={() => setSelectedAgentId(agent.id)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AgentInstallSheet 
        agent={selectedAgent} 
        onClose={() => setSelectedAgentId(null)} 
      />
    </div>
  )
}
