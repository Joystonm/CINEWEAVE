import type {
  M3Response,
  M27Response,
  GMISubmitResponse,
  GMIStatusResponse,
} from '../types'

const BASE = '/api'

async function apiCall<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.detail || data.error || `API error ${res.status}`)
  }

  return data as T
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkHealth() {
  return apiCall<{ status: string; openrouter: boolean; gmi: boolean }>('/health')
}

// ─── M3 Creative Director ─────────────────────────────────────────────────────
export async function callM3Director(params: {
  idea: string
  genre?: string
  mood?: string
}): Promise<M3Response> {
  return apiCall<M3Response>('/m3/direct', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ─── M2.7 Workflow Assistant ──────────────────────────────────────────────────
export async function callM27Assistant(params: {
  task: string
  context?: Record<string, unknown>
}): Promise<M27Response> {
  return apiCall<M27Response>('/m27/assist', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ─── H3 Video Generation ──────────────────────────────────────────────────────
export async function submitH3Video(params: {
  prompt: string
  resolution?: string
  duration?: number
  ratio?: string
  first_frame_image?: string
  last_frame_image?: string
}): Promise<GMISubmitResponse> {
  return apiCall<GMISubmitResponse>('/h3/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ─── Speech 2.8 Generation ───────────────────────────────────────────────────
export async function submitSpeech(params: {
  text: string
  voice_id?: string
  emotion?: string
  speed?: number
  sound_effects?: string
}): Promise<GMISubmitResponse> {
  return apiCall<GMISubmitResponse>('/speech/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ─── Music 3.0 Generation ────────────────────────────────────────────────────
export async function submitMusic(params: {
  lyrics: string
  prompt?: string
  format?: string
}): Promise<GMISubmitResponse & { outcome?: GMIStatusResponse['outcome'] }> {
  return apiCall('/music/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// ─── Poll GMI Job Status ──────────────────────────────────────────────────────
export async function pollJobStatus(requestId: string): Promise<GMIStatusResponse> {
  return apiCall<GMIStatusResponse>(`/gmi/status/${requestId}`)
}

// ─── Polling helper: poll until done ─────────────────────────────────────────
export async function pollUntilComplete(
  requestId: string,
  onUpdate: (status: string) => void,
  intervalMs = 3000,
  maxAttempts = 60
): Promise<GMIStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const check = async () => {
      attempts++
      try {
        const result = await pollJobStatus(requestId)
        onUpdate(result.status)

        if (result.status === 'success') {
          resolve(result)
          return
        }

        if (result.status === 'failed' || result.status === 'cancelled') {
          reject(new Error(`Job ${result.status}: ${requestId}`))
          return
        }

        if (attempts >= maxAttempts) {
          reject(new Error('Job timed out after maximum polling attempts'))
          return
        }

        setTimeout(check, intervalMs)
      } catch (err) {
        reject(err)
      }
    }

    check()
  })
}
