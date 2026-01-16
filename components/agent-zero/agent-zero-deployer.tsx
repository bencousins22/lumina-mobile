/**
 * Agent Zero Instance Deployer Component
 * 
 * Handles deployment and management of isolated Agent Zero instances
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Server, Zap, Shield, Clock, ExternalLink, Trash2, RefreshCw } from "lucide-react"
import { useAgentZero } from "@/hooks/use-agent-zero"
import { formatDistanceToNow } from "date-fns"

export function AgentZeroDeployer() {
  const { instance, isLoading, error, deployInstance, deleteInstance, refreshInstance } = useAgentZero()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeploy = async () => {
    await deployInstance()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteInstance()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefresh = async () => {
    await refreshInstance()
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Agent Zero Instance
          </CardTitle>
          <CardDescription>
            Deploy and manage your isolated Agent Zero environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {instance ? (
            <div className="space-y-4">
              {/* Instance Info */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Active
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Instance ID: {instance.instanceId}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        Created {formatDistanceToNow(new Date(instance.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        Expires {formatDistanceToNow(new Date(instance.expiresAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(instance.instanceUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting || isLoading}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>

              {/* Instance Details */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <h4 className="font-semibold">Instance Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">URL:</span> {instance.instanceUrl}
                    </div>
                    <div>
                      <span className="font-medium">Project:</span> {instance.projectId}
                    </div>
                    <div>
                      <span className="font-medium">Region:</span> {instance.region}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Resources</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>2 CPU cores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      <span>4GB RAM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Isolated environment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Instance</h3>
              <p className="text-muted-foreground mb-4">
                Deploy your personal Agent Zero instance to get started
              </p>
              <Button
                onClick={handleDeploy}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Deploy Instance
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      {!instance && (
        <Card>
          <CardHeader>
            <CardTitle>Instance Features</CardTitle>
            <CardDescription>
              What you get with your Agent Zero instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-semibold">Isolated Environment</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete isolation from other users
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Zap className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="font-semibold">High Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    2 CPU cores, 4GB RAM
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold">24 Hour Runtime</h4>
                  <p className="text-sm text-muted-foreground">
                    Auto-extended with activity
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AgentZeroDeployer
