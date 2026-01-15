/**
 * Deploy Agent Zero Instance API Route
 * 
 * Creates a new isolated Agent Zero instance for each user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateTokenPair } from '@/lib/auth'

// Google Cloud Run deployment configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id'
const REGION = 'us-central1'
const SERVICE_NAME = 'agent-zero-instance'

interface DeploymentRequest {
  userId: string
  userEmail: string
  userName: string
}

interface DeploymentResponse {
  success: boolean
  instanceId: string
  instanceUrl: string
  projectId: string
  region: string
  createdAt: string
  expiresAt: string
}

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json()
    const { userId, userEmail, userName } = body

    // Validate input
    if (!userId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'User ID, email, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already has an active instance
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingInstance } = await supabase
      .from('agent_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (existingInstance) {
      return NextResponse.json({
        success: true,
        instanceId: existingInstance.instance_id,
        instanceUrl: existingInstance.instance_url,
        projectId: existingInstance.project_id,
        region: existingInstance.region,
        createdAt: existingInstance.created_at,
        expiresAt: existingInstance.expires_at,
      } as DeploymentResponse)
    }

    // Generate unique instance ID
    const instanceId = `agent-zero-${userId}-${Date.now()}`
    const instanceName = `agent-zero-${userId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`

    // Create deployment configuration
    const deploymentConfig = {
      service: {
        name: instanceName,
        project: PROJECT_ID,
        region: REGION,
        template: 'projects/' + PROJECT_ID + '/locations/' + REGION + '/services/' + SERVICE_NAME,
        scaling: {
          minInstances: 0,
          maxInstances: 1,
        },
        resources: {
          cpu: 2,
          memory: '4Gi',
          diskSize: '10Gi',
        },
        container: {
          image: 'gcr.io/' + PROJECT_ID + '/agent-zero:latest',
          ports: {
            containerPort: 8080,
          },
          env: [
            {
              name: 'INSTANCE_ID',
              value: instanceId,
            },
            {
              name: 'USER_ID',
              value: userId,
            },
            {
              name: 'USER_EMAIL',
              value: userEmail,
            },
            {
              name: 'USER_NAME',
              value: userName,
            },
            {
              name: 'PORT',
              value: '8080',
            },
            {
              name: 'ENVIRONMENT',
              value: 'production',
            },
            {
              name: 'API_KEY',
              value: generateApiKey(),
            },
          ],
        },
        timeout: '3600s',
      },
      traffic: [
        {
          type: 'revision',
          revision: 'latest',
          percent: 100,
        },
      ],
    }

    // Deploy to Google Cloud Run
    const deployResponse = await deployToCloudRun(deploymentConfig, instanceName)
    
    if (!deployResponse.success) {
      throw new Error('Failed to deploy Agent Zero instance')
    }

    // Store instance information in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const { data: instanceRecord } = await supabase
      .from('agent_instances')
      .insert({
        instance_id: instanceId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        instance_url: deployResponse.url,
        project_id: PROJECT_ID,
        region: REGION,
        service_name: instanceName,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Generate access token for the instance
    const { accessToken, refreshToken } = await generateTokenPair({
      id: userId,
      instanceId: instanceId,
      email: userEmail,
      name: userName,
      role: 'user',
    })

    return NextResponse.json({
      success: true,
      instanceId: instanceId,
      instanceUrl: deployResponse.url,
      projectId: PROJECT_ID,
      region: REGION,
      createdAt: instanceRecord.created_at,
      expiresAt: instanceRecord.expires_at,
      accessToken,
      refreshToken,
    } as DeploymentResponse)

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Failed to deploy Agent Zero instance' },
      { status: 500 }
    )
  }
}

async function deployToCloudRun(config: any, serviceName: string) {
  try {
    // This would use Google Cloud SDK to deploy
    // For now, return a mock response
    const instanceUrl = `https://${serviceName}-${Math.random().toString(36).substring(2, 8)}.run.app`
    
    // In a real implementation, you would:
    // 1. Call gcloud CLI or Google Cloud Admin SDK
    // 2. Deploy the service
    // 3. Wait for deployment to complete
    // 4. Return the actual URL
    
    return {
      success: true,
      url: instanceUrl,
      serviceUrl: instanceUrl,
    }
  } catch (error) {
    console.error('Cloud Run deployment error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user's active instances
    const { data: instances } = await supabase
      .from('agent_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      instances: instances || [],
    })
  } catch (error) {
    console.error('Error fetching instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instanceId = searchParams.get('instanceId')

    if (!instanceId) {
      return NextResponse.json(
        { error: 'Instance ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update instance status to inactive
    const { data: instance } = await supabase
      .from('agent_instances')
      .update({ 
        status: 'inactive',
        deleted_at: new Date().toISOString()
      })
      .eq('instance_id', instanceId)
      .select()
      .single()

    // In a real implementation, you would also:
    // 1. Delete the Cloud Run service
    // 2. Clean up any resources
    // 3. Handle billing implications

    return NextResponse.json({
      success: true,
      message: 'Instance deleted successfully',
      instance,
    })
  } catch (error) {
    console.error('Error deleting instance:', error)
    return NextResponse.json(
      { error: 'Failed to delete instance' },
      { status: 500 }
    )
  }
}
