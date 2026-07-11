# 🎙️ VoxTutor — AI Mock Interview Platform

Users sign in, pick a domain and level, and an AI voice agent conducts a real interview.
Gemini generates the questions. Vapi voices them. Firebase stores everything. Users never enter any keys.

Developed by:

Mohith Raju
Sathwik Vasu

Users sign in, pick a domain and level, and an AI voice agent conducts a real interview. Gemini generates the questions. Vapi voices them. Firebase stores everything. Users never enter any keys.
---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Voice AI | Vapi Web SDK |
| Question + Feedback AI | Google Gemini 1.5 Flash |
| Interview AI model | OpenAI GPT-4o-mini (via Vapi) |
| Auth + Database | Firebase Auth + Firestore |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Setup (do this in order)

### 1. Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project — e.g. `voxtutor`
3. **Authentication** → Sign-in method → enable **Email/Password** + **Google**
4. **Firestore** → Create database → Start in **test mode** (you'll lock it down below)
5. **Project Settings** → Your apps → Add **Web app** → copy the config object (client keys)
6. **Project Settings** → Service accounts → **Generate new private key** → download the JSON (admin keys)

### 2. Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API key** → Create API key in new project
3. Copy it (starts with `AIza...`)

### 3. Vapi Public Key + OpenAI Key

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai) → sign up
2. Account (bottom left) → copy your **Public Key** (starts with `vapi_pub_...`)
3. In Vapi dashboard → **Provider Keys** → add your **OpenAI API key**
   - Vapi uses OpenAI's `gpt-4o-mini` as the interview brain
   - Get OpenAI key at [platform.openai.com](https://platform.openai.com)

### 4. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See the example file for descriptions.

### 5. Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab → paste the contents of `firestore.rules` → Publish.

### 6. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How the full flow works

```
1.  User signs in (Google or email/password)
         ↓ Firebase Auth creates session cookie
2.  Dashboard loads their interview history from Firestore

3.  User clicks "New Interview" → picks domain + level + duration
         ↓
4.  /api/vapi/generate → Gemini generates N questions
         ↓
5.  createInterview() saves interview + questions to Firestore
         ↓
6.  User redirected to /interview/[id]

7.  Page loads questions FROM Firestore (not URL params)
         ↓
8.  Vapi Web SDK connects → "Alex" (AI voice agent) starts the interview
    - Alex speaks questions via PlayHT voice
    - Deepgram transcribes user's speech in real time
    - GPT-4o-mini generates Alex's adaptive follow-ups

9.  Every transcript line → /api/transcript → saved to Firestore immediately
    (so even if user refreshes, transcript is preserved)

10. User clicks "End Interview" (or timer runs out, or Alex says end phrase)
         ↓
11. /api/feedback → Gemini analyzes the full transcript
    → scores 4 categories → generates verdict, strengths, improvements
    → feedback saved to Firestore
         ↓
12. User redirected to /interview/[id]/feedback → sees full report

13. Dashboard shows all past interviews with scores
```

---

## Deploy to Vercel

```bash
npx vercel
```

In Vercel Dashboard → **Settings → Environment Variables** → add all variables from `.env.local`

> For `FIREBASE_PRIVATE_KEY`: paste the value with `\n` literally — Vercel handles newlines correctly.

---

## Project Structure

```
app/
├── (auth)/
│   ├── sign-in/          # Sign-in page
│   └── sign-up/          # Sign-up page
├── (root)/
│   ├── dashboard/        # Interview history + stats
│   └── interview/[id]/
│       ├── page.tsx      # Live interview room
│       └── feedback/     # Feedback report
├── api/
│   ├── vapi/generate/    # Gemini question generation
│   ├── transcript/       # Real-time transcript → Firestore
│   └── feedback/         # Gemini feedback analysis → Firestore
└── page.tsx              # Landing page

components/
├── ui/                   # AuthForm, Navbar
├── interview/            # InterviewPageClient (Vapi + transcript)
└── dashboard/            # NewInterviewButton, InterviewCard

firebase/
├── client.ts             # Firebase client SDK
└── admin.ts              # Firebase Admin SDK (server-only)

lib/
├── actions/              # Server actions (auth, CRUD)
└── constants.ts          # Domains, difficulties, durations

firestore.rules           # Paste into Firebase Console → Firestore → Rules
```

---

## What each key does

| Key | Where it's used | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_VAPI_KEY` | Client — starts Vapi voice call | dashboard.vapi.ai → Account |
| `GEMINI_API_KEY` | Server — generates questions + feedback | aistudio.google.com |
| `NEXT_PUBLIC_FIREBASE_*` | Client — auth + Firestore reads | Firebase Console → Web app config |
| `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` | Server — admin writes | Firebase → Service accounts → JSON |
| OpenAI key | Added in Vapi dashboard — never in your code | platform.openai.com |
