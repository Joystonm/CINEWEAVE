// Local dev server — mirrors all Netlify Function routes
// Run with: node server.js
// Requires: .env file with OPENROUTER_API_KEY and GMI_API_KEY

import { createServer } from 'http'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually
try {
  const env = readFileSync(resolve(__dirname, '.env'), 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...val] = line.split('=')
    if (key && !key.startsWith('#') && key.trim()) {
      process.env[key.trim()] = val.join('=').trim()
    }
  }
} catch {
  console.log('No .env file found — API keys not loaded')
}

const GMI_BASE = 'https://console.gmicloud.ai'
const OR_BASE = 'https://openrouter.ai/api/v1'

async function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(data))
}

const server = createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' })
    return res.end()
  }

  const url = req.url || ''

  // Health
  if (url === '/api/health') {
    return json(res, 200, { status: 'ok', openrouter: !!process.env.OPENROUTER_API_KEY, gmi: !!process.env.GMI_API_KEY })
  }

  // M3
  if (url === '/api/m3/direct' && req.method === 'POST') {
    if (!process.env.OPENROUTER_API_KEY) return json(res, 503, { error: 'OPENROUTER_API_KEY not set in .env' })
    const { idea, genre, mood } = await readBody(req)
    try {
      const r = await fetch(`${OR_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://cineweave.app', 'X-Title': 'CineWeave' },
        body: JSON.stringify({
          model: 'minimax/minimax-m3:free',
          messages: [
            { role: 'system', content: `You are CineWeave's Creative Director. Transform the idea into a cinematic blueprint JSON with this structure: {"title":"","logline":"","creative_direction":{"genre":"","tone":"","visual_language":"","color_palette":"","cinematography_style":""},"emotional_arc":{"opening":"","escalation":"","climax":"","resolution":""},"scenes":[{"scene":1,"title":"","purpose":"","camera":"","lighting":"","emotion":"","duration_seconds":5,"video_prompt":""}],"music_brief":{"style":"","opening":"","middle":"","climax":"","ending":"","prompt":""},"narration":{"style":"","text":"","emotion":""},"h3_primary_prompt":""}` },
            { role: 'user', content: `Idea: ${idea}\nGenre: ${genre || 'undecided'}\nMood: ${mood || 'undecided'}` }
          ],
          response_format: { type: 'json_object' }, temperature: 0.8, max_tokens: 4000
        })
      })
      const data = await r.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) return json(res, 500, { error: 'Empty M3 response' })
      try { 
        // M3 sometimes wraps JSON in markdown fences — strip them
        let cleaned = content.trim()
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        }
        return json(res, 200, { success: true, blueprint: JSON.parse(cleaned), usage: data.usage }) 
      }
      catch { return json(res, 200, { success: true, blueprint: { raw: content } }) }
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  // M2.7
  if (url === '/api/m27/assist' && req.method === 'POST') {
    if (!process.env.OPENROUTER_API_KEY) return json(res, 503, { error: 'OPENROUTER_API_KEY not set in .env' })
    const { task, context } = await readBody(req)
    try {
      const r = await fetch(`${OR_BASE}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://cineweave.app', 'X-Title': 'CineWeave' },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.7:free',
          messages: [
            { role: 'system', content: 'You are CineWeave workflow assistant. Respond in JSON: {"result":"","suggestions":[],"issues":[],"optimized_prompt":""}' },
            { role: 'user', content: `Task: ${task}\nContext: ${JSON.stringify(context || {})}` }
          ],
          response_format: { type: 'json_object' }, temperature: 0.5, max_tokens: 1500
        })
      })
      const data = await r.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) return json(res, 500, { error: 'Empty M2.7 response' })
      try { 
        let cleaned = content.trim()
        if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
        return json(res, 200, { success: true, result: JSON.parse(cleaned) }) 
      }
      catch { return json(res, 200, { success: true, result: { result: content } }) }
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  // H3 generate
  if (url === '/api/h3/generate' && req.method === 'POST') {
    if (!process.env.GMI_API_KEY) return json(res, 503, { error: 'GMI_API_KEY not set in .env' })
    const { prompt, resolution = '2K', duration = 5, ratio = '16:9' } = await readBody(req)
    if (!prompt) return json(res, 400, { error: 'prompt required' })
    try {
      const r = await fetch(`${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GMI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'MiniMax-H3', payload: { prompt, resolution, duration, ratio } })
      })
      const data = await r.json()
      return json(res, 200, { success: true, request_id: data.request_id, status: data.status })
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  // GMI status polling
  if (url.startsWith('/api/gmi/status/') && req.method === 'GET') {
    if (!process.env.GMI_API_KEY) return json(res, 503, { error: 'GMI_API_KEY not set in .env' })
    const requestId = url.split('/api/gmi/status/')[1]
    try {
      const r = await fetch(`${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests/${requestId}`, {
        headers: { 'Authorization': `Bearer ${process.env.GMI_API_KEY}` }
      })
      const data = await r.json()
      // Log full response for debugging
      console.log(`GMI status for ${requestId}:`, JSON.stringify(data))
      return json(res, 200, { success: true, request_id: data.request_id, model: data.model, status: data.status, outcome: data.outcome || null })
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  // Speech generate
  if (url === '/api/speech/generate' && req.method === 'POST') {
    if (!process.env.GMI_API_KEY) return json(res, 503, { error: 'GMI_API_KEY not set in .env' })
    const { text, voice_id = 'English_expressive_narrator', emotion = 'auto', speed = 1 } = await readBody(req)
    if (!text) return json(res, 400, { error: 'text required' })
    try {
      // Retry up to 3 times on capacity errors
      let data, lastStatus
      for (let attempt = 1; attempt <= 3; attempt++) {
        const r = await fetch(`${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GMI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'minimax-tts-speech-2.8-hd', payload: { text, voice_id, speed: String(speed), vol: '1', pitch: '0', emotion, language_boost: 'auto', format: 'mp3', audio_sample_rate: '44100', bitrate: '256000', channel: '2', vm_pitch: 0, intensity: 0, timbre: 0, sound_effects: '' } })
        })
        data = await r.json()
        lastStatus = r.status
        if (r.ok) break
        if (r.status === 503 && attempt < 3) {
          console.log(`Speech 503 capacity, retrying (${attempt}/3) in ${attempt * 3}s...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 3000))
        } else {
          const msg = r.status === 503
            ? 'Speech 2.8 is at capacity. Please try again in a few seconds.'
            : (data.error || 'Speech generation failed')
          return json(res, r.status, { error: msg })
        }
      }
      return json(res, 200, { success: true, request_id: data.request_id, status: data.status })
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  // Music generate
  if (url === '/api/music/generate' && req.method === 'POST') {
    if (!process.env.GMI_API_KEY) return json(res, 503, { error: 'GMI_API_KEY not set in .env' })
    const { lyrics, prompt, sample_rate = 44100, bitrate = 256000, format = 'mp3' } = await readBody(req)
    if (!lyrics) return json(res, 400, { error: 'lyrics required' })
    try {
      // Retry up to 3 times on capacity errors
      let data, lastStatus
      for (let attempt = 1; attempt <= 3; attempt++) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10_000)
        const r = await fetch(`${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.GMI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'minimax-music-3.0', payload: { lyrics, prompt, sample_rate, bitrate, format } }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        // Handle non-JSON responses (HTML error pages)
        const contentType = r.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const errText = await r.text()
          console.log(`Music API non-JSON response (attempt ${attempt}):`, errText.slice(0, 200))
          if (attempt === 3) return json(res, 502, { error: 'Music API returned invalid response', detail: errText.slice(0, 200) })
          await new Promise(resolve => setTimeout(resolve, attempt * 2000))
          continue
        }

        data = await r.json()
        lastStatus = r.status
        if (r.ok) break
        if ((r.status === 503 || r.status === 429) && attempt < 3) {
          console.log(`Music ${r.status}, retrying (${attempt}/3) in ${attempt * 3}s...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 3000))
        } else {
          const msg = (r.status === 503 || r.status === 429)
            ? 'Music 3.0 is at capacity. Please try again in a few seconds.'
            : (data.error || data.message || 'Music generation failed')
          return json(res, r.status, { error: msg })
        }
      }
      if (data.status === 'success' && data.outcome) return json(res, 200, { success: true, request_id: data.request_id, status: 'success', outcome: data.outcome })
      return json(res, 200, { success: true, request_id: data.request_id, status: data.status })
    } catch (e) { return json(res, 500, { error: e.message }) }
  }

  return json(res, 404, { error: `Route not found: ${url}` })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`\n🎬 CineWeave dev API running on http://localhost:${PORT}`)
  console.log(`   OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✓' : '✗ missing OPENROUTER_API_KEY'}`)
  console.log(`   GMI Cloud:  ${process.env.GMI_API_KEY ? '✓' : '✗ missing GMI_API_KEY'}\n`)
})
