"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { MainApp } from "@/components/main-app"

export default function Home() {
  return (
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  )
}
