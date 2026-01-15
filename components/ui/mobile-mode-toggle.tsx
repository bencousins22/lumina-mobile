/**
 * Mobile Mode Toggle Component
 * 
 * Provides a button to toggle between desktop and mobile view modes
 * with snap-in functionality for full-screen mobile experience
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Monitor, Smartphone, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileModeToggleProps {
  className?: string
}

export function MobileModeToggle({ className }: MobileModeToggleProps) {
  const [isMobileMode, setIsMobileMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Check if we're in mobile mode on mount
  useEffect(() => {
    const checkMobileMode = () => {
      const width = window.innerWidth
      setIsMobileMode(width < 768)
    }

    checkMobileMode()
    window.addEventListener('resize', checkMobileMode)
    return () => window.removeEventListener('resize', checkMobileMode)
  }, [])

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err)
      }
    }
  }

  // Toggle mobile mode with snap animation
  const toggleMobileMode = () => {
    if (isMobileMode) {
      // Exit mobile mode
      document.body.classList.remove('mobile-mode-active')
      document.body.classList.add('snap-out')
      
      setTimeout(() => {
        document.body.style.width = ''
        document.body.style.maxWidth = ''
        document.body.style.margin = ''
        document.body.style.transform = ''
        document.body.style.transformOrigin = ''
        document.body.style.overflow = ''
        document.body.classList.remove('snap-out')
      }, 300)
      
      setIsMobileMode(false)
      if (isFullscreen) {
        toggleFullscreen()
      }
    } else {
      // Enter mobile mode
      const viewportWidth = 375 // iPhone width
      const viewportHeight = 812 // iPhone height
      const scale = Math.min(
        window.innerWidth / viewportWidth,
        window.innerHeight / viewportHeight
      )

      document.body.style.width = `${viewportWidth}px`
      document.body.style.maxWidth = `${viewportWidth}px`
      document.body.style.margin = '0 auto'
      document.body.style.transform = `scale(${scale})`
      document.body.style.transformOrigin = 'center center'
      document.body.style.overflow = 'hidden'
      
      document.body.classList.add('mobile-mode-active')
      document.body.classList.add('snap-in')
      
      setTimeout(() => {
        document.body.classList.remove('snap-in')
      }, 300)
      
      setIsMobileMode(true)
      
      // Auto-enter fullscreen for immersive experience
      if (!isFullscreen) {
        setTimeout(() => {
          toggleFullscreen()
        }, 500)
      }
    }
  }

  // Handle escape key to exit mobile mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMode) {
        toggleMobileMode()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMode])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement && isMobileMode) {
        // Exit mobile mode when fullscreen is exited
        toggleMobileMode()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isMobileMode])

  return (
    <>
      {/* Mobile Mode Toggle */}
      <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-2", className)}>
        <Button
          onClick={toggleMobileMode}
          variant={isMobileMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-105",
            isMobileMode && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          title={isMobileMode ? "Exit Mobile Mode (ESC)" : "Enter Mobile Mode"}
        >
          {isMobileMode ? (
            <Monitor className="h-5 w-5" />
          ) : (
            <Smartphone className="h-5 w-5" />
          )}
        </Button>

        {/* Fullscreen Toggle (only show in mobile mode) */}
        {isMobileMode && (
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="h-10 w-10 rounded-full shadow-lg bg-background border-border hover:bg-muted"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Mobile Mode Indicator */}
        {isMobileMode && (
          <div className="absolute -top-2 -right-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Mobile Mode Indicator */}
      {isMobileMode && (
        <div className="mobile-mode-indicator">
          Mobile Mode Active
        </div>
      )}
    </>
  )
}

// Hook to use mobile mode state
export function useMobileMode() {
  const [isMobileMode, setIsMobileMode] = useState(false)

  useEffect(() => {
    const checkMobileMode = () => {
      const width = window.innerWidth
      setIsMobileMode(width < 768)
    }

    checkMobileMode()
    window.addEventListener('resize', checkMobileMode)
    return () => window.removeEventListener('resize', checkMobileMode)
  }, [])

  return { isMobileMode, setIsMobileMode }
}
