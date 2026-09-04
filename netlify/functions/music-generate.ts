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
    lyrics,
    prompt,
    sample_rate = 44100,
    bitrate = 256000,
    format = 'mp3',
  } = JSON.parse(event.body || '{}')

  if (!lyrics) {
    return { statusCode: 400, body: JSON.stringify({ error: 'lyrics are required' }) }
  }

  try {
    // Music 3.0 can take 30-60s to respond (synchronous operation)
    // Increase timeout to 90s to accommodate long generation time
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 90_000)

    const response = await fetch(`${GMI_BASE}${GMI_SUBMIT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GMI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'minimax-music-3.0',
        payload: { lyrics, prompt, sample_rate, bitrate, format },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      console.log('Music API error response:', err)
      return { statusCode: response.status, body: JSON.stringify({ error: 'Music submission failed', detail: err }) }
    }

    const data = await response.json()

    // If already success (sync response), return outcome directly
    if (data.status === 'success' && data.outcome) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          request_id: data.request_id,
          status: 'success',
          outcome: data.outcome,
        }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, request_id: data.request_id, status: data.status }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit Music job', detail: message }) }
  }
}
