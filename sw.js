const CACHE = "hs98-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/os.css",
  "./vendor/98.css",
  "./js/main.js",
  "./js/engine.js",
  "./js/wm.js",
  "./js/apps.js",
  "./js/story.js",
  "./js/chats.js",
  "./js/icons.js",
  "./js/ascii.js",
  "./js/setup.js",
  "./js/audio.js",
  "./js/popups.js",
  "./img/wallpaper.jpg",
  "./img/photo-pizza.jpg",
  "./img/photo-movie.jpg",
  "./img/photo-sleepingbags.jpg",
  "./img/photo-mom.jpg",
  "./img/photo-basement.jpg",
  "./img/photo-window.jpg",
  "./img/photo-ouija.jpg",
  "./img/photo-leaving.jpg",
  "./img/photo-creek.jpg",
  "./img/photo-proof.jpg",
  "./img/mandy-yearbook.jpg",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-maskable-192.png",
  "./img/icon-maskable-512.png",
  "./img/apple-touch-icon.png",
  "./img/favicon-32.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
