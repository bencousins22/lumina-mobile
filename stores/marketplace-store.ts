import { create } from "zustand"
import { MarketplaceAgent, MarketplaceFilter } from "@/types/marketplace"

interface MarketplaceState {
  agents: MarketplaceAgent[]
  isLoading: boolean
  error: string | null
  filter: MarketplaceFilter
  userBalance: number
  
  // Actions
  setAgents: (agents: MarketplaceAgent[]) => void
  setFilter: (filter: Partial<MarketplaceFilter>) => void
  fetchAgents: () => Promise<void>
  installAgent: (agentId: string) => Promise<void>
}

// Mock data
const MOCK_AGENTS: MarketplaceAgent[] = [
  {
    id: "mkt-1",
    name: "CoderPro",
    description: "An advanced coding assistant specialized in React and Node.js.",
    url: "https://agent-zero.com/agents/coderpro",
    version: "1.2.0",
    capabilities: { streaming: true },
    skills: [],
    price: 0,
    currency: "USD",
    author: { name: "AgentZero Team", verified: true },
    rating: 4.8,
    reviewCount: 124,
    downloads: 5400,
    categories: ["Development"],
    releaseDate: "2024-01-15",
    lastUpdated: "2024-03-20",
    screenshots: []
  },
  {
    id: "mkt-2",
    name: "WriterBot",
    description: "Creative writing assistant for blogs, stories, and marketing copy.",
    url: "https://agent-zero.com/agents/writerbot",
    version: "2.0.1",
    capabilities: { streaming: true },
    skills: [],
    price: 4.99,
    currency: "USD",
    author: { name: "ContentAI" },
    rating: 4.5,
    reviewCount: 89,
    downloads: 2100,
    categories: ["Marketing", "Productivity"],
    releaseDate: "2024-02-10",
    lastUpdated: "2024-03-15",
    screenshots: []
  },
  {
    id: "mkt-3",
    name: "DataViz Wizard",
    description: "Turns complex datasets into beautiful charts and graphs.",
    url: "https://agent-zero.com/agents/dataviz",
    version: "1.0.5",
    capabilities: {},
    skills: [],
    price: 9.99,
    currency: "USD",
    author: { name: "DataWorks", verified: true },
    rating: 4.9,
    reviewCount: 45,
    downloads: 890,
    categories: ["Data", "Design"],
    releaseDate: "2024-03-01",
    lastUpdated: "2024-03-01",
    screenshots: []
  },
   {
    id: "mkt-4",
    name: "FinanceBro",
    description: "Personal finance tracker and investment analyzer.",
    url: "https://agent-zero.com/agents/financebro",
    version: "0.9.0",
    capabilities: {},
    skills: [],
    price: 0,
    currency: "USD",
    author: { name: "FinTech Sol" },
    rating: 3.8,
    reviewCount: 20,
    downloads: 500,
    categories: ["Finance"],
    releaseDate: "2024-02-28",
    lastUpdated: "2024-02-28",
    screenshots: []
  }
]

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,
  userBalance: 100.00,
  filter: {
    category: "All",
    search: "",
    sortBy: "popular"
  },

  setAgents: (agents) => set({ agents }),
  
  setFilter: (newFilter) => set((state) => ({ 
    filter: { ...state.filter, ...newFilter } 
  })),

  fetchAgents: async () => {
    set({ isLoading: true, error: null })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      set({ agents: MOCK_AGENTS, isLoading: false })
    } catch (err) {
      set({ error: "Failed to fetch agents", isLoading: false })
    }
  },

  installAgent: async (agentId) => {
    // This would connect to the main AgentStore to add the agent
    // For now, we just simulate the delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    set((state) => ({
      agents: state.agents.map(a => 
        a.id === agentId ? { ...a, isInstalled: true } : a
      )
    }))
  }
}))
