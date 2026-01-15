"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Terminal, Cpu, Network, Shield, Globe, Mail, Lock, AlertCircle, Check } from "lucide-react"

export function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "", color: "" }
    
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++

    const levels = [
      { text: "Weak", color: "text-destructive" },
      { text: "Fair", color: "text-orange-500" },
      { text: "Good", color: "text-yellow-500" },
      { text: "Strong", color: "text-green-500" },
      { text: "Very Strong", color: "text-green-600" }
    ]

    return { score, text: levels[score]?.text || "", color: levels[score]?.color || "" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(email, password)
      // No redirect needed - ProtectedRoute will automatically show MainApp after login
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error('Login failed:', err)
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
            <CardTitle className="text-xl">Welcome to Lumina</CardTitle>
            <CardDescription>Sign in to access your AI framework</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 h-12 bg-input/50"
                    required
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10 h-12 bg-input/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                  </Button>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {password && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? "bg-destructive"
                                : passwordStrength.score <= 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
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
