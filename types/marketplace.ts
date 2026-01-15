import { A2AAgentCard } from "./agent-zero"

export interface MarketplaceAgent extends A2AAgentCard {
  id: string
  price: number
  currency: string
  author: {
    name: string
    url?: string
    verified?: boolean
  }
  rating: number
  reviewCount: number
  downloads: number
  categories: string[]
  isInstalled?: boolean
  releaseDate: string
  lastUpdated: string
  screenshots?: string[]
}

export type MarketplaceCategory = 
  | "All"
  | "Productivity"
  | "Development"
  | "Marketing"
  | "Design"
  | "Data"
  | "Finance"
  | "Lifestyle"

export interface MarketplaceFilter {
  category: MarketplaceCategory
  search: string
  minPrice?: number
  maxPrice?: number
  sortBy: "popular" | "newest" | "price_asc" | "price_desc" | "rating"
}
