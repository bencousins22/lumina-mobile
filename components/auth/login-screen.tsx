"use client"

import type React from "react"

import { useState } from "react"
import { useUIContext } from "@/components/providers"
import { useAgentZeroConnection } from "@/hooks/use-agent-zero"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Terminal, Cpu, Network, Shield, Globe } from "lucide-react"

export function LoginScreen() {
  const { setIsAuthenticated } = useUIContext()
  const { testConnection, updateConnection } = useAgentZeroConnection()
  
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("http://localhost:50001")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Update connection settings first
      updateConnection(baseUrl, apiKey)
      
      // Test the connection
      const isConnected = await testConnection()
      
      if (isConnected) {
        setIsAuthenticated(true)
        // Store in localStorage for persistence
        localStorage.setItem("agentZero_baseUrl", baseUrl)
        localStorage.setItem("agentZero_apiKey", apiKey)
      } else {
        setError("Could not connect to Agent Zero. Please check your URL and API Key.")
      }
    } catch (err) {
      setError("An error occurred during connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background safe-top safe-bottom">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Terminal className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance text-center">Lumina</h1>
          <p className="text-muted-foreground text-sm mt-1">Autonomous AI Framework</p>
        </div>

        {/* Login card */}
        <Card className="w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Connect to Agent Zero</CardTitle>
            <CardDescription>Enter your backend URL and API Key to start</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Backend URL
                </Label>
                <div className="relative">
                  <Input
                    id="baseUrl"
                    type="url"
                    placeholder="http://localhost:50001"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="pl-10 h-12 bg-input/50"
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 h-12 bg-input/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showApiKey ? "Hide" : "Show"} key</span>
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  "Access Control Panel"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm w-full">
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Multi-Agent</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Network className="w-5 h-5 text-chart-2" />
            </div>
            <span className="text-xs text-muted-foreground">A2A Protocol</span>
          </div>
          <div className="flex flex-col items-center text-center p-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-chart-3" />
            </div>
            <span className="text-xs text-muted-foreground">Secure</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Open Source AI Framework</p>
      </footer>
    </div>
  )
}
