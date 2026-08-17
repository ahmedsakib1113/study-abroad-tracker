# Study Abroad Application Tracker

A single-file web app for tracking university applications end to end — programmes, deadlines, documents, recommenders, test scores, scholarships, expenses, visa steps and contacts.

No build step, no server code to maintain — one HTML file, with Firebase handling accounts and data storage.

**Live version:** https://ahmedsakib1113.github.io/study-abroad-tracker/

## Accounts

Each person signs up with their own email and password. Your data is stored under your account (Firestore) and cached locally in your browser for speed — sign in with the same email/password from any device to reach the same tracker. Two people using the same link, or even the same computer, get two completely separate trackers as long as they sign in as themselves.

That also means: as long as you remember your password, clearing your browser data does **not** delete your data — it's re-downloaded on next sign-in. It's still worth keeping backups:

- **Data & settings → Choose data file** (Chrome/Edge) — every change writes directly to a `.json` file on your disk too, if you want a local copy independent of the cloud.
- **Data & settings → Export backup** — download a `.json` snapshot whenever you remember to.

⚠️ If you fork this repo, **never commit your exported backup file**, and never commit real Firebase credentials for a project you care about keeping private (the config below is not secret by itself — see the security rules step — but treat your own project deliberately). The included `.gitignore` blocks `*.json` for exactly this reason.

## Set up your own login (Firebase, free)

This app doesn't ship with a working login out of the box — you point it at your own free Firebase project so you (and whoever you share the link with) control the data.

1. Go to the [Firebase console](https://console.firebase.google.com), sign in with a Google account, and **Add project** (the free "Spark" plan is enough).
2. In the left sidebar: **Build → Authentication → Get started**. Under "Sign-in method", enable **Email/Password**.
3. In the left sidebar: **Build → Firestore Database → Create database**. Pick any nearby region, and start in **production mode**.
4. Still in Firestore, go to the **Rules** tab and replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   Click **Publish**. This is what actually keeps each account's data private — without it, anyone could read anyone else's.
5. Click the gear icon → **Project settings → General**, scroll to "Your apps", click the web icon (`</>`), give it any nickname, and register it. Firebase shows you a `firebaseConfig` object.
6. Open `index.html`, search for `firebaseConfig`, and replace the placeholder values with the ones Firebase gave you.
7. Save, then open (or redeploy) `index.html`. You should see a sign-in screen; create an account to try it.

Serving the file over `http(s)` — GitHub Pages, Netlify, or any static host — is recommended over double-clicking it from disk, for the most reliable auth behaviour.

## Set up Sakib (AI assistant)

Sakib is a chat assistant (the "S" button, bottom-right) that can see your own tracker data — applications, deadlines, scholarships — and answer questions like "what's due this week?". It's optional; the rest of the app works fine without it.

It needs a tiny backend (in `worker/`) so its AI API key never sits inside this public HTML file:

1. Get a **free** Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no credit card needed).
2. Create a free [Cloudflare](https://dash.cloudflare.com/sign-up) account (also no card needed for the free tier used here).
3. Install Wrangler (Cloudflare's CLI) and log in:
   ```
   npm install -g wrangler
   wrangler login
   ```
4. In `worker/wrangler.toml`, set `FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY` (same values as your `firebaseConfig` in `index.html`), and `ALLOWED_ORIGINS` (your GitHub Pages / hosting URL, and `http://localhost:<port>` for local testing) if they aren't already right.
5. From inside `worker/`, add your Gemini key as a secret (never committed to git):
   ```
   wrangler secret put GEMINI_API_KEY
   ```
6. Deploy it:
   ```
   wrangler deploy
   ```
   Wrangler prints a URL like `https://sakib-assistant.<your-subdomain>.workers.dev`.
7. Open `index.html`, search for `SAKIB_WORKER_URL`, and paste that URL in.

**Privacy note:** the free Gemini API tier means Google may review prompts/responses (your applications/deadlines, sent as plain data) to improve their products — unlike their paid tier. Keep that in mind before sending anything more sensitive than study-abroad planning details.

## What's in it

| Section | What it tracks |
|---|---|
| Applications | University, programme, intake, tier, status pipeline, deadlines, portal link and username, per-school requirement checklist |
| Pipeline board | The same applications as draggable cards across ten stages |
| Compare offers | Every live application side by side — tuition, scholarship, net cost, first-year total, all with a home-currency equivalent |
| Documents | Versioned SOPs, transcripts, CV, financial papers — stores the link to the file, not a copy |
| Recommenders | Who is writing for which school, and whether the letter has actually been submitted |
| Test scores | Scores, section breakdown, validity expiry, and which universities received official reports |
| Scholarships | Separate deadlines and award amounts |
| Expenses | Multi-currency spend, converted to one base currency |
| Visa tracker | Post-acceptance step checklist per country |
| Contacts | Admissions officers, agents, current students |
| Deadlines | Every dated item from every section, in one sorted list |

## Currency

Amounts show in the school's own currency with your home currency beside it (`A$96,000 ≈ ৳77,26,829`). Set your home currency in **Data & settings**.

Exchange rates are **manual** — no live rate API, by design, so the app never breaks offline. Check and update them in settings before making any decision that turns on money.

## Running it locally instead

Download `index.html` and double-click it, once you've pointed it at your own Firebase project as above. It still needs an internet connection to sign in and sync — it's no longer a fully offline file. Hosting it makes sign-in more reliable and easier to share.

## Licence

Do whatever you like with it.
