/* Calisthenics Log — vanilla PWA built on KBoges principles:
   a few compound movements, full range of motion, consistent effort. */

'use strict';

// Bump this with each release; surfaced in Settings so you can confirm the
// installed app matches the latest deploy. Keep in step with the sw.js cache.
const APP_VERSION = 'v16';
const APP_BUILT = '31 May 2026';
const APP_LABEL = `${APP_VERSION} · ${APP_BUILT}`;

// ---------- Movement library ----------
// type: 'reps' for rep-counted work, 'time' for holds (seconds).
// Variations run easiest -> hardest. Ladders follow the r/bodyweightfitness
// Recommended Routine progression guides. `range` is the working target:
// strength work uses an 8-12 rep range (the RR's higher-rep/endurance option:
// add a rep per session, advance at 12); isometrics are 10-30s (advance at
// 30s). Train at failure-1 (RIR ~1).
const MOVEMENTS = [
  {
    id: 'pushup', name: 'Push-ups', emoji: '🤜', group: 'Push', type: 'reps', range: [8, 12],
    cues: 'Straight line head to toe, don’t let the hips sag. Lower until the chest nearly touches, elbows in (not flared), lock out and protract the shoulders at the top.',
    variations: ['Vertical (wall)', 'Incline', 'Full', 'Diamond', 'Pseudo-planche', 'Rings', 'RTO'],
  },
  {
    id: 'dips', name: 'Dips', emoji: '🪑', group: 'Push', type: 'reps', range: [8, 12],
    cues: 'Shoulders down and back. Lower under control until the upper arms are about parallel, then lock out hard at the top. (RR uses parallel bars, not bench dips.)',
    variations: ['Support hold (s)', 'Negative', 'Parallel bar', 'Weighted', 'Ring', 'Ring turned-out'],
  },
  {
    id: 'pullup', name: 'Pull-ups', emoji: '🆙', group: 'Pull', type: 'reps', range: [8, 12],
    cues: 'Start from a full dead hang. Pull the chin over the bar, no kipping, lower slowly and fully each rep.',
    variations: ['Scapular pulls', 'Arch hangs', 'Negative', 'Pull-up', 'Weighted', 'Archer', 'One-arm progression'],
  },
  {
    id: 'row', name: 'Rows', emoji: '🚣', group: 'Pull', type: 'reps', range: [8, 12],
    cues: 'Body straight and rigid. Squeeze the shoulder blades, pull the chest to the bar, control the way down. Lower the body angle to make it harder.',
    variations: ['Vertical', 'Incline', 'Horizontal', 'Wide', 'Weighted', 'Tuck front-lever pulls', 'Archer'],
  },
  {
    id: 'squat', name: 'Squats', emoji: '🦵', group: 'Legs', type: 'reps', range: [8, 12],
    cues: 'Full depth — hips below knees. Knees track over toes, chest up, heels planted. Stand tall to finish.',
    variations: ['Assisted', 'Squat', 'Split squat', 'Bulgarian split squat', 'Beginner shrimp', 'Intermediate shrimp', 'Advanced shrimp', 'Pistol'],
  },
  {
    id: 'hinge', name: 'Hip hinge', emoji: '🍑', group: 'Hinge', type: 'reps', range: [8, 12],
    cues: 'Brace and squeeze the glutes to flatten the low back. Send the hips back, hinge from the hips with a neutral spine — never round the back. (RR uses a weighted RDL if you have a barbell.)',
    variations: ['Romanian deadlift', 'Single-leg deadlift', 'Banded Nordic negative', 'Banded Nordic curl', 'Nordic curl'],
  },
  {
    id: 'core', name: 'Core: anti-extension', emoji: '🧱', group: 'Core', type: 'time', range: [10, 30],
    cues: 'Resist the low back arching. Brace abs hard, glutes and quads tight, ribs down, posterior pelvic tilt — keep one straight line, no sagging hips. Quality tension over long sloppy holds.',
    variations: ['Plank (s)', 'RKC plank (s)', 'Long-lever plank (s)', 'Body saw (s)', 'Ab-wheel from knees', 'Standing ab-wheel'],
  },
  {
    id: 'antirot', name: 'Core: anti-rotation', emoji: '🔄', group: 'Core', type: 'time', range: [10, 30],
    cues: 'Resist the torso twisting. Brace hard and keep the hips and shoulders square — don’t let the load rotate you. (Side/Copenhagen planks are timed holds; Pallof press is slow reps.)',
    variations: ['Pallof press', 'Suitcase carry (s)', 'Side plank (s)', 'Copenhagen (bent knee) (s)', 'Copenhagen full (s)'],
  },
  {
    id: 'extension', name: 'Core: extension', emoji: '🌉', group: 'Core', type: 'reps', range: [8, 12],
    cues: 'Reverse hyperextension: lie face-down with hips at an edge, raise the legs by squeezing the glutes and lower back. Control the lowering; don’t hyper-arch — stop at a straight line.',
    variations: ['Floor reverse hyper', 'Bench reverse hyper', 'Weighted reverse hyper'],
  },
  {
    id: 'legraise', name: 'Leg raises', emoji: '🔻', group: 'Core', type: 'reps', range: [8, 12],
    cues: 'Move slowly with no swinging. Posteriorly tilt the pelvis so the lower back stays flat, and control the way down.',
    variations: ['Lying knee raises', 'Lying leg raises', 'Hanging knee raises', 'Hanging leg raises', 'Toes-to-bar'],
  },
  {
    id: 'bike', name: 'Bike HIIT', emoji: '🚴', group: 'Cardio', type: 'time', hiit: true,
    cues: 'Hard bursts on the bike. Push near-max during work intervals, spin easy to recover. Raise the tension dial to make bursts harder as you progress.',
    variations: ['Tension 1', 'Tension 2', 'Tension 3', 'Tension 4', 'Tension 5', 'Tension 6', 'Tension 7', 'Tension 8'],
  },
];

const byId = (id) => MOVEMENTS.find((m) => m.id === id);

// Default suggested full-body session (KBoges leans full-body, frequent, low-fuss).
// Mirrors the Recommended Routine pairs + core triplet (3x8-12, failure-1).
// Fully editable via the "Edit" link on Today.
const DEFAULT_SESSION = [
  { id: 'pullup',   target: 'Pair A · 3×8–12' },
  { id: 'squat',    target: 'Pair A · 3×8–12' },
  { id: 'dips',     target: 'Pair B · 3×8–12' },
  { id: 'hinge',    target: 'Pair B · 3×8–12' },
  { id: 'row',      target: 'Pair C · 3×8–12' },
  { id: 'pushup',   target: 'Pair C · 3×8–12' },
  { id: 'core',      target: 'Triplet · anti-ext · 3×10–30s' },
  { id: 'antirot',   target: 'Triplet · anti-rot · 3×10–30s' },
  { id: 'extension', target: 'Triplet · extension · 3×8–12' },
];

const RIR_OPTIONS = ['0 (failure)', '1–2 left', '3–4 left', 'Easy'];
const REST_PRESETS = [60, 90, 120];

// ---------- Storage ----------
const KEY = 'cal_log_v1';
const SESSION_KEY = 'cal_session_v1';

function loadLog() {
  let log;
  try { log = JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { log = []; }
  // Backfill ids on older entries so edit/delete can target them.
  let changed = false;
  for (const e of log) if (!e.id) { e.id = makeId(); changed = true; }
  if (changed) localStorage.setItem(KEY, JSON.stringify(log));
  return log;
}
function saveLog(log) { localStorage.setItem(KEY, JSON.stringify(log)); }
function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let LOG = loadLog();

function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (Array.isArray(s) && s.length) return s;
  } catch {}
  return DEFAULT_SESSION.map((s) => ({ ...s }));
}
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
let SESSION = loadSession();

const SETTINGS_KEY = 'cal_settings_v1';
const DEFAULT_SETTINGS = { autoRest: true, restDefault: 90, unit: 'kg', remDays: [1, 3, 5], remTime: '18:00' };
// Last-used HIIT setup, remembered between sessions.
const HIIT_KEY = 'cal_hiit_v1';
const DEFAULT_HIIT = { work: 30, rest: 60, rounds: 8, tension: 4 };
function loadHiit() {
  try { return { ...DEFAULT_HIIT, ...(JSON.parse(localStorage.getItem(HIIT_KEY)) || {}) }; }
  catch { return { ...DEFAULT_HIIT }; }
}
function saveHiit(h) { localStorage.setItem(HIIT_KEY, JSON.stringify(h)); }
let HIIT = loadHiit();
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ICAL_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
let SETTINGS = loadSettings();

// ---------- Date helpers ----------
const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const TODAY = dayKey(new Date());
const entriesOn = (key) => LOG.filter((e) => e.day === key);

// ---------- App state ----------
let activeTab = 'today';
const view = document.getElementById('view');
const topTitle = document.getElementById('topTitle');

// ---------- Rendering ----------
function render() {
  renderWeekStrip();
  if (activeTab === 'today') renderToday();
  else if (activeTab === 'log') renderLog();
  else if (activeTab === 'stats') renderStats();
  else renderHistory();
}

function renderWeekStrip() {
  const strip = document.getElementById('weekStrip');
  const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  strip.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dayKey(d);
    const done = entriesOn(key).length > 0;
    const el = document.createElement('div');
    el.className = 'week-day' + (done ? ' done' : '') + (key === TODAY ? ' today' : '');
    el.innerHTML = `<b>${names[i]}</b>${d.getDate()}`;
    strip.appendChild(el);
  }
}

// One-line momentum summary for the current week (Sun–Sat).
function weekSummary() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const wk = LOG.filter((e) => new Date(e.day + 'T00:00') >= weekStart);
  if (!wk.length) return null;
  const sessions = new Set(wk.map((e) => e.day)).size;
  const reps = wk.filter((e) => { const m = byId(e.movement); return m && m.type === 'reps'; })
    .reduce((s, e) => s + e.value, 0);
  return { sessions, sets: wk.length, reps };
}

function renderToday() {
  topTitle.textContent = 'Today';
  const today = entriesOn(TODAY);
  let html = `<p class="lede">A short full-body session. Move with control, stop a couple reps shy of failure.</p>`;
  const ws = weekSummary();
  if (ws) {
    html += `<div class="week-summary">📅 This week: <b>${ws.sessions}</b> session${ws.sessions > 1 ? 's' : ''} · <b>${ws.sets}</b> sets${ws.reps ? ` · <b>${ws.reps}</b> reps` : ''}</div>`;
  }
  html += `<div class="section-row"><div class="section-title">Suggested session</div><button id="editSession" class="link-btn">Edit</button></div>`;
  for (const s of SESSION) {
    const m = byId(s.id);
    if (!m) continue;
    const done = today.filter((e) => e.movement === s.id);
    html += movementCard(m, s.target, summarize(m, done), done.length);
  }
  html += `<div class="section-title">Today's log</div>`;
  html += today.length
    ? renderEntryList(today)
    : `<p class="lede">Nothing logged yet. Tap a movement above to start.</p>`;
  view.innerHTML = html;
  wireCards();
  wireEntries();
  document.getElementById('editSession').onclick = openSessionEditor;
}

function renderLog() {
  topTitle.textContent = 'Log anything';
  let html = `<p class="lede">Free log — pick any movement and record a set.</p>`;
  let group = '';
  for (const m of MOVEMENTS) {
    if (m.group !== group) { group = m.group; html += `<div class="section-title">${group}</div>`; }
    const done = entriesOn(TODAY).filter((e) => e.movement === m.id);
    html += movementCard(m, m.variations.length + ' progressions', summarize(m, done), done.length);
  }
  view.innerHTML = html;
  wireCards();
}

function renderHistory() {
  topTitle.textContent = 'History';
  if (!LOG.length) {
    view.innerHTML = `<div class="empty"><div class="big">🌱</div>No workouts logged yet.<br>Consistency is the whole game — start today.</div>`
      + dataButtons();
    wireDataButtons();
    return;
  }
  const keys = [...new Set(LOG.map((e) => e.day))].sort().reverse();
  let html = `<p class="lede">Tap any set to edit or delete it.</p>`;
  for (const key of keys) {
    const items = entriesOn(key);
    const d = new Date(key + 'T00:00');
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    html += `<div class="day-group"><div class="day-head"><h3>${label}${key === TODAY ? ' · Today' : ''}</h3><span>${items.length} sets</span></div><div class="card">${renderEntryRows(items, true)}</div></div>`;
  }
  html += dataButtons();
  view.innerHTML = html;
  wireEntries();
  wireDataButtons();
}

function renderStats() {
  topTitle.textContent = 'Stats';
  if (!LOG.length) {
    view.innerHTML = `<div class="empty"><div class="big">📈</div>Log a few sessions and your progress shows up here.</div>`;
    return;
  }
  const s = computeStats();
  let html = `<div class="stat-grid">
    <div class="stat"><b>${s.streak}</b><span>day streak</span></div>
    <div class="stat"><b>${s.daysTrained}</b><span>days trained</span></div>
    <div class="stat"><b>${s.totalSets}</b><span>total sets</span></div>
    <div class="stat"><b>${s.weekSets}</b><span>sets this week</span></div>
  </div>`;

  html += `<div class="section-title">Consistency</div>`;
  html += heatmap();

  html += `<div class="section-title">Progress</div>`;
  for (const m of MOVEMENTS) {
    const series = bestPerDay(m.id);
    if (!series.length) continue;
    const pb = Math.max(...series.map((p) => p.v));
    const unit = m.type === 'time' ? 's' : '';
    let weightBlock = '';
    if (hasWeight(m.id)) {
      const wSeries = bestPerDay(m.id, 'weight');
      const wPb = Math.max(...wSeries.map((p) => p.v));
      weightBlock = `<div class="chart-sub">🏆 Added weight · PB ${wPb}${SETTINGS.unit}</div>
        ${sparkline(wSeries, 'weight', SETTINGS.unit)}`;
    }
    html += `<div class="card">
      <div class="chart-head"><div class="mv-name">${m.emoji} ${m.name}</div>
      <div class="mv-tally">PB <b>${pb}${unit}</b></div></div>
      ${sparkline(series, m.type)}
      <div class="chart-foot">${series.length} day${series.length > 1 ? 's' : ''} · best set per day</div>
      ${weightBlock}
    </div>`;
  }
  view.innerHTML = html;
}

// ---------- Card / entry markup ----------
function movementCard(m, sub, tally, count) {
  // Show a one-tap repeat once a set exists today (the 2nd/3rd-set case).
  const repeat = count ? `<button class="repeat-btn" data-repeat="${m.id}" aria-label="Repeat last set">↻</button>` : '';
  return `<div class="card mv-card" data-mv="${m.id}">
    <div class="mv-emoji">${m.emoji}</div>
    <div class="mv-main">
      <div class="mv-name">${m.name}</div>
      <div class="mv-sub">${sub}</div>
    </div>
    <div class="mv-tally">${count ? `<span class="check">✓</span> ${tally}` : 'Tap to log'}</div>
    ${repeat}
  </div>`;
}

function summarize(m, entries) {
  if (!entries.length) return '';
  const unit = m.type === 'time' ? 's' : '';
  return entries.map((e) => e.value + unit + (e.weight ? `+${e.weight}` : '')).join(' · ');
}

function renderEntryList(items) { return `<div class="card">${renderEntryRows(items, true)}</div>`; }
function renderEntryRows(items, editable) {
  return items
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .map((e) => {
      const m = byId(e.movement);
      const unit = m && m.type === 'time' ? 's' : ' reps';
      const tap = editable ? ` data-edit="${e.id}"` : '';
      const w = e.weight ? ` <span class="wtag">+${e.weight}${SETTINGS.unit}</span>` : '';
      const note = e.note ? `<div class="e-note">“${escapeHtml(e.note)}”</div>` : '';
      return `<div class="entry${editable ? ' tappable' : ''}"${tap}><div>${m ? m.emoji : ''} ${m ? m.name : e.movement}
        <div class="e-meta">${e.variation} · ${e.rir}</div>${note}</div>
        <div class="e-val"><b>${e.value}</b>${unit}${w}${editable ? ' <span class="chev">›</span>' : ''}</div></div>`;
    })
    .join('');
}

function wireCards() {
  view.querySelectorAll('[data-mv]').forEach((el) => {
    const m = byId(el.dataset.mv);
    el.onclick = () => (m && m.hiit) ? openHiit() : openSheet(el.dataset.mv);
  });
  view.querySelectorAll('[data-repeat]').forEach((el) => {
    el.onclick = (ev) => { ev.stopPropagation(); repeatLastSet(el.dataset.repeat); };
  });
}

// One-tap log a duplicate of the most recent set for a movement.
function repeatLastSet(mvId) {
  const m = byId(mvId);
  if (m && m.hiit) { openHiit(); return; }
  const prev = lastSet(mvId);
  if (!prev) { openSheet(mvId); return; }
  LOG.push({
    id: makeId(), ts: Date.now(), day: TODAY, movement: mvId,
    variation: prev.variation, rir: prev.rir, value: prev.value,
    weight: prev.weight || 0, note: '',
  });
  saveLog(LOG);
  render();
  if (SETTINGS.autoRest) startRest(SETTINGS.restDefault);
}
function wireEntries() {
  view.querySelectorAll('[data-edit]').forEach((el) => {
    el.onclick = () => openSheet(null, el.dataset.edit);
  });
}

// ---------- Stats helpers ----------
function computeStats() {
  const days = [...new Set(LOG.map((e) => e.day))].sort();
  // current streak: consecutive days up to today (or yesterday) with entries
  const set = new Set(days);
  let streak = 0;
  const cur = new Date();
  if (!set.has(dayKey(cur))) cur.setDate(cur.getDate() - 1); // allow streak to count through yesterday
  while (set.has(dayKey(cur))) { streak++; cur.setDate(cur.getDate() - 1); }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekSets = LOG.filter((e) => new Date(e.day + 'T00:00') >= weekStart).length;

  return { streak, daysTrained: days.length, totalSets: LOG.length, weekSets };
}

// GitHub-style consistency grid: last ~18 weeks, one cell per day, shaded by
// number of sets logged. Columns are weeks (Sun–Sat), most recent on the right.
function heatmap() {
  const WEEKS = 18;
  // sets-per-day lookup
  const perDay = {};
  for (const e of LOG) perDay[e.day] = (perDay[e.day] || 0) + 1;

  // Start from the Sunday WEEKS-1 weeks before this week's Sunday.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() - today.getDay());
  const start = new Date(thisSunday);
  start.setDate(thisSunday.getDate() - (WEEKS - 1) * 7);

  const level = (n) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 6 ? 3 : 4);
  let cells = '';
  for (let w = 0; w < WEEKS; w++) {
    let col = '';
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      if (day > today) { col += `<div class="hm-cell hm-empty"></div>`; continue; }
      const key = dayKey(day);
      const n = perDay[key] || 0;
      const lbl = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      col += `<div class="hm-cell hm-l${level(n)}" title="${lbl}: ${n} set${n === 1 ? '' : 's'}"></div>`;
    }
    cells += `<div class="hm-col">${col}</div>`;
  }
  return `<div class="card hm-card">
    <div class="hm-grid">${cells}</div>
    <div class="hm-legend"><span>Less</span>
      <span class="hm-cell hm-l0"></span><span class="hm-cell hm-l1"></span>
      <span class="hm-cell hm-l2"></span><span class="hm-cell hm-l3"></span>
      <span class="hm-cell hm-l4"></span><span>More</span></div>
    <div class="chart-foot">Each square is a day · darker = more sets · last ${WEEKS} weeks</div>
  </div>`;
}

// Best (max value) set per day for a movement, oldest -> newest.
// metric: 'value' (reps/seconds) or 'weight' (added load).
function bestPerDay(mvId, metric = 'value') {
  const map = {};
  for (const e of LOG) {
    if (e.movement !== mvId) continue;
    const v = metric === 'weight' ? (e.weight || 0) : e.value;
    map[e.day] = Math.max(map[e.day] || 0, v);
  }
  return Object.keys(map).sort().map((day) => ({ day, v: map[day] }));
}

// True if any logged set for this movement carried added weight.
function hasWeight(mvId) {
  return LOG.some((e) => e.movement === mvId && e.weight > 0);
}

// Tiny inline SVG line chart. Last ~12 points.
function sparkline(series, type, unitOverride) {
  const pts = series.slice(-12);
  const W = 300, H = 70, P = 6;
  const max = Math.max(...pts.map((p) => p.v));
  const min = Math.min(...pts.map((p) => p.v));
  const span = max - min || 1;
  const stepX = pts.length > 1 ? (W - P * 2) / (pts.length - 1) : 0;
  const xy = (p, i) => {
    const x = P + i * stepX;
    const y = H - P - ((p.v - min) / span) * (H - P * 2);
    return [x, y];
  };
  const line = pts.map((p, i) => xy(p, i).join(',')).join(' ');
  const dots = pts.map((p, i) => { const [x, y] = xy(p, i); return `<circle cx="${x}" cy="${y}" r="2.6"/>`; }).join('');
  const [lx, ly] = xy(pts[pts.length - 1], pts.length - 1);
  const unit = unitOverride != null ? unitOverride : (type === 'time' ? 's' : '');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">
    <polyline class="spark-line" points="${line}" />
    <g class="spark-dots">${dots}</g>
    <text x="${Math.min(lx, W - 22)}" y="${Math.max(ly - 6, 12)}" class="spark-val">${pts[pts.length - 1].v}${unit}</text>
  </svg>`;
}

// ---------- Logging / edit sheet ----------
const sheet = document.getElementById('sheet');
let sheetState = { mv: null, variation: 0, rir: 1, editId: null };

// Open to log a new set (mvId) OR edit an existing entry (editId).
function openSheet(mvId, editId) {
  let m, variation, rir, value, weight, note;
  if (editId) {
    const e = LOG.find((x) => x.id === editId);
    if (!e) return;
    m = byId(e.movement);
    if (!m) return; // orphaned entry (movement was removed) — can't edit, leave as-is
    variation = Math.max(0, m.variations.indexOf(e.variation));
    rir = Math.max(0, RIR_OPTIONS.indexOf(e.rir));
    value = e.value;
    weight = e.weight || 0;
    note = e.note || '';
  } else {
    m = byId(mvId);
    variation = defaultVariation(m);
    rir = 1;
    value = m.type === 'time' ? 30 : 8;
    weight = 0;
    note = '';
  }
  sheetState = { mv: m.id, variation, rir, editId: editId || null };

  document.getElementById('sheetTitle').textContent = (editId ? 'Edit · ' : '') + m.name;
  document.getElementById('sheetCues').textContent = m.cues;
  document.getElementById('valueLabel').textContent = m.type === 'time' ? 'Seconds' : 'Reps';
  document.getElementById('valueInput').value = value;
  document.getElementById('weightInput').value = weight;
  document.getElementById('noteInput').value = note;
  document.getElementById('weightUnitLabel').textContent = SETTINGS.unit;
  document.getElementById('saveSet').textContent = editId ? 'Save changes' : 'Save set';
  document.getElementById('deleteSet').hidden = !editId;

  // Bike HIIT sets are time-based with a tension variation and no effort/weight;
  // hide the irrelevant fields so the same sheet can edit them.
  const isBike = !!m.hiit;
  document.getElementById('effortBlock').hidden = isBike;
  document.getElementById('weightBlock').hidden = isBike;
  document.getElementById('valueLabel').textContent = isBike ? 'Total work (s)' : (m.type === 'time' ? 'Seconds' : 'Reps');

  // "Last time" reference — what you did in your previous session.
  const lt = document.getElementById('lastTime');
  const prev = editId ? null : lastSessionSet(m.id);
  if (prev) {
    const d = new Date(prev.day + 'T00:00');
    const when = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    lt.innerHTML = `<span class="lt-label">Last time (${when})</span> ${describeSet(prev)} — beat it!`;
    lt.hidden = false;
  } else {
    lt.hidden = true;
  }

  // Target range + progression nudge (Recommended-Routine style): show the
  // working range, and suggest advancing a rung once you top it on this variation.
  const ph = document.getElementById('progressHint');
  if (!editId && !isBike && m.range) {
    const isHold = m.type === 'time';
    const [lo, hi] = m.range;
    const target = isHold ? `3 × ${lo}–${hi}s` : `3 × ${lo}–${hi}`;
    const advice = isHold
      ? `hold for time, advance when you reach ${hi}s on all 3 sets`
      : `add a rep per session, advance when you hit 3 × ${hi}`;
    let txt = `<span class="ph-label">RR target ${target}</span> at failure − 1 (leave ~1 in the tank); ${advice}.`;
    if (readyToAdvance(m)) {
      const cur = m.variations[variation];
      const next = m.variations[Math.min(variation + 1, m.variations.length - 1)];
      const u = isHold ? 's' : '';
      if (next !== cur) txt = `<span class="ph-label ph-go">Ready to progress 🎉</span> You're topping ${hi}${u} on <b>${cur}</b> — try <b>${next}</b> next.`;
    }
    ph.innerHTML = txt;
    ph.hidden = false;
  } else {
    ph.hidden = true;
  }

  renderChips('variationRow', m.variations, variation, (i) => { sheetState.variation = i; });
  renderChips('rirRow', RIR_OPTIONS, rir, (i) => { sheetState.rir = i; });
  document.getElementById('sheetSaved').hidden = true;
  sheet.hidden = false;
}

// Resume at the variation last used for this movement, else the first.
function defaultVariation(m) {
  const last = lastSet(m.id);
  const idx = last ? m.variations.indexOf(last.variation) : -1;
  return idx >= 0 ? idx : 0;
}

// Ready to advance when the two most recent sets on the current variation both
// reached the top of the target range (RR-style: top the range with good form).
function readyToAdvance(m) {
  if (!m.range) return false;
  const cur = m.variations[defaultVariation(m)];
  const recent = LOG.filter((e) => e.movement === m.id && e.variation === cur)
    .sort((a, b) => b.ts - a.ts).slice(0, 2);
  return recent.length >= 2 && recent.every((e) => e.value >= m.range[1]);
}

// Most recent logged set for a movement (by timestamp). null if none.
function lastSet(mvId) {
  return LOG.filter((e) => e.movement === mvId).sort((a, b) => b.ts - a.ts)[0] || null;
}

// The most recent set on a *previous* day (for the "last time" reference).
function lastSessionSet(mvId) {
  return LOG.filter((e) => e.movement === mvId && e.day !== TODAY).sort((a, b) => b.ts - a.ts)[0] || null;
}

// Human label for a set, e.g. "12 reps · Standard +5kg".
function describeSet(e) {
  const m = byId(e.movement);
  const unit = m && m.type === 'time' ? 's' : ' reps';
  const w = e.weight ? ` +${e.weight}${SETTINGS.unit}` : '';
  return `${e.value}${unit} · ${e.variation}${w}`;
}

function renderChips(rowId, items, selected, onPick) {
  const row = document.getElementById(rowId);
  row.innerHTML = '';
  items.forEach((label, i) => {
    const c = document.createElement('button');
    c.className = 'chip' + (i === selected ? ' sel' : '');
    c.textContent = label;
    c.onclick = () => {
      onPick(i);
      row.querySelectorAll('.chip').forEach((x, j) => x.classList.toggle('sel', j === i));
    };
    row.appendChild(c);
  });
}

function closeSheet() { sheet.hidden = true; }
sheet.querySelectorAll('[data-close]').forEach((el) => (el.onclick = closeSheet));

document.querySelectorAll('[data-step]').forEach((b) => {
  b.onclick = () => {
    const inp = document.getElementById('valueInput');
    inp.value = Math.max(0, (parseInt(inp.value, 10) || 0) + parseInt(b.dataset.step, 10));
  };
});

document.querySelectorAll('[data-wstep]').forEach((b) => {
  b.onclick = () => {
    const inp = document.getElementById('weightInput');
    inp.value = Math.max(0, Math.round(((parseFloat(inp.value) || 0) + parseFloat(b.dataset.wstep)) * 10) / 10);
  };
});

document.getElementById('saveSet').onclick = () => {
  const m = byId(sheetState.mv);
  const value = Math.max(0, parseInt(document.getElementById('valueInput').value, 10) || 0);
  if (!value) return;
  const variation = m.variations[sheetState.variation];
  const rir = RIR_OPTIONS[sheetState.rir];
  const weight = Math.max(0, parseFloat(document.getElementById('weightInput').value) || 0);
  const note = document.getElementById('noteInput').value.trim();

  if (sheetState.editId) {
    const e = LOG.find((x) => x.id === sheetState.editId);
    if (e) {
      e.value = value;
      e.variation = variation;
      e.note = note;
      if (!m.hiit) { e.rir = rir; e.weight = weight; } // keep bike's session summary + no weight
    }
    saveLog(LOG);
    render();
    closeSheet();
    return;
  }

  LOG.push({ id: makeId(), ts: Date.now(), day: TODAY, movement: m.id, variation, rir, value, weight, note });
  saveLog(LOG);
  render();

  // Auto-start the rest timer if enabled; otherwise offer quick presets.
  if (SETTINGS.autoRest) {
    startRest(SETTINGS.restDefault);
    closeSheet();
    return;
  }
  const hint = document.getElementById('sheetSaved');
  const presets = [...new Set([SETTINGS.restDefault, ...REST_PRESETS])].sort((a, b) => a - b);
  hint.innerHTML = `<div class="saved-line">Saved ${value}${m.type === 'time' ? 's' : ' reps'} ✓ — start rest?</div>
    <div class="rest-presets">${presets.map((s) => `<button class="rest-preset" data-sec="${s}">${s}s</button>`).join('')}</div>`;
  hint.hidden = false;
  hint.querySelectorAll('.rest-preset').forEach((b) => {
    b.onclick = () => { startRest(parseInt(b.dataset.sec, 10)); closeSheet(); };
  });
};

document.getElementById('deleteSet').onclick = () => {
  if (!sheetState.editId) return;
  const removed = LOG.find((x) => x.id === sheetState.editId);
  LOG = LOG.filter((x) => x.id !== sheetState.editId);
  saveLog(LOG);
  render();
  closeSheet();
  if (removed) {
    const m = byId(removed.movement);
    showToast(`Deleted ${m ? m.name : 'set'}`, () => {
      LOG.push(removed);
      LOG.sort((a, b) => a.ts - b.ts);
      saveLog(LOG);
      render();
    });
  }
};

// ---------- Undo toast ----------
const toast = document.getElementById('toast');
let toastTimer = null;
function showToast(msg, onUndo) {
  clearTimeout(toastTimer);
  document.getElementById('toastMsg').textContent = msg;
  const undoBtn = document.getElementById('toastUndo');
  undoBtn.onclick = () => { clearTimeout(toastTimer); toast.hidden = true; onUndo(); };
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}

// ---------- Rest timer (persistent banner) ----------
const restBar = document.getElementById('restBar');
const restTimeEl = document.getElementById('restTime');
const restToggle = document.getElementById('restToggle');
let rest = { remaining: 0, running: false, intId: null };

function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function paintRest() {
  restTimeEl.textContent = fmt(Math.max(0, rest.remaining));
  restToggle.textContent = rest.running ? '⏸' : '▶';
}
function startRest(sec) {
  rest.remaining = sec;
  rest.running = true;
  restBar.hidden = false;
  paintRest();
  clearInterval(rest.intId);
  rest.intId = setInterval(tickRest, 1000);
}
function tickRest() {
  if (!rest.running) return;
  rest.remaining--;
  paintRest();
  if (rest.remaining <= 0) finishRest();
}
function finishRest() {
  clearInterval(rest.intId);
  rest.running = false;
  buzz();
  restBar.classList.add('done');
  restTimeEl.textContent = 'Go!';
  setTimeout(() => { restBar.hidden = true; restBar.classList.remove('done'); }, 2500);
}
function buzz() {
  if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.06;
    o.start(); o.stop(ctx.currentTime + 0.18);
  } catch {}
}
restToggle.onclick = () => {
  if (rest.remaining <= 0) return;
  rest.running = !rest.running;
  paintRest();
};
document.getElementById('restSkip').onclick = () => {
  clearInterval(rest.intId); rest.running = false; restBar.hidden = true;
};
restBar.querySelectorAll('[data-rest]').forEach((b) => {
  b.onclick = () => { rest.remaining = Math.max(0, rest.remaining + parseInt(b.dataset.rest, 10)); paintRest(); };
});

// ---------- Bike HIIT interval timer ----------
const hiitSheet = document.getElementById('hiitSheet');
const hiit = { phase: 'idle', round: 0, remaining: 0, intId: null, completed: 0 };

function openHiit() {
  HIIT = loadHiit();
  document.getElementById('hiitWork').value = HIIT.work;
  document.getElementById('hiitRest').value = HIIT.rest;
  document.getElementById('hiitRounds').value = HIIT.rounds;
  // Tension chips 1..8
  const row = document.getElementById('hiitTensionRow');
  row.innerHTML = '';
  for (let t = 1; t <= 8; t++) {
    const c = document.createElement('button');
    c.className = 'chip' + (t === HIIT.tension ? ' sel' : '');
    c.textContent = t;
    c.dataset.tension = t;
    c.onclick = () => row.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === c));
    row.appendChild(c);
  }
  showHiitSetup();
  hiitSheet.hidden = false;
}
function closeHiit() {
  clearInterval(hiit.intId);
  hiit.phase = 'idle';
  hiitSheet.hidden = true;
}
hiitSheet.querySelectorAll('[data-close-hiit]').forEach((el) => (el.onclick = () => {
  if (hiit.phase !== 'idle' && hiit.phase !== 'done' && !confirm('Stop the workout? Completed rounds will still be logged.')) return;
  if (hiit.completed > 0 && hiit.phase !== 'done') logHiitSession();
  closeHiit();
}));

function showHiitSetup() {
  document.getElementById('hiitSetup').hidden = false;
  document.getElementById('hiitRun').hidden = true;
}

// Read + persist the chosen setup from the inputs.
function readHiitSetup() {
  const sel = hiitSheet.querySelector('#hiitTensionRow .chip.sel');
  HIIT = {
    work: Math.max(5, parseInt(document.getElementById('hiitWork').value, 10) || 30),
    rest: Math.max(5, parseInt(document.getElementById('hiitRest').value, 10) || 60),
    rounds: Math.max(1, parseInt(document.getElementById('hiitRounds').value, 10) || 8),
    tension: sel ? parseInt(sel.dataset.tension, 10) : 4,
  };
  saveHiit(HIIT);
  return HIIT;
}

document.getElementById('hiitStart').onclick = () => {
  readHiitSetup();
  hiit.completed = 0;
  hiit.round = 1;
  document.getElementById('hiitSetup').hidden = true;
  document.getElementById('hiitRun').hidden = false;
  enterPhase('lead', 3); // 3-2-1 countdown before the first burst
};

// Phase machine: 'lead' -> ('work' -> 'rest')* -> 'done'.
function enterPhase(phase, seconds) {
  hiit.phase = phase;
  hiit.remaining = seconds;
  paintHiit();
  clearInterval(hiit.intId);
  hiit.intId = setInterval(tickHiit, 1000);
  if (phase === 'work') beep(880, 0.18);
  else if (phase === 'rest') beep(440, 0.18);
  else if (phase === 'lead') beep(440, 0.1);
}
function tickHiit() {
  hiit.remaining--;
  // Count-in cue on the last 3 seconds of work/rest.
  if (hiit.remaining > 0 && hiit.remaining <= 3 && (hiit.phase === 'work' || hiit.phase === 'rest')) beep(660, 0.08);
  paintHiit();
  if (hiit.remaining > 0) return;

  if (hiit.phase === 'lead') { enterPhase('work', HIIT.work); return; }
  if (hiit.phase === 'work') {
    hiit.completed = hiit.round;
    if (hiit.round >= HIIT.rounds) { finishHiit(); return; }
    enterPhase('rest', HIIT.rest);
    return;
  }
  if (hiit.phase === 'rest') { hiit.round++; enterPhase('work', HIIT.work); return; }
}
function finishHiit() {
  clearInterval(hiit.intId);
  hiit.phase = 'done';
  buzz();
  logHiitSession();
  const run = document.getElementById('hiitRun');
  run.innerHTML = `<div class="hiit-done">✅<div>Done — ${hiit.completed} × ${HIIT.work}s logged</div></div>
    <button id="hiitClose2" class="btn-primary">Finish</button>`;
  document.getElementById('hiitClose2').onclick = closeHiit;
}
function paintHiit() {
  const label = { lead: 'Get ready', work: 'GO!', rest: 'Recover', done: 'Done' }[hiit.phase] || '';
  document.getElementById('hiitPhase').textContent = label;
  document.getElementById('hiitBig').textContent = Math.max(0, hiit.remaining);
  document.getElementById('hiitRoundInfo').textContent =
    hiit.phase === 'lead' ? `Tension ${HIIT.tension} · ${HIIT.rounds} rounds`
                          : `Round ${hiit.round} of ${HIIT.rounds} · tension ${HIIT.tension}`;
  const run = document.getElementById('hiitRun');
  run.classList.toggle('is-work', hiit.phase === 'work');
  run.classList.toggle('is-rest', hiit.phase === 'rest' || hiit.phase === 'lead');
}

// Log the session as one entry: value = total work seconds, note describes structure.
function logHiitSession() {
  if (hiit.completed <= 0) return;
  LOG.push({
    id: makeId(), ts: Date.now(), day: TODAY, movement: 'bike',
    variation: `Tension ${HIIT.tension}`,
    rir: `${hiit.completed}×${HIIT.work}s`,
    value: hiit.completed * HIIT.work,
    weight: 0,
    note: `${hiit.completed} × ${HIIT.work}s on / ${HIIT.rest}s off`,
  });
  saveLog(LOG);
  hiit.completed = 0; // guard against double-logging on close
  render();
}

// A single tone (used for interval cues); reuses one AudioContext.
let _actx = null;
function beep(freq, dur) {
  try {
    _actx = _actx || new (window.AudioContext || window.webkitAudioContext)();
    if (_actx.state === 'suspended') _actx.resume();
    const o = _actx.createOscillator(), g = _actx.createGain();
    o.connect(g); g.connect(_actx.destination);
    o.frequency.value = freq; g.gain.value = 0.07;
    o.start(); o.stop(_actx.currentTime + dur);
  } catch {}
  if (navigator.vibrate && freq >= 800) navigator.vibrate(120);
}

document.getElementById('hiitPause').onclick = () => {
  if (hiit.phase === 'idle' || hiit.phase === 'done') return;
  if (hiit.intId) { clearInterval(hiit.intId); hiit.intId = null; document.getElementById('hiitPause').textContent = '▶'; }
  else { hiit.intId = setInterval(tickHiit, 1000); document.getElementById('hiitPause').textContent = '⏸'; }
};

// ---------- Custom session editor ----------
const sessionSheet = document.getElementById('sessionSheet');
function openSessionEditor() {
  const editor = document.getElementById('sessionEditor');
  editor.innerHTML = MOVEMENTS.map((m) => {
    const inSession = SESSION.find((s) => s.id === m.id);
    const target = inSession ? inSession.target : '2–3 sets · RIR 1–2';
    return `<div class="sess-row">
      <label class="sess-pick"><input type="checkbox" data-sid="${m.id}" ${inSession ? 'checked' : ''} />
        <span>${m.emoji} ${m.name}</span></label>
      <input class="sess-target" data-tid="${m.id}" value="${target.replace(/"/g, '&quot;')}" placeholder="Target" />
    </div>`;
  }).join('');
  sessionSheet.hidden = false;
}
function closeSessionEditor() { sessionSheet.hidden = true; }
sessionSheet.querySelectorAll('[data-close-session]').forEach((el) => (el.onclick = closeSessionEditor));

document.getElementById('saveSession').onclick = () => {
  const next = [];
  // Preserve movement order from MOVEMENTS.
  for (const m of MOVEMENTS) {
    const cb = sessionSheet.querySelector(`[data-sid="${m.id}"]`);
    if (cb && cb.checked) {
      const t = sessionSheet.querySelector(`[data-tid="${m.id}"]`).value.trim();
      next.push({ id: m.id, target: t || '2–3 sets' });
    }
  }
  SESSION = next.length ? next : DEFAULT_SESSION.map((s) => ({ ...s }));
  saveSession(SESSION);
  closeSessionEditor();
  render();
};
document.getElementById('resetSession').onclick = () => {
  SESSION = DEFAULT_SESSION.map((s) => ({ ...s }));
  saveSession(SESSION);
  closeSessionEditor();
  render();
};

// ---------- Data export / import / clear ----------
function dataButtons() {
  return `<div class="section-title">Your data</div>
    <p class="lede">Stored only on this device. Export regularly as a backup.</p>
    <div class="btn-row">
      <button id="exportBtn" class="btn-outline">Export JSON</button>
      <button id="exportMdBtn" class="btn-outline">Export Markdown</button>
    </div>
    <div class="btn-row">
      <button id="importBtn" class="btn-outline">Restore</button>
      <button id="clearBtn" class="btn-outline danger">Clear</button>
    </div>`;
}
function wireDataButtons() {
  const ex = document.getElementById('exportBtn');
  if (ex) ex.onclick = exportData;
  const md = document.getElementById('exportMdBtn');
  if (md) md.onclick = exportMarkdown;
  const im = document.getElementById('importBtn');
  if (im) im.onclick = () => document.getElementById('importFile').click();
  const cl = document.getElementById('clearBtn');
  if (cl) cl.onclick = clearData;
}

function exportData() {
  download(`calisthenics-log-${TODAY}.json`, JSON.stringify(LOG, null, 2), 'application/json');
}

// Export the log as Obsidian-friendly Markdown: YAML frontmatter for
// Dataview, then one section per day with a table of sets.
function exportMarkdown() {
  if (!LOG.length) { alert('Nothing logged yet to export.'); return; }
  const days = [...new Set(LOG.map((e) => e.day))].sort().reverse();
  const totalSets = LOG.length;
  const totalReps = LOG.reduce((s, e) => { const m = byId(e.movement); return s + (m && m.type === 'reps' ? e.value : 0); }, 0);

  const lines = [];
  lines.push('---');
  lines.push('type: workout-log');
  lines.push(`exported: ${TODAY}`);
  lines.push(`days_trained: ${days.length}`);
  lines.push(`total_sets: ${totalSets}`);
  lines.push(`total_reps: ${totalReps}`);
  lines.push('tags: [fitness, calisthenics]');
  lines.push('---');
  lines.push('');
  lines.push('# Calisthenics Log');
  lines.push('');

  for (const day of days) {
    const items = entriesOn(day).slice().sort((a, b) => a.ts - b.ts);
    const d = new Date(day + 'T00:00');
    const pretty = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    lines.push(`## ${day} — ${pretty}`);
    lines.push('');
    lines.push('| Movement | Variation | Result | Effort | Note |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const e of items) {
      const m = byId(e.movement);
      const name = m ? m.name : e.movement;
      const unit = m && m.type === 'time' ? 's' : ' reps';
      let result = `${e.value}${unit}`;
      if (e.weight) result += ` +${e.weight}${SETTINGS.unit}`;
      const note = (e.note || '').replace(/\|/g, '\\|');
      lines.push(`| ${name} | ${e.variation} | ${result} | ${e.rir} | ${note} |`);
    }
    lines.push('');
  }

  download(`calisthenics-log-${TODAY}.md`, lines.join('\n'), 'text/markdown');
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('importFile').onchange = (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch { alert('That file is not valid JSON.'); return; }
    if (!Array.isArray(data) || !data.every((e) => e && e.movement && e.day && 'value' in e)) {
      alert('That does not look like a Calisthenics Log backup.');
      return;
    }
    const ok = confirm(`Restore ${data.length} sets? This replaces your current ${LOG.length} sets on this device.`);
    if (!ok) return;
    LOG = data.map((e) => ({ ...e, id: e.id || makeId() }));
    saveLog(LOG);
    render();
    alert('Backup restored.');
  };
  reader.readAsText(file);
  ev.target.value = ''; // allow re-importing the same file later
};

function clearData() {
  if (!confirm('Delete all logged workouts? Export a backup first if unsure. This cannot be undone.')) return;
  LOG = [];
  saveLog(LOG);
  render();
}

// ---------- Settings ----------
const settingsSheet = document.getElementById('settingsSheet');
function openSettings() {
  document.getElementById('setAutoRest').checked = SETTINGS.autoRest;
  document.getElementById('restLenInput').value = SETTINGS.restDefault;
  const row = document.getElementById('restLenRow');
  row.innerHTML = '';
  [45, 60, 90, 120, 150].forEach((s) => {
    const c = document.createElement('button');
    c.className = 'chip' + (s === SETTINGS.restDefault ? ' sel' : '');
    c.textContent = s + 's';
    c.onclick = () => {
      document.getElementById('restLenInput').value = s;
      row.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === c));
    };
    row.appendChild(c);
  });
  const unitRow = document.getElementById('unitRow');
  unitRow.innerHTML = '';
  ['kg', 'lb'].forEach((u) => {
    const c = document.createElement('button');
    c.className = 'chip' + (u === SETTINGS.unit ? ' sel' : '');
    c.textContent = u;
    c.onclick = () => unitRow.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === c));
    unitRow.appendChild(c);
  });
  // Reminder day chips (multi-select) + time.
  const remRow = document.getElementById('remDays');
  remRow.innerHTML = '';
  const chosen = new Set(SETTINGS.remDays);
  WEEKDAYS.forEach((label, i) => {
    const c = document.createElement('button');
    c.className = 'chip' + (chosen.has(i) ? ' sel' : '');
    c.textContent = label;
    c.dataset.dow = i;
    c.onclick = () => c.classList.toggle('sel');
    remRow.appendChild(c);
  });
  document.getElementById('remTime').value = SETTINGS.remTime;
  document.getElementById('appVersion').textContent = APP_LABEL;
  document.getElementById('updateStatus').hidden = true;
  settingsSheet.hidden = false;
}

// Manual escape hatch: ask the service worker to re-check the network for a
// newer version. If one is found it installs and the page reloads itself.
function checkForUpdate() {
  const status = document.getElementById('updateStatus');
  status.hidden = false;
  status.textContent = 'Checking…';
  const reg = window.__swReg;
  if (!reg) {
    // No service worker (e.g. opened over plain http) — just hard-reload.
    status.textContent = 'Reloading…';
    setTimeout(() => location.reload(), 400);
    return;
  }
  reg.update().then(() => {
    const waiting = reg.installing || reg.waiting;
    if (waiting) {
      status.textContent = 'Update found — applying…';
      // controllerchange (registered in index.html) reloads once it activates.
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      status.textContent = `You're up to date (${APP_VERSION}).`;
    }
  }).catch(() => { status.textContent = 'Could not check — are you online?'; });
}

// Build a recurring .ics reminder for the chosen days/time and download it.
function addReminderToCalendar() {
  const days = [...document.querySelectorAll('#remDays .chip.sel')].map((c) => parseInt(c.dataset.dow, 10));
  if (!days.length) { alert('Pick at least one day for your reminder.'); return; }
  const time = document.getElementById('remTime').value || '18:00';
  // Persist the choice so it's remembered next time the sheet opens.
  SETTINGS.remDays = days;
  SETTINGS.remTime = time;
  saveSettings(SETTINGS);

  const [hh, mm] = time.split(':').map((n) => parseInt(n, 10));
  // First occurrence: the next upcoming chosen weekday at the chosen time.
  const now = new Date();
  const start = new Date(now);
  start.setHours(hh, mm, 0, 0);
  for (let add = 0; add < 8; add++) {
    const cand = new Date(start);
    cand.setDate(start.getDate() + add);
    if (days.includes(cand.getDay()) && cand > now) { start.setTime(cand.getTime()); break; }
  }
  const pad = (n) => String(n).padStart(2, '0');
  const local = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(start.getTime() + 30 * 60000);
  const byday = days.sort().map((d) => ICAL_DAYS[d]).join(',');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Calisthenics Log//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:calisthenics-${Date.now()}@local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
    'SUMMARY:🏋️ Calisthenics workout',
    'DESCRIPTION:Time to train — simple movements, proper form. Consistency is the whole game.',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Calisthenics workout', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calisthenics-reminder.ics';
  a.click();
  URL.revokeObjectURL(url);
}
function closeSettings() { settingsSheet.hidden = true; }
document.getElementById('settingsBtn').onclick = openSettings;
document.getElementById('addReminder').onclick = addReminderToCalendar;
document.getElementById('checkUpdate').onclick = checkForUpdate;
settingsSheet.querySelectorAll('[data-close-settings]').forEach((el) => (el.onclick = closeSettings));
settingsSheet.querySelectorAll('[data-restadj]').forEach((b) => {
  b.onclick = () => {
    const inp = document.getElementById('restLenInput');
    inp.value = Math.max(5, (parseInt(inp.value, 10) || 0) + parseInt(b.dataset.restadj, 10));
    document.querySelectorAll('#restLenRow .chip').forEach((x) => x.classList.remove('sel'));
  };
});
document.getElementById('saveSettings').onclick = () => {
  SETTINGS.autoRest = document.getElementById('setAutoRest').checked;
  SETTINGS.restDefault = Math.max(5, parseInt(document.getElementById('restLenInput').value, 10) || 90);
  const selUnit = document.querySelector('#unitRow .chip.sel');
  if (selUnit) SETTINGS.unit = selUnit.textContent;
  SETTINGS.remDays = [...document.querySelectorAll('#remDays .chip.sel')].map((c) => parseInt(c.dataset.dow, 10));
  SETTINGS.remTime = document.getElementById('remTime').value || '18:00';
  saveSettings(SETTINGS);
  render();
  closeSettings();
};

// ---------- Tabs ----------
document.querySelectorAll('.tab').forEach((t) => {
  t.onclick = () => {
    activeTab = t.dataset.tab;
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('is-active', x === t));
    window.scrollTo(0, 0);
    render();
  };
});

render();
