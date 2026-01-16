"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useAuthContext, useSettings } from "@/components/providers"
import { useAgentZeroConnection } from "@/hooks/use-agent-zero"
import { useSettingsStore } from "@/stores/app-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { cn } from "@/lib/utils"

// --- Constants & Data ---
const APP_VERSION = "v0.6.0-beta"

const TTS_PROVIDERS = [
  { value: "kokoro", label: "Kokoro TTS" },
  { value: "openai", label: "OpenAI TTS" },
  { value: "elevenlabs", label: "ElevenLabs" },
]

// --- Reusable & Composable Components ---

const SettingsHeader = () => (
  <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
    <h1 className="text-lg font-semibold">Settings</h1>
    <p className="text-xs text-muted-foreground">Configure your Lumina instance</p>
  </header>
)

interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType
  title: string
  description?: string
}

const SettingsCard = React.forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ icon: Icon, title, description, children, ...props }, ref) => (
    <Card ref={ref} {...props} className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2.5">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs pt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
)
SettingsCard.displayName = "SettingsCard"

const AppearanceCard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true) // Assuming dark mode is the default

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  return (
    <SettingsCard icon={isDarkMode ? Moon : Sun} title="Appearance">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode</Label>
          <p className="text-xs text-muted-foreground">Use the dark theme for the interface</p>
        </div>
        <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
      </div>
    </SettingsCard>
  )
}

const AudioCard = () => (
  <SettingsCard icon={Volume2} title="Audio">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Text to Speech</Label>
          <p className="text-xs text-muted-foreground">Enable voice responses from the agent</p>
        </div>
        <Switch />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Speech to Text</Label>
          <p className="text-xs text-muted-foreground">Enable voice input for sending messages</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="space-y-2 pt-2">
        <Label className="text-sm font-medium">TTS Provider</Label>
        <Select defaultValue={TTS_PROVIDERS[0].value}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TTS_PROVIDERS.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </SettingsCard>
)

const ModelsCard = () => (
  <SettingsCard
    icon={Cpu}
    title="Model Configuration"
    description="Model settings are managed in your Agent Zero backend."
  >
    <p className="text-xs text-muted-foreground">
      To change models, please update your <code>config.json</code> or use the backend CLI. The interface will
      automatically reflect any changes.
    </p>
  </SettingsCard>
)

const ConnectionCard = () => {
  const { isConnected } = useSettings()
  const { baseUrl, apiKey, setConnectionSettings } = useSettingsStore()
  const { testConnection, isLoading: isTesting } = useAgentZeroConnection()

  const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl)
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const [status, setStatus] = useState<"idle" | "testing" | "saved" | "error">("idle")

  const isModified = useMemo(() => localBaseUrl !== baseUrl || localApiKey !== apiKey, [localBaseUrl, localApiKey, baseUrl, apiKey])

  useEffect(() => {
    setLocalBaseUrl(baseUrl)
    setLocalApiKey(apiKey)
  }, [baseUrl, apiKey])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("testing")
    const success = await testConnection()
    if (success) {
      setConnectionSettings(localBaseUrl, localApiKey)
      setStatus("saved")
    } else {
      setStatus("error")
    }
    setTimeout(() => setStatus("idle"), 3000)
  }

  const buttonText = {
    idle: isModified ? "Save & Test" : "Test Connection",
    testing: "Testing...",
    saved: "Connected",
    error: "Failed! Retry?",
  }

  const ConnectionStatus = () => (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? "text-agent-online" : "text-agent-error"}`}>
      {isConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {isConnected ? "Connected" : "Disconnected"}
    </div>
  )

  return (
    <SettingsCard
      icon={Network}
      title="Agent Zero Backend"
      description="Configure how the app connects to your Agent Zero instance."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-url" className="text-sm font-medium">Backend URL</Label>
          <Input
            id="base-url"
            value={localBaseUrl}
            onChange={(e) => setLocalBaseUrl(e.target.value)}
            placeholder="http://localhost:50001"
            className="font-mono text-xs h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-sm font-medium">API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            placeholder="••••••••••••••••••••"
            className="font-mono text-xs h-11"
          />
        </div>
        <div className="pt-2 flex items-center justify-between">
          <ConnectionStatus />
          <Button type="submit" disabled={isTesting || status === "testing"} size="sm" className="min-w-[120px]">
            {(isTesting || status === "testing") && <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" />}
            {status === "saved" && <CheckCircle2 className="h-3.5 w-3.5 mr-2" />}
            {status === "error" && <XCircle className="h-3.5 w-3.5 mr-2" />}
            {buttonText[status]}
          </Button>
        </div>
      </form>
    </SettingsCard>
  )
}

const SystemInfoCard = () => {
  const { isConnected } = useSettings()
  const info = [
    { label: "Version", value: APP_VERSION, mono: true },
    {
      label: "Status",
      value: isConnected ? "Active" : "Offline",
      color: isConnected ? "text-agent-online" : "text-agent-error",
    },
    { label: "Runtime", value: "Docker (Linux/amd64)" },
  ]
  return (
    <SettingsCard icon={Server} title="System Information">
      <div className="space-y-3">
        {info.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={cn(item.color, item.mono && "font-mono")}>{item.value}</span>
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}

const LogoutButton = () => {
  const { logOut } = useAuthContext();

  return (
    <Button
      variant="outline"
      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
      onClick={logOut}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}

// --- Main Settings Panel Component ---

function SettingsPanel() {
  return (
    <div className="h-full flex flex-col bg-background">
      <SettingsHeader />
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="general" className="p-4 md:p-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <TabsContent value="general" className="space-y-4 mt-0">
              <AppearanceCard />
              <AudioCard />
              <LogoutButton />
            </TabsContent>

            <TabsContent value="models" className="mt-0">
              <ModelsCard />
            </TabsContent>

            <TabsContent value="connection" className="space-y-4 mt-0">
              <ConnectionCard />
              <SystemInfoCard />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default SettingsPanel
