const CACHE = "hs98-v3";
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
  "./img/og-image.png",
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
  "./img/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
