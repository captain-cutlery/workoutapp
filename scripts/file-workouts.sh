#!/bin/bash
#
# file-workouts.sh — move exported workout notes into the Obsidian vault.
#
# Part of the Calisthenics Log workflow:
#   Phone: "Today → vault" export saves YYYY-MM-DD.md into Download
#     -> Syncthing (Download, Send Only, filtered to 20*.md)
#     -> Server staging folder $SRC (Receive Only)
#     -> THIS SCRIPT moves the note into the vault's Fitness folder
#     -> the existing whole-vault Syncthing carries it back to all devices
#
# Run on the server that can natively see both paths (e.g. Unraid via the
# "User Scripts" plugin) on a schedule, e.g. every 5 minutes:  */5 * * * *
#
# IMPORTANT: $DST is inside the already-synced Obsidian vault. $SRC must NOT be
# inside the vault (Syncthing folders cannot overlap) — keep it as a sibling.

set -euo pipefail

# --- Edit these two paths to match your server ---
SRC="/media/data/media/WorkoutExports"
DST="/media/data/media/Obsidian/Second Brain/PARA Folders/2.Area Folders/Health/Fitness"
# -------------------------------------------------

mkdir -p "$DST"
shopt -s nullglob

for f in "$SRC"/20*.md; do
  base="$(basename "$f")"
  # Vanadium re-exports the same day as "2026-06-01 (1).md"; normalise back to
  # "2026-06-01.md" so re-exporting just refreshes the note instead of piling up.
  clean="$(printf '%s' "$base" | sed -E 's/ \([0-9]+\)\.md$/.md/')"
  # mv on the same filesystem is atomic, so Obsidian/Syncthing never see a
  # half-written file.
  mv -f "$f" "$DST/$clean"
  echo "filed: $clean"
done
