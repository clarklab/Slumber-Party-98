/** HomeSoft 98 sound — Web Audio synth. No sample library, no copyrighted .wavs. */

let ctx = null;
let master = null;
let muted = sessionStorage.getItem("hs98-mute") === "1";
let lastAt = 0;
let lastName = "";

function AC() {
  return window.AudioContext || window.webkitAudioContext;
}

export function unlockAudio() {
  try {
    if (!AC()) return;
    if (!ctx) {
      ctx = new (AC())();
      master = ctx.createGain();
      master.gain.value = 0.22;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 20;
      comp.ratio.value = 6;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
  } catch {
    /* ignore */
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(v) {
  muted = !!v;
  sessionStorage.setItem("hs98-mute", muted ? "1" : "0");
  try {
    if (master) master.gain.value = muted ? 0 : 0.22;
  } catch {
    /* ignore */
  }
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

function now() {
  unlockAudio();
  return ctx ? ctx.currentTime : 0;
}

function env(t, peak, dur, a = 0.006) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.01, dur));
  g.connect(master);
  return g;
}

function osc(type, freq, t, dur, peak, slide) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  o.connect(env(t, peak, dur));
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise(t, dur, peak, hpFreq = 800, type = "highpass") {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = hpFreq;
  src.connect(f);
  f.connect(env(t, peak, dur, 0.002));
  src.start(t);
  src.stop(t + dur + 0.02);
}

const BANK = {
  tada(t) {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => osc("triangle", f, t + i * 0.11, 0.45, 0.22));
  },
  logoff(t) {
    [784, 659, 523, 392].forEach((f, i) => osc("triangle", f, t + i * 0.13, 0.4, 0.18));
  },
  ding(t) {
    osc("sine", 1320, t, 0.12, 0.18);
    osc("sine", 1760, t + 0.02, 0.08, 0.08);
  },
  tick(t) {
    osc("square", 1400, t, 0.045, 0.07);
  },
  click(t) {
    noise(t, 0.03, 0.12, 1800);
    osc("square", 2400, t, 0.02, 0.04);
  },
  error(t) {
    osc("square", 220, t, 0.16, 0.2);
    osc("square", 180, t + 0.18, 0.22, 0.2);
  },
  warn(t) {
    osc("square", 740, t, 0.09, 0.14);
    osc("square", 740, t + 0.14, 0.12, 0.14);
  },
  question(t) {
    osc("sine", 660, t, 0.1, 0.14);
    osc("sine", 880, t + 0.12, 0.16, 0.16);
  },
  notify(t) {
    osc("sine", 1174, t, 0.12, 0.16);
    osc("sine", 1480, t + 0.1, 0.14, 0.14);
    osc("sine", 1760, t + 0.22, 0.18, 0.12);
  },
  im(t) {
    noise(t, 0.05, 0.16, 400, "lowpass");
    osc("triangle", 784, t + 0.06, 0.12, 0.2);
    osc("triangle", 1174, t + 0.16, 0.2, 0.2);
  },
  send(t) {
    osc("triangle", 980, t, 0.05, 0.1, 1560);
  },
  signon(t) {
    noise(t, 0.08, 0.14, 600, "lowpass");
    osc("square", 392, t + 0.04, 0.18, 0.12, 784);
    osc("triangle", 523, t + 0.16, 0.2, 0.12);
  },
  signoff(t) {
    osc("triangle", 784, t, 0.16, 0.12, 330);
    noise(t + 0.08, 0.1, 0.08, 500, "lowpass");
  },
  open(t) {
    osc("square", 520, t, 0.04, 0.06);
    osc("square", 780, t + 0.04, 0.05, 0.05);
  },
  close(t) {
    osc("square", 780, t, 0.04, 0.05);
    osc("square", 420, t + 0.04, 0.06, 0.05);
  },
  menu(t) {
    osc("square", 980, t, 0.03, 0.05);
  },
  recycle(t) {
    noise(t, 0.18, 0.14, 1200);
    noise(t + 0.05, 0.12, 0.1, 2400);
  },
  shutter(t) {
    noise(t, 0.04, 0.2, 2500);
    osc("square", 90, t, 0.04, 0.08);
    noise(t + 0.07, 0.03, 0.12, 3000);
  },
  navigate(t) {
    osc("sine", 640, t, 0.06, 0.08);
    osc("sine", 960, t + 0.05, 0.07, 0.07);
  },
  modem(t) {
    for (let i = 0; i < 8; i++) {
      osc("square", i % 2 ? 2225 : 1270, t + i * 0.045, 0.042, 0.07);
    }
    osc("sawtooth", 1800, t + 0.38, 0.12, 0.06, 600);
  },
};

export function play(name) {
  if (muted) return;
  unlockAudio();
  if (!ctx || !master) return;
  const fn = BANK[name] || BANK.ding;
  const t = ctx.currentTime;
  if (name === lastName && t - lastAt < 0.05) return;
  lastName = name;
  lastAt = t;
  try {
    fn(t);
  } catch {
    /* ignore */
  }
}

export function playBeep() {
  play("tick");
}

export function playChord(kind = "start") {
  play(kind === "end" ? "logoff" : "tada");
}

export function bindAudio() {
  const resume = () => unlockAudio();
  window.addEventListener("pointerdown", resume);
  window.addEventListener("keydown", resume);
  window.addEventListener("touchstart", resume, { passive: true });
  unlockAudio();
}

export function paintMuteButton() {
  const el = document.getElementById("vol");
  if (!el) return;
  el.textContent = muted ? "🔇" : "🔊";
  el.title = muted ? "Sound: Off" : "Sound: On";
  el.setAttribute("aria-label", muted ? "Unmute" : "Mute");
}
