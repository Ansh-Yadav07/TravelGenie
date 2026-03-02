# Travel Genie Frontend & API

This directory contains a simple front-end for a travel planner and a minimal Node/Express backend for demonstrations.

## Features

- Multi-tab interface with dark, bold theme
- Home tab with bubble-style inputs, calendar, currency select, mood/interest/companions
- Autocomplete place lookup, backed by a sample API
- Google Maps integration for hotel and attraction search
- API endpoints for place filtering and recommendations

## Running locally

1. Navigate to the folder in terminal:
   ```bash
   cd "c:\Users\Taraksh Pratap Singh\Desktop\travel genie\travel-frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Obtain a Google Maps API key and replace `YOUR_API_KEY` in `index.html` with it.
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in your browser.

The server serves the front-end and provides `/api/places` and `/api/recommendations` endpoints.

Feel free to extend the backend logic or integrate real data sources (Google Maps, ratings, currency conversion, etc.).
