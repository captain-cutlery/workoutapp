/* Calisthenics Log — vanilla PWA built on KBoges principles:
   a few compound movements, full range of motion, consistent effort. */

'use strict';

// Bump this with each release; surfaced in Settings so you can confirm the
// installed app matches the latest deploy. Keep in step with the sw.js cache.
const APP_VERSION = 'v26';
const APP_BUILT = '16 Sep 2026';
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
    cues: 'Brace and squeeze the glutes to flatten the low back. Send the hips back, hinge from the hips with a neutral spine — never round the back. Kettlebell swings are a back-friendly loaded option: snap the hips through, float the bell with the glutes (don’t lift with the arms or low back).',
    variations: ['Kettlebell swing', 'Romanian deadlift', 'Single-leg deadlift', 'Banded Nordic negative', 'Banded Nordic curl', 'Nordic curl'],
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

  // ---- SuperMover (The Bioneer) additions ----
  // Purely additive: nothing above is renamed or removed, so existing logs and
  // the Recommended Routine keep working exactly as before. These only appear
  // in the suggested session when the SuperMover routine is selected, but are
  // always free-loggable from the Log tab.
  {
    id: 'lizardcrawl', name: 'Lizard Crawl', emoji: '🦎', group: 'Push', type: 'time', range: [60, 60], style: 'supermover', rx: '3 × 1 min',
    cues: 'Crawl along the floor low to the ground, chest close to the deck. Bring the knee out to the side toward the elbow as you reach forward with the opposite hand. Keep the hips low.',
    variations: ['On the spot', 'Forward crawl', 'Forward + reverse', 'Weighted vest'],
  },
  {
    id: 'pikepushup', name: 'Pike Push-ups', emoji: '🔺', group: 'Push', type: 'reps', range: [15, 30], style: 'supermover', rx: '3 × failure',
    cues: 'Hips high in a pike so the torso is close to vertical, then push through the shoulders. The closer to vertical, the more it targets the delts.',
    variations: ['Feet on floor', 'Feet elevated', 'Wall-assisted', 'Full handstand push-up'],
  },
  {
    id: 'abrollout', name: 'Ab Roll-out', emoji: '🎡', group: 'Core', type: 'reps', range: [10, 25], style: 'supermover', rx: '3 × failure',
    cues: 'Hold the wheel with both hands and roll forward. Contract the core, hips and glutes to resist extension — never let the low back arch. Only go as far as you can control.',
    variations: ['From knees (short)', 'From knees (full)', 'Standing'],
  },
  {
    id: 'gobletcurl', name: 'Goblet Curls', emoji: '🏋️', group: 'Pull', type: 'reps', range: [15, 30], style: 'supermover', rx: '3 × failure',
    cues: 'Hold a kettlebell, dumbbell or heavy rucksack in both hands and curl upwards. Increase or decrease the weight to adjust difficulty.',
    variations: ['Light', 'Moderate', 'Heavy'],
  },
  {
    id: 'tacticalpullup', name: 'Tactical Pull-ups', emoji: '🪖', group: 'Pull', type: 'reps', range: [8, 20], style: 'supermover', rx: '3 × failure',
    cues: 'Grab the bar and pull explosively so your thumbs meet the top — as though hauling yourself over a ledge. Keep the torso straight and lower under control.',
    variations: ['Band-assisted', 'Standard', 'Explosive', 'Weighted'],
  },
  {
    id: 'multilunge', name: 'Multi-directional Lunge', emoji: '🧭', group: 'Legs', type: 'reps', range: [10, 20], style: 'supermover', rx: '2 × 10 each direction',
    cues: 'Lunge in three directions — forward, to the side, and backwards. Great for hip mobility, balance and strength through multiple planes.',
    variations: ['Bodyweight', 'Slow tempo', 'Weighted'],
  },
  {
    id: 'squatwalk', name: 'Squat Walks', emoji: '🦆', group: 'Legs', type: 'time', range: [60, 60], style: 'supermover', rx: '3 × 1 min',
    cues: 'Drop into a deep squat and walk forward while staying down. Builds strength endurance and mobility in the legs. Make a game of it — squat-walk to fetch something.',
    variations: ['Short distance', 'Continuous 1 min', 'Weighted'],
  },
  {
    id: 'broadjump', name: 'Precision Broad Jumps', emoji: '🐸', group: 'Legs', type: 'reps', range: [10, 20], style: 'supermover', rx: '3 × 10',
    cues: 'A precision jump: aim to land on a target, not just as far as you can. Swing the arms and jump from one foot position to another. Land gently on the balls of the feet to absorb impact.',
    variations: ['Floor targets', 'Onto a low box', 'Longer distance'],
  },
  {
    id: 'kbhalo', name: 'Kettlebell Halos', emoji: '💫', group: 'Push', type: 'reps', range: [15, 20], style: 'supermover', rx: '2 × 15',
    cues: 'Hold a kettlebell by the horns, bring it past the right ear, behind the head, and back to the start. Circle one way then reverse. Great shoulder mobility work.',
    variations: ['Light', 'Moderate', 'Heavy'],
  },
  {
    id: 'hollowhold', name: 'Hollow Body Hold', emoji: '🌙', group: 'Core', type: 'time', range: [30, 60], style: 'supermover', rx: '3 × 1 min',
    cues: 'Lie on your back, legs straight and arms overhead. Contract the core so the lower back touches the ground and the shoulders and legs lift — a slight concave shape. Hold.',
    variations: ['Tuck', 'One leg extended', 'Full hollow', 'Hollow rocks'],
  },
  {
    id: 'cossack', name: 'Cossack Squats', emoji: '↔️', group: 'Legs', type: 'reps', range: [5, 15], style: 'supermover', rx: '2 × 5',
    cues: 'Squat down over one leg with the other extended out to the side, foot flat. Keep the extended leg straight and the chest up. Excellent for hip adductors and deep mobility.',
    variations: ['Assisted / heel raised', 'Bodyweight', 'Weighted'],
  },
  {
    id: 'airsquat', name: 'Air Squats', emoji: '🪑', group: 'Legs', type: 'reps', range: [30, 50], style: 'supermover', rx: '3 × 50',
    cues: 'Feet shoulder-width, toes slightly out. Squat until the thighs are at least parallel, then return to standing. Keep the back straight. High-rep conditioning.',
    variations: ['Bodyweight', 'Fast cadence', 'Weighted vest'],
  },
  {
    id: 'sprints', name: 'Sprint Drills', emoji: '💨', group: 'Cardio', type: 'reps', range: [5, 10], style: 'supermover', rx: '5 × 100m',
    cues: 'Mark out ~100 metres and sprint to the end, walk back, repeat. Log one rep per sprint. Builds immense power and reinforces one of the most important human movement patterns.',
    variations: ['60m', '100m', 'Hill sprints'],
  },
  {
    id: 'jumprope', name: 'Jump Rope', emoji: '🪢', group: 'Warm-up', type: 'time', range: [600, 600], style: 'supermover', rx: '1 × 10 min',
    cues: 'Small hops, minimal impact, arms close to the sides — rotate the rope from the wrists, not the shoulders. Keep a subtle hollow-body tension. No rope? Mime it.',
    variations: ['Basic bounce', 'Crossovers', 'Double unders'],
  },
  {
    id: 'shadowbox', name: 'Shadow Boxing', emoji: '🥊', group: 'Warm-up', type: 'time', range: [600, 600], style: 'supermover', rx: '1 × 10 min',
    cues: 'Hands up in guard, punch from the hip and turn the fist over. Stay relaxed, never lock out the elbow. Throw kicks too — roundhouses open the hips and get you rotating. Work both sides.',
    variations: ['Shadow boxing', 'Heavy bag', 'With kicks'],
  },
  {
    id: 'run', name: 'Run', emoji: '🏃', group: 'Warm-up', type: 'time', range: [900, 900], style: 'supermover', rx: '1 × 15 min',
    cues: 'A short run at a gentle pace to get the blood flowing and settle into cadence. Stay relaxed and focus on gait mechanics rather than speed or distance.',
    variations: ['Easy pace', 'Off-road', 'Minimal shoes'],
  },
  {
    id: 'liquidmotion', name: 'Liquid Motion', emoji: '🌊', group: 'Warm-up', type: 'time', range: [600, 600], style: 'supermover', rx: '10 min',
    cues: 'Ten minutes of flowing, exploratory movement — rotate the spine, open the hips, move through positions slowly and continuously. Mobility through motion rather than static stretching.',
    variations: ['Ground flow', 'Standing flow', 'Free movement'],
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

// ---------- Routines ----------
// A routine decides what the Today tab suggests. 'rr' is the original
// Recommended Routine behaviour and stays the default, so switching is purely
// opt-in and fully reversible — routines never touch the log, and the custom
// session saved under SESSION_KEY only ever applies to 'rr'.
//
// 'rr'         : one full-body session every day (user-editable).
// 'supermover' : The Bioneer's SuperMover, "workout-only" weekly split.
//                days[] is indexed by JS getDay() — 0 = Sunday.

const SUPERMOVER_PUSH = [
  { id: 'dips',        target: '3 × failure · rapid cadence' },
  { id: 'lizardcrawl', target: '3 × 1 min' },
  { id: 'pushup',      target: '3 × failure · rapid cadence' },
  { id: 'pikepushup',  target: '3 × failure' },
];
const SUPERMOVER_PULL = [
  { id: 'row',            target: '3 × failure' },
  { id: 'abrollout',      target: '3 × failure' },
  { id: 'gobletcurl',     target: '3 × failure' },
  { id: 'tacticalpullup', target: '3 × failure' },
];
const SUPERMOVER_LEGS = [
  { id: 'multilunge', target: '2 × 10 each direction' },
  { id: 'squatwalk',  target: '3 × 1 min' },
  { id: 'broadjump',  target: '3 × 10' },
  { id: 'hinge',      target: '3 × 50 · kettlebell swing' },
];
const SUPERMOVER_FULL = [
  { id: 'pushup',     target: '3 × failure' },
  { id: 'hinge',      target: '3 × 50 · kettlebell swing' },
  { id: 'gobletcurl', target: '3 × failure' },
  { id: 'hollowhold', target: '3 × 1 min' },
  { id: 'kbhalo',     target: '2 × 15' },
  { id: 'row',        target: '3 × 10' },
  { id: 'squatwalk',  target: '3 × 1 min' },
];
// Every SuperMover training day finishes with 10 minutes of Liquid Motion.
const SUPERMOVER_FINISHER = [{ id: 'liquidmotion', target: '10 min' }];

const ROUTINES = {
  rr: {
    name: 'Recommended Routine',
    blurb: 'A short full-body session. Move with control, stop a couple reps shy of failure.',
    repStyle: 'rr',
  },
  supermover: {
    name: 'SuperMover',
    blurb: 'The Bioneer’s SuperMover split. High reps, rapid cadence, sets to failure, ~1 min rest between sets.',
    repStyle: 'supermover',
    // Prescriptions for movements SHARED with the Recommended Routine, so they
    // show the book's numbers while SuperMover is active instead of RR's 8–12.
    // (SuperMover-only movements carry their own `rx` on the movement itself.)
    rx: {
      dips:   '3 × failure',
      pushup: '3 × failure',
      row:    '3 × failure',
      hinge:  '3 × 50 (kettlebell swing)',
    },
    // 0=Sun … 6=Sat
    days: [
      { label: 'Rest', short: 'Rest', rest: true, items: [] },
      { label: 'Push day',  short: 'Push', items: [...SUPERMOVER_PUSH, ...SUPERMOVER_FINISHER] },
      { label: 'Pull day',  short: 'Pull', items: [...SUPERMOVER_PULL, ...SUPERMOVER_FINISHER] },
      { label: 'Rest', short: 'Rest', rest: true, items: [] },
      { label: 'Rest', short: 'Rest', rest: true, items: [] },
      { label: 'Leg day',   short: 'Legs', items: [...SUPERMOVER_LEGS, ...SUPERMOVER_FINISHER] },
      { label: 'Full body', short: 'Full', items: [...SUPERMOVER_FULL, ...SUPERMOVER_FINISHER] },
    ],
  },
};

const activeRoutine = () => ROUTINES[SETTINGS.routine] || ROUTINES.rr;

// What Today should suggest: the user's saved session for 'rr', or the
// weekday's session for a day-based routine. Returns { label, rest, items }.
function todaysPlan() {
  const r = activeRoutine();
  if (!r.days) return { label: 'Suggested session', rest: false, items: SESSION };
  const d = r.days[new Date().getDay()] || { label: 'Rest', rest: true, items: [] };
  return { label: d.label, rest: !!d.rest, items: d.items };
}

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
// `routine` defaults to 'rr' so existing behaviour is untouched until the user
// opts in from Settings; switching back restores everything exactly.
const DEFAULT_SETTINGS = { autoRest: true, restDefault: 90, unit: 'kg', remDays: [1, 3, 5], remTime: '18:00', routine: 'rr' };
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
  const routine = activeRoutine();
  const plan = todaysPlan();

  let html = `<p class="lede">${routine.blurb}</p>`;
  const ws = weekSummary();
  if (ws) {
    html += `<div class="week-summary">📅 This week: <b>${ws.sessions}</b> session${ws.sessions > 1 ? 's' : ''} · <b>${ws.sets}</b> sets${ws.reps ? ` · <b>${ws.reps}</b> reps` : ''}</div>`;
  }

  // 'rr' keeps its editable session; day-based routines show the day's label.
  const editable = !routine.days;
  html += `<div class="section-row"><div class="section-title">${editable ? 'Suggested session' : plan.label}</div>`
    + (editable ? `<button id="editSession" class="link-btn">Edit</button>` : `<span class="routine-badge">${routine.name}</span>`)
    + `</div>`;

  // For weekday-based routines show the week at a glance, so it's obvious which
  // routine is active and what's coming up — including on rest days.
  html += weekOverviewHtml(routine);

  if (plan.rest) {
    html += `<div class="card rest-card">😴 <b>Rest day.</b> Recovery is when you actually get stronger —
      take it. You can still free-log anything from the Log tab.</div>`;
  } else {
    for (const s of plan.items) {
      const m = byId(s.id);
      if (!m) continue;
      const done = today.filter((e) => e.movement === s.id);
      html += movementCard(m, s.target, summarize(m, done), done.length);
    }
  }

  html += `<div class="section-title">Today's log</div>`;
  html += today.length
    ? renderEntryList(today)
    : `<p class="lede">Nothing logged yet. Tap a movement above to start.</p>`;
  view.innerHTML = html;
  wireCards();
  wireEntries();
  const edit = document.getElementById('editSession');
  if (edit) edit.onclick = openSessionEditor;
}

// Display order for the Log tab's group headings. Movements are bucketed by
// group rather than relying on array order, so new movements can be appended
// anywhere in MOVEMENTS without producing duplicate headings.
const GROUP_ORDER = ['Warm-up', 'Push', 'Pull', 'Legs', 'Hinge', 'Core', 'Cardio'];

function renderLog() {
  topTitle.textContent = 'Log anything';
  let html = `<p class="lede">Free log — pick any movement and record a set.</p>`;
  const todays = entriesOn(TODAY);
  const groups = [...new Set(MOVEMENTS.map((m) => m.group))]
    .sort((a, b) => {
      const ia = GROUP_ORDER.indexOf(a), ib = GROUP_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  for (const group of groups) {
    html += `<div class="section-title">${group}</div>`;
    for (const m of MOVEMENTS.filter((x) => x.group === group)) {
      const done = todays.filter((e) => e.movement === m.id);
      html += movementCard(m, m.variations.length + ' progressions', summarize(m, done), done.length);
    }
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
  showCardFor(m.id); // async; reveals the card only if one is stored
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

  // Target range + progression nudge. The two routines disagree on rep scheme,
  // so the guidance follows whichever routine is active:
  //   rr         — 3×8–12 at failure − 1, advance the variation at the top.
  //   supermover — high reps, rapid cadence, sets to failure, ~1 min rest,
  //                progress by adding reps rather than changing variation.
  // The effort label is programme-specific too: RR stops shy of failure,
  // SuperMover deliberately takes sets to failure.
  const effortLabel = document.getElementById('effortLabel');
  if (effortLabel) {
    effortLabel.textContent = (m.style === 'supermover' || activeRoutine().repStyle === 'supermover')
      ? 'Effort — SuperMover takes most sets to failure'
      : 'Effort — stop a couple reps shy of failure';
  }

  const ph = document.getElementById('progressHint');
  if (!editId && !isBike && m.range) {
    const isHold = m.type === 'time';
    const [lo, hi] = m.range;
    // A movement that only exists in SuperMover always shows SuperMover
    // guidance, whichever routine is active — otherwise a SuperMover-only
    // exercise would show RR wording that doesn't apply to it. Movements shared
    // by both programmes (push-ups, dips, rows, hinge) follow the active routine.
    const superMover = m.style === 'supermover' || activeRoutine().repStyle === 'supermover';
    let txt;

    if (superMover) {
      // Prefer the book's own prescription: a routine-level override for shared
      // movements first, then the movement's own, then the computed range.
      const r = activeRoutine();
      const routineRx = r.repStyle === 'supermover' ? (r.rx || {})[m.id] : null;
      const target = routineRx || m.rx
        || (isHold ? `3 × ${hi >= 60 ? Math.round(hi / 60) + ' min' : hi + 's'}` : `3 × ${lo}–${hi}`);
      const advice = isHold
        ? 'hold the full time with quality, then add a set or load'
        : 'take each set close to failure, then simply add reps next time';
      txt = `<span class="ph-label">SuperMover ${target}</span> rapid cadence, ~1 min rest; ${advice}.`;
    } else {
      const target = isHold ? `3 × ${lo}–${hi}s` : `3 × ${lo}–${hi}`;
      const advice = isHold
        ? `hold for time, advance when you reach ${hi}s on all 3 sets`
        : `add a rep per session, advance when you hit 3 × ${hi}`;
      txt = `<span class="ph-label">RR target ${target}</span> at failure − 1 (leave ~1 in the tank); ${advice}.`;
      if (readyToAdvance(m)) {
        const cur = m.variations[variation];
        const next = m.variations[Math.min(variation + 1, m.variations.length - 1)];
        const u = isHold ? 's' : '';
        if (next !== cur) txt = `<span class="ph-label ph-go">Ready to progress 🎉</span> You're topping ${hi}${u} on <b>${cur}</b> — try <b>${next}</b> next.`;
      }
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
    <p class="lede"><b>Obsidian:</b> "Today → vault" saves a single PARA note for today —
      point Chrome's download folder at your synced vault's Fitness folder (or enable
      "Ask where to save") and Syncthing does the rest. "All days (zip)" exports the full history.</p>
    <div class="btn-row">
      <button id="exportTodayBtn" class="btn-outline">Today → vault</button>
      <button id="exportMdBtn" class="btn-outline">All days (zip)</button>
    </div>
    <div class="btn-row">
      <button id="exportBtn" class="btn-outline">Backup JSON</button>
      <button id="importBtn" class="btn-outline">Restore</button>
      <button id="clearBtn" class="btn-outline danger">Clear</button>
    </div>`;
}
function wireDataButtons() {
  const ex = document.getElementById('exportBtn');
  if (ex) ex.onclick = exportData;
  const td = document.getElementById('exportTodayBtn');
  if (td) td.onclick = exportTodayMarkdown;
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

// ----- Obsidian / PARA export config -----
// Workouts are filed as an Area in the PARA vault (2.Area Folders/Health/Fitness).
// Frontmatter mirrors the user's actual note style (lean: a tags list + a few
// content fields + a quoted links wikilink — no Dataview blocks). Edit these
// constants if any vault value differs.
const OBSIDIAN = {
  tags: ['area', 'Fitness', 'workout', 'calisthenics'], // PARA category + topic tags
  areasLink: '2. Area',      // PARA index note for the `links` field (the "2. Area.md" note)
  // Optional folder path placed inside the zip so it extracts to the right spot.
  // Set to '' to export bare .md files at the zip root instead.
  folder: 'PARA Folders/2.Area Folders/Health/Fitness',
};

// Build one Obsidian note for a single day, matching the vault's note style:
// lean YAML frontmatter (tags, date, sets, reps, links) then a workout table.
// Filename is the date only, matching the existing daily notes in Fitness/.
function dayMarkdown(day) {
  const items = entriesOn(day).slice().sort((a, b) => a.ts - b.ts);
  const sets = items.length;
  const reps = items.reduce((s, e) => { const m = byId(e.movement); return s + (m && m.type === 'reps' ? e.value : 0); }, 0);
  const d = new Date(day + 'T00:00');
  const pretty = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const lines = [
    '---',
    'tags:',
    ...OBSIDIAN.tags.map((t) => `  - ${t}`),
    `date: ${day}`,
    `sets: ${sets}`,
    `reps: ${reps}`,
    `links: "[[${OBSIDIAN.areasLink}]]"`,
    '---',
    `## ${pretty}`,
    '',
    '| Movement | Variation | Result | Effort | Note |',
    '| --- | --- | --- | --- | --- |',
  ];
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
  return lines.join('\n');
}

// Export one PARA note per workout day, bundled into a single .zip (browsers
// block firing many downloads at once). Files are named by date and optionally
// nested under the Fitness folder path so they extract into the right place.
function exportMarkdown() {
  if (!LOG.length) { alert('Nothing logged yet to export.'); return; }
  const days = [...new Set(LOG.map((e) => e.day))].sort();
  const enc = new TextEncoder();
  const dir = OBSIDIAN.folder ? OBSIDIAN.folder.replace(/\/$/, '') + '/' : '';
  const files = days.map((day) => ({ name: `${dir}${day}.md`, data: enc.encode(dayMarkdown(day)) }));
  downloadBlob(`calisthenics-markdown-${TODAY}.zip`, buildZip(files));
}

// Export just today's PARA note as a single `YYYY-MM-DD.md` file. Ideal for a
// Syncthing'd vault: with Chrome set to save to (or "ask" for) the Fitness
// folder, the file lands in the vault and syncs automatically.
function exportTodayMarkdown() {
  if (!entriesOn(TODAY).length) { alert('Nothing logged today yet.'); return; }
  download(`${TODAY}.md`, dayMarkdown(TODAY), 'text/markdown');
}

// ----- Minimal ZIP writer (store / no compression) -----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function buildZip(files) {
  const enc = new TextEncoder();
  const locals = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = enc.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;
    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    locals.push(lh, f.data);

    const ch = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    ch.set(nameBytes, 46);
    central.push(ch);

    offset += lh.length + f.data.length;
  }
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);
  return new Blob([...locals, ...central, eocd], { type: 'application/zip' });
}

function download(filename, text, type) {
  downloadBlob(filename, new Blob([text], { type }));
}
function downloadBlob(filename, blob) {
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

// ---------- Exercise cards (on-device only) ----------
// The SuperMover cards are artwork from a paid product, so they are never
// committed to this (public) repo. Instead the user imports their own copy
// once; images are downscaled and kept in IndexedDB on the device.

const CARD_DB = 'cal_cards';
const CARD_STORE = 'cards';
const CARD_MAX_W = 1200;   // plenty for a phone, keeps the card text legible
const CARD_QUALITY = 0.85;

function cardDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CARD_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(CARD_STORE)) req.result.createObjectStore(CARD_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function cardTx(mode, fn) {
  return cardDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(CARD_STORE, mode);
    const store = tx.objectStore(CARD_STORE);
    const out = fn(store);
    tx.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
    tx.onerror = () => reject(tx.error);
  }));
}
const cardPut   = (id, blob) => cardTx('readwrite', (s) => s.put(blob, id));
const cardGet   = (id)       => cardTx('readonly',  (s) => s.get(id));
const cardKeys  = ()         => cardTx('readonly',  (s) => s.getAllKeys());
const cardAll   = ()         => cardTx('readonly',  (s) => s.getAll());
const cardClear = ()         => cardTx('readwrite', (s) => s.clear());

// Map a card filename to a movement id. Names are normalised (lowercase,
// letters only) so "Tactical Pull Ups.png" matches "tacticalpullup".
const CARD_ALIASES = {
  abrollout: 'abrollout',
  airsquats: 'airsquat',
  bodyweightrows: 'row',
  boxing: 'shadowbox',
  cossacksquats: 'cossack',
  dips: 'dips',
  gobletcurls: 'gobletcurl',
  hollowbodyhold: 'hollowhold',
  jumprope: 'jumprope',
  kettlebellhalos: 'kbhalo',
  kettlebellswing: 'hinge',
  lizardcrawl: 'lizardcrawl',
  lunges: 'multilunge',
  pikepushup: 'pikepushup',
  precisionbroadjump: 'broadjump',
  pushups: 'pushup',
  running: 'run',
  sprintdrills: 'sprints',
  squatwalk: 'squatwalk',
  tacticalpullups: 'tacticalpullup',
};
function matchCardName(filename) {
  const base = filename.replace(/^.*\//, '').replace(/\.[a-z0-9]+$/i, '');
  const norm = base.toLowerCase().replace(/[^a-z]/g, '');
  if (CARD_ALIASES[norm]) return CARD_ALIASES[norm];
  // Fall back to a direct id match, then a singular/plural nudge.
  if (byId(norm)) return norm;
  const singular = norm.replace(/s$/, '');
  if (CARD_ALIASES[singular]) return CARD_ALIASES[singular];
  if (byId(singular)) return singular;
  return null;
}

// Minimal ZIP reader: walks the central directory and inflates entries with
// the browser's native DecompressionStream (no library needed).
async function readZip(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  const dv = new DataView(buf.buffer);
  // Find the End Of Central Directory record (scan back from the tail).
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a valid .zip file.');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);

  const out = [];
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOff = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith('/')) continue;                 // directory entry
    if (name.split('/').pop().startsWith('.')) continue; // __MACOSX / dotfiles
    // Local header: data begins after its own name + extra fields.
    const lNameLen = dv.getUint16(localOff + 26, true);
    const lExtraLen = dv.getUint16(localOff + 28, true);
    const start = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);

    let data;
    if (method === 0) {
      data = raw;
    } else if (method === 8) {
      const ds = new DecompressionStream('deflate-raw');
      const stream = new Blob([raw]).stream().pipeThrough(ds);
      data = new Uint8Array(await new Response(stream).arrayBuffer());
    } else {
      continue; // unsupported compression — skip rather than fail the import
    }
    out.push({ name, blob: new Blob([data]) });
  }
  return out;
}

// Downscale a card so 23 A4/300dpi PNGs don't eat ~26 MB of device storage.
async function shrinkImage(blob) {
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, CARD_MAX_W / bmp.width);
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
  bmp.close && bmp.close();
  const type = 'image/webp';
  const made = await new Promise((r) => canvas.toBlob(r, type, CARD_QUALITY));
  // Safari/older engines may not support webp encoding — fall back to JPEG.
  return made || await new Promise((r) => canvas.toBlob(r, 'image/jpeg', CARD_QUALITY));
}

// Import cards from either a .zip or a multi-select of image files.
async function importCards(files) {
  const status = document.getElementById('cardStatus');
  const say = (t) => { if (status) { status.hidden = false; status.textContent = t; } };
  try {
    let entries = [];
    for (const f of files) {
      if (/\.zip$/i.test(f.name)) {
        say('Reading zip…');
        entries = entries.concat(await readZip(f));
      } else if (/^image\//.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name)) {
        entries.push({ name: f.name, blob: f });
      }
    }
    if (!entries.length) { say('No images found in that file.'); return; }

    let saved = 0, bytes = 0;
    const unmatched = [];
    for (let i = 0; i < entries.length; i++) {
      const { name, blob } = entries[i];
      const id = matchCardName(name);
      if (!id) { unmatched.push(name.replace(/^.*\//, '')); continue; }
      say(`Processing ${i + 1} of ${entries.length}…`);
      const small = await shrinkImage(blob);
      await cardPut(id, small);
      saved++; bytes += small.size;
    }
    const mb = (bytes / 1048576).toFixed(1);
    let msg = `Imported ${saved} card${saved === 1 ? '' : 's'} (${mb} MB).`;
    if (unmatched.length) msg += ` Skipped ${unmatched.length} with no matching exercise: ${unmatched.join(', ')}.`;
    say(msg);
    refreshCardStatus(true);
  } catch (err) {
    say('Import failed: ' + (err && err.message ? err.message : 'unknown error'));
  }
}

// Show the card for a movement in the log sheet (if one has been imported).
// Object URLs are revoked as we go so repeated opens don't leak memory.
let currentCardUrl = null;
async function showCardFor(movementId) {
  const wrap = document.getElementById('cardThumb');
  const img = document.getElementById('cardThumbImg');
  if (!wrap || !img) return;
  if (currentCardUrl) { URL.revokeObjectURL(currentCardUrl); currentCardUrl = null; }
  wrap.hidden = true;
  if (!movementId || !('indexedDB' in window)) return;
  try {
    const blob = await cardGet(movementId);
    if (!blob) return;
    currentCardUrl = URL.createObjectURL(blob);
    img.src = currentCardUrl;
    wrap.hidden = false;
  } catch { /* storage unavailable — just don't show a card */ }
}

function openCardViewer() {
  const src = document.getElementById('cardThumbImg').src;
  if (!src) return;
  document.getElementById('cardViewerImg').src = src;
  document.getElementById('cardViewer').hidden = false;
}
function closeCardViewer() { document.getElementById('cardViewer').hidden = true; }

async function refreshCardStatus(keepMessage) {
  const el = document.getElementById('cardCount');
  if (!el) return;
  try {
    const blobs = await cardAll();
    const bytes = blobs.reduce((s, b) => s + (b.size || 0), 0);
    el.textContent = blobs.length
      ? `${blobs.length} card${blobs.length === 1 ? '' : 's'} stored · ${(bytes / 1048576).toFixed(1)} MB`
      : 'No cards imported yet';
  } catch {
    el.textContent = 'Card storage unavailable on this browser';
  }
  if (!keepMessage) {
    const status = document.getElementById('cardStatus');
    if (status) status.hidden = true;
  }
}

// ---------- Settings ----------
const settingsSheet = document.getElementById('settingsSheet');
// Render the routine chips + blurb. Selecting is non-destructive: it only
// changes what Today suggests, so you can switch back at any time.
// A compact "Mon Push · Tue Pull · …" overview for weekday-based routines, with
// today highlighted. Shown in Settings (as a preview) and on Today, so the
// routine is visible even on a rest day.
function weekOverviewHtml(routine) {
  if (!routine.days) return '';
  const names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  return `<div class="wk-plan">` + routine.days.map((d, i) =>
    `<div class="wk-plan-day${i === today ? ' is-today' : ''}${d.rest ? ' is-rest' : ''}">
       <b>${names[i]}</b><span>${d.short || d.label}</span></div>`).join('') + `</div>`;
}

function renderRoutineRow() {
  const row = document.getElementById('routineRow');
  const blurb = document.getElementById('routineBlurb');
  const preview = document.getElementById('routinePreview');
  const paint = (key) => {
    const r = ROUTINES[key] || ROUTINES.rr;
    blurb.textContent = r.blurb;
    if (preview) preview.innerHTML = weekOverviewHtml(r);
  };
  row.innerHTML = '';
  for (const [key, r] of Object.entries(ROUTINES)) {
    const c = document.createElement('button');
    c.className = 'chip' + (key === SETTINGS.routine ? ' sel' : '');
    c.textContent = r.name;
    c.dataset.routine = key;
    c.onclick = () => {
      row.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === c));
      // Apply immediately — switching is non-destructive and reversible, and
      // waiting for Save made it look like the toggle did nothing.
      SETTINGS.routine = key;
      saveSettings(SETTINGS);
      paint(key);
      render();
    };
    row.appendChild(c);
  }
  paint(SETTINGS.routine);
}

function openSettings() {
  renderRoutineRow();
  refreshCardStatus();
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
// ---- Exercise card wiring ----
document.getElementById('cardThumb').onclick = openCardViewer;
document.getElementById('cardViewerClose').onclick = closeCardViewer;
document.getElementById('cardViewer').onclick = (e) => {
  if (e.target.id === 'cardViewer') closeCardViewer(); // tap the backdrop to close
};
document.getElementById('importCardsBtn').onclick = () => document.getElementById('cardFile').click();
document.getElementById('cardFile').onchange = (ev) => {
  const files = [...ev.target.files];
  ev.target.value = ''; // allow re-importing the same file later
  if (files.length) importCards(files);
};
document.getElementById('clearCardsBtn').onclick = async () => {
  if (!confirm('Remove all imported exercise cards from this device?')) return;
  await cardClear();
  await showCardFor(null);
  refreshCardStatus();
  const status = document.getElementById('cardStatus');
  if (status) { status.hidden = false; status.textContent = 'All cards removed.'; }
};

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
  const selRoutine = document.querySelector('#routineRow .chip.sel');
  if (selRoutine) SETTINGS.routine = selRoutine.dataset.routine;
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
