import { state, emit, on, dateStr } from "./engine.js";
import { icons } from "./icons.js";

const registry = new Map();
const openOrder = [];

export function registerApp(def) {
  registry.set(def.id, def);
}

export function getApp(id) {
  return registry.get(id);
}

export function apps() {
  return [...registry.values()];
}

export function openApp(id, opts = {}) {
  const def = registry.get(id);
  if (!def) return;
  if (!state.firstApp) state.firstApp = id;
  const wins = document.getElementById("windows");
  let el = document.getElementById(`win-${id}`);
  if (!el) {
    el = document.createElement("div");
    el.className = "window";
    el.id = `win-${id}`;
    el.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text" id="title-${id}">${escapeHtml(def.title)}</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" data-min="${id}"></button>
          <button aria-label="Maximize" disabled></button>
          <button aria-label="Close" data-close="${id}"></button>
        </div>
      </div>
      <div class="window-body" id="body-${id}"></div>
    `;
    const titleText = el.querySelector(".title-bar-text");
    if (def.icon && icons[def.icon]) {
      titleText.style.backgroundImage = `url("${icons[def.icon]}")`;
    }
    wins.appendChild(el);
    el.addEventListener("mousedown", () => focusApp(id));
    el.addEventListener("touchstart", () => focusApp(id), { passive: true });
  }
  el.classList.remove("minimized");
  focusApp(id);
  def.render(document.getElementById(`body-${id}`), opts);
  paintTaskbar();
  emit("open", { id, opts });
}

export function closeApp(id) {
  const el = document.getElementById(`win-${id}`);
  if (el) el.remove();
  const i = openOrder.indexOf(id);
  if (i >= 0) openOrder.splice(i, 1);
  paintTaskbar();
  const last = openOrder[openOrder.length - 1];
  if (last) focusApp(last);
}

export function minimizeApp(id) {
  const el = document.getElementById(`win-${id}`);
  if (el) el.classList.add("minimized");
  const i = openOrder.indexOf(id);
  if (i >= 0) openOrder.splice(i, 1);
  paintTaskbar();
}

export function focusApp(id) {
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
      return `<button type="button" class="task-btn${active ? " active" : ""}" data-task="${id}">${escapeHtml(
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
      openApp(b.getAttribute("data-start-app"));
    });
  });
  menu.querySelector("[data-shutdown]").addEventListener("click", () => {
    hideStart();
    emit("shutdown-request");
  });
}

function imgBtn(name) {
  return `<img class="glyph" alt="" src="${icons[name]}" />`;
}
