/** 1998 ad popups + Dial-Up phone fights. Shown between moments, never on a timer. */

import { state, on, setFlag, hold, release, setAfterGag, onGap } from "./engine.js";
import { play } from "./audio.js";
import { img } from "./icons.js";

const seen = new Set();
const queue = [];
let busy = false;
let currentId = null;
let ringTimer = 0;
let bound = false;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function host() {
  return document.getElementById("popup-root");
}

function overlayBusy() {
  const o = document.getElementById("overlay-root");
  return !!(o && o.innerHTML.trim());
}

function dropQueue() {
  queue.length = 0;
}

function offer(id) {
  if (!id || seen.has(id) || queue.includes(id) || currentId === id) return;
  if (!state.started || state.shutdown || state.climax > 0) return;
  queue.push(id);
  requestPump();
}

function requestPump() {
  onGap(pump);
}

function pump() {
  if (busy || currentId || !queue.length) return;
  if (state.shutdown || state.climax > 0) {
    dropQueue();
    return;
  }
  if (overlayBusy()) {
    onGap(pump);
    return;
  }
  const id = queue.shift();
  if (seen.has(id) || !POPUPS[id]) {
    if (queue.length) requestPump();
    return;
  }
  busy = true;
  currentId = id;
  seen.add(id);
  setFlag("popup_" + id);
  hold("popup");
  POPUPS[id].show();
}

function dismiss() {
  const was = currentId;
  currentId = null;
  clearInterval(ringTimer);
  ringTimer = 0;
  const el = host();
  if (el) el.innerHTML = "";
  busy = false;
  play("close");
  setAfterGag(true);
  release("popup");
  if (was === "phoneRing" && state.climax === 0) offer("phoneExt");
  else if (queue.length) requestPump();
}

function shell(cls, title, body, footer) {
  const el = host();
  if (!el) return;
  el.innerHTML = `
    <div class="popup-scrim">
      <div class="window popup-win ${cls}">
        <div class="title-bar">
          <div class="title-bar-text">${title}</div>
          <div class="title-bar-controls">
            <button type="button" aria-label="Close" data-pop-x></button>
          </div>
        </div>
        <div class="window-body popup-body">${body}</div>
        ${footer ? `<div class="popup-foot">${footer}</div>` : ""}
      </div>
    </div>`;
  el.querySelector("[data-pop-x]")?.addEventListener("click", () => {
    play("click");
    dismiss();
  });
}

function adFooter(no = "No thanks", yes = "CLAIM NOW!!!") {
  return `
    <button type="button" data-pop-no>${esc(no)}</button>
    <button type="button" class="default" data-pop-yes>${esc(yes)}</button>`;
}

function bindAd() {
  const el = host();
  el.querySelector("[data-pop-no]")?.addEventListener("click", () => {
    play("click");
    dismiss();
  });
  el.querySelector("[data-pop-yes]")?.addEventListener("click", () => {
    play("modem");
    dismiss();
  });
}

const POPUPS = {
  clearinghouse: {
    show() {
      play("notify");
      shell(
        "ad ad-pch",
        "CONGRATULATIONS!!!!!!!",
        `
        <div class="pch-banner">YOU MAY HAVE ALREADY WON</div>
        <div class="pch-star">★</div>
        <p class="pch-vis">You are visitor <b>#1,000,000</b></p>
        <p>CedarNet Clearing House has selected <b>moonpixie98</b> to receive a <b>FREE Motorola Bravo Plus pager</b> in Millhaven teal.</p>
        <p class="ad-fine">Void in Ohio, Millhaven, bedrooms, and wherever a girl is using the phone line. Prize shipped in 6–8 business years. Not a pager. Not free. Not winning.</p>`,
        adFooter("I don't even want a pager", "CLAIM NOW!!!")
      );
      bindAd();
    },
  },
  ool: {
    show() {
      play("ding");
      shell(
        "ad ad-ool",
        "Ohio On-Line 4.0 Setup",
        `
        <div class="ool-hero">
          <span class="ool-run"></span>
          <div>
            <div class="ool-name">Ohio On-Line</div>
            <div class="ool-hours">1000 FREE HOURS</div>
          </div>
        </div>
        <p>Already have CedarNet? Great! We'll <b>disconnect it for you</b> and install 14 extra toolbars, a talking paperclip, and the dancing baby.</p>
        <p>Keyword: <b>SLUMBER</b> &nbsp; Estimated download: 36 hours on 56k.</p>
        <p class="ad-fine">By clicking Yes you agree you are not currently using this computer to find out what happened last night.</p>`,
        adFooter("Keep CedarNet", "Download (don't)")
      );
      bindAd();
    },
  },
  singles: {
    show() {
      play("notify");
      shell(
        "ad ad-419",
        "419 Connections — Millhaven / BG",
        `
        <div class="s419-head">HOT LOCAL SINGLES IN YOUR AREA CODE</div>
        <div class="s419-grid">
          <div class="s419-card"><i class="s419-pic chad"></i><b>Chad, 28</b><span>owns a Trans Am. thinks 15 is "mature for her age." REPORT.</span></div>
          <div class="s419-card"><i class="s419-pic brandy"></i><b>Brandy, 31</b><span>loves Dave Matthews AND her kid. not in that order.</span></div>
          <div class="s419-card"><i class="s419-pic kyle"></i><b>Kyle, 17</b><span>Derek's friend. why is he on here. close this.</span></div>
        </div>
        <p>Your screen name <b>moonpixie98</b> has been submitted. (It has not.)</p>`,
        adFooter("Absolutely not", "Chat now (no)")
      );
      bindAd();
    },
  },
  luna: {
    show() {
      play("question");
      shell(
        "ad ad-luna",
        "Miss Luna's Psychic Network",
        `
        <div class="luna-stars"></div>
        <p class="luna-hey">I SEE A BOARD. I SEE A CREEK. I SEE A <b>$3.99</b> FIRST MINUTE.</p>
        <p>Live spirits!! No Ouija required!! Miss Luna already knows what you did last summer <i>and</i> last night. (She does not. She's in a call center in Toledo.)</p>
        <p>Call <b>1-900-555-LUNA</b> — or click below and we'll dial it on your mom's bill.</p>
        <p class="ad-fine">For entertainment only. Not affiliated with Carrie Voss, Old Mill Creek, or any actual dead girl. If you are currently missing a friend, maybe hang up and look at the pictures instead.</p>`,
        adFooter("Hang up", "Connect me ($3.99)")
      );
      bindAd();
    },
  },
  phoneRing: {
    show() {
      play("ring");
      ringTimer = setInterval(() => play("ring"), 2100);
      shell(
        "phone-win",
        "Dial-Up Networking",
        `
        <div class="phone-hero">
          ${img("phone")}
          <div>
            <p class="phone-title">Incoming call on Line 1</p>
            <p>The kitchen phone is ringing. If anybody picks up, CedarNet drops and you are just a girl in a bedroom with no alibi and no 56k.</p>
            <p>Caller ID: <b>Unknown</b> — could be Mandy's mom. Could be Grandma. Could be a boy. Could be a salesman for vinyl siding.</p>
          </div>
        </div>
        <p class="phone-status"><span class="modem-lights"><i></i><i></i><i></i></span> CONNECTED — do not pick up</p>
        <div class="phone-choices">
          <button type="button" data-ph="yell">Shout "DEREK GET THE PHONE I'M ON THE INTERNET"</button>
          <button type="button" data-ph="lie">Lie: "I'm not online, I'm doing the Tell-Tale Heart essay!"</button>
          <button type="button" data-ph="sleep">Pretend you're still asleep at Jess's</button>
          <button type="button" data-ph="ring">Let it ring. That's a later-Sarah problem.</button>
        </div>`,
        ""
      );
      host().querySelector("[data-pop-x]")?.remove();
      bindPhone({
        yell: "Derek screams FINE from the kitchen. A distant pickup. Grandma wants to know if you still like horses. You do not get on the line. CedarNet holds.",
        lie: "You yell the lie down the hall. Nobody believes you. They hang up anyway. The Tell-Tale Heart remains unfinished. You remain online.",
        sleep: "Derek tells them \"she's dead to the world.\" Wording. They say they'll call back. You are very much not asleep. You are very much still on CedarNet.",
        ring: "Fourteen rings. It stops. You do not think about who it was. The modem sings its ugly little song. You're still here.",
      });
    },
  },
  phoneExt: {
    show() {
      play("modem");
      shell(
        "phone-win",
        "Dial-Up Networking — Line in use",
        `
        <div class="phone-hero">
          ${img("warning")}
          <div>
            <p class="phone-title">Another phone picked up</p>
            <p>You can hear Derek breathing on the kitchen extension. The modem is making the noise a dying robot makes. He does not care.</p>
            <p><b>"SARAH GET OFF I NEED TO CALL KYLE ABOUT THE GYM LEADER."</b></p>
          </div>
        </div>
        <p class="phone-status warn"><span class="modem-lights panic"><i></i><i></i><i></i></span> NOISE — if he stays you disconnect</p>
        <div class="phone-choices">
          <button type="button" data-ph="yell">Shout "I WILL END YOU" down the stairs</button>
          <button type="button" data-ph="lie">Lie that you're not even online, the line is just "broken"</button>
          <button type="button" data-ph="sleep">Pretend you hung up. Hold your breath. Stay connected.</button>
          <button type="button" data-ph="deal">Bargain: five minutes and then he can have it forever</button>
        </div>`,
        ""
      );
      host().querySelector("[data-pop-x]")?.remove();
      bindPhone({
        yell: "A door slam that shakes the lava-lamp poster. Kyle can wait. Pokémon can wait. CedarNet, against all physics, holds.",
        lie: "\"Then why is it screaming, Sarah.\" He hangs up anyway, mostly because you used the big-sister voice. Connected.",
        sleep: "You freeze like the computer is a sleeping bag. Derek says whatever and clicks the kitchen phone down. You exhale. Still on.",
        deal: "He says you always say five minutes. He hangs up anyway. You still have the line. You will not give it to him. You never do.",
      });
    },
  },
};

function bindPhone(results) {
  host().querySelectorAll("[data-ph]").forEach((btn) => {
    btn.addEventListener("click", () => {
      play("click");
      clearInterval(ringTimer);
      ringTimer = 0;
      const key = btn.getAttribute("data-ph");
      showPhoneResult(results[key] || "CedarNet holds. Somehow.");
    });
  });
}

function showPhoneResult(text) {
  play("ding");
  shell(
    "phone-win",
    "Dial-Up Networking",
    `
    <div class="phone-hero">
      ${img("info")}
      <div>
        <p class="phone-title">Connected</p>
        <p>${esc(text)}</p>
      </div>
    </div>
    <p class="phone-status"><span class="modem-lights"><i></i><i></i><i></i></span> 56k • CedarNet • Millhaven</p>`,
    `<button type="button" class="default" data-pop-ok>OK</button>`
  );
  host().querySelector("[data-pop-ok]")?.addEventListener("click", () => {
    play("click");
    dismiss();
  });
  host().querySelector("[data-pop-x]")?.addEventListener("click", () => {
    play("click");
    dismiss();
  });
}

function onFlag({ name }) {
  if (name.startsWith("saw_") && ["pizza", "movie", "bags", "mom", "basement", "window", "ouija", "leaving"].some((p) => name === "saw_" + p)) {
    offer("ool");
  }
  if (name === "read_news") offer("singles");
  if (name === "read_wiki" || name === "saw_ouija" || name === "talked_chloe") offer("luna");
  if (name.startsWith("talked_")) offer("phoneRing");
}

function onClue({ count }) {
  if (count >= 3) offer("phoneRing");
}

export function startPopups() {
  if (bound) return;
  bound = true;
  seen.clear();
  queue.length = 0;
  busy = false;
  currentId = null;
  on("flag", onFlag);
  on("clue", onClue);
  on("climax", () => {
    dropQueue();
    const win = host()?.querySelector(".popup-win");
    if (win && !win.classList.contains("phone-win")) dismiss();
  });
  offer("clearinghouse");
}
