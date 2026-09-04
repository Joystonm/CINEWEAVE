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

  // Submit music job to GMI and return immediately with request_id.
  // GMI Music 3.0 is synchronous (30-60s) so we do NOT wait for the result —
  // the frontend polls /api/gmi/status/:id using the returned request_id.
  try {
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
    })

    if (!response.ok) {
      const err = await response.text()
      console.log('Music API error response:', err)
      return { statusCode: response.status, body: JSON.stringify({ error: 'Music submission failed', detail: err }) }
    }

    const data = await response.json()

    // Return the request_id immediately — do NOT wait for synchronous result
    // Frontend will poll /api/gmi/status/:id until status === 'success'
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        request_id: data.request_id,
        status: 'processing',
      }),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit Music job', detail: message }) }
  }
}
