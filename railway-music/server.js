// Railway-compatible music API server for CineWeave
// Handles MiniMax Music 3.0 generation
// No execution timeout - runs on Railway's infrastructure

import { createServer } from 'http'

const GMI_BASE = 'https://console.gmicloud.ai'
const GMI_SUBMIT = '/api/v1/ie/requestqueue/apikey/requests'

const PORT = process.env.PORT || 3000

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(res, status, data) {
  res.writeHead(status, { ...CORS_HEADERS, 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => resolve(body))
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    })
    res.end()
    return
  }

  // Health check
  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // Music generate - POST /api/music/generate or /music/generate
  if ((url.pathname === '/api/music/generate' || url.pathname === '/music/generate') && req.method === 'POST') {
    if (!process.env.GMI_API_KEY) {
      return json(res, 503, { error: 'GMI_API_KEY not set in environment' })
    }

    let body
    try {
      body = await readBody(req)
    } catch {
      return json(res, 400, { error: 'Failed to read request body' })
    }

    let params
    try {
      params = JSON.parse(body)
    } catch {
      return json(res, 400, { error: 'Invalid JSON in request body' })
    }

    const {
      lyrics,
      prompt,
      sample_rate = 44100,
      bitrate = 256000,
      format = 'mp3',
    } = params

    if (!lyrics) {
      return json(res, 400, { error: 'lyrics is required' })
    }

    console.log(`[Music] Submitting job to GMI...`)

    try {
      const response = await fetch(`${GMI_BASE}${GMI_SUBMIT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GMI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'minimax-music-3.0',
          payload: { lyrics, prompt, sample_rate, bitrate, format },
        }),
      })

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const errText = await response.text()
        console.log(`[Music] Non-JSON response from GMI:`, errText.slice(0, 200))
        return json(res, 502, { error: 'GMI returned invalid response', detail: errText.slice(0, 200) })
      }

      const data = await response.json()
      console.log(`[Music] GMI response:`, JSON.stringify(data))

      if (!response.ok) {
        return json(res, response.status, {
          error: 'Music submission failed',
          detail: data.error || data.message || `HTTP ${response.status}`,
        })
      }

      // Music 3.0 is synchronous - if outcome is already available, return it directly
      // Otherwise return request_id and let frontend poll for result
      if (data.status === 'success' && data.outcome) {
        return json(res, 200, {
          success: true,
          request_id: data.request_id,
          status: 'success',
          outcome: data.outcome,
        })
      }

      return json(res, 200, {
        success: true,
        request_id: data.request_id,
        status: data.status || 'processing',
      })
    } catch (err) {
      console.error(`[Music] Error:`, err.message)
      return json(res, 500, { error: 'Failed to submit music job', detail: err.message })
    }
  }

  // GMI status - GET /api/gmi/status/:requestId or /gmi/status/:requestId
  if ((url.pathname.startsWith('/api/gmi/status/') || url.pathname.startsWith('/gmi/status/')) && req.method === 'GET') {
    if (!process.env.GMI_API_KEY) {
      return json(res, 503, { error: 'GMI_API_KEY not set' })
    }

    const requestId = url.pathname.split('/api/gmi/status/')[1] || url.pathname.split('/gmi/status/')[1]
    if (!requestId) {
      return json(res, 400, { error: 'request_id is required' })
    }

    console.log(`[Music] Checking status for: ${requestId}`)

    try {
      const response = await fetch(`${GMI_BASE}/api/v1/ie/requestqueue/apikey/requests/${requestId}`, {
        headers: { 'Authorization': `Bearer ${process.env.GMI_API_KEY}` },
      })

      const data = await response.json()
      console.log(`[Music] Status response:`, JSON.stringify(data))

      return json(res, 200, {
        success: true,
        request_id: data.request_id,
        model: data.model,
        status: data.status,
        outcome: data.outcome || null,
      })
    } catch (err) {
      console.error(`[Music] Status error:`, err.message)
      return json(res, 500, { error: 'Failed to check job status', detail: err.message })
    }
  }

  json(res, 404, { error: `Not found: ${req.method} ${url.pathname}` })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 CineWeave Music API running on port ${PORT}`)
  console.log(`   GMI_API_KEY: ${process.env.GMI_API_KEY ? '✓ set' : '✗ missing'}\n`)
})
