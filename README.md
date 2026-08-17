# Study Abroad Application Tracker

A single-file web app for tracking university applications end to end — programmes, deadlines, documents, recommenders, test scores, scholarships, expenses, visa steps and contacts.

No server, no accounts, no dependencies. One HTML file.

**Live version:** https://YOUR-USERNAME.github.io/study-abroad-tracker/

## Your data is yours

Everything you enter is stored in **your own browser**, on your own machine. Nothing is uploaded, nothing is transmitted, and the person hosting this page cannot see anything you type into it. Two people using the same link have two completely separate trackers.

That also means: **clearing your browser data deletes it.** Use one of these:

- **Data & settings → Choose data file** (Chrome/Edge) — every change writes directly to a `.json` file on your disk. Safest option.
- **Data & settings → Export backup** — download a `.json` snapshot whenever you remember to.

⚠️ If you fork this repo, **never commit your exported backup file.** The repository is public; your bank statements and application details should not be. The included `.gitignore` blocks `*.json` for exactly this reason.

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

Download `index.html` and double-click it. It works from disk with no web server. Hosting it just makes it easier to share and slightly more reliable for browser storage.

## Licence

Do whatever you like with it.
