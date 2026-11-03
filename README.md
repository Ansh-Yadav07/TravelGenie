# TravelGenie

An AI trip planner for India. Tell it where you're going, who's coming and how you like to travel. Google Gemini then plans every day with real, named places, real stays and transport options, and a budget that adds up.

## Features
- **Day-by-day itinerary** with times, costs, durations and an "Open in Maps" link for every stop. Hour-wise plans for short visits.
- **Transparent budget.** The budget scales with trip length, travelers and tier, and the plan's estimate is checked against it.
- **Live progress** while Gemini writes the plan ("Planning day 2 of 4…"), with cancel and retry.
- **Adjust & regenerate.** Change budget, vibe, pace, days or travelers without re-entering everything.
- **Saved trips.** Plans are stored in your browser (no account), and you can share them or print them / save as PDF.
- **Explore & Stays.** Curated destinations and stays, each with a link to plan a trip there.
- **Apple-style design.** Light and dark mode follow your system, and the layout works on phone and desktop.

## Tech stack
- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Framer Motion, Lucide icons (`src/`)
- **Backend:** Python FastAPI + httpx, calling the Gemini REST API with structured JSON output and model fallback (`TravelGenieAI/`). See [TravelGenieAI/README.md](TravelGenieAI/README.md) for the full API contract.

## Local development

```bash
npm install
npm run api:setup          # creates TravelGenieAI/.venv and installs the backend
cp TravelGenieAI/.env.example TravelGenieAI/.env   # then set GEMINI_API_KEY
```

Run the backend and the frontend in two terminals:

```bash
npm run api                # FastAPI on http://localhost:8000
```

```bash
npm run dev                # Vite on http://localhost:5173 (proxies /api to :8000)
```

No API key? Start the backend with `TRAVELGENIE_DEMO=1 npm run api` to get labelled sample plans.

Other scripts: `npm run lint`, `npm run build`, `npm run api:test`.

## Deployment
Deploy the two parts separately:

1. **Backend** (Render / Railway): root directory `TravelGenieAI`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `GEMINI_API_KEY`, and set `ALLOWED_ORIGINS` to your frontend URL.
2. **Frontend** (Vercel / Netlify): build `npm run build`, output `dist`. Set `VITE_API_URL` to the backend URL (e.g. `https://travelgenie-api.onrender.com`). `VITE_API_URL` is read at build time, so redeploy after changing it. On Vercel, `vercel.json` makes routes like `/trip/:id` serve `index.html`; other hosts need an equivalent SPA rewrite.

## Team
- Ansh Yadav
- Taraksh Pratap Singh
- Dishan Kumar
