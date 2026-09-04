import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'ok',
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gmi: !!process.env.GMI_API_KEY,
    }),
  }
}
