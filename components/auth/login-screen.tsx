"use client"

import React, { useState, useMemo } from "react"
import { useAuthContext } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Terminal, Cpu, Network, Shield, Mail, AlertCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Helper Hooks & Components ---

// Hook to calculate password strength
const usePasswordStrength = (password: string) => {
  return useMemo(() => {
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
      { text: "Very Strong", color: "text-green-600" },
    ]

    return {
      score,
      text: levels[score]?.text || "",
      color: levels[score]?.color || "",
    }
  }, [password])
}

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = usePasswordStrength(password)
  const requirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase & lowercase", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { text: "Contains a number", met: /\d/.test(password) },
    { text: "Contains special character", met: /[^a-zA-Z\d]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Password strength:</span>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            strength.color,
            strength.score >= 3 && "bg-green-500/10 text-green-600 border border-green-500/20",
            strength.score === 2 && "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
            strength.score <= 1 && "bg-destructive/10 text-destructive border border-destructive/20",
          )}
        >
          {strength.text}
        </span>
      </div>
      <div className="flex gap-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < strength.score
                ? strength.score <= 2
                  ? strength.score === 1
                    ? "bg-destructive"
                    : "bg-yellow-500"
                  : "bg-green-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="mt-3 space-y-1">
        {requirements.map((req) => (
          <div key={req.text} className="flex items-center gap-2 text-xs">
            <div className={cn("w-3 h-3 rounded-full flex items-center justify-center", req.met ? "bg-green-500" : "bg-muted")}>
              {req.met && <Check className="h-2 w-2 text-white" />}
            </div>
            <span className={cn(req.met ? "text-green-600" : "text-muted-foreground")}>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const AuthHeader = () => (
  <div className="flex flex-col items-center mb-8">
    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
      <Terminal className="w-10 h-10 text-primary" />
    </div>
    <h1 className="text-3xl font-bold text-foreground text-balance text-center">Lumina</h1>
    <p className="text-muted-foreground text-sm mt-1">Autonomous AI Framework</p>
  </div>
)

const featureData = [
  { icon: Cpu, label: "Multi-Agent", color: "text-primary" },
  { icon: Network, label: "A2A Protocol", color: "text-chart-2" },
  { icon: Shield, label: "Secure", color: "text-chart-3" },
]

const FeatureHighlights = () => (
  <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm w-full">
    {featureData.map(({ icon: Icon, label, color }) => (
      <div key={label} className="flex flex-col items-center text-center p-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    ))}
  </div>
)

const AuthFooter = () => (
  <footer className="p-4 text-center">
    <p className="text-xs text-muted-foreground">Open Source AI Framework</p>
  </footer>
)

const AuthForm = () => {
  const { signIn, signUp, loading: isAuthLoading } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const passwordStrength = usePasswordStrength(password)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      if (isSignUp) {
        if (passwordStrength.score < 3) {
          setFormError("Please choose a stronger password.")
          return
        }
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setFormError(err.message || (isSignUp ? "Signup failed" : "Login failed"))
    }
  }

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp)
    setFormError(null)
    setPassword("")
  }

  return (
    <Card className="w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{isSignUp ? "Create Account" : "Welcome to Lumina"}</CardTitle>
        <CardDescription>{isSignUp ? "Sign up to get started" : "Sign in to your account"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="pr-12 h-12 bg-input/50"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {isSignUp && <PasswordStrengthIndicator password={password} />}
          </div>

          {!isSignUp && (
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
            </div>
          )}
          
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{formError}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isAuthLoading}>
            {isAuthLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </span>
            ) : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="text-center">
            <Button type="button" variant="link" className="text-sm text-muted-foreground hover:text-foreground" onClick={toggleFormMode}>
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// --- Main Login Screen Component ---

export function LoginScreen() {
  return (
    <div className="min-h-dvh flex flex-col bg-background p-4 safe-top safe-bottom">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/5 rounded-full blur-3xl animate-pulse animation-delay-300" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center">
        <AuthHeader />
        <AuthForm />
        <FeatureHighlights />
      </main>

      <AuthFooter />
    </div>
  )
}