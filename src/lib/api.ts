// src/lib/api.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserClusters() {
  const {
    data,
    error
  } = await supabase.from('clusters').select('*').order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clusters:', error)
    return []
  }
  return data
}

export async function extractMetricsFromLogs(files: FileList) {
  const metrics: any = {
    cpu: 0,
    memory: 0,
    slow_queries: [],
    slow_query_count: 0,
  }

  for (const file of Array.from(files)) {
    const text = await file.text()
    const lines = text.split('\n')

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line)

        if (parsed.attr?.name === 'cpu') metrics.cpu += parsed.attr?.value || 0
        if (parsed.attr?.name === 'mem') metrics.memory += parsed.attr?.value || 0

        if (parsed.component === 'COMMAND' && parsed.attr?.ns && parsed.attr?.millis && parsed.attr.millis > 100) {
          metrics.slow_queries.push(parsed)
          metrics.slow_query_count++
        }
      } catch (e) {
        // Skip non-JSON lines
      }
    }
  }

  // Average CPU/memory if multiple files
  if (files.length > 0) {
    metrics.cpu = Math.round(metrics.cpu / files.length)
    metrics.memory = Math.round(metrics.memory / files.length)
  }

  return metrics
}

export async function saveMetricsAndStartAnalysis({ metrics, clusterId, userId, organizationId }: any) {
  const { data: metricsData, error: metricsError } = await supabase
    .from('log_metrics')
    .insert([{ ...metrics, cluster_id: clusterId, user_id: userId, organization_id: organizationId }])
    .select()
    .single()

  if (metricsError) {
    throw new Error('Failed to store metrics: ' + metricsError.message)
  }

  const { data: analysisData, error: analysisError } = await supabase
    .from('ai_analyses')
    .insert([
      {
        name: 'AI Analysis - ' + new Date().toISOString(),
        log_metrics_id: metricsData.id,
        cluster_id: clusterId,
        user_id: userId,
        organization_id: organizationId
      }
    ])
    .select()
    .single()

  if (analysisError) {
    throw new Error('Failed to create analysis: ' + analysisError.message)
  }

  return analysisData
}

export async function runOpenAIAIAnalysis(metrics: any) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a MongoDB expert helping users diagnose performance issues from MongoDB log metrics. Provide detailed findings and expert recommendations.'
        },
        {
          role: 'user',
          content: `Here are the extracted metrics from MongoDB logs:\n${JSON.stringify(metrics, null, 2)}`
        }
      ]
    })
  })

  const json = await res.json()
  return json.choices?.[0]?.message?.content || 'No response from OpenAI'
}

