# Deploying CineWeave to Netlify

CineWeave runs entirely on Netlify — the React frontend is served as a static site and all API calls run as Netlify Functions (serverless). No separate backend server needed.

---

## Prerequisites

- A [Netlify account](https://netlify.com) (free tier works)
- Your API keys:
  - **OpenRouter** — get at [openrouter.ai/keys](https://openrouter.ai/keys)
  - **GMI Cloud** — get at [console.gmicloud.ai](https://console.gmicloud.ai)

---

## Option A: Deploy via GitHub (recommended — auto-deploy on push)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — CineWeave"
git remote add origin https://github.com/YOUR_USERNAME/cineweave.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Select your GitHub repo
3. Netlify auto-detects `netlify.toml` — settings are pre-configured:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
4. Click **Deploy site**

### 3. Set environment variables

In Netlify dashboard → **Site configuration → Environment variables → Add a variable**:

| Key | Value |
|-----|-------|
| `OPENROUTER_API_KEY` | `sk-or-...` |
| `GMI_API_KEY` | `gmi-...` |

Click **Save**, then **Trigger deploy** → **Deploy site**.

---

## Option B: Deploy via Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Build & deploy
npm run build
netlify deploy --prod --dir=dist
```

Then add the environment variables in the Netlify dashboard as above and redeploy.

---

## How it works in production

```
Browser
  │
  ├── GET /              → dist/index.html  (React SPA)
  │
  ├── POST /api/m3/direct       → /.netlify/functions/m3-direct
  ├── POST /api/m27/assist      → /.netlify/functions/m27-assist
  ├── POST /api/h3/generate     → /.netlify/functions/h3-generate
  ├── POST /api/speech/generate → /.netlify/functions/speech-generate
  ├── POST /api/music/generate  → /.netlify/functions/music-generate
  └── GET  /api/gmi/status/:id  → /.netlify/functions/gmi-status
```

The redirects in `netlify.toml` map all `/api/*` requests to the corresponding function. API keys stay inside the functions — never exposed to the browser.

---

## Local development

Use the Netlify CLI to run everything locally — it spins up Vite and the Functions together with one command:

```bash
# Install CLI globally if you haven't
npm install -g netlify-cli

# Set up your keys
cp .env.example .env
# Open .env and fill in OPENROUTER_API_KEY and GMI_API_KEY

# Run locally
npm run dev
# → http://localhost:8888
```

`netlify dev` automatically routes `/api/*` to your local functions, exactly as in production. No separate server needed.

---

## Troubleshooting

**Functions returning 503** — API keys not set. Go to Netlify → Site configuration → Environment variables.

**`netlify` command not found** — Run `npm install -g netlify-cli` first.

**H3 video taking a long time** — Normal. The browser polls GMI every 4 seconds for up to 6 minutes. Each poll is a fast individual function call, well within Netlify's limits.
