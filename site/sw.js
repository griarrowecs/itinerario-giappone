// Service worker: tiene sul telefono una copia dei file dell'app (non dei
// dati — quelli restano su jsonbin/localStorage come già funzionava), così
// se il browser prova a ricaricare la pagina mentre non c'è rete (es. un
// pull-to-refresh accidentale), mostra comunque l'ultima versione salvata
// dell'app invece della pagina di errore nativa del browser.
//
// Strategia: "prima la rete, se non risponde uso la copia salvata" — così
// online vedete sempre l'ultima versione pubblicata, e solo offline entra
// in gioco la copia di riserva.
//
// Cambiare CACHE_NAME (es. v1 -> v2) ad ogni release importante: forza la
// sostituzione pulita della copia salvata invece di lasciarla invecchiare.
var CACHE_NAME = "jg-app-v1";

var APP_SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "css/styles.css",
  "js/config.js",
  "js/data.js",
  "js/app.js",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/apple-touch-icon.png",
  "assets/mappa.avif",
  "assets/mappa.html"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var req = event.request;

  // Solo richieste dello stesso sito (GET): il resto (jsonbin.io, le
  // funzioni Netlify per Virtual Giu/notizie, meteo, cambio valuta) passa
  // dritto in rete senza che il service worker se ne occupi — offline
  // falliranno semplicemente come già gestito dal codice dell'app.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (cached) {
          if (cached) return cached;
          // richiesta di navigazione (apertura/ricaricamento pagina) mai
          // vista prima e senza rete: mostriamo comunque l'app principale
          // invece di lasciar apparire l'errore nativo del browser.
          if (req.mode === "navigate") return caches.match("index.html");
          return Response.error();
        });
      })
  );
});
