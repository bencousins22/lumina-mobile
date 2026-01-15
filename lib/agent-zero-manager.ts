/**
 * Agent Zero Instance Manager
 * 
 * Manages deployment and connection to isolated Agent Zero instances
 */

export interface AgentZeroInstance {
  instanceId: string
  instanceUrl: string
  projectId: string
  region: string
  accessToken: string
  refreshToken: string
  createdAt: string
  expiresAt: string
}

export interface InstanceConfig {
  userId: string
  userEmail: string
  userName: string
}

export class AgentZeroManager {
  private instances: Map<string, AgentZeroInstance> = new Map()

  /**
   * Deploy a new Agent Zero instance for a user
   */
  async deployInstance(config: InstanceConfig): Promise<AgentZeroInstance> {
    try {
      const response = await fetch('/api/deploy-agent-zero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to deploy instance')
      }

      const instance = await response.json()
      
      // Cache the instance
      this.instances.set(config.userId, instance)
      
      return instance
    } catch (error) {
      console.error('Failed to deploy Agent Zero instance:', error)
      throw error
    }
  }

  /**
   * Get user's active instances
   */
  async getUserInstances(userId: string): Promise<AgentZeroInstance[]> {
    try {
      // First check cache
      const cachedInstance = this.instances.get(userId)
      if (cachedInstance && this.isInstanceValid(cachedInstance)) {
        return [cachedInstance]
      }

      // Fetch from database
      const response = await fetch(`/api/deploy-agent-zero?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch instances')
      }

      const data = await response.json()
      const instances = data.instances || []

      // Update cache
      instances.forEach((instance: AgentZeroInstance) => {
        if (this.isInstanceValid(instance)) {
          this.instances.set(instance.instanceId, instance)
        }
      })

      return instances
    } catch (error) {
      console.error('Failed to get user instances:', error)
      throw error
    }
  }

  /**
   * Delete an Agent Zero instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    try {
      const response = await fetch(`/api/deploy-agent-zero?instanceId=${instanceId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete instance')
      }

      // Remove from cache
      this.instances.forEach((instance, key) => {
        if (instance.instanceId === instanceId) {
          this.instances.delete(key)
        }
      })
    } catch (error) {
      console.error('Failed to delete instance:', error)
      throw error
    }
  }

  /**
   * Check if an instance is still valid
   */
  private isInstanceValid(instance: AgentZeroInstance): boolean {
    const now = new Date()
    const expiresAt = new Date(instance.expiresAt)
    return now < expiresAt
  }

  /**
   * Get a specific instance by ID
   */
  getInstance(instanceId: string): AgentZeroInstance | null {
    for (const instance of this.instances.values()) {
      if (instance.instanceId === instanceId && this.isInstanceValid(instance)) {
        return instance
      }
    }
    return null
  }

  /**
   * Refresh instance access token
   */
  async refreshToken(instanceId: string): Promise<string> {
    try {
      const instance = this.getInstance(instanceId)
      if (!instance) {
        throw new Error('Instance not found')
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      return data.accessToken
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw error
    }
  }

  /**
   * Clean up expired instances
   */
  cleanupExpiredInstances(): void {
    const now = new Date()
    for (const [key, instance] of this.instances.entries()) {
      if (new Date(instance.expiresAt) < now) {
        this.instances.delete(key)
      }
    }
  }
}

// Export singleton instance
export const agentZeroManager = new AgentZeroManager()
