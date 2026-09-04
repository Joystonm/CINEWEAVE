import type { Handler } from '@netlify/functions'

const GMI_BASE = 'https://console.gmicloud.ai'
const GMI_SUBMIT = '/api/v1/ie/requestqueue/apikey/requests'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
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

  const {
    prompt,
    resolution = '2K',
    duration = 5,
    ratio = '16:9',
    first_frame_image,
    last_frame_image,
  } = JSON.parse(event.body || '{}')

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'prompt is required' }) }
  }

  const payload: Record<string, unknown> = { prompt, resolution, duration, ratio }
  if (first_frame_image) payload.first_frame_image = first_frame_image
  if (last_frame_image) payload.last_frame_image = last_frame_image

  try {
    const response = await fetch(`${GMI_BASE}${GMI_SUBMIT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'MiniMax-H3', payload }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: JSON.stringify({ error: 'H3 submission failed', detail: err }) }
    }

    const data = await response.json()
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, request_id: data.request_id, status: data.status }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit H3 job', detail: message }) }
  }
}
