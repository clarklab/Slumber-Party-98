/** HomeSoft 98 game engine — flags, time, notes, climax. */

const listeners = new Map();

export const state = {
  started: false,
  time: new Date("1998-10-18T09:41:00"),
  flags: {},
  clues: new Set(),
  notes: "",
  notepadDoc: "scratch",
  notepadDocs: {},
  chats: {},
  unread: {},
  injectDone: {},
  climax: 0, // 0 none, 1 drip, 2 found, 3 accused, 4 mandy, 5 shutdown
  climaxAt: 0,
  currentBuddy: null,
  browserUrl: "millhaven.net",
  wikiId: "home",
  explorerPath: "C:\\My Documents",
  selectedFile: null,
  installOk: false,
  shutdown: false,
  firstApp: null,
};

export function on(evt, fn) {
  if (!listeners.has(evt)) listeners.set(evt, new Set());
  listeners.get(evt).add(fn);
  return () => listeners.get(evt).delete(fn);
}

export function emit(evt, payload) {
  const set = listeners.get(evt);
  if (set) for (const fn of set) fn(payload);
}

export function flag(name) {
  return !!state.flags[name];
}

export function setFlag(name, value = true) {
  if (state.flags[name] === value) return;
  state.flags[name] = value;
  emit("flag", { name, value });
  maybeClimax();
}

export function addClue(id, noteLine) {
  if (!id) return;
  const size = state.clues.size;
  state.clues.add(id);
  if (state.clues.size !== size) {
    tick(3 + Math.floor(Math.random() * 4));
    emit("clue", { id, count: state.clues.size });
  }
  if (noteLine) pinNote(noteLine);
  maybeClimax();
}

export function pinNote(line) {
  const stamp = clockStr();
  const entry = `[${stamp}] ${line}`;
  if (state.notes.includes(line)) return;
  state.notes = (state.notes ? state.notes + "\n\n" : "") + entry;
  emit("notes");
}

export function setNotes(text) {
  state.notes = text;
  emit("notes");
}

export function tick(minutes = 2) {
  state.time = new Date(state.time.getTime() + minutes * 60000);
  emit("time");
}

export function clockStr() {
  let h = state.time.getHours();
  const m = String(state.time.getMinutes()).padStart(2, "0");
  const am = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${am}`;
}

export function dateStr() {
  return `Sun ${clockStr()}`;
}

export function clueCount() {
  return state.clues.size;
}

function maybeClimax() {
  if (state.climax > 0 || state.shutdown) return;
  const hasChat = ["talked_jess", "talked_chloe", "talked_britt", "talked_lauren"].filter(flag).length;
  const hasWorld = ["read_news", "read_wiki", "read_file", "used_notepad"].filter(flag).length;
  const hasPhotos = [
    "saw_pizza",
    "saw_movie",
    "saw_bags",
    "saw_mom",
    "saw_window",
    "saw_ouija",
    "saw_leaving",
  ].filter(flag).length;
  if (state.clues.size >= 6 && hasChat >= 3 && hasWorld >= 2 && hasPhotos >= 4) {
    startClimax();
  }
}

export function startClimax() {
  if (state.climax) return;
  state.climax = 1;
  state.climaxAt = Date.now();
  setFlag("climax");
  emit("climax", { stage: 1 });
}

export function setClimax(stage) {
  if (stage <= state.climax) return;
  state.climax = stage;
  tick(4);
  emit("climax", { stage });
}

export function markUnread(buddy, n = 1) {
  state.unread[buddy] = (state.unread[buddy] || 0) + n;
  emit("unread");
}

export function clearUnread(buddy) {
  state.unread[buddy] = 0;
  emit("unread");
}

export function ensureChat(id) {
  if (!state.chats[id]) {
    state.chats[id] = { node: "start", log: [], waiting: false, seenStart: false };
  }
  return state.chats[id];
}

export function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    o.type = "square";
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.08);
    setTimeout(() => ctx.close(), 300);
  } catch {
    /* ignore */
  }
}

export function playChord(kind = "start") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === "start" ? [196, 262, 330, 392] : [392, 311, 247, 196];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      o.start(t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.stop(t + 0.55);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {
    /* ignore */
  }
}

export function isStandalone() {
  const mq = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  return mq || window.navigator.standalone === true;
}
