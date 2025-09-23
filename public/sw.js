// Minimal Service Worker to prevent console warnings
// This file exists to prevent browsers from showing 404 errors when looking for sw.js

self.addEventListener("install", () => {
  // Immediately activate this service worker
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  // Take control of all clients immediately
  self.clients.claim();
});

// Optional: Handle fetch events (currently just passes through to network)
self.addEventListener("fetch", (event) => {
  // Let the browser handle all fetch requests normally
  return;
});
