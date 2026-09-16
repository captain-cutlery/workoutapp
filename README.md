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

Plus the SuperMover additions (see Routines): Lizard Crawl · Pike Push-ups ·
Ab Roll-out · Goblet Curls · Tactical Pull-ups · Multi-directional Lunge ·
Squat Walks · Precision Broad Jumps · Kettlebell Halos · Hollow Body Hold ·
Cossack Squats · Air Squats · Sprint Drills · Jump Rope · Shadow Boxing ·
Run · Liquid Motion · Hindu Squats · Step Up.

The SuperMover sessions are transcribed from the book's own "The SuperMover
Workout" text listing, which is authoritative — the illustrated exercise cards
are a slightly different selection. Liquid Motion is the 8-movement mobility
flow (30s each, continuous movement, 2–3 rounds), not a generic 10-minute
block; its order and naming follow the official Liquid Motion cheat-sheet card
(prayer squat, roundhouse stretch, shoulder dislocates, crab reach, elephant
walk, lateral gorilla crawl, V-W stretch, sofa hip flexor stretch). The
cheat sheet itself imports like any other card — name it `Liquid Motion.png`.

---

## Routines

The **Today** tab is driven by a routine, chosen in **Settings → Routine**.
Routines only decide what Today *suggests* — they never touch the log, so
switching is non-destructive and instantly reversible.

- **`rr` — Recommended Routine (default).** The original behaviour: one
  editable full-body session (stored under `cal_session_v1`), RR rep guidance
  (3×8–12 at failure − 1, advance the variation at the top of the range).
- **`supermover` — SuperMover (The Bioneer), "workout-only" split.** A
  weekday-based routine: Mon Push · Tue Pull · Wed/Thu rest · Fri Legs ·
  Sat Full Body · Sun rest. Each training day starts with a warm-up (choose one
  of jump rope / shadow boxing / run) and finishes with the Liquid Motion flow. Rep guidance switches to SuperMover's style: high reps, rapid
  cadence, sets to failure, ~1 min rest, progress by *adding reps* rather than
  advancing a variation.

### Exercise cards (on-device only)

The SuperMover exercise cards are artwork from a **paid product**, so they are
deliberately **not committed to this repo** (it is public, and GitHub Pages
would serve them at a public URL). Instead the user imports their own copy:

- **Settings → Exercise cards → Import** accepts a `.zip` or individual images.
- The zip is read in-browser via `DecompressionStream('deflate-raw')` — no
  library. Images are downscaled (max 1200px wide, WebP q85) and stored in
  **IndexedDB** (`cal_cards`), keyed by movement id. Nothing is uploaded.
- Filenames map to movement ids via `CARD_ALIASES` + `matchCardName()`.
  22 of the 23 supplied cards map. Only Pseudo-Planche Push-ups is unmatched
  (an "Extras" card, not part of the main programme); it is reported as skipped.
- A stored card appears under the form cues in the log sheet, tap to enlarge.
- **Remove all cards** clears the store. Cards survive app updates but are
  wiped by "clear site data" (as is the log — export first).

Implementation notes for a future session:
- `ROUTINES` registry in `app.js`; `SETTINGS.routine` defaults to `'rr'`.
- A routine with a `days[]` array is weekday-based (indexed by `getDay()`,
  0 = Sunday) and renders a rest-day card on rest days; a routine without
  `days[]` uses the user's editable `SESSION`.
- `todaysPlan()` returns `{ label, rest, items }` and is the single place Today
  asks what to show. `activeRoutine().repStyle` drives the rep guidance.
- New movements are appended to `MOVEMENTS`; the Log tab buckets by `group`
  (see `GROUP_ORDER`) rather than array order, so appending is safe.
- An unknown/removed routine id falls back to `rr`.

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
- **v23** — routine switcher: added The Bioneer's SuperMover split
  (workout-only schedule) alongside the Recommended Routine, with day-aware
  Today, SuperMover rep guidance, and 17 new movements. RR remains default.
- **v24** — fix RR rep guidance appearing on SuperMover-only exercises;
  programme-aware effort label.
- **v25** — optional on-device exercise cards: import a zip/images in Settings,
  stored in IndexedDB, shown in the log sheet with tap-to-enlarge.

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
