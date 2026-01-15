"use client"

import { MarketplaceAgent } from "@/types/marketplace"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Star, Download, Calendar, ShieldCheck, Globe, Check, Zap } from "lucide-react"
import { useMarketplaceStore } from "@/stores/marketplace-store"
import { toast } from "sonner"
import { useAgentContext } from "@/components/providers"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface AgentInstallSheetProps {
  agent: MarketplaceAgent | null
  onClose: () => void
}

export function AgentInstallSheet({ agent, onClose }: AgentInstallSheetProps) {
  const { installAgent } = useMarketplaceStore()
  const { addAgent } = useAgentContext()
  const [isInstalling, setIsInstalling] = useState(false)

  if (!agent) return null

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installAgent(agent.id)
      
      // Add to local agent context to reflect change immediately in other panels
      addAgent({
        id: crypto.randomUUID(),
        name: agent.name,
        status: "offline",
        model: "gpt-4-turbo", // Default or from agent config
        level: 1,
        parentId: "0" // Default to root
      })

      toast.success(`${agent.name} installed successfully`, {
        description: "You can now configure it in the Agents panel."
      })
      onClose()
    } catch (error) {
      toast.error("Installation failed")
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <Sheet open={!!agent} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-full sm:w-[500px] sm:max-w-none rounded-t-xl sm:rounded-none">
        <div className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                {agent.name.substring(0, 1)}
              </div>
              <div className="flex-1">
                <SheetTitle className="text-xl">{agent.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{agent.author.name}</span>
                  {agent.author.verified && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    {agent.rating} ({agent.reviewCount})
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Download className="w-3 h-3" />
                    {agent.downloads}
                  </Badge>
                  <Badge variant="secondary">v{agent.version}</Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-medium">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Screenshots (Placeholder) */}
              <div className="space-y-2">
                <h3 className="font-medium">Preview</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="w-60 h-32 rounded-lg bg-muted border shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                       Screenshot {i}
                     </div>
                   ))}
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Categories</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.categories.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <p className="text-sm">{new Date(agent.lastUpdated).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Capabilities</span>
                   <div className="flex gap-2">
                     {agent.capabilities.streaming && <Badge variant="outline" className="text-[10px]">Streaming</Badge>}
                   </div>
                </div>
                 <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Website</span>
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Globe className="w-3 h-3" />
                    <a href={agent.url} target="_blank" rel="noreferrer" className="hover:underline">View Website</a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="pt-4 border-t mt-auto">
             <div className="w-full flex items-center justify-between gap-4">
                <div className="text-lg font-bold">
                  {agent.price === 0 ? "Free" : `$${agent.price}`}
                </div>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleInstall}
                  disabled={agent.isInstalled || isInstalling}
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Installing...
                    </>
                  ) : agent.isInstalled ? (
                    <>
                      <Check className="w-4 h-4" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Install Agent
                    </>
                  )}
                </Button>
             </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
