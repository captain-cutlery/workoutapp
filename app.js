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
    id: 'core', name: 'Core hold', emoji: '🧱', group: 'Core', type: 'time',
    cues: 'Brace abs hard, ribs down, neutral spine. No sagging hips. Quality tension beats long sloppy holds.',
    variations: ['Knee plank (s)', 'Plank (s)', 'Hollow hold (s)', 'Hollow rocks'],
  },
];

const byId = (id) => MOVEMENTS.find((m) => m.id === id);

// Suggested full-body session (KBoges leans full-body, frequent, low-fuss).
const SESSION = [
  { id: 'pushup', target: '2–3 sets · RIR 1–2' },
  { id: 'pullup', target: '2–3 sets · RIR 1–2' },
  { id: 'squat',  target: '2–3 sets · RIR 1–2' },
  { id: 'core',   target: '2–3 quality holds' },
];

const RIR_OPTIONS = ['0 (failure)', '1–2 left', '3–4 left', 'Easy'];

// ---------- Storage ----------
const KEY = 'cal_log_v1';
function loadLog() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveLog(log) { localStorage.setItem(KEY, JSON.stringify(log)); }
let LOG = loadLog();

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
  html += `<div class="section-title">Suggested session</div>`;
  for (const s of SESSION) {
    const m = byId(s.id);
    const done = today.filter((e) => e.movement === s.id);
    const tally = summarize(m, done);
    html += movementCard(m, s.target, tally, done.length);
  }
  const total = today.length;
  html += `<div class="section-title">Today's log</div>`;
  html += total
    ? renderEntryList(today)
    : `<p class="lede">Nothing logged yet. Tap a movement above to start.</p>`;
  view.innerHTML = html;
  wireCards();
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
    view.innerHTML = `<div class="empty"><div class="big">🌱</div>No workouts logged yet.<br>Consistency is the whole game — start today.</div>`;
    return;
  }
  const keys = [...new Set(LOG.map((e) => e.day))].sort().reverse();
  let html = `<div class="card"><b>${LOG.length}</b> sets logged across <b>${keys.length}</b> days.</div>`;
  for (const key of keys) {
    const items = entriesOn(key);
    const d = new Date(key + 'T00:00');
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    html += `<div class="day-group"><div class="day-head"><h3>${label}${key === TODAY ? ' · Today' : ''}</h3><span>${items.length} sets</span></div><div class="card">${renderEntryRows(items)}</div></div>`;
  }
  html += `<div class="section-title">Data</div><div class="btn-row">
    <button id="exportBtn" class="btn-outline">Export JSON</button>
    <button id="clearBtn" class="btn-outline danger">Clear all</button></div>`;
  view.innerHTML = html;
  document.getElementById('exportBtn').onclick = exportData;
  document.getElementById('clearBtn').onclick = clearData;
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
  const vals = entries.map((e) => e.value + unit).join(' · ');
  return vals;
}

function renderEntryList(items) { return `<div class="card">${renderEntryRows(items)}</div>`; }
function renderEntryRows(items) {
  return items
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .map((e) => {
      const m = byId(e.movement);
      const unit = m && m.type === 'time' ? 's' : ' reps';
      return `<div class="entry"><div>${m ? m.emoji : ''} ${m ? m.name : e.movement}
        <div class="e-meta">${e.variation} · ${e.rir}</div></div>
        <div><b>${e.value}</b>${unit}</div></div>`;
    })
    .join('');
}

function wireCards() {
  view.querySelectorAll('[data-mv]').forEach((el) => {
    el.onclick = () => openSheet(el.dataset.mv);
  });
}

// ---------- Logging sheet ----------
const sheet = document.getElementById('sheet');
let sheetState = { mv: null, variation: 0, rir: 1 };

function openSheet(mvId) {
  const m = byId(mvId);
  sheetState = { mv: mvId, variation: defaultVariation(m), rir: 1 };
  document.getElementById('sheetTitle').textContent = m.name;
  document.getElementById('sheetCues').textContent = m.cues;
  document.getElementById('valueLabel').textContent = m.type === 'time' ? 'Seconds' : 'Reps';
  document.getElementById('valueInput').value = m.type === 'time' ? 30 : 8;

  renderChips('variationRow', m.variations, sheetState.variation, (i) => { sheetState.variation = i; });
  renderChips('rirRow', RIR_OPTIONS, sheetState.rir, (i) => { sheetState.rir = i; });
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
  LOG.push({
    ts: Date.now(),
    day: TODAY,
    movement: m.id,
    variation: m.variations[sheetState.variation],
    rir: RIR_OPTIONS[sheetState.rir],
    value,
  });
  saveLog(LOG);
  const hint = document.getElementById('sheetSaved');
  hint.textContent = `Saved ${value}${m.type === 'time' ? 's' : ' reps'} · log another or close`;
  hint.hidden = false;
  render();
};

// ---------- Data export / clear ----------
function exportData() {
  const blob = new Blob([JSON.stringify(LOG, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calisthenics-log-${TODAY}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function clearData() {
  if (!confirm('Delete all logged workouts? This cannot be undone.')) return;
  LOG = [];
  saveLog(LOG);
  render();
}

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
