"use client"

import { useState, useEffect } from "react"
import { useUIContext, useSettings } from "@/components/providers"
import { useAgentZeroConnection } from "@/hooks/use-agent-zero"
import { useSettingsStore } from "@/stores/app-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Cpu,
  Globe,
  Shield,
  Volume2,
  Moon,
  Sun,
  LogOut,
  Key,
  Server,
  Wifi,
  QrCode,
  Network,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"

function SettingsPanel() {
  const { setIsAuthenticated } = useUIContext()
  const { isConnected } = useSettings()
  const { baseUrl, apiKey } = useSettingsStore()
  const { testConnection, updateConnection, isLoading: isTestingConnection } = useAgentZeroConnection()
  
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl)
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  useEffect(() => {
    setLocalBaseUrl(baseUrl)
    setLocalApiKey(apiKey)
  }, [baseUrl, apiKey])

  const handleSaveConnection = async () => {
    setSaveStatus("saving")
    try {
      updateConnection(localBaseUrl, localApiKey)
      const success = await testConnection()
      if (success) {
        setSaveStatus("saved")
        localStorage.setItem("agentZero_baseUrl", localBaseUrl)
        localStorage.setItem("agentZero_apiKey", localApiKey)
      } else {
        setSaveStatus("error")
      }
    } catch (err) {
      setSaveStatus("error")
    } finally {
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-xs text-muted-foreground">Configure your Lumina instance</p>
      </header>

      <ScrollArea className="flex-1 scrollbar-thin">
        <Tabs defaultValue="general" className="p-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-0">
            {/* Appearance */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-sm">
                      Dark Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                  <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                </div>
              </CardContent>
            </Card>

            {/* Audio */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Text to Speech</Label>
                    <p className="text-xs text-muted-foreground">Enable voice responses</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Speech to Text</Label>
                    <p className="text-xs text-muted-foreground">Enable voice input</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">TTS Provider</Label>
                  <Select defaultValue="kokoro">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kokoro">Kokoro TTS</SelectItem>
                      <SelectItem value="openai">OpenAI TTS</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </TabsContent>

          <TabsContent value="models" className="space-y-4 mt-0">
            <Card className="border-border/50 bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Model Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Model settings are managed directly in the Agent Zero backend configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <p>
                  To change models, please update your <code>config.json</code> or use the 
                  backend CLI/Settings. The frontend will automatically reflect these changes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connection" className="space-y-4 mt-0">
            {/* Connection Settings */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Agent Zero Backend
                </CardTitle>
                <CardDescription className="text-xs">Configure how the frontend connects to Agent Zero</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base-url" className="text-sm">Backend URL</Label>
                  <Input 
                    id="base-url"
                    value={localBaseUrl}
                    onChange={(e) => setLocalBaseUrl(e.target.value)}
                    placeholder="http://localhost:50001"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-sm">API Key</Label>
                  <Input 
                    id="api-key"
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter API Key"
                    className="font-mono text-xs"
                  />
                </div>
                
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 text-agent-online text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-agent-error text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" />
                        Disconnected
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSaveConnection}
                    disabled={isTestingConnection || saveStatus === "saving"}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {saveStatus === "saving" ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : saveStatus === "saved" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                    ) : null}
                    {saveStatus === "saving" ? "Testing..." : saveStatus === "saved" ? "Connected" : "Save & Test"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Docker Status (Read-only info) */}
            <Card className="border-border/50 bg-muted/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-mono">v0.5.2-alpha</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className={isConnected ? "text-agent-online" : "text-agent-error"}>
                    {isConnected ? "Active" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Runtime</span>
                  <span>Docker (Linux/amd64)</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}


export default SettingsPanel
