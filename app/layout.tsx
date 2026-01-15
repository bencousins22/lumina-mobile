import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lumina | Autonomous AI Framework",
  description: "Your open-source AI companion. Limitless, transparent, and entirely yours.",
  generator: "Lumina",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" }
    ]
  },
  openGraph: {
    title: "Lumina | Autonomous AI Framework",
    description: "Your open-source AI companion. Limitless, transparent, and entirely yours.",
    type: "website",
    url: "https://lumina-mobile.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina | Autonomous AI Framework",
    description: "Your open-source AI companion. Limitless, transparent, and entirely yours.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased overscroll-none">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
