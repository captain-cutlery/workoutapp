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
# Run on the server (Unraid "User Scripts" plugin) on a schedule, e.g. every
# 5 minutes:  */5 * * * *
#
# Paths below are the Unraid HOST view (/mnt/user/...), not the desktop share
# view (/media/...). Confirmed on this server. Edit if your layout changes.

set -uo pipefail

SRC="/mnt/user/data/media/WorkoutExports"
DST="/mnt/user/data/media/Obsidian/Second Brain/PARA Folders/2.Area Folders/Health/Fitness"

echo "Source (staging): $SRC"
echo "Dest   (vault)  : $DST"

if [ ! -d "$SRC" ]; then
  echo "ERROR: staging folder not found: $SRC"
  exit 1
fi
mkdir -p "$DST"

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
