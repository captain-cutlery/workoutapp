# Calisthenics Log

A dead-simple workout tracker for bodyweight training, built on
[KBoges](https://www.kboges.com/) principles — *a few compound movements, full
range of motion, consistent effort, sustainability over complexity* — and the
exercise progressions from the
[r/bodyweightfitness Recommended Routine (RR)](https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/).

It's a **Progressive Web App (PWA)**: plain HTML/CSS/JS, no framework, no build
step, no account, no server. All data lives on the device in `localStorage`.
Works fully offline once installed.

---

## For a future session (orientation)

If you're an assistant picking this project up fresh, read this section first.

- **Stack:** vanilla HTML/CSS/JS PWA. No dependencies, no build, no tests yet.
- **Files:** `index.html` (markup + SW registration), `styles.css`, `app.js`
  (all logic), `sw.js` (service worker, offline cache), `manifest.webmanifest`,
  `icons/` (generated PNGs).
- **Hosting:** GitHub Pages off `main` (Settings → Pages → deploy from `main`,
  root). Live at `https://captain-cutlery.github.io/workoutapp/`.
- **Repo:** `captain-cutlery/workoutapp`. The user runs Android + the GitHub
  mobile app, and is newer to git — explain GitHub steps simply.
- **Workflow:** develop on branch `claude/android-workout-app-O9EFD`, commit,
  push, then open a PR and **post the PR/merge URL** for the user to tap-merge
  in the GitHub mobile app. One batch of work = one PR. Do **not** create a PR
  unless asked, but here the user expects a merge link after each change.
- **Versioning:** every release bumps **two** values that must stay in step —
  `APP_VERSION` in `app.js` and `CACHE` in `sw.js` (e.g. `v17` / `cal-log-v17`).
  The version also shows in Settings as `APP_LABEL` (e.g. `v17 · 31 May 2026`).
- **Caching gotcha:** the SW is **network-first** so updates land on the next
  online launch. If an install ever seems stuck, Settings → **Check for update**
  forces it; last resort is clearing site data (which also wipes logs — export
  first).
- **Data shape:** `LOG` is an array of set objects:
  `{ id, ts, day:'YYYY-MM-DD', movement, variation, rir, value, weight, note }`.
  Holds store seconds in `value` (`type: 'time'`); reps store count
  (`type: 'reps'`). Bike HIIT sessions store total work-seconds in `value` and
  the structure in `rir`/`note`.
- **localStorage keys:** `cal_log_v1` (log), `cal_session_v1` (custom Today
  session), `cal_settings_v1` (settings), `cal_hiit_v1` (last HIIT setup).

---

## Features

### Logging
- **Today tab** — a suggested full-body session mirroring the RR structure
  (Pair A: Pull-ups + Squats · Pair B: Dips + Hinge · Pair C: Rows + Push-ups ·
  Core triplet). Fully editable via the **Edit** link; custom sessions persist.
- **Log tab** — free-log any movement and variation any time.
- One-tap logging via a bottom sheet: variation chips, value stepper, effort
  (RIR), optional **added weight** (kg/lb), optional **note**.
- **Last time** reference shows your previous session for that movement.
- **Repeat last set** (↻) button on a movement card duplicates your last set.
- **Edit / delete** any logged set (tap it in Today or History). Delete shows a
  5-second **Undo** toast.

### Programming guidance (RR-aligned)
- Each movement has an easy→hard **progression ladder** from the official RR
  progression wikis, plus a working **rep/time range** and a **progression
  nudge** ("Ready to progress 🎉 — try the next variation").
- Default strength target is **8–12 reps** (the RR's higher-rep option);
  isometric holds are **10–30s**. Effort guidance is **failure − 1**.

### Rest & cardio
- **Rest timer** — auto-starts after a set (toggle in Settings) or via quick
  presets; persistent countdown banner with ±15s, pause, skip, beep + vibrate.
- **Bike HIIT** — hands-free interval timer for an exercise bike: set
  work/rest/rounds/tension (1–8), 3-2-1 lead-in, audible work/rest cues,
  auto-logs the session.

### Review & data
- **Stats tab** — streak, days trained, totals, per-movement progress
  sparklines (reps/holds + added weight), and a GitHub-style **consistency
  heatmap** (last 18 weeks).
- **History tab** — per-day log; weekly streak strip on every screen.
- **Export JSON** (full backup) and **Restore** (import a JSON backup).
- **Export Markdown** — one Obsidian note per workout day (`YYYY-MM-DD.md`)
  bundled in a single `.zip`, with per-day YAML frontmatter
  (`date, type, sets, reps, tags`) for Dataview + a table of sets. Uses a small
  built-in ZIP writer (no dependencies).
- **Settings** — rest auto-start + default length, weight unit, workout
  reminder (calendar `.ics` export — see below), app version + Check for update.

### Reminders
- Because reliable scheduled web push isn't feasible for a serverless PWA on
  Android, the reminder is a **recurring `.ics` calendar event**: pick days +
  time in Settings → "Add reminder to calendar" → import once into your phone's
  calendar. Native, offline, no permissions.

---

## Movements

Push-ups · Dips · Pull-ups · Rows · Squats · Hip hinge ·
Core: anti-extension · Core: anti-rotation · Core: extension · Leg raises ·
Bike HIIT.

Ladders follow the RR progression guides (e.g. push-ups: Vertical → Incline →
Full → Diamond → Pseudo-planche → Rings → RTO). *(L-sit, calf raises and
handstand were intentionally removed per preference.)*

---

## Install on Android

1. Open `https://captain-cutlery.github.io/workoutapp/` in Chrome.
2. Menu (⋮) → **Add to Home screen** / **Install app**.
3. Launch from the icon — opens fullscreen and works offline.

## Hosting (free, GitHub Pages)

In GitHub: **Settings → Pages → Deploy from a branch → `main` / root**.
Published at `https://<user>.github.io/<repo>/`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
A service worker (and "Add to Home screen") needs HTTPS or `localhost`.

---

## Architecture notes

- `app.js` holds the movement library (`MOVEMENTS`), default session, all
  rendering (Today/Log/Stats/History), the log/edit sheet, rest + HIIT timers,
  settings, and import/export. It renders by rebuilding innerHTML per tab.
- `sw.js` is network-first for same-origin GETs, falling back to cache offline;
  it handles a `SKIP_WAITING` message so "Check for update" can activate a new
  version immediately. **Bump `CACHE` on every release.**
- Movement removal is safe: rendering and the edit sheet guard against orphaned
  log entries whose `movement` id no longer exists.

## Release checklist

1. Make changes in `app.js` / `styles.css` / `index.html`.
2. Bump `APP_VERSION` (app.js) **and** `CACHE` (sw.js) together; update
   `APP_BUILT` date if desired.
3. `node --check app.js && node --check sw.js`.
4. Commit, push to the feature branch, open a PR, share the merge link.

## Version history

- **v1** — initial PWA: Today/Log/History, JSON export, offline install.
- **v2** — rest timer, edit/delete sets, Stats tab, custom session, restore.
- **v3** — auto-start rest timer + Settings; more movements.
- **v4** — per-set weight and notes.
- **v5** — last-time reference, repeat-last-set, weight on charts, calendar
  reminder (`.ics`).
- **v6** — network-first service worker (automatic updates).
- **v7** — Bike HIIT movement + hands-free interval timer.
- **v8** — fix bottom content cut off behind the tab bar.
- **v9** — app version + "Check for update" button in Settings.
- **v10** — undo-on-delete, editable HIIT, week summary, version label,
  consistency heatmap.
- **v11–v12** — adopt RR progression ladders (corrected from the official
  wikis), RR-style scheme, core triplet (anti-ext / anti-rot / extension).
- **v13** — switch default strength target to 8–12 reps.
- **v15** — remove L-sit, calf raises, handstand.
- **v16** — Markdown export (initial, single file).
- **v17** — Markdown export as one note per day, bundled in a `.zip`.
- **v18** — kettlebell swing added to the hip-hinge progression.
- **v19** — KBoges & Recommended Routine credit links in Settings (About).
- **v20** — PARA-format Obsidian export + single-note "Today → vault" export.
- **v21** — match export to the user's real (lean) note frontmatter.
- **v22** — finalise export tags (`area, Fitness, workout, calisthenics`).

## Obsidian / PARA export & Syncthing workflow

The app exports each day as a note matching the user's PARA vault. Two export
buttons (History → data section):

- **Today → vault** — saves a single `YYYY-MM-DD.md` (best for the synced flow).
- **All days (zip)** — full history, one note per day, in a `.zip`.

Exported note shape (lean, matching the vault's real style — config in the
`OBSIDIAN` block near the top of `exportMarkdown` in `app.js`):

```markdown
---
tags:
  - area
  - Fitness
  - workout
  - calisthenics
date: 2026-06-01
sets: 1
reps: 12
links: "[[2. Area]]"
---
## Monday, June 1, 2026

| Movement | Variation | Result | Effort | Note |
| --- | --- | --- | --- | --- |
| Push-ups | Full | 12 reps | 1–2 left |  |
```

### Hands-off sync pipeline (the user's setup)

A PWA can't write to an arbitrary phone folder, so files route via Syncthing +
a server-side mover (`scripts/file-workouts.sh`):

```
Phone: "Today → vault" → Download
  → Syncthing (Download folder, Send Only, ignore-filtered to "!20*.md / *")
  → Server staging: /mnt/user/data/media/WorkoutExports (Receive Only)
  → scripts/file-workouts.sh moves notes into the vault's Fitness folder
    (Unraid User Scripts, cron */15 * * * *)
  → existing whole-vault Syncthing carries it back to all devices
```

Key facts for a future session:
- Vault (Unraid host view): `/mnt/user/data/media/Obsidian/Second Brain/`
  Fitness folder: `…/PARA Folders/2.Area Folders/Health/Fitness`
- Staging and vault **must not overlap** (Syncthing folders can't nest), so the
  staging folder is a sibling and the script does the crossing.
- The mover normalises Vanadium's duplicate names (`2026-06-01(1).md` →
  `2026-06-01.md`) and overwrites, so re-exporting a day just refreshes it.
- The app is the source of truth: don't hand-edit a day's note in Obsidian then
  re-export it, or the mover overwrites your edits.
- Moved files end up owned by `nobody users` on Unraid (no chown needed).

## Tech

Plain HTML/CSS/JS — no framework, no build step. Data in `localStorage`.
Plus `scripts/file-workouts.sh` (server-side Obsidian filing, runs on Unraid).
