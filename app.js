/* Calisthenics Log — vanilla PWA built on KBoges principles:
   a few compound movements, full range of motion, consistent effort. */

'use strict';

// ---------- Movement library ----------
// type: 'reps' for rep-counted work, 'time' for holds (seconds).
// Variations run easiest -> hardest so progression is obvious.
const MOVEMENTS = [
  {
    id: 'pushup', name: 'Push-ups', emoji: '🤜', group: 'Push', type: 'reps',
    cues: 'Body in one line, brace your core. Chest to the floor, elbows ~45°. Lower slowly, press all the way up.',
    variations: ['Incline', 'Knee', 'Standard', 'Diamond', 'Decline', 'Archer'],
  },
  {
    id: 'dips', name: 'Dips', emoji: '🪑', group: 'Push', type: 'reps',
    cues: 'Shoulders down and back. Lower under control until upper arms are parallel, then lock out at the top.',
    variations: ['Bench / chair', 'Parallel bar', 'Ring'],
  },
  {
    id: 'pullup', name: 'Pull-ups', emoji: '🆙', group: 'Pull', type: 'reps',
    cues: 'Start from a full dead hang. Pull chin over the bar, no kipping. Lower slowly and fully each rep.',
    variations: ['Dead hang (s)', 'Negative', 'Band-assisted', 'Standard', 'Wide', 'Archer'],
  },
  {
    id: 'row', name: 'Rows', emoji: '🚣', group: 'Pull', type: 'reps',
    cues: 'Body straight and rigid. Squeeze shoulder blades, pull chest to the bar, control the way down.',
    variations: ['Incline (feet back)', 'Horizontal', 'Feet elevated'],
  },
  {
    id: 'squat', name: 'Squats', emoji: '🦵', group: 'Legs', type: 'reps',
    cues: 'Full depth — hips below knees. Knees track over toes, chest up, heels planted. Stand tall to finish.',
    variations: ['Box / assisted', 'Bodyweight', 'Tempo (3s down)', 'Split squat', 'Pistol progression'],
  },
  {
    id: 'calf', name: 'Calf raises', emoji: '🦶', group: 'Legs', type: 'reps',
    cues: 'Full range — stretch at the bottom, rise high onto the toes and pause at the top. Slow and controlled, no bouncing.',
    variations: ['Two-leg', 'Single-leg', 'Deficit (off a step)', 'Single-leg deficit'],
  },
  {
    id: 'hinge', name: 'Hip hinge', emoji: '🍑', group: 'Hinge', type: 'reps',
    cues: 'Drive through the heels and squeeze the glutes hard at the top, ribs down. Hinge from the hips with a neutral spine — never round the back.',
    variations: ['Glute bridge', 'Single-leg bridge', 'Hip thrust', 'Good morning', 'Nordic (assisted)', 'Nordic curl'],
  },
  {
    id: 'core', name: 'Core hold', emoji: '🧱', group: 'Core', type: 'time',
    cues: 'Brace abs hard, ribs down, neutral spine. No sagging hips. Quality tension beats long sloppy holds.',
    variations: ['Knee plank (s)', 'Plank (s)', 'Hollow hold (s)', 'Hollow rocks'],
  },
  {
    id: 'legraise', name: 'Leg raises', emoji: '🔻', group: 'Core', type: 'reps',
    cues: 'Move slowly with no swinging. Posteriorly tilt the pelvis so the lower back stays flat, and control the way down.',
    variations: ['Lying knee raises', 'Lying leg raises', 'Hanging knee raises', 'Hanging leg raises', 'Toes-to-bar'],
  },
  {
    id: 'lsit', name: 'L-sit', emoji: '📐', group: 'Core', type: 'time',
    cues: 'Push the floor away, depress the shoulders and lock the knees. Build it in short, high-quality holds.',
    variations: ['Foot-supported (s)', 'Tuck hold (s)', 'One-leg (s)', 'Full L-sit (s)'],
  },
];

const byId = (id) => MOVEMENTS.find((m) => m.id === id);

// Default suggested full-body session (KBoges leans full-body, frequent, low-fuss).
const DEFAULT_SESSION = [
  { id: 'pushup', target: '2–3 sets · RIR 1–2' },
  { id: 'pullup', target: '2–3 sets · RIR 1–2' },
  { id: 'squat',  target: '2–3 sets · RIR 1–2' },
  { id: 'core',   target: '2–3 quality holds' },
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
const DEFAULT_SETTINGS = { autoRest: true, restDefault: 90 };
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

function renderToday() {
  topTitle.textContent = 'Today';
  const today = entriesOn(TODAY);
  let html = `<p class="lede">A short full-body session. Move with control, stop a couple reps shy of failure.</p>`;
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

  html += `<div class="section-title">Progress</div>`;
  for (const m of MOVEMENTS) {
    const series = bestPerDay(m.id);
    if (!series.length) continue;
    const pb = Math.max(...series.map((p) => p.v));
    const unit = m.type === 'time' ? 's' : '';
    html += `<div class="card">
      <div class="chart-head"><div class="mv-name">${m.emoji} ${m.name}</div>
      <div class="mv-tally">PB <b>${pb}${unit}</b></div></div>
      ${sparkline(series, m.type)}
      <div class="chart-foot">${series.length} day${series.length > 1 ? 's' : ''} · best set per day</div>
    </div>`;
  }
  view.innerHTML = html;
}

// ---------- Card / entry markup ----------
function movementCard(m, sub, tally, count) {
  return `<div class="card mv-card" data-mv="${m.id}">
    <div class="mv-emoji">${m.emoji}</div>
    <div class="mv-main">
      <div class="mv-name">${m.name}</div>
      <div class="mv-sub">${sub}</div>
    </div>
    <div class="mv-tally">${count ? `<span class="check">✓</span> ${tally}` : 'Tap to log'}</div>
  </div>`;
}

function summarize(m, entries) {
  if (!entries.length) return '';
  const unit = m.type === 'time' ? 's' : '';
  return entries.map((e) => e.value + unit).join(' · ');
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
      return `<div class="entry${editable ? ' tappable' : ''}"${tap}><div>${m ? m.emoji : ''} ${m ? m.name : e.movement}
        <div class="e-meta">${e.variation} · ${e.rir}</div></div>
        <div class="e-val"><b>${e.value}</b>${unit}${editable ? ' <span class="chev">›</span>' : ''}</div></div>`;
    })
    .join('');
}

function wireCards() {
  view.querySelectorAll('[data-mv]').forEach((el) => {
    el.onclick = () => openSheet(el.dataset.mv);
  });
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

// Best (max value) set per day for a movement, oldest -> newest.
function bestPerDay(mvId) {
  const map = {};
  for (const e of LOG) {
    if (e.movement !== mvId) continue;
    map[e.day] = Math.max(map[e.day] || 0, e.value);
  }
  return Object.keys(map).sort().map((day) => ({ day, v: map[day] }));
}

// Tiny inline SVG line chart. Last ~12 points.
function sparkline(series, type) {
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
  const unit = type === 'time' ? 's' : '';
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
  let m, variation, rir, value;
  if (editId) {
    const e = LOG.find((x) => x.id === editId);
    if (!e) return;
    m = byId(e.movement);
    variation = Math.max(0, m.variations.indexOf(e.variation));
    rir = Math.max(0, RIR_OPTIONS.indexOf(e.rir));
    value = e.value;
  } else {
    m = byId(mvId);
    variation = defaultVariation(m);
    rir = 1;
    value = m.type === 'time' ? 30 : 8;
  }
  sheetState = { mv: m.id, variation, rir, editId: editId || null };

  document.getElementById('sheetTitle').textContent = (editId ? 'Edit · ' : '') + m.name;
  document.getElementById('sheetCues').textContent = m.cues;
  document.getElementById('valueLabel').textContent = m.type === 'time' ? 'Seconds' : 'Reps';
  document.getElementById('valueInput').value = value;
  document.getElementById('saveSet').textContent = editId ? 'Save changes' : 'Save set';
  document.getElementById('deleteSet').hidden = !editId;

  renderChips('variationRow', m.variations, variation, (i) => { sheetState.variation = i; });
  renderChips('rirRow', RIR_OPTIONS, rir, (i) => { sheetState.rir = i; });
  document.getElementById('sheetSaved').hidden = true;
  sheet.hidden = false;
}

// Resume at the variation last used for this movement, else the first.
function defaultVariation(m) {
  const last = LOG.filter((e) => e.movement === m.id).slice(-1)[0];
  const idx = last ? m.variations.indexOf(last.variation) : -1;
  return idx >= 0 ? idx : 0;
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

document.querySelectorAll('.step-btn').forEach((b) => {
  b.onclick = () => {
    const inp = document.getElementById('valueInput');
    inp.value = Math.max(0, (parseInt(inp.value, 10) || 0) + parseInt(b.dataset.step, 10));
  };
});

document.getElementById('saveSet').onclick = () => {
  const m = byId(sheetState.mv);
  const value = Math.max(0, parseInt(document.getElementById('valueInput').value, 10) || 0);
  if (!value) return;
  const variation = m.variations[sheetState.variation];
  const rir = RIR_OPTIONS[sheetState.rir];

  if (sheetState.editId) {
    const e = LOG.find((x) => x.id === sheetState.editId);
    if (e) { e.value = value; e.variation = variation; e.rir = rir; }
    saveLog(LOG);
    render();
    closeSheet();
    return;
  }

  LOG.push({ id: makeId(), ts: Date.now(), day: TODAY, movement: m.id, variation, rir, value });
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
  if (!confirm('Delete this set?')) return;
  LOG = LOG.filter((x) => x.id !== sheetState.editId);
  saveLog(LOG);
  render();
  closeSheet();
};

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
      <button id="exportBtn" class="btn-outline">Export</button>
      <button id="importBtn" class="btn-outline">Restore</button>
      <button id="clearBtn" class="btn-outline danger">Clear</button>
    </div>`;
}
function wireDataButtons() {
  const ex = document.getElementById('exportBtn');
  if (ex) ex.onclick = exportData;
  const im = document.getElementById('importBtn');
  if (im) im.onclick = () => document.getElementById('importFile').click();
  const cl = document.getElementById('clearBtn');
  if (cl) cl.onclick = clearData;
}

function exportData() {
  const blob = new Blob([JSON.stringify(LOG, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calisthenics-log-${TODAY}.json`;
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
  settingsSheet.hidden = false;
}
function closeSettings() { settingsSheet.hidden = true; }
document.getElementById('settingsBtn').onclick = openSettings;
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
  saveSettings(SETTINGS);
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
