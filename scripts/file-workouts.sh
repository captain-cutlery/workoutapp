#!/bin/bash
#
# file-workouts.sh — move exported workout notes into the Obsidian vault.
#
# Part of the Calisthenics Log workflow:
#   Phone: "Today -> vault" export saves YYYY-MM-DD.md into Download
#     -> Syncthing (Download, Send Only, filtered to 20*.md)
#     -> Server staging folder "WorkoutExports" (Receive Only)
#     -> THIS SCRIPT moves the note into the vault's Fitness folder
#     -> the existing whole-vault Syncthing carries it back to all devices
#
# Run on the server that can natively see both paths (e.g. Unraid via the
# "User Scripts" plugin) on a schedule, e.g. every 5 minutes:  */5 * * * *
#
# Paths are AUTO-DISCOVERED under /mnt/user so you don't have to find them.
# If auto-discovery fails, set SRC and DST manually in the OVERRIDE block below.

set -uo pipefail

# ---- Optional manual override (leave blank to auto-discover) ----
SRC=""   # e.g. "/mnt/user/media/WorkoutExports"
DST=""   # e.g. "/mnt/user/media/Obsidian/Second Brain/PARA Folders/2.Area Folders/Health/Fitness"
# -----------------------------------------------------------------

SEARCH_ROOT="/mnt/user"

# Auto-find the staging folder (the Syncthing share named "WorkoutExports").
if [ -z "$SRC" ]; then
  SRC="$(find "$SEARCH_ROOT" -maxdepth 5 -type d -name "WorkoutExports" 2>/dev/null | head -n1)"
fi

# Auto-find the vault's Fitness folder (…/Health/Fitness inside the Obsidian vault).
if [ -z "$DST" ]; then
  DST="$(find "$SEARCH_ROOT" -maxdepth 8 -type d -path "*Health/Fitness" 2>/dev/null | head -n1)"
fi

echo "Source (staging): ${SRC:-<not found>}"
echo "Dest   (vault)  : ${DST:-<not found>}"

if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "ERROR: could not locate the 'WorkoutExports' staging folder under $SEARCH_ROOT."
  echo "Set SRC manually at the top of this script, then re-run."
  exit 1
fi
if [ -z "$DST" ] || [ ! -d "$DST" ]; then
  echo "ERROR: could not locate the vault's '…/Health/Fitness' folder under $SEARCH_ROOT."
  echo "Set DST manually at the top of this script, then re-run."
  exit 1
fi

echo "Files currently in staging:"
ls -la "$SRC" || true

shopt -s nullglob
moved=0
for f in "$SRC"/20*.md; do
  base="$(basename "$f")"
  # Vanadium re-exports the same day as "2026-06-01 (1).md" or "2026-06-01(1).md"
  # (with or without a space); normalise either back to "2026-06-01.md" so
  # re-exporting just refreshes the note instead of piling up duplicates.
  clean="$(printf '%s' "$base" | sed -E 's/ ?\([0-9]+\)\.md$/.md/')"
  # mv on the same filesystem is atomic, so Obsidian/Syncthing never see a
  # half-written file.
  mv -f "$f" "$DST/$clean"
  echo "filed: $clean"
  moved=$((moved + 1))
done

echo "Done — $moved file(s) moved."
