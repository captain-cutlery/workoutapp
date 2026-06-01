---
tags:
  - area
  - Fitness
links: "[[2. Area]]"
---
# Fitness

# All Workouts Table
![[Base - Workouts.base]]

---

# Stats

```dataviewjs
const pages = dv.pages('#workout').sort(p => p.date, 'desc');
const sessions = pages.length;
const totalReps = pages.reduce((s, p) => s + (p.reps || 0), 0);
const totalSets = pages.reduce((s, p) => s + (p.sets || 0), 0);

// current streak: consecutive days up to today (or yesterday)
const days = new Set(pages.map(p => String(p.date)));
let streak = 0;
let d = new Date();
const key = x => x.toISOString().slice(0, 10);
if (!days.has(key(d))) d.setDate(d.getDate() - 1);
while (days.has(key(d))) { streak++; d.setDate(d.getDate() - 1); }

dv.paragraph(`**Sessions:** ${sessions}  ·  **Total sets:** ${totalSets}  ·  **Total reps:** ${totalReps}  ·  **Streak:** ${streak} day${streak === 1 ? '' : 's'}`);
```
