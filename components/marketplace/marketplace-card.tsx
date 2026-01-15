"use client"

import { MarketplaceAgent } from "@/types/marketplace"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Download, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketplaceCardProps {
  agent: MarketplaceAgent
  onClick: () => void
}

export function MarketplaceCard({ agent, onClick }: MarketplaceCardProps) {
  return (
    <Card 
      className="flex flex-col h-full hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
              {agent.name.substring(0, 1)}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-none mb-1 group-hover:text-primary transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-muted-foreground">{agent.author.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={agent.price === 0 ? "secondary" : "default"} className="text-[10px] h-5">
              {agent.price === 0 ? "Free" : `$${agent.price}`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {agent.description}
        </p>
        
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-0.5 text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-medium">{agent.rating}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-0.5">
            <Download className="w-3 h-3" />
            <span>{agent.downloads > 1000 ? `${(agent.downloads / 1000).toFixed(1)}k` : agent.downloads}</span>
          </div>
          <span>•</span>
          <span>{agent.categories[0]}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {agent.isInstalled ? (
          <Button variant="outline" size="sm" className="w-full h-8 gap-2 bg-muted/50 cursor-default" disabled>
            <Check className="w-3 h-3" />
            Installed
          </Button>
        ) : (
          <Button size="sm" className="w-full h-8 gap-2" variant="secondary">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
