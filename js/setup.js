/** Native HomeSoft 98 Setup — one window, one Add to Home Screen button. */

import { icons, img } from "./icons.js";
import { isStandalone } from "./engine.js";
import { play } from "./audio.js";

function platform() {
  const ua = navigator.userAgent || "";
  const iOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  return { iOS, android, desktop: !iOS && !android };
}

export function showSetupWizard({ root, onComplete, getPrompt, consumePrompt }) {
  if (isStandalone()) {
    onComplete();
    return;
  }

  const plat = platform();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  root.innerHTML = shellHtml(plat);

  window.addEventListener("appinstalled", () => {
    play("ding");
    finish();
  });

  const a2hs = root.querySelector("#setup-a2hs");
  const playHere = root.querySelector("#setup-play");

  a2hs.addEventListener("click", async () => {
    play("click");
    const prompt = getPrompt && getPrompt();
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      consumePrompt && consumePrompt();
      if (choice && choice.outcome === "accepted") {
        play("ding");
        finish();
        return;
      }
    }
    showHowTo(root, plat);
  });

  playHere.addEventListener("click", () => {
    play("click");
    finish();
  });
  root.querySelector("#setup-x")?.addEventListener("click", () => {
    play("click");
    finish();
  });
}

function shellHtml(plat) {
  const how = plat.iOS
    ? "On iPhone: tap Share, then Add to Home Screen."
    : plat.android
      ? "Tap the button. Confirm the system dialog."
      : "Tap the button, or use the browser menu: Install app.";
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
            <button type="button" aria-label="Close" id="setup-x"></button>
          </div>
        </div>
        <div class="wizard97-body setup-one">
          <div class="setup-hero">
            <img class="setup-appicon" src="./img/icon-192.png" alt="" width="72" height="72" />
            <h2>Put this computer on your Home Screen</h2>
            <p>HomeSoft 98 should open like a PC — full screen, no browser chrome around Sarah's desktop.</p>
          </div>
          <button type="button" class="default setup-a2hs" id="setup-a2hs">
            ${img("shortcut")}
            <span>Add to Home Screen</span>
          </button>
          <p class="setup-how" id="setup-how">${how}</p>
          <button type="button" id="setup-play">Play in this window</button>
        </div>
      </div>
      <footer class="setup-taskbar">
        <button type="button" class="setup-start" tabindex="-1"><span class="start-logo"></span> Start</button>
        <button type="button" class="task-btn active">HomeSoft 98 Setup</button>
        <div class="setup-tray"><span>✉</span> 9:41 AM</div>
      </footer>
    </div>`;
}

function showHowTo(root, plat) {
  const how = root.querySelector("#setup-how");
  if (!how) return;
  how.classList.add("setup-how-on");
  if (plat.iOS) {
    how.innerHTML = `Tap <b>Share</b> on the toolbar under this window, then <b>Add to Home Screen</b>. Then open the HomeSoft 98 icon.`;
  } else if (plat.android) {
    how.innerHTML = `If no dialog appeared: Chrome menu → <b>Add to Home screen</b> / <b>Install app</b>.`;
  } else {
    how.innerHTML = `Use the browser menu: <b>Install app</b> / <b>Add to Home screen</b>. Or play in this window.`;
  }
}
