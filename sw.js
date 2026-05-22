'use strict';

// ==================== WORKBOX v7 ====================
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

const VERSION = 'v2.0';   // ← Increase this version
const CACHE_NAME = `meselhy-cache-${VERSION}`;

// Activate Workbox
workbox.setConfig({ debug: false });

// Precache important files
const precacheManifest = [
    "/",
    "index.html",
    "assets/style/style.css",
    "assets/script/jquery-3.6.1.min.js",
    "assets/script/howler.min.js",
    "assets/script/script.js",
	"assets/style/style.css", // Main CSS file
	"assets/style/pixeloperator-webfont.woff",
	"assets/style/pixeloperator-webfont.woff2",
	"assets/script/jquery-3.6.1.min.js", // Jquery JS file
	"assets/script/howler.min.js", // Howler JS file
	"assets/img/github.svg",
	"assets/img/instagram.svg",
	"assets/img/twitter.svg",
	"assets/img/facebook.svg",
	"assets/img/error.png",
	"assets/img/error.webm",
	"assets/img/rotate.webm",
	"assets/img/fav/android-chrome-192x192.png", // Favicon, Android Chrome M39+ with 4.0 screen density
	"assets/img/fav/android-chrome-384x384.png", // Favicon, Android Chrome M47+ Splash screen with 3.0 screen density
	"assets/img/fav/apple-touch-icon-precomposed.png",
	"assets/img/fav/apple-touch-icon.png", // Favicon, Apple default
	"assets/img/fav/browserconfig.xml", // IE11 icon configuration file
	"assets/img/fav/favicon.ico", // Favicon, IE and fallback for other browsers
	"assets/img/fav/favicon-16x16.png", // Favicon, default
	"assets/img/fav/favicon-32x32.png", // Favicon, Safari on Mac OS
	"assets/img/fav/favicon-194x194.png",
	"assets/img/fav/maskable_icon.png", // Favicon, maskable
	"assets/img/fav/mstile-150x150.png", // Favicon, Windows 8 / IE11
	"assets/img/fav/mstile-310x150.png",
	"assets/img/fav/safari-pinned-tab.svg", // Favicon, Safari pinned tab
	"assets/img/fav/site.webmanifest", // Manifest file
	"assets/audio/click.mp3",
	"assets/audio/game.mp3",
	"assets/audio/start.mp3"
];

workbox.precaching.precacheAndRoute(precacheManifest);

// ==================== ROUTING STRATEGIES ====================

// 1. HTML - Stale While Revalidate (Fast + Fresh)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAME,
  })
);

// 2. CSS, JS, Fonts - Stale While Revalidate
workbox.routing.registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAME,
  })
);

// 3. Images, Audio, Video - Cache First (Best for media)
workbox.routing.registerRoute(
  ({ request }) => 
    request.destination === 'image' ||
    request.destination === 'audio' ||
    request.destination === 'video',
  new workbox.strategies.CacheFirst({
    cacheName: `${CACHE_NAME}-media`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      })
    ],
  })
);

// 4. Everything else - Network First
workbox.routing.registerRoute(
  () => true,
  new workbox.strategies.NetworkFirst({
    cacheName: CACHE_NAME,
  })
);

// ==================== INSTALL & ACTIVATE ====================
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && !cache.includes('workbox')) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});