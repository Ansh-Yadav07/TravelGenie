# TravelGenie

**TravelGenie** is a premium, AI-powered travel planning application that helps users discover destinations, plan personalized itineraries, and find the perfect accommodations. It uses the Gemini API to generate highly specific, realistic trip plans tailored to your exact mood, budget, and companions.

## Tech Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS 4** (Custom Design System)
- **Framer Motion** for smooth, modern animations
- **Lucide React** for premium iconography

### Backend
- **Python 3.10+** with **FastAPI**
- **Google GenAI SDK** (Gemini 1.5 Flash) for intelligent itinerary generation

---

## Local Development Setup

To run TravelGenie locally, you need to run both the frontend and the backend simultaneously.

### 1. Backend (FastAPI + Gemini)

The backend handles the AI API calls securely.

```bash
cd TravelGenieAI
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `TravelGenieAI` folder with your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend server:
```bash
python main.py
```
*The backend will run on http://localhost:8000*

### 2. Frontend (React + Vite)

In a new terminal window, start the frontend:

```bash
# From the root directory (TravelGenie/)
npm install
npm run dev
```
*The frontend will run on http://localhost:5173*

---

## Deployment Guide

You **cannot** simply deploy the frontend to Vercel without also deploying the backend. The frontend relies on the Python FastAPI backend to communicate securely with the Gemini API. If you only deploy the frontend, the app will try to call `localhost:8000` for AI generation, which will fail for actual users on the internet.

You need to deploy them separately:

### Step 1: Deploy the Backend (Render or Railway)
Because the backend is a Python FastAPI server, it needs a persistent host.
1. Create an account on **Render.com** or **Railway.app**.
2. Create a new "Web Service".
3. Point it to this GitHub repository.
4. Set the Root Directory to `TravelGenieAI`.
5. Set the Start Command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add your `GEMINI_API_KEY` as an Environment Variable.
7. Once deployed, copy the backend URL (e.g., `https://travelgenie-api.onrender.com`).

### Step 2: Deploy the Frontend (Vercel)
1. Create an account on **Vercel.com**.
2. Import this GitHub repository.
3. Keep the Root Directory as the default (the main folder).
4. **Important**: Add an Environment Variable named `VITE_API_URL` and set its value to your deployed backend URL from Step 1 (e.g., `VITE_API_URL=https://travelgenie-api.onrender.com`).
5. Click **Deploy**.

---

## Features
- **Highly Specific AI Plans:** Suggests real-world places, actual restaurants, and specific hotels (no generic placeholders).
- **Custom Design System:** Premium, neutral-first dark mode UI with modern typography.
- **Dynamic Filtering:** Adjust your budget, pace, mood, and transport to dynamically recalculate the trip matrix.

## Team
- Ansh Yadav
- Taraksh Pratap Singh
- Dishan Kumar
