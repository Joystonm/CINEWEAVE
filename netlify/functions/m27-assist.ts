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

  const { task, context } = JSON.parse(event.body || '{}')

  const system = `You are CineWeave's Workflow Assistant powered by MiniMax M2.7.
Your role is to help with fast workflow operations:
- Validate workflow connections and detect issues
- Refine and optimize prompts for downstream models
- Suggest improvements to workflow configurations

Be concise and practical. Respond in JSON format:
{
  "result": "string",
  "suggestions": ["string"],
  "issues": ["string"],
  "optimized_prompt": "string"
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
        model: 'minimax/minimax-m2.7:free',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Task: ${task}\n\nContext: ${JSON.stringify(context || {})}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: response.status, body: JSON.stringify({ error: 'M2.7 API error', detail: err }) }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Empty response from M2.7' }) }
    }

    try {
      const result = JSON.parse(content)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, result, usage: data.usage }),
      }
    } catch {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, result: { result: content }, usage: data.usage }),
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to call M2.7', detail: message }) }
  }
}
