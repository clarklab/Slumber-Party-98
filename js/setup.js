/** Native HomeSoft 98 Setup — Create Shortcut to the Home Screen. */

import { icons, img } from "./icons.js";
import { isStandalone } from "./engine.js";

function platform() {
  const ua = navigator.userAgent || "";
  const iOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  return { iOS, android, desktop: !iOS && !android };
}

export function showSetupWizard({ root, onComplete, getPrompt, consumePrompt }) {
  const plat = platform();
  const st = {
    step: 0,
    shortcutOk: false,
    copying: false,
  };

  root.innerHTML = shellHtml();
  const stepEl = root.querySelector("#setup-step");
  const back = root.querySelector("#setup-back");
  const next = root.querySelector("#setup-next");
  const cancel = root.querySelector("#setup-cancel");

  window.addEventListener("appinstalled", () => {
    st.shortcutOk = true;
    paint();
  });

  function paint() {
    stepEl.innerHTML = STEPS[st.step].html(st, plat);
    bindStep(stepEl, st, plat, { getPrompt, consumePrompt, paint, goNext });
    back.disabled = st.step === 0 || st.copying;
    const last = st.step === STEPS.length - 1;
    next.textContent = last ? "Finish" : "Next >";
    next.classList.toggle("default", true);
    next.disabled = st.copying || STEPS[st.step].id === "copy";
    root.querySelector("#setup-task").textContent = STEPS[st.step].task;
    root.querySelector(".setup-scrim").classList.toggle("ios-share", plat.iOS && STEPS[st.step].id === "shortcut");
    if (STEPS[st.step].id === "copy" && !st.copying) {
      runCopy(st, () => {
        st.step += 1;
        paint();
      });
    }
  }

  function goNext() {
    const gate = STEPS[st.step].canNext;
    if (gate && !gate(st, plat)) {
      showMsg(root, {
        title: "HomeSoft 98 Setup",
        icon: "warning",
        text: "Setup cannot start this computer inside a browser window. Create a Home Screen shortcut, then open HomeSoft 98 from there.",
      });
      return;
    }
    if (st.step === STEPS.length - 1) {
      sessionStorage.setItem("hs98-installed", "1");
      onComplete();
      return;
    }
    st.step += 1;
    paint();
  }

  back.addEventListener("click", () => {
    if (st.step > 0) {
      st.step -= 1;
      paint();
    }
  });
  next.addEventListener("click", goNext);
  cancel.addEventListener("click", () => cannotQuit(root));
  root.querySelector("#setup-x").addEventListener("click", () => cannotQuit(root));
  root.querySelector("#setup-skip")?.addEventListener("click", () => {});
  root.addEventListener("click", (e) => {
    if (e.target.closest("#setup-skip")) {
      st.shortcutOk = true;
      sessionStorage.setItem("hs98-installed", "1");
      goNext();
    }
  });

  paint();
  if (isStandalone()) {
    st.shortcutOk = true;
    st.step = STEPS.length - 1;
    paint();
  }
}

function shellHtml() {
  return `
    <div class="scrim setup-scrim">
      <div class="setup-icons">
        <button type="button" class="desk-icon" tabindex="-1">${img("computer")}<span class="label">My Computer</span></button>
        <button type="button" class="desk-icon selected" tabindex="-1">${img("setup")}<span class="label">Setup.exe</span></button>
        <button type="button" class="desk-icon" tabindex="-1">${img("recycle")}<span class="label">Recycle Bin</span></button>
      </div>
      <div class="window wizard97" id="setup-win">
        <div class="title-bar">
          <div class="title-bar-text" style="background-image:url('${icons.setup}')">HomeSoft 98 Setup</div>
          <div class="title-bar-controls">
            <button aria-label="Minimize" disabled></button>
            <button aria-label="Close" id="setup-x"></button>
          </div>
        </div>
        <div class="wizard97-body">
          <div class="wizard97-side" aria-hidden="true">
            <div class="wiz-billboard">
              <span class="wiz-clouds">HomeSoft</span>
              <span class="wiz-98">98</span>
              ${img("computer")}
              <span class="wiz-cd"></span>
            </div>
          </div>
          <div class="wizard97-main">
            <div id="setup-step"></div>
          </div>
        </div>
        <div class="wizard97-footer">
          <button type="button" id="setup-back" disabled>&lt; Back</button>
          <button type="button" class="default" id="setup-next">Next &gt;</button>
          <button type="button" id="setup-cancel">Cancel</button>
        </div>
      </div>
      <footer class="setup-taskbar">
        <button type="button" class="setup-start" tabindex="-1"><span class="start-logo"></span> Start</button>
        <button type="button" class="task-btn active" id="setup-task">HomeSoft 98 Setup</button>
        <div class="setup-tray"><span>✉</span> 9:41 AM</div>
      </footer>
    </div>`;
}

const STEPS = [
  {
    id: "welcome",
    task: "HomeSoft 98 Setup",
    html() {
      return `
        <h2>Welcome to HomeSoft 98 Setup</h2>
        <p>This wizard will install a <b>shortcut to this computer</b> on your Home Screen so HomeSoft 98 can start in full screen, like a real PC.</p>
        <p>A browser window leaves furniture around the desktop. Sarah's computer should not have furniture.</p>
        <fieldset>
          <legend>What will be installed</legend>
          <div class="field-row">${img("shortcut")} Shortcut: <b>HomeSoft 98</b></div>
          <div class="field-row">${img("computer")} Target: QUINN-PC (this machine)</div>
          <div class="field-row">${img("folder")} Location: Home Screen</div>
        </fieldset>
        <p>Click Next to continue.</p>`;
    },
  },
  {
    id: "dest",
    task: "Choose Destination",
    html() {
      return `
        <h2>Choose Destination Location</h2>
        <p>Setup will create the shortcut in the following folder.</p>
        <div class="field-row-stacked">
          <label>Destination folder</label>
          <input value="Home Screen\\HomeSoft 98" readonly />
        </div>
        <ul class="tree-view">
          <li>
            <details open>
              <summary>Home Screen</summary>
              <ul>
                <li>Phone</li>
                <li>Photos</li>
                <li><strong>HomeSoft 98</strong> (new)</li>
                <li>Notes</li>
              </ul>
            </details>
          </li>
        </ul>
        <div class="sunken-panel homescreen-preview" title="Your Home Screen">
          ${previewIcons()}
        </div>
        <p class="hint">This is your Home Screen. The highlighted icon is the computer.</p>`;
    },
  },
  {
    id: "shortcut",
    task: "Create Shortcut",
    html(st, plat) {
      if (plat.iOS) return iosHtml(st);
      if (plat.android) return androidHtml(st);
      return desktopHtml(st);
    },
    canNext(st) {
      return st.shortcutOk || isStandalone();
    },
  },
  {
    id: "copy",
    task: "Copying Files...",
    html() {
      return `
        <h2>Copying files...</h2>
        <p>Please wait while Setup copies HomeSoft 98 to this computer and writes the shortcut.</p>
        <p class="copy-file" id="copy-file">Preparing...</p>
        <div class="progress-indicator segmented" id="copy-bar-wrap">
          <span class="progress-indicator-bar" id="copy-bar" style="width:4%"></span>
        </div>
        <div class="status-bar">
          <p class="status-bar-field" id="copy-status">Writing CAB files</p>
          <p class="status-bar-field">C:\\HOMESOFT\\</p>
        </div>`;
    },
  },
  {
    id: "done",
    task: "Setup Complete",
    html() {
      return `
        <h2>Setup is complete</h2>
        <p>HomeSoft 98 is installed. A shortcut named <b>HomeSoft 98</b> is on your Home Screen.</p>
        <div class="sunken-panel homescreen-preview">
          ${previewIcons(true)}
        </div>
        <fieldset>
          <legend>Start options</legend>
          <div class="field-row">
            <input type="radio" id="r1" name="boot" checked />
            <label for="r1">Restart the computer now (recommended)</label>
          </div>
          <div class="field-row">
            <input type="radio" id="r2" name="boot" />
            <label for="r2">I will restart later (do not choose this)</label>
          </div>
        </fieldset>
        <p>If you added the shortcut, close this browser and tap <b>HomeSoft 98</b> on the Home Screen. Otherwise click Finish to start in this window.</p>`;
    },
  },
];

function previewIcons(lit = false) {
  const cells = [
    ["computer", "Phone"],
    ["photo", "Photos"],
    ["setup", "HomeSoft 98", true],
    ["notepad", "Notes"],
    ["messenger", "BuddyBee"],
    ["recycle", "Trash"],
  ];
  return cells
    .map(([ic, lab, ours]) => {
      const glyph = ours
        ? `<img class="glyph" alt="" src="./img/icon-192.png" />`
        : img(ic);
      return `<span class="hs-ico${ours ? " ours" : ""}${ours && lit ? " lit" : ""}">${glyph}<i>${lab}</i></span>`;
    })
    .join("");
}

function iosHtml() {
  return `
    <h2>Create Shortcut</h2>
    <p>This computer has to live on the Home Screen. Safari will not do it by itself — you have to tell it, using the bar <b>under this window</b>.</p>
    <ol class="wiz-steps">
      <li>Tap <b>Share</b> on the phone toolbar just below Setup.</li>
      <li>Choose <b>Add to Home Screen</b>.</li>
      <li>Tap <b>Add</b>. The icon is a teal monitor with a moon.</li>
    </ol>
    <div class="window menu98">
      <div class="title-bar"><div class="title-bar-text">Share</div></div>
      <div class="window-body">
        <button type="button" class="menu98-item" tabindex="-1">Add Bookmark</button>
        <button type="button" class="menu98-item on" tabindex="-1">${img("shortcut")} Add to Home Screen</button>
        <button type="button" class="menu98-item" tabindex="-1">Print</button>
      </div>
    </div>
    <div class="field-row">
      <input type="checkbox" id="shortcut-ok" />
      <label for="shortcut-ok">I created the HomeSoft 98 shortcut</label>
    </div>
    <div class="pocket-toolbar">
      <span>Tap Share on the real bar under here ↓</span>
      <div class="pocket-btns">
        <button type="button" tabindex="-1">◀</button>
        <button type="button" tabindex="-1">▶</button>
        <button type="button" class="default" tabindex="-1">Share</button>
        <button type="button" tabindex="-1">+</button>
      </div>
    </div>`;
}

function androidHtml() {
  return `
    <h2>Create Shortcut</h2>
    <p>Setup can place the shortcut itself. Tap <b>Create Shortcut</b>, then confirm the system dialog.</p>
    <div class="sunken-panel homescreen-preview">${previewIcons()}</div>
    <div class="field-row" style="margin-top:10px">
      <button type="button" class="default" id="do-install">${img("shortcut")} Create Shortcut</button>
    </div>
    <div class="field-row">
      <input type="checkbox" id="shortcut-ok" />
      <label for="shortcut-ok">The shortcut is on my Home Screen</label>
    </div>
    <p class="hint">If no dialog appears: Chrome menu → <b>Install app</b> / <b>Add to Home screen</b>.</p>`;
}

function desktopHtml() {
  return `
    <h2>Create Shortcut</h2>
    <p>On a phone, Setup puts this computer on the Home Screen. On this PC you can install it as an application, or continue in the window (not recommended).</p>
    <div class="field-row">
      <button type="button" class="default" id="do-install">${img("shortcut")} Create Shortcut</button>
    </div>
    <div class="field-row">
      <input type="checkbox" id="shortcut-ok" />
      <label for="shortcut-ok">Shortcut created / I am on a computer</label>
    </div>
    <p class="hint"><button type="button" id="setup-skip">Continue in this window (not recommended)</button></p>`;
}

function bindStep(el, st, plat, ctx) {
  const box = el.querySelector("#shortcut-ok");
  if (box) {
    box.checked = st.shortcutOk;
    box.addEventListener("change", () => {
      st.shortcutOk = box.checked;
    });
  }
  const inst = el.querySelector("#do-install");
  if (inst) {
    inst.addEventListener("click", async () => {
      const prompt = ctx.getPrompt && ctx.getPrompt();
      if (prompt) {
        prompt.prompt();
        const choice = await prompt.userChoice;
        ctx.consumePrompt && ctx.consumePrompt();
        if (choice && choice.outcome === "accepted") {
          st.shortcutOk = true;
          ctx.paint();
        } else {
          showMsg(el.closest("#overlay-root") || document.getElementById("overlay-root"), {
            title: "Create Shortcut",
            icon: "warning",
            text: "The shortcut was not created. Try again, or use the browser menu: Install app.",
          });
        }
      } else if (plat.iOS) {
        showMsg(document.getElementById("overlay-root"), {
          title: "Create Shortcut",
          icon: "info",
          text: "On this phone, use Share → Add to Home Screen on the toolbar under Setup, then check the box.",
        });
      } else {
        showMsg(document.getElementById("overlay-root"), {
          title: "Create Shortcut",
          icon: "info",
          text: "Use the browser menu and choose Install app or Add to Home screen, then check the box.",
        });
      }
    });
  }
}

function runCopy(st, done) {
  st.copying = true;
  document.body.style.cursor = "progress";
  const nextBtn = document.getElementById("setup-next");
  const backBtn = document.getElementById("setup-back");
  if (nextBtn) nextBtn.disabled = true;
  if (backBtn) backBtn.disabled = true;
  const files = [
    "SETUP.INS",
    "HOMESOFT.CAB",
    "BUDDYBEE.EXE",
    "NETBUDDY.EXE",
    "TROPICAN.DAT",
    "SCRATCH.PAD",
    "QUINN.PWL",
    "SHORTCUT.LNK",
  ];
  let i = 0;
  const tick = () => {
    if (i >= files.length) {
      st.copying = false;
      st.shortcutOk = true;
      document.body.style.cursor = "";
      done();
      return;
    }
    const fileEl = document.getElementById("copy-file");
    const bar = document.getElementById("copy-bar");
    const status = document.getElementById("copy-status");
    if (fileEl) fileEl.textContent = `Copying file: ${files[i]}`;
    if (status) status.textContent = `${i + 1} of ${files.length}`;
    if (bar) bar.style.width = `${Math.round(((i + 1) / files.length) * 100)}%`;
    i += 1;
    setTimeout(tick, 280);
  };
  tick();
}

function cannotQuit(root) {
  showMsg(root, {
    title: "Exit Setup",
    icon: "warning",
    text: "You cannot quit Setup. This computer has to start. Click OK, then Next.",
  });
}

function showMsg(root, { title, icon, text }) {
  let host = root.querySelector("#setup-msg");
  if (!host) {
    host = document.createElement("div");
    host.id = "setup-msg";
    root.appendChild(host);
  }
  host.innerHTML = `
    <div class="msg-scrim">
      <div class="window dialog-center">
        <div class="title-bar"><div class="title-bar-text">${title}</div></div>
        <div class="window-body msg-body">
          ${img(icon === "warning" ? "warning" : "info")}
          <p>${text}</p>
        </div>
        <div class="wizard-actions" style="margin:0 12px 12px">
          <button type="button" class="default" id="msg-ok">OK</button>
        </div>
      </div>
    </div>`;
  host.querySelector("#msg-ok").addEventListener("click", () => {
    host.innerHTML = "";
  });
}
