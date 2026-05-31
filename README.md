# Calisthenics Log

A dead-simple workout tracker for bodyweight training, built on
[KBoges](https://www.kboges.com/) principles: **a few compound movements,
full range of motion, consistent effort — sustainability over complexity.**

It's a Progressive Web App (PWA). No app store, no account, no server.
Your data lives only on your phone. Works fully offline once installed.

## Features

- **Today** — a short suggested full-body session (push / pull / legs / core)
  with form cues and gentle "stop a couple reps shy of failure" targets.
- **Log** — free-log any movement and variation whenever you want.
- **History** — per-day history, weekly streak strip, export to JSON.
- Rep- and time-based movements, each with progressions from easy to hard.
- Installs to your home screen and runs like a native app, offline.

## Movements

Push-ups · Dips · Pull-ups · Rows · Squats · Core holds — each with a
progression ladder so you advance variation, not just numbers.

## Install on Android

1. Host the folder over HTTPS (see below) and open the URL in Chrome.
2. Menu (⋮) → **Add to Home screen** / **Install app**.
3. Launch from the icon — it opens fullscreen and works without a connection.

## Hosting (free, via GitHub Pages)

Push this repo, then in GitHub: **Settings → Pages → Build from branch**,
pick the branch and `/ (root)`. Your app appears at
`https://<user>.github.io/<repo>/`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
A service worker (and "Add to Home screen") needs HTTPS or `localhost`.

## Tech

Plain HTML/CSS/JS — no framework, no build step. Files: `index.html`,
`styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icons/`.
Data is stored in `localStorage` under the key `cal_log_v1`.
