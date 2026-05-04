# Gargi & Adam RSVP Website

An elegant static RSVP site for Gargi and Adam's Civil Ceremony Celebration Party on August 22, 2026 at 7:00 PM. The frontend is built with React + Vite for GitHub Pages, and RSVP submissions are saved to Google Sheets through Google Apps Script.

## Architecture

```text
Guest browser
  -> GitHub Pages React site
  -> Google Apps Script Web App
  -> Google Sheet
```

The frontend only contains the public Apps Script web app URL. No private Google credentials are exposed.

## Project Structure

```text
.
├── google-apps-script/
│   └── Code.gs
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` after deploying the Google Apps Script web app:

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Start the site locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Google Sheets Setup

1. Create a new Google Sheet.
2. Rename the first sheet tab to `RSVP Responses`, or let the Apps Script create it.
3. Add these header columns if you want to prepare it manually:
   - Timestamp
   - Guest Name
   - RSVP Status
   - Number of Guests
   - Custom Question 1
   - Custom Question 2

## Google Apps Script Setup

1. In the Google Sheet, choose **Extensions > Apps Script**.
2. Replace the default code with the contents of `google-apps-script/Code.gs`.
3. Save the project.
4. Click **Deploy > New deployment**.
5. Choose **Web app**.
6. Set **Execute as** to **Me**.
7. Set **Who has access** to **Anyone**.
8. Deploy and authorize the script.
9. Copy the Web App URL ending in `/exec`.
10. Paste that URL into `.env` as `VITE_APPS_SCRIPT_URL`.

## GitHub Pages Deployment

### Option A: Deploy with GitHub Actions

This repo already includes `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          VITE_APPS_SCRIPT_URL: ${{ secrets.VITE_APPS_SCRIPT_URL }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in GitHub:

1. Go to **Settings > Pages**.
2. Set **Build and deployment** to **GitHub Actions**.
3. Go to **Settings > Secrets and variables > Actions**.
4. Add a repository secret named `VITE_APPS_SCRIPT_URL`.
5. Push to `main`.

### Option B: Deploy the `dist` Folder Manually

Run:

```bash
npm run build
```

Upload the generated `dist` folder to the branch or hosting flow you use for GitHub Pages.

## Updating Invite Styling

Most visual customization lives in `src/styles.css`:

```css
:root {
  --color-sage: #98ae87;
  --color-ink: #624a44;
  --font-heading: "Cormorant Garamond", Georgia, serif;
}
```

To match the invite:

- Replace `--color-sage` with the invite's main accent color.
- Replace `--color-ink` with the invite's text color.
- Update the Google Fonts link in `index.html` if the invite uses a different web font.
- Update names, date, and wording in `src/App.jsx`.

## Security and Spam Prevention

- Do not put Google service account credentials or private keys in the frontend.
- The Apps Script URL is public by design, but it can only append to the connected sheet as configured.
- This site includes a hidden honeypot field named `website` to reduce simple bot spam.
- For a private wedding site, consider sharing the link only with invited guests.
- If spam becomes a concern, add a simple invite code field and verify it in Apps Script before saving.
- Apps Script does not support custom CORS headers cleanly, so the frontend submits with `mode: "no-cors"`. The user still sees a confirmation after the request is sent.
