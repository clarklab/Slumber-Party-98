import { state, emit, on, dateStr, isDesktopShell, syncShellClass, hold, release, signalAck } from "./engine.js";
import { icons } from "./icons.js";
import { play, bindAudio, toggleMuted, paintMuteButton, isMuted } from "./audio.js";

const flashing = new Set();

export function flashTask(id) {
  flashing.add(id);
  paintTaskbar();
}

export function clearFlash(id) {
  if (!flashing.delete(id)) return;
  paintTaskbar();
}

const registry = new Map();
const openOrder = [];
const SIZES = {
  messenger: [760, 540],
  browser: [840, 600],
  tropicana: [780, 560],
  explorer: [700, 520],
  computer: [700, 520],
  notepad: [560, 440],
  photo: [600, 580],
  dos: [600, 400],
  help: [520, 440],
};
let cascade = 0;

export function registerApp(def) {
  registry.set(def.id, def);
}

export function getApp(id) {
  return registry.get(id);
}

export function apps() {
  return [...registry.values()];
}

function windowsEl() {
  return document.getElementById("windows");
}

function areaSize() {
  const el = windowsEl();
  return { w: el?.clientWidth || window.innerWidth, h: el?.clientHeight || window.innerHeight };
}

function nextGeom(id) {
  const [dw, dh] = SIZES[id] || [560, 420];
  const { w: aw, h: ah } = areaSize();
  const width = Math.min(dw, Math.max(320, aw - 24));
  const height = Math.min(dh, Math.max(240, ah - 24));
  const step = (cascade++ % 8) * 26;
  const x = Math.min(32 + step, Math.max(0, aw - width - 8));
  const y = Math.min(28 + step, Math.max(0, ah - height - 8));
  return { x, y, width, height };
}

function applyGeom(el, g) {
  el.style.left = `${g.x}px`;
  el.style.top = `${g.y}px`;
  el.style.width = `${g.width}px`;
  el.style.height = `${g.height}px`;
  el.style.right = "auto";
  el.style.bottom = "auto";
  el.style.inset = "auto";
}

function currentGeom(el) {
  return {
    x: el.offsetLeft,
    y: el.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
}

function setMaxButton(el, id, maximized) {
  const btn = el.querySelector("[data-max], [data-restore]");
  if (!btn) return;
  if (maximized) {
    btn.setAttribute("aria-label", "Restore");
    btn.className = "restore";
    btn.dataset.restore = id;
    delete btn.dataset.max;
  } else {
    btn.setAttribute("aria-label", "Maximize");
    btn.className = "maximize";
    btn.dataset.max = id;
    delete btn.dataset.restore;
  }
}

export function toggleMaximize(id) {
  if (!isDesktopShell()) return;
  const el = document.getElementById(`win-${id}`);
  if (!el) return;
  if (el.classList.contains("maximized")) {
    const g = JSON.parse(el.dataset.geom || "null") || nextGeom(id);
    el.classList.remove("maximized");
    applyGeom(el, g);
    setMaxButton(el, id, false);
  } else {
    el.dataset.geom = JSON.stringify(currentGeom(el));
    el.classList.add("maximized");
    setMaxButton(el, id, true);
  }
  focusApp(id);
}

function bindWindowChrome(el, id) {
  const bar = el.querySelector(".title-bar");
  bar.addEventListener("dblclick", (e) => {
    if (e.target.closest(".title-bar-controls")) return;
    toggleMaximize(id);
  });
  bar.addEventListener("pointerdown", (e) => {
    if (!isDesktopShell() || el.classList.contains("maximized")) return;
    if (e.target.closest(".title-bar-controls")) return;
    if (e.button != null && e.button !== 0) return;
    focusApp(id);
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    const orig = currentGeom(el);
    el.classList.add("dragging");
    const move = (ev) => {
      applyGeom(el, {
        x: orig.x + ev.clientX - sx,
        y: Math.max(0, orig.y + ev.clientY - sy),
        width: orig.width,
        height: orig.height,
      });
    };
    const up = () => {
      el.classList.remove("dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
  el.querySelectorAll("[data-rz]").forEach((h) => {
    h.addEventListener("pointerdown", (e) => {
      if (!isDesktopShell() || el.classList.contains("maximized")) return;
      e.preventDefault();
      e.stopPropagation();
      focusApp(id);
      const dir = h.getAttribute("data-rz");
      const sx = e.clientX;
      const sy = e.clientY;
      const orig = currentGeom(el);
      const move = (ev) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        let { x, y, width, height } = orig;
        if (dir.includes("e")) width = orig.width + dx;
        if (dir.includes("s")) height = orig.height + dy;
        if (dir.includes("w")) {
          width = orig.width - dx;
          x = orig.x + dx;
        }
        if (dir.includes("n")) {
          height = orig.height - dy;
          y = orig.y + dy;
        }
        width = Math.max(320, width);
        height = Math.max(220, height);
        applyGeom(el, { x, y, width, height });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  });
}

export function openApp(id, opts = {}) {
  const def = registry.get(id);
  if (!def) return;
  if (!state.firstApp) state.firstApp = id;
  const wins = windowsEl();
  let el = document.getElementById(`win-${id}`);
  const desk = isDesktopShell();
  if (!el) {
    el = document.createElement("div");
    el.className = "window";
    el.id = `win-${id}`;
    el.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text" id="title-${id}">${escapeHtml(def.title)}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" data-min="${id}"></button>
          <button aria-label="Maximize" class="maximize" data-max="${id}"></button>
          <button aria-label="Close" data-close="${id}"></button>
        </div>
      </div>
      <div class="window-body" id="body-${id}"></div>
      <div class="rz rz-n" data-rz="n"></div>
      <div class="rz rz-s" data-rz="s"></div>
      <div class="rz rz-e" data-rz="e"></div>
      <div class="rz rz-w" data-rz="w"></div>
      <div class="rz rz-ne" data-rz="ne"></div>
      <div class="rz rz-nw" data-rz="nw"></div>
      <div class="rz rz-se" data-rz="se"></div>
      <div class="rz rz-sw" data-rz="sw"></div>
    `;
    const titleText = el.querySelector(".title-bar-text");
    if (def.icon && icons[def.icon]) {
      titleText.style.backgroundImage = `url("${icons[def.icon]}")`;
    }
    wins.appendChild(el);
    el.addEventListener("mousedown", () => focusApp(id));
    el.addEventListener("touchstart", () => focusApp(id), { passive: true });
    bindWindowChrome(el, id);
    if (desk) applyGeom(el, nextGeom(id));
    else el.classList.add("maximized");
    play("open");
  }
  el.classList.remove("minimized");
  if (desk && !el.style.width) applyGeom(el, nextGeom(id));
  focusApp(id);
  def.render(document.getElementById(`body-${id}`), opts);
  paintTaskbar();
  emit("open", { id, opts });
}

export function waitUntilDismissed(id) {
  const gone = () => {
    const el = document.getElementById(`win-${id}`);
    const top = openOrder[openOrder.length - 1];
    return !el || el.classList.contains("minimized") || top !== id;
  };
  if (gone()) return Promise.resolve();
  return new Promise((resolve) => {
    const tick = () => {
      if (!gone()) return;
      offClose();
      offFocus();
      resolve();
    };
    const offClose = on("window-closed", tick);
    const offFocus = on("focus", tick);
  });
}

export function closeApp(id) {
  const el = document.getElementById(`win-${id}`);
  if (el) {
    el.remove();
    play("close");
  }
  const i = openOrder.indexOf(id);
  if (i >= 0) openOrder.splice(i, 1);
  releaseWindow(id);
  paintTaskbar();
  const last = openOrder[openOrder.length - 1];
  if (last) focusApp(last);
  else updateAppHold();
  emit("window-closed", { id });
}

export function minimizeApp(id) {
  const el = document.getElementById(`win-${id}`);
  if (el) el.classList.add("minimized");
  const i = openOrder.indexOf(id);
  if (i >= 0) openOrder.splice(i, 1);
  releaseWindow(id);
  paintTaskbar();
  updateAppHold();
  emit("window-closed", { id });
}

function releaseWindow(id) {
  if (id === "messenger") {
    const chatting = state.currentBuddy;
    release("stream");
    release("choices");
    if (chatting) signalAck(chatting);
    state.currentBuddy = null;
  }
}

let appHoldId = null;

function updateAppHold() {
  const id = openOrder[openOrder.length - 1];
  const el = id && document.getElementById(`win-${id}`);
  const next = el && !el.classList.contains("minimized") && id !== "messenger" ? id : null;
  if (appHoldId === next) return;
  if (appHoldId) release("app:" + appHoldId);
  appHoldId = next;
  if (appHoldId) hold("app:" + appHoldId);
}

export function focusApp(id) {
  clearFlash(id);
  document.querySelectorAll("#windows .window").forEach((w) => {
    const tb = w.querySelector(".title-bar");
    if (!tb) return;
    if (w.id === `win-${id}`) tb.classList.remove("inactive");
    else tb.classList.add("inactive");
  });
  const i = openOrder.indexOf(id);
  if (i >= 0) openOrder.splice(i, 1);
  openOrder.push(id);
  const el = document.getElementById(`win-${id}`);
  if (el) el.style.zIndex = String(20 + openOrder.length);
  paintTaskbar();
  updateAppHold();
  emit("focus", { id });
}

export function setTitle(id, title) {
  const t = document.getElementById(`title-${id}`);
  if (t) t.childNodes[0] ? (t.childNodes[0].nodeValue = title) : (t.textContent = title);
  const def = registry.get(id);
  if (def) def.title = title;
  paintTaskbar();
}

export function isOpen(id) {
  const el = document.getElementById(`win-${id}`);
  return el && !el.classList.contains("minimized");
}

export function refreshApp(id) {
  const def = registry.get(id);
  const body = document.getElementById(`body-${id}`);
  if (def && body && isOpen(id)) def.render(body, {});
}

export function paintTaskbar() {
  const host = document.getElementById("task-buttons");
  if (!host) return;
  const ids = [...document.querySelectorAll("#windows .window")].map((w) => w.id.replace("win-", ""));
  host.innerHTML = ids
    .map((id) => {
      const def = registry.get(id);
      const el = document.getElementById(`win-${id}`);
      const active = el && !el.classList.contains("minimized") && openOrder[openOrder.length - 1] === id;
      const flash = flashing.has(id) && !active;
      return `<button type="button" class="task-btn${active ? " active" : ""}${flash ? " flash" : ""}" data-task="${id}">${escapeHtml(
        (def && def.title) || id
      )}</button>`;
    })
    .join("");
}

export function paintClock() {
  const el = document.getElementById("clock");
  if (el) el.textContent = dateStr();
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bindShell() {
  bindAudio();
  paintMuteButton();
  document.getElementById("vol")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isMuted()) {
      toggleMuted();
      paintMuteButton();
      play("click");
    } else {
      play("click");
      toggleMuted();
      paintMuteButton();
    }
  });
  syncShellClass();
  const mq = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
  mq.addEventListener?.("change", () => {
    syncShellClass();
    document.querySelectorAll("#windows .window").forEach((el) => {
      const id = el.id.replace("win-", "");
      if (isDesktopShell()) {
        if (!el.style.width) applyGeom(el, nextGeom(id));
        el.classList.remove("maximized");
        setMaxButton(el, id, false);
      } else {
        el.classList.add("maximized");
      }
    });
  });
  document.body.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) {
      closeApp(close.getAttribute("data-close"));
      return;
    }
    const min = e.target.closest("[data-min]");
    if (min) {
      minimizeApp(min.getAttribute("data-min"));
      return;
    }
    const max = e.target.closest("[data-max]");
    if (max) {
      toggleMaximize(max.getAttribute("data-max"));
      return;
    }
    const restore = e.target.closest("[data-restore]");
    if (restore) {
      toggleMaximize(restore.getAttribute("data-restore"));
      return;
    }
    const task = e.target.closest("[data-task]");
    if (task) {
      const id = task.getAttribute("data-task");
      const el = document.getElementById(`win-${id}`);
      if (el && !el.classList.contains("minimized") && openOrder[openOrder.length - 1] === id) {
        minimizeApp(id);
      } else {
        openApp(id);
      }
      return;
    }
    const start = e.target.closest("#start-btn");
    if (start) {
      toggleStart();
      play("menu");
      return;
    }
    if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) {
      hideStart();
    }
  });
  on("time", paintClock);
  paintClock();
}

export function toggleStart() {
  const menu = document.getElementById("start-menu");
  const btn = document.getElementById("start-btn");
  if (menu.hidden) {
    menu.hidden = false;
    btn.classList.add("active");
    renderStartMenu();
  } else {
    hideStart();
  }
}

export function hideStart() {
  const menu = document.getElementById("start-menu");
  const btn = document.getElementById("start-btn");
  if (menu) menu.hidden = true;
  if (btn) btn.classList.remove("active");
}

function renderStartMenu() {
  const menu = document.getElementById("start-menu");
  menu.innerHTML = `
    <div class="window" style="margin:0;width:100%">
      <div class="window-body">
        <div class="start-banner">HomeSoft 98</div>
        <div class="start-items">
          <button type="button" data-start-app="messenger">${imgBtn("messenger")} BuddyBee</button>
          <button type="button" data-start-app="browser">${imgBtn("browser")} NetBuddy Navigator</button>
          <button type="button" data-start-app="tropicana">${imgBtn("tropicana")} Encyclopedia Tropicana</button>
          <button type="button" data-start-app="notepad">${imgBtn("notepad")} ScratchPad</button>
          <button type="button" data-start-app="explorer">${imgBtn("folder")} Windows Explorer</button>
          <button type="button" data-start-app="computer">${imgBtn("computer")} My Computer</button>
          <button type="button" data-start-app="dos">${imgBtn("dos")} MS-DOS Prompt</button>
          <hr />
          <button type="button" data-start-app="help">${imgBtn("help")} Help</button>
          <hr />
          <button type="button" data-shutdown>Shut Down...</button>
        </div>
      </div>
    </div>`;
  menu.querySelectorAll("[data-start-app]").forEach((b) => {
    b.addEventListener("click", () => {
      hideStart();
      play("click");
      openApp(b.getAttribute("data-start-app"));
    });
  });
  menu.querySelector("[data-shutdown]").addEventListener("click", () => {
    hideStart();
    play("question");
    emit("shutdown-request");
  });
}

function imgBtn(name) {
  return `<img class="glyph" alt="" src="${icons[name]}" />`;
}
