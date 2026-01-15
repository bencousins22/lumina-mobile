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
import { cn } from "@/lib/utils"

export function LoginScreen() {
  const { login, signup, isLoading, error, clearError } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isSignUp) {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
      // No redirect needed - ProtectedRoute will automatically show MainApp after login
    } catch (err) {
      // Error is already handled by useAuth hook
      console.error(isSignUp ? 'Signup failed:' : 'Login failed:', err)
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
            <CardTitle className="text-xl">{isSignUp ? 'Create Account' : 'Welcome to Lumina'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Sign up to get started with your AI assistant' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                    Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="pl-10 h-12 bg-input/50"
                      required
                    />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

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
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className={cn(
                      "pr-12 h-12 bg-input/50 border-border/50 transition-all duration-200",
                      "focus:bg-background focus:border-primary/50 focus:shadow-lg",
                      "group-hover:bg-input/70",
                      passwordStrength.score >= 3 && "border-green-500/30 focus:border-green-500/50",
                      passwordStrength.score <= 1 && password.length > 0 && "border-destructive/30 focus:border-destructive/50"
                    )}
                    required
                  />
                  <Lock className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                    "text-muted-foreground group-focus-within:text-primary",
                    passwordStrength.score >= 3 && "text-green-500",
                    passwordStrength.score <= 1 && password.length > 0 && "text-destructive"
                  )} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      "transition-all duration-200",
                      showPassword && "text-primary bg-primary/10 hover:bg-primary/20"
                    )}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password strength indicator for signup */}
                {isSignUp && password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Password strength:</span>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        passwordStrength.color,
                        passwordStrength.score >= 3 && "bg-green-500/10 text-green-600 border border-green-500/20",
                        passwordStrength.score <= 1 && "bg-destructive/10 text-destructive border border-destructive/20",
                        passwordStrength.score === 2 && "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                      )}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            i < passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? passwordStrength.score === 1
                                  ? "bg-destructive"
                                  : "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    
                    {/* Password requirements checklist */}
                    <div className="mt-3 space-y-1">
                      {[
                        { text: "At least 8 characters", met: password.length >= 8 },
                        { text: "Contains uppercase & lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
                        { text: "Contains a number", met: /\d/.test(password) },
                        { text: "Contains special character", met: /[^a-zA-Z\d]/.test(password) },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={cn(
                            "w-3 h-3 rounded-full flex items-center justify-center",
                            req.met ? "bg-green-500" : "bg-muted"
                          )}>
                            {req.met && <Check className="h-2 w-2 text-white" />}
                          </div>
                          <span className={cn(
                            req.met ? "text-green-600" : "text-muted-foreground"
                          )}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Password hint for login */}
                {!isSignUp && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Use your account password to sign in
                    </p>
                  </div>
                )}
              </div>

              {!isSignUp && (
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
              )}

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
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    clearError()
                  }}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
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
