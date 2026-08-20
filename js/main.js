import {
  state,
  on,
  isStandalone,
  playChord,
  setClimax,
  setFlag,
  flag,
} from "./engine.js";
import { bindShell, hideStart, paintClock } from "./wm.js";
import { registerApps, paintDesktop, injectNode, viewPhoto } from "./apps.js";
import { showSetupWizard } from "./setup.js";
import { asciiIntroHtml } from "./ascii.js";
import { BUDDIES } from "./story.js";

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

const overlay = () => document.getElementById("overlay-root");

function showOverlay(html) {
  overlay().innerHTML = html;
}

function clearOverlay() {
  overlay().innerHTML = "";
}

async function boot() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch {
      /* ignore */
    }
  }
  bindShell();
  registerApps();
  paintClock();
  on("shutdown-request", onShutdown);
  on("climax", onClimax);

  if (isStandalone() || sessionStorage.getItem("hs98-installed") === "1") {
    await runBootThenLogin();
  } else {
    showWizard();
  }
}

function showWizard() {
  showSetupWizard({
    root: overlay(),
    getPrompt: () => deferredPrompt,
    consumePrompt: () => {
      deferredPrompt = null;
    },
    onComplete: () => {
      sessionStorage.setItem("hs98-installed", "1");
      runBootThenLogin();
    },
  });
}

async function runBootThenLogin() {
  await showAsciiIntro();
  showOverlay(`
    <div class="scrim navy">
      <div class="boot-mark">
        <div class="clouds">HomeSoft</div>
        <div class="edition">98</div>
        <p>Starting Windows...</p>
        <progress class="boot-bar" max="100" value="8"></progress>
        <p style="font-size:12px;opacity:.7">CedarNet 56k • Millhaven, Ohio</p>
      </div>
    </div>`);
  playChord("start");
  const bar = overlay().querySelector("progress");
  for (let v = 8; v <= 100; v += 4) {
    await wait(70);
    bar.value = v;
  }
  showLogin();
}

function showAsciiIntro() {
  showOverlay(`
    <div class="scrim ascii-scrim" id="ascii-scrim">
      <div class="ascii-wrap">
        <pre class="ascii-intro">${asciiIntroHtml()}</pre>
      </div>
      <button type="button" class="ascii-hint blink" id="ascii-go">tap to log on_</button>
    </div>`);
  playChord("start");
  return new Promise((resolve) => {
    let done = false;
    const root = overlay();
    const go = () => {
      if (done) return;
      done = true;
      root.removeEventListener("click", go);
      window.removeEventListener("resize", fitAscii);
      resolve();
    };
    root.addEventListener("click", go);
    window.addEventListener("resize", fitAscii);
    setTimeout(go, 5200);
    requestAnimationFrame(fitAscii);
  });
}

function fitAscii() {
  const wrap = document.querySelector(".ascii-wrap");
  const pre = document.querySelector(".ascii-intro");
  if (!wrap || !pre) return;
  pre.style.transform = "none";
  pre.style.marginLeft = "0";
  const scale = Math.min(1, (wrap.clientWidth - 8) / Math.max(1, pre.scrollWidth));
  pre.style.transformOrigin = "top left";
  pre.style.transform = `scale(${scale})`;
  pre.style.marginLeft = `${Math.max(0, (wrap.clientWidth - pre.scrollWidth * scale) / 2)}px`;
  wrap.style.height = `${Math.ceil(pre.scrollHeight * scale)}px`;
}

function showLogin() {
  showOverlay(`
    <div class="scrim">
      <div class="window login-card">
        <div class="title-bar"><div class="title-bar-text">Enter Network Password</div></div>
        <div class="window-body">
          <p>Welcome to HomeSoft 98. Sign in as the person who slept here.</p>
          <div class="field-row-stacked">
            <label for="user">User name</label>
            <input id="user" value="Sarah Quinn" />
          </div>
          <div class="field-row-stacked">
            <label for="pw">Password</label>
            <input id="pw" type="password" placeholder="hint: the rental" />
          </div>
          <p style="font-size:12px">Logged on to: QUINN-PC &nbsp; Date: Sun 10/18/98</p>
          <div class="wizard-actions">
            <button type="button" class="default" id="ok">OK</button>
            <button type="button" id="cancel">Cancel</button>
          </div>
        </div>
      </div>
    </div>`);
  overlay().querySelector("#ok").addEventListener("click", enterDesktop);
  overlay().querySelector("#cancel").addEventListener("click", enterDesktop);
  overlay().querySelector("#pw").addEventListener("keydown", (e) => {
    if (e.key === "Enter") enterDesktop();
  });
}

function enterDesktop() {
  state.started = true;
  clearOverlay();
  document.getElementById("desktop").hidden = false;
  paintDesktop();
  markUnreadStart();
}

function markUnreadStart() {
  ["jess", "lauren"].forEach((id) => {
    state.unread[id] = (state.unread[id] || 0) + 1;
  });
  paintDesktop();
}

function onShutdown() {
  hideStart();
  if (state.shutdown) return;
  if (flag("caught") || state.climax >= 5) {
    doShutdown();
    return;
  }
  showOverlay(`
    <div class="scrim" style="background:transparent">
      <div class="window dialog-center">
        <div class="title-bar"><div class="title-bar-text">Shut Down HomeSoft</div></div>
        <div class="window-body">
          <p>You have unfinished pictures. BuddyBee is still blinking. Lauren has not sent the last frame.</p>
          <p>Are you sure you want to shut down?</p>
          <div class="wizard-actions">
            <button type="button" id="no">No</button>
            <button type="button" id="yes">Shut Down</button>
          </div>
        </div>
      </div>
    </div>`);
  overlay().querySelector("#no").addEventListener("click", clearOverlay);
  overlay().querySelector("#yes").addEventListener("click", () => {
    clearOverlay();
    showOverlay(`
      <div class="scrim" style="background:transparent">
        <div class="window dialog-center">
          <div class="title-bar"><div class="title-bar-text">HomeSoft</div></div>
          <div class="window-body">
            <p>Sarah doesn't. Not yet.</p>
            <div class="wizard-actions"><button type="button" class="default" id="ok">OK</button></div>
          </div>
        </div>
      </div>`);
    overlay().querySelector("#ok").addEventListener("click", clearOverlay);
  });
}

function onClimax({ stage }) {
  if (stage !== 1) return;
  runClimaxReel();
}

async function runClimaxReel() {
  await wait(5000);
  injectNode("jess", "police");
  await wait(12000);
  setFlag("body_found");
  setClimax(2);
  injectNode("jess", "found");
  state.browserUrl = "found";
  await wait(11000);
  setClimax(3);
  injectNode("lauren", "proof");
  viewPhoto("proof", { force: true });
  await wait(7000);
  injectNode("britt", "proof");
  await wait(9000);
  setClimax(4);
  BUDDIES.mandy.online = true;
  setFlag("mandy_signed_on");
  injectNode("mandy", "ghost");
  await wait(7000);
  setClimax(5);
  showCaughtDialog();
}

function showCaughtDialog() {
  showOverlay(`
    <div class="scrim" style="background:rgba(0,0,0,.35)">
      <div class="window dialog-center caught">
        <div class="title-bar"><div class="title-bar-text">IMG_009.JPG</div>
          <div class="title-bar-controls"><button aria-label="Close" disabled></button></div>
        </div>
        <div class="window-body">
          <p><b>You know this is you.</b></p>
          <p>Lauren DeSantis has a print in her backpack. Walgreens still has the negative. Brittany heard the fight. The creek has Mandy.</p>
          <p>It is time to turn the computer off.</p>
          <div class="wizard-actions">
            <button type="button" class="default" id="off">Shut Down...</button>
          </div>
        </div>
      </div>
    </div>`);
  overlay().querySelector("#off").addEventListener("click", doShutdown);
}

function doShutdown() {
  state.shutdown = true;
  playChord("end");
  document.getElementById("desktop").hidden = true;
  showOverlay(`
    <div class="scrim black">
      <div class="safe-off">It's now safe to turn off<br>your computer.</div>
    </div>`);
  setTimeout(showGameOver, 2800);
}

function showGameOver() {
  showOverlay(`
    <div class="scrim black">
      <div class="game-over">
        <h1>SLUMBER PARTY 98</h1>
        <p>You saw her finger on the planchette. She saw yours. You took her off Maple, away from the porch lights, onto the mill path, because she was going to tell.</p>
        <p>Lauren took eight pictures of a slumber party. The ninth was you coming home at 5:14 a.m. You looked at the flash. You did not wave. You knew.</p>
        <img src="./img/photo-proof.jpg" alt="proof" style="width:70%;max-width:280px;margin:8px auto;display:block;border:2px solid #333;">
        <p><i>she was cheating. so were you.</i></p>
        <button type="button" id="again">Restart</button>
      </div>
    </div>`);
  overlay().querySelector("#again").addEventListener("click", () => location.reload());
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

boot();
