import type { Handler } from '@netlify/functions'

const OR_BASE = 'https://openrouter.ai/api/v1'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      statusCode: 503,
      body: JSON.stringify({
        error: 'OpenRouter API key not configured.',
        detail: 'Add OPENROUTER_API_KEY to your Netlify environment variables.',
      }),
    }
  }

  const { idea, genre, mood } = JSON.parse(event.body || '{}')

  const system = `You are CineWeave's Creative Director powered by MiniMax M3.
Your role is to transform a raw creative idea into a structured cinematic blueprint.
Think deeply about narrative structure, pacing, emotional progression, visual continuity,
cinematic language, camera decisions, and scene relationships.

Always respond with a JSON object matching this exact structure:
{
  "title": "string",
  "logline": "string (one sentence)",
  "creative_direction": {
    "genre": "string",
    "tone": "string",
    "visual_language": "string",
    "color_palette": "string",
    "cinematography_style": "string"
  },
  "emotional_arc": {
    "opening": "string",
    "escalation": "string",
    "climax": "string",
    "resolution": "string"
  },
  "scenes": [
    {
      "scene": 1,
      "title": "string",
      "purpose": "string",
      "camera": "string",
      "lighting": "string",
      "emotion": "string",
      "duration_seconds": 5,
      "video_prompt": "string"
    }
  ],
  "music_brief": {
    "style": "string",
    "opening": "string",
    "middle": "string",
    "climax": "string",
    "ending": "string",
    "prompt": "string"
  },
  "narration": {
    "style": "string",
    "text": "string",
    "emotion": "string"
  },
  "h3_primary_prompt": "string (the main H3 video generation prompt - detailed and cinematic)"
}`

  try {
    const response = await fetch(`${OR_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cineweave.netlify.app',
        'X-Title': 'CineWeave',
      },
      body: JSON.stringify({
        model: 'minimax/minimax-m3:free',
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Creative Idea: ${idea}\nGenre: ${genre || 'undecided'}\nMood: ${mood || 'undecided'}\n\nTransform this into a complete cinematic blueprint.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: JSON.stringify({ error: 'M3 API error', detail: err }) }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Empty response from M3' }) }
    }

    try {
      let cleaned = content.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      }
      const blueprint = JSON.parse(cleaned)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, blueprint, usage: data.usage }),
      }
    } catch {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, blueprint: { raw: content }, usage: data.usage }),
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to call M3', detail: message }) }
  }
}
