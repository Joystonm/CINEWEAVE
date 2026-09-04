# CineWeave Music API — Railway Deployment

MiniMax Music 3.0 API proxy that runs on Railway (no execution timeout).

## Why Railway?

Netlify Functions timeout at ~10s (free tier). MiniMax Music 3.0 takes 30-60s to generate.
Railway has no execution timeout on free tier, making it ideal for long-running music generation.

## Deploy to Railway

### Option 1: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Go to the music API folder
cd railway-music

# Initialize Railway project
railway init

# Set GMI API key as environment variable
railway variables set GMI_API_KEY=your_gmi_api_key_here

# Deploy
railway up
```

### Option 2: GitHub Connect

1. Push `railway-music/` folder to a new GitHub repo
2. Go to https://railway.app
3. New Project → Deploy from GitHub repo
4. Set `GMI_API_KEY` environment variable in Railway dashboard

## Get Your Railway URL

After deploying, your Railway URL will be shown in the dashboard.
It will look like: `https://cineweave-music-[random].up.railway.app`

## Configure Frontend

In your Netlify site environment variables, add:

```
VITE_MUSIC_API_URL=https://your-railway-url.up.railway.app
```

Then rebuild/redeploy your Netlify frontend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/music/generate` | Submit music generation job |
| GET | `/api/gmi/status/:requestId` | Check job status |
| GET | `/health` | Health check |

## Test Locally

```bash
cd railway-music
GMI_API_KEY=your_key node server.js
```

Then test with:
```bash
curl -X POST http://localhost:3000/api/music/generate \
  -H "Content-Type: application/json" \
  -d '{"lyrics":"[verse]\nHello world\n\n[chorus]\nTest song","prompt":"pop"}'
```
