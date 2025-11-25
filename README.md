# Gen Jargon Translator

Goal: Web app that converts text between:
- "Old -> Young": corporate/boomer/over-formal English -> Gen Z / internet slang
- "Young -> Old": Gen Z / internet slang -> professional / corporate English

Stack:
- Node.js + Express backend
- Static frontend from `public/`
- API endpoint: `POST /api/translate`
- AI provider: **Perplexity Sonar API**, using the **OpenAI Node SDK** with:
  - baseURL = `https://api.perplexity.ai`
  - apiKey = `process.env.PERPLEXITY_API_KEY`

Hosting:
- Deployed on Render as a Node web service
- Connected to this GitHub repo
- Environment variable on Render:
  - `PERPLEXITY_API_KEY=your-perplexity-key`

## Deploying on Render
1. Push this repo to GitHub.  
2. In Render, create a new **Web Service** and connect the repo.  
3. Build command: `npm install`  
4. Start command: `npm start`  
5. Environment variables: not required because the Perplexity key is baked into `server.js`. To override, set `PERPLEXITY_API_KEY`.  
6. Deploy. Render will serve the app on the generated URL.
