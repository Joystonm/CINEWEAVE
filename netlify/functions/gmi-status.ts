import type { Handler } from '@netlify/functions'

const GMI_BASE = 'https://console.gmicloud.ai'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!process.env.GMI_API_KEY) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'GMI Cloud API key not configured.',
        detail: 'Add GMI_API_KEY to your Netlify environment variables.',
      }),
    }
  }

  // Extract requestId from path: /.netlify/functions/gmi-status/REQUEST_ID
  const pathParts = (event.path || '').split('/')
  const requestId = pathParts[pathParts.length - 1]

  if (!requestId || requestId === 'gmi-status') {
    return { statusCode: 400, body: JSON.stringify({ error: 'request_id is required in path' }) }
  }

  try {
    const response = await fetch(
      `${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests/${requestId}`,
      {
        headers: { Authorization: `Bearer ${process.env.GMI_API_KEY}` },
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: JSON.stringify({ error: 'Status check failed', detail: err }) }
    }

    const data = await response.json()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        request_id: data.request_id,
        model: data.model,
        status: data.status,
        outcome: data.outcome || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to check job status', detail: message }) }
  }
}
