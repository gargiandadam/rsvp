# RSVP Website

A small static RSVP site built with React, Vite, GitHub Pages, and Google Apps Script.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add the Google Apps Script Web App URL:

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Google Apps Script

1. Create a Google Sheet.
2. Open **Extensions > Apps Script**.
3. Paste in `google-apps-script/Code.gs`.
4. Deploy as a **Web app**.
5. Set **Execute as** to **Me**.
6. Set **Who has access** to **Anyone**.
7. Copy the `/exec` Web App URL into `.env`.

Expected sheet columns:

```text
Timestamp
Guest Name
RSVP Status
Number of Guests
Additional Guest Name
Marriage Advice
```

## GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

Before deploying:

1. In GitHub, go to **Settings > Pages**.
2. Set deployment source to **GitHub Actions**.
3. Add an Actions secret named `VITE_APPS_SCRIPT_URL`.
4. Push to `main`.

If the page is blank, confirm GitHub Pages is set to **GitHub Actions**, not **Deploy from a branch**. This is a Vite app, so GitHub Pages must serve the generated `dist` build.

## Customization

- Update copy and event details in `src/App.jsx`.
- Update colors and fonts in `src/styles.css`.
- Update the Google Fonts import in `index.html` if needed.

## Notes

- Do not commit `.env`.
- Do not put private Google credentials in frontend code.
- The form includes a simple honeypot field for basic spam reduction.
