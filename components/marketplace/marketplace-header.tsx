"use client"

import { Search, Filter, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMarketplaceStore } from "@/stores/marketplace-store"
import { MarketplaceCategory } from "@/types/marketplace"
import { cn } from "@/lib/utils"

const CATEGORIES: MarketplaceCategory[] = [
  "All",
  "Productivity",
  "Development",
  "Marketing",
  "Design",
  "Data",
  "Finance"
]

export function MarketplaceHeader() {
  const { filter, setFilter, userBalance } = useMarketplaceStore()

  return (
    <div className="flex flex-col border-b bg-card/50 backdrop-blur-sm safe-top z-10 sticky top-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 pb-2">
        <h1 className="text-lg font-semibold">Marketplace</h1>
        <Badge variant="outline" className="gap-1.5 py-1">
          <Coins className="w-3 h-3 text-amber-500" />
          <span>${userBalance.toFixed(2)}</span>
        </Badge>
      </div>

      {/* Search & Filter */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search agents..." 
            className="pl-9 h-9 bg-background/50"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories */}
      <ScrollArea className="w-full whitespace-nowrap border-t bg-background/30">
        <div className="flex p-2 gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={filter.category === cat ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs rounded-full",
                filter.category === cat && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={() => setFilter({ category: cat })}
            >
              {cat}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
