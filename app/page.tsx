"use client"

import { useUIContext } from "@/components/providers"
import { LoginScreen } from "@/components/auth/login-screen"
import { MainApp } from "@/components/main-app"

export default function Home() {
  const { isAuthenticated } = useUIContext()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <MainApp />
}
