import {
  state,
  flag,
  setFlag,
  addClue,
  pinNote,
  setNotes,
  tick,
  clockStr,
  playBeep,
  on,
  emit,
  ensureChat,
  clearUnread,
  markUnread,
  clueCount,
  hold,
  release,
  signalAck,
  onIdle,
  isHeld,
} from "./engine.js";
import { openApp, setTitle, escapeHtml, refreshApp, isOpen, registerApp, getApp, flashTask, waitUntilDismissed } from "./wm.js";
import { img } from "./icons.js";
import { PHOTOS, PARTY_ROLL, BUDDIES, FILES, TEXTS, WIKI, wikiBody, parseRich, escapeText } from "./story.js";
import { CHATS } from "./chats.js";
import { isDesktopShell } from "./engine.js";
import { play } from "./audio.js";

export function openLink(ref) {
  const [kind, id] = String(ref).split(":");
  if (kind === "photo") return viewPhoto(id);
  if (kind === "news") {
    state.browserUrl = id === "missing" ? "missing" : id;
    setFlag("read_news");
    addClue("read_news", "You opened the Millhaven news.");
    return openApp("browser");
  }
  if (kind === "wiki") {
    state.wikiId = id;
    setFlag("read_wiki");
    addClue("read_wiki", `Tropicana: ${WIKI[id]?.title || id}`);
    return openApp("tropicana");
  }
  if (kind === "file") {
    const map = {
      letters: "C:\\Network Neighborhood\\JESS-PC\\ouija_letters.txt",
      lastnight: "C:\\My Documents\\lastnight.txt",
      index: "C:\\My Pictures\\PartyRoll\\INDEX.TXT",
    };
    const path = map[id] || id;
    return openFile(path);
  }
  if (kind === "buddy" || kind === "chat") {
    state.currentBuddy = id;
    return openApp("messenger", { buddy: id });
  }
}

export function viewPhoto(id, extra = {}) {
  const p = PHOTOS[id];
  if (!p) return;
  if (p.proof && !flag("saw_proof") && !extra.force && state.climax < 3) {
    openApp("photo", { id: "leaving" });
    return;
  }
  if (state.currentPhoto !== id) play("shutter");
  state.currentPhoto = id;
  setFlag("saw_" + id);
  if (p.roll || id === "creek" || id === "mandy") {
    addClue("photo_" + id, p.scribble || p.title);
  }
  if (p.proof) {
    setFlag("saw_proof");
    setFlag("caught");
    addClue("caught", "IMG_009 is you at 5:14 AM. Lauren has a print. You are caught.");
  }
  tick(1);
  openApp("photo", { id, ...extra });
}

export function openFile(path) {
  const f = FILES[path];
  if (!f) return;
  setFlag("read_file");
  addClue("read_file", `Opened ${f.name}`);
  if (f.type === "photo") return viewPhoto(f.photo);
  if (f.type === "text") {
    state.notepadDoc = f.opened;
    setFlag("used_notepad");
    return openApp("notepad", { doc: f.opened });
  }
  if (f.type === "folder") {
    state.explorerPath = path;
    return openApp("explorer");
  }
}

function bindLinks(root) {
  root.querySelectorAll("[data-link]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openLink(a.getAttribute("data-link"));
    });
  });
}

function pinBtn(line) {
  return `<div class="pin-row"><button type="button" data-pin="${escapeHtml(line)}">Send to ScratchPad</button></div>`;
}

export function paintDesktop() {
  const grid = document.getElementById("icon-grid");
  const unread = Object.values(state.unread).reduce((a, b) => a + b, 0);
  const items = [
    { app: "computer", icon: "computer", label: "My Computer" },
    { app: "messenger", icon: "messenger", label: "BuddyBee" + (unread ? ` (${unread})` : ""), pulse: unread },
    { app: "browser", icon: "browser", label: "NetBuddy" },
    { app: "tropicana", icon: "tropicana", label: "Tropicana" },
    { app: "notepad", icon: "notepad", label: "ScratchPad" },
    { app: "explorer", icon: "folder", label: "Party Roll" },
    { app: "recycle", icon: "recycle", label: "Recycle Bin" },
    { app: "help", icon: "help", label: "Help" },
  ];
  grid.innerHTML = items
    .map(
      (it) =>
        `<button type="button" class="desk-icon${it.pulse ? " unread-pulse" : ""}" data-open="${it.app}">
          ${img(it.icon)}<span class="label">${escapeHtml(it.label)}</span>
        </button>`
    )
    .join("");
}

export function registerApps() {
  document.getElementById("icon-grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    const id = b.getAttribute("data-open");
    if (id === "recycle") {
      state.explorerPath = "C:\\Recycle Bin";
      play("recycle");
      openApp("explorer");
    } else if (id === "computer") {
      state.explorerPath = "C:\\";
      openApp("explorer");
    } else if (id === "explorer") {
      state.explorerPath = "C:\\My Pictures\\PartyRoll";
      openApp("explorer");
    } else openApp(id);
  });

  registerMessenger();
  registerBrowser();
  registerTropicana();
  registerExplorer();
  registerNotepad();
  registerPhoto();
  registerDos();
  registerHelp();
  registerApp({
    id: "computer",
    title: "My Computer",
    icon: "computer",
    render(body, opts) {
      state.explorerPath = "C:\\";
      getApp("explorer").render(body, opts);
      setTitle("computer", "My Computer");
    },
  });

  document.body.addEventListener("click", (e) => {
    const pin = e.target.closest("[data-pin]");
    if (pin) {
      pinNote(pin.getAttribute("data-pin"));
      setFlag("used_notepad");
      addClue("used_notepad", "You wrote it down so you couldn't rearrange it later.");
      openApp("notepad");
    }
  });
}

function registerMessenger() {
  registerApp({
    id: "messenger",
    title: "BuddyBee Instant Messenger",
    icon: "messenger",
    render(body, opts) {
      if (opts.buddy) state.currentBuddy = opts.buddy;
      if (isDesktopShell()) renderMessengerDesktop(body);
      else if (state.currentBuddy) renderChat(body, state.currentBuddy);
      else renderBuddyList(body);
    },
  });
}

function buddyButtonsHtml() {
  const order = ["jess", "lauren", "chloe", "britt", "tyler", "mandy"];
  return order
    .map((id) => {
      const b = BUDDIES[id];
      const locked = b.locked && !flag("tyler_unlocked") && !flag("asked_tyler_jess") && !flag("read_file");
      const unread = state.unread[id] || 0;
      const on = id === "mandy" ? flag("mandy_signed_on") && state.climax < 6 : b.online || (id === "tyler" && !locked);
      return `<button type="button" class="buddy" data-buddy="${id}" ${locked ? "disabled" : ""}>
              <span class="dot ${on ? "on" : "off"}"></span>
              <span class="meta">
                <span class="sn" style="color:${b.color}">${escapeHtml(b.sn)}</span>
                <span class="away">${locked ? "(offline — find a screen name)" : escapeHtml(b.away)}</span>
              </span>
              ${unread ? `<span class="badge">${unread}</span>` : ""}
            </button>`;
    })
    .join("");
}

function renderMessengerDesktop(body) {
  setTitle("messenger", "BuddyBee — moonpixie98");
  body.innerHTML = `
    <div class="im-split">
      <div class="im-side" id="im-side">
        <p style="margin:4px 8px;font-size:12px;">moonpixie98 • 56k</p>
        <div class="buddy-list">${buddyButtonsHtml()}</div>
      </div>
      <div class="im-main" id="im-main"></div>
    </div>`;
  body.querySelectorAll("[data-buddy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openBuddyChat(body.querySelector("#im-main"), btn.getAttribute("data-buddy"));
    });
  });
  const main = body.querySelector("#im-main");
  if (state.currentBuddy) renderChat(main, state.currentBuddy);
  else main.innerHTML = `<div class="im-empty">Select a buddy to send an Instant Message.<br>Windows can overlap — drag the title bar.</div>`;
}

function renderBuddyList(body) {
  setTitle("messenger", "BuddyBee — moonpixie98");
  body.innerHTML = `
    <div class="im-layout">
      <div class="app-scroll buddy-list">
        <p style="margin:4px 8px;font-size:12px;">Sign-on name: <b>moonpixie98</b> &nbsp; 56k • Connected</p>
        ${buddyButtonsHtml()}
      </div>
      <div class="status-bar"><p class="status-bar-field">${clueCount()} note(s) in ScratchPad memory</p></div>
    </div>`;
  body.querySelectorAll("[data-buddy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openBuddyChat(body, btn.getAttribute("data-buddy"));
    });
  });
}

function renderChat(body, buddyId) {
  const b = BUDDIES[buddyId];
  if (!b) return renderBuddyList(body);
  if (buddyId === "tyler") setFlag("tyler_unlocked");
  consumeBalloon(buddyId);
  clearUnread(buddyId);
  paintDesktop();
  setTitle("messenger", `BuddyBee — ${b.sn}`);
  const chat = ensureChat(buddyId);
  body.innerHTML = `
    <div class="im-layout">
      <div class="app-menu">
        <button type="button" data-back-buddies>Buddy List</button>
        <button type="button" data-link="photo:pizza">Roll</button>
      </div>
      <div class="app-scroll chat-log" id="chat-log"></div>
      <div id="chat-typing" class="typing" hidden></div>
      <div class="choices" id="chat-choices"></div>
      <div class="status-bar"><p class="status-bar-field">${escapeHtml(b.profile)}</p></div>
    </div>`;
  body.querySelector("[data-back-buddies]").addEventListener("click", () => goBuddyList(body));
  bindLinks(body);
  const logEl = body.querySelector("#chat-log");
  chat.log.forEach((m) => appendMsg(logEl, m));
  logEl.scrollTop = logEl.scrollHeight;
  if (chat.pendingNode) {
    const n = chat.pendingNode;
    chat.pendingNode = null;
    playNode(body, buddyId, n);
  } else if (!chat.seenStart) {
    chat.seenStart = true;
    playNode(body, buddyId, "start");
  } else {
    showChoices(body, buddyId, chat.node);
  }
}

let streamGen = 0;

async function playNode(body, buddyId, nodeId) {
  const tree = CHATS[buddyId];
  const node = tree && tree[nodeId];
  const chat = ensureChat(buddyId);
  if (!node) return;
  const gen = ++streamGen;
  hold("stream");
  release("choices");
  chat.node = nodeId;
  (node.flags || []).forEach((f) => setFlag(f));
  (node.clues || []).forEach((c) => addClue(c.id, c.note));
  const logEl = body.querySelector("#chat-log");
  const typeEl = body.querySelector("#chat-typing");
  const choiceEl = body.querySelector("#chat-choices");
  if (!logEl) {
    if (gen === streamGen) release("stream");
    return;
  }
  if (choiceEl) choiceEl.innerHTML = "";
  const live = () => gen === streamGen && state.currentBuddy === buddyId && document.body.contains(logEl);
  try {
    for (const m of node.messages) {
      if (live() && typeEl && m.from !== "sys") {
        typeEl.hidden = false;
        typeEl.textContent = `${BUDDIES[m.from]?.sn || m.from} is typing...`;
      }
      if (live()) await sleep(m.from === "sys" ? 200 : 650);
      if (typeEl && live()) typeEl.hidden = true;
      chat.log.push(m);
      if (!live()) continue;
      appendMsg(logEl, m);
      logEl.scrollTop = logEl.scrollHeight;
      if (m.from === "sys") {
        const t = String(m.text).toLowerCase();
        if (t.includes("signed on")) play("signon");
        else if (t.includes("signed off")) play("signoff");
      } else if (m.from !== "sarah") playBeep();
      if (m.photo === "proof" && live()) {
        viewPhoto("proof", { force: true });
        await waitUntilDismissed("photo");
      }
    }
    if (live()) showChoices(body, buddyId, nodeId);
  } finally {
    if (gen === streamGen) release("stream");
  }
}

function showChoices(body, buddyId, nodeId) {
  const node = CHATS[buddyId]?.[nodeId];
  const choiceEl = body.querySelector("#chat-choices");
  if (!choiceEl || !node) return;
  hold("choices");
  const choices = node.choices || [];
  if (!choices.length) {
    const label = node.exit || "Back to Buddy List";
    choiceEl.innerHTML = `<button type="button" class="default" data-exit>${escapeHtml(label)}</button>`;
    choiceEl.querySelector("[data-exit]")?.addEventListener("click", () => {
      play("send");
      signalAck(buddyId);
      goBuddyList(body);
    });
    return;
  }
  choiceEl.innerHTML = choices
    .map((c, i) => `<button type="button" data-choice="${i}">${escapeHtml(c.text)}</button>`)
    .join("");
  choiceEl.querySelectorAll("[data-choice]").forEach((btn) => {
    btn.addEventListener("click", () => pickChoice(body, buddyId, nodeId, choices, Number(btn.getAttribute("data-choice"))));
  });
}

async function pickChoice(body, buddyId, nodeId, choices, index) {
  const c = choices[index];
  if (!c) return;
  play("send");
  signalAck(buddyId);
  release("choices");
  (c.flags || []).forEach((f) => setFlag(f));
  if (c.notes) pinNote(c.notes);
  const chat = ensureChat(buddyId);
  const you = { from: "sarah", text: c.text };
  chat.log.push(you);
  const logEl = body.querySelector("#chat-log");
  appendMsg(logEl, you);
  if (c.exit) {
    goBuddyList(body);
    return;
  }
  if (c.open?.photo) {
    viewPhoto(c.open.photo);
    await waitUntilDismissed("photo");
    if (state.currentBuddy !== buddyId || !document.body.contains(body)) return;
  }
  if (c.open?.buddy) {
    if (c.next) chat.pendingNode = c.next;
    state.currentBuddy = c.open.buddy;
    openApp("messenger", { buddy: c.open.buddy });
    return;
  }
  if (c.next) playNode(body, buddyId, c.next);
}

function appendMsg(logEl, m) {
  if (!logEl) return;
  if (m.from === "sys") {
    const p = document.createElement("div");
    p.className = "sys";
    p.innerHTML = parseRich(escapeText(m.text));
    bindLinks(p);
    logEl.appendChild(p);
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "msg";
  const sn = m.from === "sarah" ? "moonpixie98" : BUDDIES[m.from]?.sn || m.from;
  const color = m.from === "sarah" ? "#0000aa" : BUDDIES[m.from]?.color || "#000";
  wrap.innerHTML = `<span class="sn" style="color:${color}">${escapeHtml(sn)}:</span> ${parseRich(escapeText(m.text))}`;
  bindLinks(wrap);
  if (m.photo && PHOTOS[m.photo]) {
    const p = PHOTOS[m.photo];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-photo";
    btn.innerHTML = `<img src="${p.src}" alt="${escapeHtml(p.title)}"><span class="stamp">${escapeHtml(p.stamp)} · ${escapeHtml(p.file)}</span>`;
    btn.addEventListener("click", () => viewPhoto(m.photo, { force: m.photo === "proof" }));
    wrap.appendChild(btn);
  }
  logEl.appendChild(wrap);
}

function goBuddyList(fromEl) {
  streamGen += 1;
  signalAck(state.currentBuddy);
  release("choices");
  release("stream");
  state.currentBuddy = null;
  const root = document.getElementById("body-messenger");
  if (isDesktopShell() && root?.querySelector("#im-side")) renderMessengerDesktop(root);
  else renderBuddyList(root || fromEl);
}

function openBuddyChat(body, buddyId) {
  streamGen += 1;
  if (state.currentBuddy) signalAck(state.currentBuddy);
  release("choices");
  state.currentBuddy = buddyId;
  renderChat(body, buddyId);
}

let balloonQ = [];

function stripImText(text) {
  return String(text || "")
    .replace(/\[\[[^\|\]]*\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[[^\]]+\]\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

export function showImAlert(buddyId, nodeId) {
  const b = BUDDIES[buddyId];
  const node = CHATS[buddyId]?.[nodeId];
  const msgs = node?.messages || [];
  const raw = msgs.find((m) => m.from !== "sys") || msgs[0];
  if (balloonQ.some((x) => x.buddyId === buddyId && x.nodeId === nodeId)) return;
  balloonQ.push({
    buddyId,
    nodeId,
    sn: b?.sn || buddyId,
    color: b?.color || "#000080",
    body: stripImText(raw?.text) || "Instant Message",
  });
  const host = document.getElementById("balloon-root");
  if (host?.querySelector("#im-balloon")) return;
  if (isHeld()) onIdle(paintBalloon);
  else paintBalloon();
}

function consumeBalloon(buddyId) {
  const host = document.getElementById("balloon-root");
  const showing = balloonQ[0];
  balloonQ = balloonQ.filter((x) => x.buddyId !== buddyId);
  if (showing?.buddyId !== buddyId) return;
  if (host) host.innerHTML = "";
  release("balloon");
  if (balloonQ.length) onIdle(paintBalloon);
}

function paintBalloon() {
  const host = document.getElementById("balloon-root");
  if (!host) return;
  const item = balloonQ[0];
  if (!item) {
    host.innerHTML = "";
    release("balloon");
    return;
  }
  if (host.querySelector("#im-balloon")) return;
  hold("balloon");
  play("im");
  host.innerHTML = `
    <button type="button" class="balloon" id="im-balloon">
      <span class="balloon-app">${img("messenger")} Instant Message</span>
      <b class="balloon-sn" style="color:${item.color}">${escapeHtml(item.sn)}</b>
      <span class="balloon-body">${escapeHtml(item.body)}</span>
    </button>`;
  host.querySelector("#im-balloon").addEventListener("click", () => {
    balloonQ.shift();
    host.innerHTML = "";
    openApp("messenger", { buddy: item.buddyId });
    release("balloon");
    if (balloonQ.length) onIdle(paintBalloon);
  });
}

function paintDocTitle() {
  const n = Object.values(state.unread).reduce((a, b) => a + b, 0);
  document.title = n ? `(${n}) Instant Message` : "Slumber Party 98";
  document.getElementById("modem")?.classList.toggle("tray-blink", n > 0);
}

export function injectNode(buddyId, nodeId) {
  const node = CHATS[buddyId]?.[nodeId];
  if (node) {
    (node.flags || []).forEach((f) => setFlag(f));
    (node.clues || []).forEach((c) => addClue(c.id, c.note));
  }
  const chat = ensureChat(buddyId);
  chat.seenStart = true;
  chat.node = nodeId;
  chat.pendingNode = nodeId;
  const watching = isOpen("messenger") && state.currentBuddy === buddyId;
  if (!watching) {
    markUnread(buddyId, 1);
    if (nodeId === "ghost") play("signon");
    flashTask("messenger");
    showImAlert(buddyId, nodeId);
  }
  paintDesktop();
  const body = document.getElementById("body-messenger");
  if (!isOpen("messenger") || !body) {
    emit("im", { buddyId, nodeId });
    return;
  }
  const main = body.querySelector("#im-main");
  const side = body.querySelector("#im-side");
  if (side && main) {
    side.querySelector(".buddy-list").innerHTML = buddyButtonsHtml();
    side.querySelectorAll("[data-buddy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openBuddyChat(main, btn.getAttribute("data-buddy"));
      });
    });
    if (state.currentBuddy === buddyId) {
      chat.pendingNode = null;
      playNode(main, buddyId, nodeId);
    }
  } else if (state.currentBuddy === buddyId) {
    chat.pendingNode = null;
    playNode(body, buddyId, nodeId);
  } else if (!state.currentBuddy) {
    renderBuddyList(body);
  }
  emit("im", { buddyId, nodeId });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function registerBrowser() {
  registerApp({
    id: "browser",
    title: "NetBuddy Navigator",
    icon: "browser",
    render(body) {
      const url = state.browserUrl || "home";
      body.innerHTML = `
        <div class="im-layout">
          <div class="browser-toolbar">
            <button type="button" data-nav="home">Home</button>
            <button type="button" data-nav="missing">Gazette</button>
            <div class="addr">
              <label for="addr">Address</label>
              <input id="addr" value="${escapeHtml(displayUrl(url))}" />
              <button type="button" id="go">Go</button>
            </div>
          </div>
          <div class="app-scroll web-frame" id="web"></div>
          <div class="status-bar"><p class="status-bar-field">CedarNet 56k Connected</p><p class="status-bar-field">Zone: Millhaven</p></div>
        </div>`;
      const web = body.querySelector("#web");
      web.innerHTML = renderWeb(url);
      bindLinks(web);
      body.querySelectorAll("[data-nav]").forEach((b) =>
        b.addEventListener("click", () => {
          state.browserUrl = b.getAttribute("data-nav");
          setFlag("read_news");
          addClue("read_news", "You checked Millhaven Online.");
          play("navigate");
          registerBrowserRender(body);
        })
      );
      body.querySelector("#go").addEventListener("click", () => goAddr(body));
      body.querySelector("#addr").addEventListener("keydown", (e) => {
        if (e.key === "Enter") goAddr(body);
      });
    },
  });
}

function registerBrowserRender(body) {
  const web = body.querySelector("#web");
  const addr = body.querySelector("#addr");
  if (addr) addr.value = displayUrl(state.browserUrl);
  web.innerHTML = renderWeb(state.browserUrl);
  bindLinks(web);
}

function goAddr(body) {
  const raw = body.querySelector("#addr").value.toLowerCase();
  if (raw.includes("tropicana")) {
    openApp("tropicana");
    return;
  }
  if (raw.includes("found") && state.climax >= 2) state.browserUrl = "found";
  else if (raw.includes("search") || raw.includes("channel7")) state.browserUrl = "search";
  else if (raw.includes("missing") || raw.includes("gazette")) state.browserUrl = "missing";
  else if (raw.includes("blockbuster")) state.browserUrl = "rental";
  else state.browserUrl = "home";
  setFlag("read_news");
  addClue("read_news", "You went looking on Millhaven Online.");
  play("navigate");
  registerBrowserRender(body);
}

function displayUrl(id) {
  const map = {
    home: "http://www.millhaven.net/",
    missing: "http://www.millhaven.net/news/missing.htm",
    search: "http://www.channel7now.com/search.htm",
    found: "http://www.millhaven.net/news/breaking.htm",
    rental: "http://www.blockbuster.millhaven.net/newreleases.htm",
  };
  return map[id] || "http://www.millhaven.net/";
}

function renderWeb(id) {
  if (id === "missing") {
    setFlag("read_news");
    return `
      <div class="marquee-bar">*** BREAKING *** Search underway — Amanda Cole, 15, last seen Willow Lane ***</div>
      <div class="web-98">
        <p style="font-family:Pixelated MS Sans Serif,sans-serif;font-size:12px;">The Millhaven Gazette &nbsp; Sunday, October 18, 1998</p>
        <h1>Local teen missing after slumber party</h1>
        <p><i>Friends last saw her leaving a Willow Lane basement after 1 a.m.</i></p>
        <div class="missing-poster">
          <div style="color:#c00;font-weight:bold;font-size:22px;">MISSING</div>
          <img src="./img/mandy-yearbook.jpg" alt="Amanda Cole" />
          <p><b>Amanda "Mandy" Cole</b><br>15 • Millhaven High School sophomore<br>Last seen: Saturday night / Sunday morning<br>Clothing: pale cardigan, dark pants, butterfly clip</p>
        </div>
        <p>Police ask anyone at the Hart residence gathering to come forward. Rumors of a "spirit board" and a boy at a basement window have not been confirmed by officials.</p>
        <p>A classmate's disposable camera — developed this morning at Walgreens — may show the last photographs of the group. Officers have asked for copies of the roll.</p>
        <p><a href="#" data-link="news:search">Channel 7: search expands</a> &nbsp; <a href="#" data-link="photo:leaving">related: maple street frame</a></p>
        ${pinBtn("Gazette: Mandy missing. They already want Lauren's roll. Last seen leaving with me.")}
      </div>`;
  }
  if (id === "search") {
    return `
      <div class="marquee-bar">CHANNEL 7 NOW — 10:05 a.m. — search widens to Old Mill Creek</div>
      <div class="web-98">
        <h1>Police expand search toward the mill path</h1>
        <img class="news-hero" src="./img/photo-creek.jpg" alt="creek" />
        <p>A volunteer told Channel 7 that one of the girls "kept saying the board spelled CREEK." Officials would not comment on occult rumors.</p>
        <p>Blockbuster clerks confirm a PG-13 rental was checked out on the Hart family card Saturday afternoon: <i>I Know What You Did Last Summer</i>.</p>
        <p><a href="#" data-link="wiki:creek">Encyclopedia Tropicana: Old Mill Creek</a></p>
        ${pinBtn("Channel 7 is already at the creek. Chloe talked. The rental is on a card.")}
      </div>`;
  }
  if (id === "found" || (id === "home" && state.climax >= 2 && flag("body_found"))) {
    if (state.climax < 2 && id === "found") {
      return `<div class="web-98"><h1>404 Not Found</h1><p>This page is not available yet. Try again later this morning.</p></div>`;
    }
    return `
      <div class="marquee-bar" style="background:#800000">*** BODY RECOVERED — IDENTITY WITHHELD — OLD MILL CREEK ***</div>
      <div class="web-98">
        <h1>Body recovered near Old Mill Creek</h1>
        <p>A statement at 10:58 a.m. said a body was found along the mill race. Identity is being withheld pending notification.</p>
        <p>Neighbors describe a shortcut teenagers use to avoid Maple porch lights.</p>
        <p>Sources say investigators have been given a photograph taken <b>after 5 a.m. Sunday</b>, separate from the slumber-party roll.</p>
        ${pinBtn("They found her at the creek. They have a picture from AFTER. Not the party. After.")}
      </div>`;
  }
  if (id === "rental") {
    return `
      <div class="web-98">
        <h1>New Releases — Wall 3</h1>
        <p>Be kind. Rewind. PG-13 unless a parent is present.</p>
        <p><b>I Know What You Did Last Summer</b> (1997) — Checked out: Hart, D. Sat 4:10 PM. Due Monday.</p>
        <p>A movie about a secret. You watched it on the basement CRT. Lauren has the picture. <a href="#" data-link="photo:movie">IMG_002</a></p>
        ${pinBtn("We rented a movie about hiding a crime. Then we hid one.")}
      </div>`;
  }
  return `
    <div class="marquee-bar">Welcome to Millhaven Online — brought to you by CedarNet 56k — Best viewed in NetBuddy 4.0</div>
    <div class="web-98">
      <h1>millhaven.net</h1>
      <p>Sunday, October 18, 1998. Overcast. You have mail, probably.</p>
      <p>Visitor number: <span class="counter">00${48000 + clueCount()}</span></p>
      <h2>Local Headlines</h2>
      <ul>
        <li><a href="#" data-link="news:missing">Gazette: sophomore missing after Willow Lane party</a></li>
        <li><a href="#" data-link="news:search">Channel 7: search, rumors, a spirit board</a></li>
        <li><a href="#" data-link="news:rental">Blockbuster: what got rented Saturday</a></li>
      </ul>
      <h2>Your bookmarks</h2>
      <ul>
        <li><a href="#" data-link="wiki:home">Encyclopedia Tropicana (online update)</a></li>
        <li><a href="#" data-link="photo:pizza">A:\\PartyRoll\\ (shortcut is on the desktop)</a></li>
      </ul>
      <p><i>Under construction since 1996.</i></p>
    </div>`;
}

function registerTropicana() {
  registerApp({
    id: "tropicana",
    title: "Encyclopedia Tropicana",
    icon: "tropicana",
    render(body) {
      const id = state.wikiId || "home";
      const ids = ["ouija", "planchette", "ideomotor", "creek", "carrie", "millhaven", "ikwydls"];
      body.innerHTML = `
        <div class="tropi">
          <div class="tropi-head"><span>Encyclopedia Tropicana</span><span>Disc 1 • 1998 update</span></div>
          <div class="tropi-search">
            <input id="q" placeholder="Search articles..." />
            <button type="button" id="qs">Search</button>
          </div>
          <div class="tropi-cols">
            <div class="tropi-nav">
              ${ids
                .map(
                  (w) =>
                    `<button type="button" class="${w === id ? "active" : ""}" data-wiki="${w}">${escapeHtml(
                      WIKI[w].title
                    )}</button>`
                )
                .join("")}
            </div>
            <div class="tropi-article" id="art"></div>
          </div>
        </div>`;
      paintWiki(body, id);
      body.querySelectorAll("[data-wiki]").forEach((b) =>
        b.addEventListener("click", () => {
          state.wikiId = b.getAttribute("data-wiki");
          setFlag("read_wiki");
          addClue("read_wiki", "You looked it up so it would be someone else's words.");
          paintWiki(body, state.wikiId);
        })
      );
      body.querySelector("#qs").addEventListener("click", () => searchWiki(body));
      body.querySelector("#q").addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchWiki(body);
      });
    },
  });
}

function searchWiki(body) {
  const q = body.querySelector("#q").value.toLowerCase();
  const hit = Object.keys(WIKI).find((k) => k !== "home" && (k.includes(q) || WIKI[k].title.toLowerCase().includes(q)));
  state.wikiId = hit || "ouija";
  setFlag("read_wiki");
  addClue("read_wiki", "Tropicana search.");
  paintWiki(body, state.wikiId);
}

function paintWiki(body, id) {
  const art = body.querySelector("#art");
  body.querySelectorAll("[data-wiki]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-wiki") === id));
  if (id === "home") {
    art.innerHTML = `<h1>Encyclopedia Tropicana</h1><p>Welcome. Try <b>Ouija</b>, <b>Old Mill Creek</b>, or the film you rented.</p><p>Tip: articles can open photographs stored on this computer.</p>`;
    return;
  }
  const w = WIKI[id];
  art.innerHTML = `<h1>${escapeHtml(w.title)}</h1>${wikiBody(id)}
    <p class="see-also">See also: ${(w.see || [])
      .map((s) => `<button type="button" data-wiki2="${s}">${escapeHtml(WIKI[s]?.title || s)}</button>`)
      .join(" ")}</p>
    ${pinBtn(`Tropicana — ${w.title}: I needed it to be in an encyclopedia so it would feel like it happened to someone else.`)}`;
  bindLinks(art);
  art.querySelectorAll("[data-wiki2]").forEach((b) =>
    b.addEventListener("click", () => {
      state.wikiId = b.getAttribute("data-wiki2");
      paintWiki(body, state.wikiId);
    })
  );
}

function registerExplorer() {
  registerApp({
    id: "explorer",
    title: "Windows Explorer",
    icon: "folder",
    render(body) {
      const path = state.explorerPath || "C:\\My Pictures\\PartyRoll";
      if (state.climax >= 3 && !FILES["C:\\My Pictures\\PartyRoll\\IMG_009.JPG"]) {
        FILES["C:\\My Pictures\\PartyRoll\\IMG_009.JPG"] = { type: "photo", name: "IMG_009.JPG", photo: "proof" };
      }
      const kids = Object.keys(FILES).filter((p) => parentPath(p) === path);
      const folders = ["C:\\", "C:\\My Documents", "C:\\My Pictures", "C:\\My Pictures\\PartyRoll", "C:\\Recycle Bin", "C:\\Network Neighborhood", "C:\\Network Neighborhood\\JESS-PC"];
      setTitle("explorer", path);
      body.innerHTML = `
        <div class="expl">
          <div class="expl-tools">
            <button type="button" id="up">Up</button>
            <button type="button" data-path="C:\\My Pictures\\PartyRoll">Party Roll</button>
          </div>
          <div class="expl-split">
            <div class="expl-tree">
              ${folders
                .map(
                  (f) =>
                    `<button type="button" class="${f === path ? "here" : ""}" data-path="${escapeHtml(f)}">${escapeHtml(
                      FILES[f]?.name || f
                    )}</button>`
                )
                .join("")}
            </div>
            <div class="expl-files">
              ${kids
                .map((p) => {
                  const f = FILES[p];
                  const ic = f.type === "folder" ? "folder" : f.type === "photo" ? "photo" : "textfile";
                  return `<button type="button" class="file-ico" data-file="${escapeHtml(p)}">${img(ic)}<span>${escapeHtml(
                    f.name
                  )}</span></button>`;
                })
                .join("")}
            </div>
          </div>
          <div class="status-bar"><p class="status-bar-field">${kids.length} object(s)</p><p class="status-bar-field">${escapeHtml(path)}</p></div>
        </div>`;
      body.querySelector("#up").addEventListener("click", () => {
        state.explorerPath = parentPath(path) || "C:\\";
        refreshApp("explorer");
      });
      body.querySelectorAll("[data-path]").forEach((b) =>
        b.addEventListener("click", () => {
          state.explorerPath = b.getAttribute("data-path");
          refreshApp("explorer");
        })
      );
      body.querySelectorAll("[data-file]").forEach((b) =>
        b.addEventListener("click", () => openFile(b.getAttribute("data-file")))
      );
    },
  });
}

function parentPath(p) {
  if (!p || p === "C:\\") return "";
  const i = p.lastIndexOf("\\");
  if (i <= 2) return "C:\\";
  return p.slice(0, i);
}

function registerNotepad() {
  if (!state.notepadDocs.scratch) {
    state.notepadDocs.scratch = "Sunday morning. Write what they said. Write what the pictures show. Don't rearrange the night.\n";
    state.notepadDocs.lastnight = TEXTS.lastnight.body;
    state.notepadDocs.letters = TEXTS.letters.body;
    state.notepadDocs.passwords = TEXTS.passwords.body;
    state.notepadDocs.essay = TEXTS.essay.body;
    state.notepadDocs.invite = TEXTS.invite.body;
    state.notepadDocs.index = TEXTS.index.body;
    state.notepadDocs.draft = TEXTS.draft.body;
    state.notepadDocs.nfo = TEXTS.nfo.body;
  }
  registerApp({
    id: "notepad",
    title: "ScratchPad",
    icon: "notepad",
    render(body, opts) {
      if (opts.doc) state.notepadDoc = opts.doc;
      const doc = state.notepadDoc || "scratch";
      if (doc === "scratch" && state.notes) {
        /* merge pins */
        if (!state.notepadDocs.scratch.includes(state.notes.slice(0, 40))) {
          state.notepadDocs.scratch = (state.notepadDocs.scratch || "") + "\n" + state.notes;
        }
      }
      const files = [
        ["scratch", "notes.txt"],
        ["lastnight", "lastnight.txt"],
        ["index", "INDEX.TXT"],
        ["letters", "ouija_letters.txt"],
        ["draft", "draft_to_mandy.txt"],
        ["essay", "TellTaleHeart.doc"],
        ["invite", "invite.txt"],
        ["nfo", "SLUMBER.NFO"],
        ["passwords", "passwords.txt"],
      ];
      setTitle("notepad", `${files.find((f) => f[0] === doc)?.[1] || "Untitled"} — ScratchPad`);
      body.innerHTML = `
        <div class="pad">
          <div class="pad-files">
            ${files
              .map(([id, name]) => `<button type="button" data-doc="${id}">${escapeHtml(name)}</button>`)
              .join("")}
          </div>
          <textarea id="pad">${escapeHtml(state.notepadDocs[doc] || "")}</textarea>
          <div class="status-bar"><p class="status-bar-field">Ln 1</p><p class="status-bar-field">${clockStr()}</p></div>
        </div>`;
      const ta = body.querySelector("#pad");
      ta.addEventListener("input", () => {
        state.notepadDocs[doc] = ta.value;
        if (doc === "scratch") {
          setNotes(ta.value);
          setFlag("used_notepad");
          addClue("used_notepad", "You typed so your hands would have something to do.");
        }
      });
      body.querySelectorAll("[data-doc]").forEach((b) =>
        b.addEventListener("click", () => {
          state.notepadDoc = b.getAttribute("data-doc");
          if (["lastnight", "draft", "passwords", "letters", "index", "invite", "nfo"].includes(state.notepadDoc)) {
            setFlag("read_file");
            addClue("read_file", `Opened ${state.notepadDoc}`);
          }
          if (state.notepadDoc === "passwords") setFlag("tyler_unlocked");
          refreshApp("notepad");
        })
      );
    },
  });
}

function registerPhoto() {
  registerApp({
    id: "photo",
    title: "Imaging",
    icon: "photo",
    render(body, opts) {
      const id = opts.id || state.currentPhoto || "pizza";
      const p = PHOTOS[id];
      if (!p) return;
      state.currentPhoto = id;
      const roll = [...PARTY_ROLL];
      if (flag("saw_proof") || state.climax >= 3) roll.push("proof");
      const caught = p.proof;
      const win = document.getElementById("win-photo");
      if (win) win.classList.toggle("caught", !!caught);
      setTitle("photo", caught ? "IMG_009.JPG — you." : `${p.file} — ${p.title}`);
      body.innerHTML = `
        <div class="im-layout">
          <div class="app-scroll">
            <div class="photo-stage">
              <img src="${p.src}" alt="${escapeHtml(p.title)}" style="width:100%;display:block;">
              <div class="photo-stamp">${escapeHtml(p.stamp)}</div>
            </div>
            <div class="photo-cap">
              <b>${escapeHtml(p.title)}</b>
              <p>${escapeHtml(p.caption)}</p>
              ${p.scribble ? `<p><i>${escapeHtml(p.scribble)}</i></p>` : ""}
              ${pinBtn(p.scribble || p.title)}
            </div>
          </div>
          <div class="filmstrip">
            ${roll
              .map((rid) => {
                const r = PHOTOS[rid];
                return `<button type="button" class="${rid === id ? "on" : ""}" data-ph="${rid}" title="${escapeHtml(
                  r.file
                )}"><img src="${r.src}" alt=""></button>`;
              })
              .join("")}
          </div>
        </div>`;
      body.querySelectorAll("[data-ph]").forEach((b) =>
        b.addEventListener("click", () => viewPhoto(b.getAttribute("data-ph"), { force: true }))
      );
      bindLinks(body);
    },
  });
}

function registerDos() {
  registerApp({
    id: "dos",
    title: "MS-DOS Prompt",
    icon: "dos",
    render(body) {
      body.innerHTML = `<div class="dos"><div class="out" id="dos-out">HomeSoft(R) 98\nC:\\SARAH&gt; </div>
        <div class="dos-in"><span>C:\\&gt;</span><input id="dos-in" autocomplete="off" /></div></div>`;
      const out = body.querySelector("#dos-out");
      const input = body.querySelector("#dos-in");
      input.focus();
      const println = (t) => {
        out.textContent += t + "\n";
        out.parentElement.scrollTop = 99999;
      };
      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const cmd = input.value.trim();
        println(`C:\\SARAH> ${cmd}`);
        input.value = "";
        const c = cmd.toLowerCase();
        if (!c || c === "help") println("DIR  TYPE  WHOAMI  PICTURES  REMEMBER  CLS");
        else if (c === "cls") out.textContent = "";
        else if (c === "whoami") println("sarah quinn\nmoonpixie98\nthe girl in IMG_008 and IMG_009");
        else if (c === "dir" || c === "pictures")
          println("IMG_001 pizza\nIMG_002 movie\nIMG_003 bags\nIMG_004 mom\nIMG_005 basement\nIMG_006 window\nIMG_007 ouija\nIMG_008 leaving\nIMG_009  ???  ask lo");
        else if (c.startsWith("type")) {
          println(TEXTS.lastnight.body);
          setFlag("read_file");
          addClue("read_file", "DOS still had lastnight.txt.");
        } else if (c === "remember") println("you looked at the flash.\nyou decided not to wave.");
        else {
          play("error");
          println("Bad command or file name");
        }
      });
    },
  });
}

function registerHelp() {
  registerApp({
    id: "help",
    title: "HomeSoft Help",
    icon: "help",
    render(body) {
      body.innerHTML = `<div class="app-scroll web-98">
        <h1>What to do when you don't know what happened</h1>
        <p>1. Open <b>BuddyBee</b>. People will send pictures. Click the pictures. The night only makes sense in order.</p>
        <p>2. The order is pizza → movie → sleeping bags → mom in the doorway → after she left → the window → the board → maple street.</p>
        <p>3. Lauren has a frame she is not sending yet. It is not from the party.</p>
        <p>4. Write it in <b>ScratchPad</b> or it will rearrange itself.</p>
        <p>5. Encyclopedia Tropicana is for when you want a dead girl in 1978 to be the explanation.</p>
        <p>6. You can shut down anytime. It will not help.</p>
        <p>On a phone: tap everything. Windows fill the screen; use the taskbar to switch.</p>
        <p>On a PC: the desktop is the whole window. Drag a title bar, resize from the edges, minimize/maximize, double-click the title bar. Press F11 for full screen.</p>
      </div>`;
    },
  });
}

on("unread", () => {
  paintDesktop();
  paintDocTitle();
});
on("climax", paintDesktop);
on("notes", () => {
  if (state.notepadDoc === "scratch") state.notepadDocs.scratch = state.notes;
});
