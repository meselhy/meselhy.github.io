const cacheName = "cache1";

self.addEventListener("install", event => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll([
				"/",
				"index.html", // Main HTML file
				"403.html", // 403 Error file
				"404.html", // 404 Error file
				"assets/style/style.css", // Main CSS file
				"assets/style/pixeloperator-webfont.woff",
				"assets/style/pixeloperator-webfont.woff2",
				"assets/script/jquery-3.6.1.min.js", // Jquery JS file
				"assets/script/howler.min.js", // Howler JS file
				"assets/script/script.js", // Main JS file
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
			]);
		})
	);
});

self.addEventListener("activate", event => {
	// Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => {
			Promise.all(
				keys.map(key => {
					if (![cacheName].includes(key)) {
						return caches.delete(key);
					}
				})
			)
		})
	);
});

self.addEventListener("fetch", event => {
	event.respondWith(
		caches.open(cacheName).then(cache => {
			return cache.match(event.request).then(response => {
				return response || fetch(event.request).then(networkResponse => {
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				});
			})
		})
	);
});

// This is the "Offline copy of assets" service worker
const CACHE = "meselhy-offline";
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

workbox.routing.registerRoute(
  new RegExp('/*'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE
  })
);