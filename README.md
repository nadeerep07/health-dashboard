# APEX 100 — Health & Body Transformation Dashboard

> **APEX 100** is a personal transformation dashboard and daily transformation coach engineered for precision weight loss, deterministic exact-gram nutrition tracking, 7-day rolling moving averages, and continuous habit adherence.

---

## 🌟 Core Pillars & Capabilities

### 1. 🍽️ Deterministic Nutrition Engine
* **Exact Scale Gram Basis:** Operates on strict 100g database fundamentals ($E = \frac{\text{Grams} \times \text{Density}}{100}$).
* **State Recognition:** Disambiguates `RAW`, `COOKED`, and `EDIBLE` weights (e.g. 190g cooked rice vs raw grain).
* **Multi-Item Plate Parsing:** Fast natural language parser extracting mixed plates (e.g. *190g white rice, 60g fish fry, 150g thoran*).
* **AI Extraction Fallback:** Structured schema parsing using Google Gemini 3.5 Flash exclusively for uncataloged ingredients.

### 2. 📉 Rolling Weight Trend Analytics
* **Noise Filtering:** Daily water and food fluctuations are smoothed using a **7-Day Trailing Simple Moving Average (SMA)**.
* **Dual-Curve Visualization:** SVG charts plotting actual fasted weigh-in data points against the smoothed trendline and goal baseline.

### 3. 🔄 Offline-First Synchronization
* **Zero-Latency Interactions:** Immediate optimistic updates to `localStorage`.
* **Debounced Cloud Sync:** Mutation queue flushes automatically to Supabase PostgreSQL when an internet connection is active.
* **Conflict Resolution:** Last-write-wins timestamp arbitration between Web UI and Telegram Bot logs.

### 4. 🤖 Telegram Companion Bot
* **Fast Meal Logging:** Natural language voice/text and vision logging on the go.
* **Proactive Reminders:** Morning weigh-in, 5km walk progress, and daily macro scorecards.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons |
| **Design System** | Vanilla CSS Design Tokens (Deep Emerald, Modern Teal, Botanical Charcoal) |
| **Data & Cloud** | Supabase (PostgreSQL + Row-Level Security), LocalStorage Queue |
| **AI / NLP** | Google Gemini 3.5 Flash API (`@google/genai`) |
| **Bot Gateway** | Node.js, `node-telegram-bot-api`, Vercel Serverless Webhook |
| **Testing** | Vitest (21/21 Unit & Daily User Regression Tests) |

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Running Locally
```bash
# Start Vite Development Server
npm run dev

# Start Telegram Bot Companion (Optional)
npm run bot
```

### 4. Running Automated Verification
```bash
# Run Vitest test suites
npm test

# Build production bundle
npm run build
```

---

## 🔒 Security & Privacy

* **Client PIN Barrier:** 4-digit numeric passcode protecting on-screen dashboard data.
* **Zero Client Secret Leaks:** Production build strips all backend secrets and service keys.
* **Row-Level Security:** PostgreSQL policies restrict record access strictly to the authenticated user ID.
