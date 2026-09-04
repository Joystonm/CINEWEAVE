import type { Handler } from '@netlify/functions'

const GMI_BASE = 'https://console.gmicloud.ai'
const GMI_SUBMIT = '/api/v1/ie/requestqueue/apikey/requests'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

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
    text,
    voice_id = 'English_expressive_narrator',
    speed = 1,
    vol = 1,
    pitch = 0,
    emotion = 'auto',
    format = 'mp3',
    sound_effects = '',
  } = JSON.parse(event.body || '{}')

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'text is required' }) }
  }

  const body = JSON.stringify({
    model: 'minimax-tts-speech-2.8-hd',
    payload: {
      text,
      voice_id,
      speed: String(speed),
      vol: String(vol),
      pitch: String(pitch),
      emotion,
      language_boost: 'auto',
      format,
      audio_sample_rate: '44100',
      bitrate: '256000',
      channel: '2',
      vm_pitch: 0,
      intensity: 0,
      timbre: 0,
      sound_effects,
    },
  })

  // Retry up to 3 times on 503 capacity errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${GMI_BASE}${GMI_SUBMIT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GMI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body,
      })

      const data = await response.json()

      if (response.ok) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, request_id: data.request_id, status: data.status }),
        }
      }

      if (response.status === 503 && attempt < 3) {
        await sleep(attempt * 3000)
        continue
      }

      const msg = response.status === 503
        ? 'Speech 2.8 is at capacity. Please try again in a few seconds.'
        : (data.error || 'Speech generation failed')

      return {
        statusCode: response.status,
        body: JSON.stringify({ error: msg }),
      }
    } catch (err) {
      if (attempt === 3) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit Speech job', detail: message }) }
      }
      await sleep(attempt * 3000)
    }
  }

  return { statusCode: 503, body: JSON.stringify({ error: 'Speech 2.8 is at capacity. Please try again.' }) }
}
