// Logica dell'applicazione: stato, rendering, eventi, salvataggio.
(function(){
  var STORAGE_KEY = "jg_itinerario_v9";
  var editingNow = null;
  var pollTimer = null;
  var pendingStampKey = null;

  var HERO_SVG = '<svg class="jg-hero-svg" viewBox="0 0 520 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'+
    '<defs>'+
      '<linearGradient id="jgSky" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0%" stop-color="#F6D7DC"/><stop offset="60%" stop-color="#F0BFCB"/><stop offset="100%" stop-color="#E7A9BE"/>'+
      '</linearGradient>'+
      '<linearGradient id="jgWater" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0%" stop-color="#E7A9BE"/><stop offset="100%" stop-color="#D98FAE"/>'+
      '</linearGradient>'+
    '</defs>'+
    '<rect width="520" height="200" fill="url(#jgSky)"/>'+
    '<circle cx="330" cy="70" r="22" fill="#F3D2C8" opacity="0.65"/>'+
    '<path d="M60 140 L150 108 L240 132 L330 104 L420 128 L520 112 V140 H60 Z" fill="#C99BAE" opacity="0.55"/>'+
    '<path d="M90 140 L160 118 L230 136 L300 116 L380 134 L460 120 L520 132 V140 H90 Z" fill="#BC8BA0" opacity="0.55"/>'+
    '<rect x="0" y="140" width="520" height="60" fill="url(#jgWater)"/>'+
    '<g stroke="#E9C3CF" stroke-width="1" opacity="0.6">'+
      '<line x1="0" y1="152" x2="520" y2="152"/><line x1="0" y1="164" x2="520" y2="164"/><line x1="0" y1="178" x2="520" y2="178"/>'+
    '</g>'+
    '<g fill="#5B3A42">'+
      '<rect x="210" y="120" width="10" height="72"/>'+
      '<rect x="298" y="120" width="10" height="72"/>'+
      '<rect x="196" y="108" width="132" height="12" rx="2"/>'+
      '<rect x="188" y="90" width="148" height="10" rx="2"/>'+
      '<rect x="255" y="118" width="8" height="10"/>'+
    '</g>'+
    '<g opacity="0.35" fill="#5B3A42">'+
      '<rect x="210" y="150" width="10" height="42"/>'+
      '<rect x="298" y="150" width="10" height="42"/>'+
    '</g>'+
    '<g fill="#D9497A" opacity="0.95">'+
      '<path d="M-10 -10 C40 20 20 40 70 30 S120 55 140 40" stroke="#8C4A57" stroke-width="2.5" fill="none" opacity="0.7"/>'+
      '<circle cx="6" cy="4" r="10"/><circle cx="28" cy="18" r="9"/><circle cx="4" cy="26" r="8"/>'+
      '<circle cx="46" cy="10" r="9"/><circle cx="60" cy="28" r="8"/><circle cx="82" cy="18" r="9"/>'+
      '<circle cx="96" cy="34" r="8"/><circle cx="116" cy="26" r="8"/><circle cx="20" cy="40" r="6"/>'+
      '<circle cx="66" cy="42" r="6"/><circle cx="106" cy="44" r="6"/>'+
    '</g>'+
    '<g fill="#F0AEBE" opacity="0.85">'+
      '<circle cx="150" cy="70" r="4"/><circle cx="180" cy="50" r="3.5"/><circle cx="120" cy="60" r="3"/>'+
      '<circle cx="380" cy="150" r="4"/><circle cx="410" cy="130" r="3.5"/><circle cx="440" cy="158" r="3"/>'+
    '</g>'+
  '</svg>';

  var MAP_ASSET_URL = "assets/mappa.html"; // pagina con la mappa + pulsante per chiudere la finestra
  var TRIP_YEAR = "2026";

  var state = {
    days:[], food:[], lodging:[], apiUsage:{inputTokens:0, outputTokens:0}, openDay:0, activeTab:'itinerario', activePill:0,
    jrPassOpen:false, offline:false, pendingSync:false, diagOpen:false,
    todayOpened:false, openPhraseCats:{}, openInfoCards:{}
  };

  // ============================== METEO ==============================
  // Un servizio gratuito senza chiave (Open-Meteo). Il meteo NON viene mai
  // salvato su jsonbin: si scarica al momento, resta solo in memoria.
  var CITY_COORDS = {
    "Kyoto":[35.0116,135.7681], "Nara":[34.6851,135.8048], "Osaka":[34.6937,135.5023],
    "Kanazawa":[36.5613,136.6562], "Takayama":[36.1461,137.2521], "Matsumoto":[36.2381,137.9720],
    "Tokyo":[35.6762,139.6503], "Fuji":[35.5000,138.7500], "Kawaguchiko":[35.5000,138.7500]
  };
  function resolveCityCoords(cityStr){
    if(!cityStr) return null;
    var tokens = cityStr.split(/→|·/).map(function(s){return s.trim();}).filter(Boolean);
    tokens.reverse(); // preferisce l'ultima parte (destinazione / luogo specifico del giorno)
    for(var i=0;i<tokens.length;i++){
      var keys = Object.keys(CITY_COORDS);
      for(var k=0;k<keys.length;k++){
        if(tokens[i].indexOf(keys[k]) !== -1) return CITY_COORDS[keys[k]];
      }
    }
    return null;
  }
  function weatherIcon(code){
    if(code===0) return '☀️';
    if(code===1||code===2) return '🌤️';
    if(code===3) return '☁️';
    if(code===45||code===48) return '🌫️';
    if(code>=51&&code<=57) return '🌦️';
    if(code>=61&&code<=67) return '🌧️';
    if(code>=71&&code<=77) return '🌨️';
    if(code>=80&&code<=82) return '🌦️';
    if(code>=85&&code<=86) return '🌨️';
    if(code>=95) return '⛈️';
    return '🌡️';
  }
  var weatherResults = {}; // "lat,lon" -> dati open-meteo, o 'error'
  var weatherFetching = {};
  function fetchWeatherFor(lat, lon){
    var key = lat+','+lon;
    if(weatherResults[key] || weatherFetching[key]) return;
    weatherFetching[key] = true;
    // "forecast_days=16" invece di un intervallo di date fisso: chiedere
    // giorni troppo lontani nel futuro (oltre l'orizzonte del servizio) fa
    // fallire l'INTERA richiesta, non solo i giorni non disponibili.
    var url = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+
      '&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FTokyo'+
      '&forecast_days=16';
    fetch(url).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){ weatherResults[key] = data || 'error'; weatherFetching[key] = false; render(); })
      .catch(function(){ weatherResults[key] = 'error'; weatherFetching[key] = false; render(); });
  }
  var weatherLoadTriggered = false;
  function loadAllWeather(){
    if(weatherLoadTriggered || !state.days.length) return;
    weatherLoadTriggered = true;
    var seen = {};
    state.days.forEach(function(d){
      var c = resolveCityCoords(d.city);
      if(c){ var k=c.join(','); if(!seen[k]){ seen[k]=true; fetchWeatherFor(c[0], c[1]); } }
    });
  }

  // --- tasso di cambio live (servizio gratuito, senza chiave, dati BCE) ---
  var currencyRate = null;      // null finché non arriva una risposta valida
  var currencyLoadTriggered = false;
  function loadCurrencyRate(){
    if(currencyLoadTriggered) return;
    currencyLoadTriggered = true;
    fetch('https://api.frankfurter.dev/v2/rate/EUR/JPY')
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(data){
        if(data && typeof data.rate === 'number'){ currencyRate = data.rate; render(); }
      })
      .catch(function(){}); // in caso di errore resta il valore di ripiego statico
  }
  function getCurrencyRate(){
    return currencyRate || USEFUL_INFO.currencyRateJpyPerEur;
  }

  function getDayWeather(day){
    var c = resolveCityCoords(day.city);
    if(!c) return null;
    var key = c.join(',');
    var data = weatherResults[key];
    if(!data) return 'loading';
    if(data === 'error') return 'error';
    var parts = day.date.split('/'); // "14/09" -> giorno/mese
    var iso = TRIP_YEAR+'-'+parts[1]+'-'+parts[0];
    var idx = data.daily && data.daily.time ? data.daily.time.indexOf(iso) : -1;
    if(idx === -1) return 'unavailable';
    return {
      tmax: Math.round(data.daily.temperature_2m_max[idx]),
      tmin: Math.round(data.daily.temperature_2m_min[idx]),
      code: data.daily.weathercode[idx]
    };
  }
  function renderWeatherBadge(day){
    var w = getDayWeather(day);
    if(w === null) return '';
    if(w === 'loading') return '<div class="jg-weather"><span class="jg-weather-icon">···</span></div>';
    if(w === 'error' || w === 'unavailable') return '<div class="jg-weather"><span class="jg-weather-icon" style="font-size:13px;color:var(--muted);">···</span><span class="jg-weather-temp">non disp.</span></div>';
    return '<div class="jg-weather"><span class="jg-weather-icon">'+weatherIcon(w.code)+'</span><span class="jg-weather-temp">'+w.tmin+'° / '+w.tmax+'°</span></div>';
  }

  function exportBackup(){
    try{
      var payload = {days:state.days, food:state.food, lodging:state.lodging, apiUsage:state.apiUsage, exportedAt:new Date().toISOString(), app:"itinerario-giappone"};
      var blob = new Blob([JSON.stringify(payload)], {type:"application/json"});
      var url = URL.createObjectURL(blob);
      var a2 = document.createElement('a');
      a2.href = url;
      var stamp = new Date().toISOString().slice(0,10);
      a2.download = "itinerario-giappone-backup-"+stamp+".json";
      document.body.appendChild(a2);
      a2.click();
      document.body.removeChild(a2);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      showToast("Backup scaricato");
    }catch(e){
      showToast("Non sono riuscito a creare il backup");
    }
  }

  function importBackup(file){
    var reader = new FileReader();
    reader.onerror = function(){ showToast("Non sono riuscito a leggere il file"); };
    reader.onload = async function(){
      try{
        var parsed = JSON.parse(reader.result);
        if(!parsed || !Array.isArray(parsed.days)) throw new Error("formato non valido");
        var ok = window.confirm("Ripristinare questo backup sovrascriverà l'itinerario condiviso attuale per entrambe. Continuare?");
        if(!ok) return;
        state.days = parsed.days;
        state.food = Array.isArray(parsed.food) ? parsed.food : [];
        state.lodging = Array.isArray(parsed.lodging) ? parsed.lodging : [];
        state.apiUsage = parsed.apiUsage || {inputTokens:0, outputTokens:0};
        render();
        await saveData(true); // sovrascrittura totale deliberata, niente merge
        showToast("Backup ripristinato e sincronizzato");
      }catch(e){
        showToast("File non valido: non sembra un backup di questa guida");
      }
    };
    reader.readAsText(file);
  }

  function root(){return document.getElementById('app');}

  function showToast(msg){
    var t = root() ? root().querySelector('.jg-toast') : null;
    if(!t){ window.alert(msg); return; }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._h);
    t._h = setTimeout(function(){t.style.display='none';}, 2200);
  }

  var JSONBIN_BASE = "https://api.jsonbin.io/v3";
  var ACTIVE_MASTER_KEY = (typeof JSONBIN_MASTER_KEY !== 'undefined' && JSONBIN_MASTER_KEY) ? JSONBIN_MASTER_KEY : "";
  var ACTIVE_BLOB_ID = (typeof REMOTE_BLOB_ID !== 'undefined' && REMOTE_BLOB_ID) ? REMOTE_BLOB_ID : "";
  var JSONBIN_LIMIT_BYTES = 100 * 1024; // piano gratuito jsonbin.io

  var STORAGE_MODE = (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function')
    ? 'cloud'
    : ((ACTIVE_MASTER_KEY && ACTIVE_BLOB_ID) ? 'remote' : (typeof REMOTE_BLOB_ID !== 'undefined' ? 'unconfigured' : 'local'));

  function localGet(){
    try{
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }
  function localSet(payload){
    try{ window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); return true; }
    catch(e){ return false; }
  }

  async function remoteGet(){
    var res = await fetch(JSONBIN_BASE + "/b/" + ACTIVE_BLOB_ID, {
      headers:{"X-Master-Key":ACTIVE_MASTER_KEY, "X-Bin-Meta":"false", "Accept":"application/json"}
    });
    if(!res.ok) throw new Error("jsonbin get failed: " + res.status);
    return await res.json();
  }
  async function remoteSet(payload){
    var body = JSON.stringify(payload);
    if(body.length > JSONBIN_LIMIT_BYTES){
      var err = new Error("payload oltre il limite di jsonbin (100KB)");
      err.isSizeLimit = true;
      throw err;
    }
    var res = await fetch(JSONBIN_BASE + "/b/" + ACTIVE_BLOB_ID, {
      method:"PUT",
      headers:{"Content-Type":"application/json","X-Master-Key":ACTIVE_MASTER_KEY, "Accept":"application/json"},
      body: body
    });
    if(!res.ok){
      var err2 = new Error("jsonbin put failed: " + res.status);
      if(res.status === 400 || res.status === 413) err2.isSizeLimit = true;
      throw err2;
    }
  }
  async function remoteCreate(payload, masterKey){
    var res = await fetch(JSONBIN_BASE + "/b", {
      method:"POST",
      headers:{"Content-Type":"application/json","X-Master-Key":masterKey,"X-Bin-Name":"itinerario-giappone","Accept":"application/json"},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error("jsonbin create failed: " + res.status);
    var data = await res.json();
    var id = data && data.metadata && data.metadata.id;
    if(!id) throw new Error("risposta senza id del bin");
    return id;
  }

  // --- gestione offline: se una scrittura remota fallisce per rete assente,
  // la teniamo comunque in locale e la ripubblichiamo appena torna la rete.
  var offlineRetryTimer = null;
  function markOffline(){
    if(state.offline) return;
    state.offline = true;
    render();
  }
  function markOnlineAndFlush(){
    if(!state.offline && !state.pendingSync) return;
    state.offline = false;
    render();
    if(state.pendingSync && (STORAGE_MODE === 'remote' || STORAGE_MODE === 'cloud')){
      saveData().then(function(){ loadData(true); });
    }
  }
  if(typeof window !== 'undefined'){
    window.addEventListener('online', markOnlineAndFlush);
    window.addEventListener('offline', markOffline);
  }

  var saveInFlight = false;
  var saveQueued = false;

  // --- tracciamento delle modifiche locali non ancora confermate sul server ---
  var DIRTY_KEY = STORAGE_KEY + "_dirty";
  var dirtyItemIds = {};      // {itemId: true} — tappe aggiunte o modificate qui
  var deletedItemIds = {};    // {itemId: true} — tappe cancellate qui
  var dirtyFoodIds = {};      // stesso meccanismo, per la sezione cibo
  var deletedFoodIds = {};
  var dirtyLodgingIds = {};   // stesso meccanismo, per la sezione alloggi
  var deletedLodgingIds = {};

  function saveDirtyToDisk(){
    try{ window.localStorage.setItem(DIRTY_KEY, JSON.stringify({
      dirty:dirtyItemIds, deleted:deletedItemIds,
      foodDirty:dirtyFoodIds, foodDeleted:deletedFoodIds,
      lodgingDirty:dirtyLodgingIds, lodgingDeleted:deletedLodgingIds
    })); }catch(e){}
  }
  function loadDirtyFromDisk(){
    try{
      var raw = window.localStorage.getItem(DIRTY_KEY);
      if(!raw) return;
      var parsed = JSON.parse(raw);
      dirtyItemIds = parsed.dirty || {};
      deletedItemIds = parsed.deleted || {};
      dirtyFoodIds = parsed.foodDirty || {};
      deletedFoodIds = parsed.foodDeleted || {};
      dirtyLodgingIds = parsed.lodgingDirty || {};
      deletedLodgingIds = parsed.lodgingDeleted || {};
    }catch(e){}
  }
  function markDirty(itemId){ dirtyItemIds[itemId] = true; delete deletedItemIds[itemId]; saveDirtyToDisk(); }
  function markDeleted(itemId){ delete dirtyItemIds[itemId]; deletedItemIds[itemId] = true; saveDirtyToDisk(); }
  function markFoodDirty(id){ dirtyFoodIds[id] = true; delete deletedFoodIds[id]; saveDirtyToDisk(); }
  function markFoodDeleted(id){ delete dirtyFoodIds[id]; deletedFoodIds[id] = true; saveDirtyToDisk(); }
  function markLodgingDirty(id){ dirtyLodgingIds[id] = true; delete deletedLodgingIds[id]; saveDirtyToDisk(); }
  function markLodgingDeleted(id){ delete dirtyLodgingIds[id]; deletedLodgingIds[id] = true; saveDirtyToDisk(); }
  function clearDirty(){
    dirtyItemIds = {}; deletedItemIds = {};
    dirtyFoodIds = {}; deletedFoodIds = {};
    dirtyLodgingIds = {}; deletedLodgingIds = {};
    saveDirtyToDisk();
  }
  function hasPendingLocalChanges(){
    return saveInFlight || saveQueued ||
      Object.keys(dirtyItemIds).length > 0 || Object.keys(deletedItemIds).length > 0 ||
      Object.keys(dirtyFoodIds).length > 0 || Object.keys(deletedFoodIds).length > 0 ||
      Object.keys(dirtyLodgingIds).length > 0 || Object.keys(deletedLodgingIds).length > 0 ||
      (pendingUsageDelta && (pendingUsageDelta.inputTokens > 0 || pendingUsageDelta.outputTokens > 0));
  }
  function cloneDeep(x){ return JSON.parse(JSON.stringify(x)); }

  function currentPayloadBytes(){
    try{ return new Blob([JSON.stringify({days:state.days, food:state.food, lodging:state.lodging})]).size; }
    catch(e){ return JSON.stringify({days:state.days, food:state.food, lodging:state.lodging}).length; }
  }

  function timeMinutes(t){
    if(!t) return null;
    var m = /(\d{1,2}):(\d{2})/.exec(t);
    if(!m) return null;
    return parseInt(m[1],10)*60 + parseInt(m[2],10);
  }
  function sortDayItems(day){
    var withIdx = day.items.map(function(it,i){ return {it:it, i:i, t:timeMinutes(it.time)}; });
    withIdx.sort(function(a,b){
      var av = a.t===null ? Infinity : a.t;
      var bv = b.t===null ? Infinity : b.t;
      if(av !== bv) return av - bv;
      return a.i - b.i;
    });
    day.items = withIdx.map(function(x){ return x.it; });
  }

  function buildDynamicRoute(day){
    var places = [];
    day.items.forEach(function(it){
      if(it.transport || !it.link) return;
      try{
        var u = new URL(it.link, window.location.href);
        var q = u.searchParams.get('query');
        if(q) places.push(q);
      }catch(e){}
    });
    if(places.length < 2) return null;
    var origin = places[0];
    var destination = places[places.length-1];
    var waypoints = places.slice(1,-1);
    var url = 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination);
    if(waypoints.length) url += '&waypoints='+waypoints.map(encodeURIComponent).join('%7C');
    return url;
  }

  // Unisce la versione più fresca del server con le sole tappe/cibo che
  // abbiamo toccato noi qui, mai spostando le tappe esistenti fuori posizione.
  function mergeForSave(remoteDays, remoteFood, remoteLodging, remoteUsageIn){
    var merged = cloneDeep(remoteDays);
    merged.forEach(function(d){ d.items.forEach(function(it){ delete it.image; delete it.imageUrl; }); });

    Object.keys(deletedItemIds).forEach(function(id){
      for(var d=0; d<merged.length; d++){
        for(var i=0; i<merged[d].items.length; i++){
          if(merged[d].items[i].id === id){ merged[d].items.splice(i,1); break; }
        }
      }
    });

    Object.keys(dirtyItemIds).forEach(function(id){
      var localItem = null, localDayIdx = -1;
      for(var d=0; d<state.days.length; d++){
        for(var i=0; i<state.days[d].items.length; i++){
          if(state.days[d].items[i].id === id){ localItem = state.days[d].items[i]; localDayIdx = d; break; }
        }
        if(localItem) break;
      }
      if(!localItem || localDayIdx === -1) return;
      var toInsert = cloneDeep(localItem);
      delete toInsert.image; delete toInsert.imageUrl;

      var foundDay = -1, foundIdx = -1;
      for(var d2=0; d2<merged.length; d2++){
        for(var i2=0; i2<merged[d2].items.length; i2++){
          if(merged[d2].items[i2].id === id){ foundDay = d2; foundIdx = i2; break; }
        }
        if(foundDay !== -1) break;
      }

      if(foundDay !== -1 && foundDay === localDayIdx){
        merged[foundDay].items[foundIdx] = toInsert;
      } else if(foundDay !== -1){
        merged[foundDay].items.splice(foundIdx, 1);
        if(merged[localDayIdx]) merged[localDayIdx].items.push(toInsert);
      } else {
        if(merged[localDayIdx]) merged[localDayIdx].items.push(toInsert);
      }
    });
    merged.forEach(sortDayItems);

    // --- stessa logica per il cibo, ma è un elenco piatto (niente giorni) ---
    var mergedFood = cloneDeep(remoteFood || []);
    Object.keys(deletedFoodIds).forEach(function(id){
      for(var i=0;i<mergedFood.length;i++){ if(mergedFood[i].id===id){ mergedFood.splice(i,1); break; } }
    });
    Object.keys(dirtyFoodIds).forEach(function(id){
      var localFood = state.food.find(function(f){ return f.id===id; });
      if(!localFood) return;
      var idx = mergedFood.findIndex(function(f){ return f.id===id; });
      if(idx !== -1) mergedFood[idx] = cloneDeep(localFood);
      else mergedFood.push(cloneDeep(localFood));
    });

    // --- stessa logica per gli alloggi, elenco piatto come il cibo ---
    var mergedLodging = cloneDeep(remoteLodging || []);
    Object.keys(deletedLodgingIds).forEach(function(id){
      for(var i=0;i<mergedLodging.length;i++){ if(mergedLodging[i].id===id){ mergedLodging.splice(i,1); break; } }
    });
    Object.keys(dirtyLodgingIds).forEach(function(id){
      var localLodging = state.lodging.find(function(f){ return f.id===id; });
      if(!localLodging) return;
      var idx = mergedLodging.findIndex(function(f){ return f.id===id; });
      if(idx !== -1) mergedLodging[idx] = cloneDeep(localLodging);
      else mergedLodging.push(cloneDeep(localLodging));
    });

    var remoteUsage = remoteUsageIn || {inputTokens:0, outputTokens:0};
    var mergedUsage = {
      inputTokens: (remoteUsage.inputTokens||0) + pendingUsageDelta.inputTokens,
      outputTokens: (remoteUsage.outputTokens||0) + pendingUsageDelta.outputTokens
    };

    return { days: merged, food: mergedFood, lodging: mergedLodging, apiUsage: mergedUsage };
  }

  async function loadData(silent){
    if(STORAGE_MODE === 'local' || STORAGE_MODE === 'unconfigured'){
      var stored = localGet();
      if(stored){
        applyRemote(stored, true);
      } else if(!state.days.length){
        state.days = defaultDays();
        state.food = defaultFood();
        state.lodging = defaultLodging();
        localSet({days:state.days, food:state.food, lodging:state.lodging});
      }
      render();
      return;
    }
    if(STORAGE_MODE === 'remote'){
      if(hasPendingLocalChanges()){
        if(!state.days.length){
          var cachedPending = localGet();
          state.days = cachedPending ? cachedPending.days : defaultDays();
          state.food = cachedPending ? (cachedPending.food || []) : defaultFood();
          state.lodging = cachedPending ? (cachedPending.lodging || []) : defaultLodging();
          state.apiUsage = cachedPending ? (cachedPending.apiUsage || {inputTokens:0,outputTokens:0}) : {inputTokens:0,outputTokens:0};
          render();
        }
        if(!saveInFlight && !saveQueued) saveData();
        return;
      }
      if(typeof navigator !== 'undefined' && navigator.onLine === false){
        markOffline();
        if(!state.days.length){
          var cached = localGet();
          state.days = cached ? cached.days : defaultDays();
          state.food = cached ? (cached.food || []) : defaultFood();
          state.lodging = cached ? (cached.lodging || []) : defaultLodging();
          state.apiUsage = cached ? (cached.apiUsage || {inputTokens:0,outputTokens:0}) : {inputTokens:0,outputTokens:0};
          render();
        }
        return;
      }
      try{
        var payload = await remoteGet();
        if(hasPendingLocalChanges()){ return; }
        localSet(payload);
        if(state.offline){ state.offline = false; }
        applyRemote(payload, silent);
      }catch(e){
        markOffline();
        if(!state.days.length){
          var cached2 = localGet();
          state.days = cached2 ? cached2.days : defaultDays();
          state.food = cached2 ? (cached2.food || []) : defaultFood();
          state.lodging = cached2 ? (cached2.lodging || []) : defaultLodging();
          state.apiUsage = cached2 ? (cached2.apiUsage || {inputTokens:0,outputTokens:0}) : {inputTokens:0,outputTokens:0};
        }
        if(!silent) showToast("Sei offline: vedi l'ultima versione salvata su questo telefono");
        render();
      }
      return;
    }
    try{
      var res = await window.storage.get(STORAGE_KEY, true);
      var parsed = JSON.parse(res.value);
      var payload2 = Array.isArray(parsed) ? {days:parsed, food:[], lodging:[]} : parsed;
      applyRemote(payload2, silent);
    }catch(e){
      if(!state.days.length){
        state.days = defaultDays();
        state.food = defaultFood();
        state.lodging = defaultLodging();
        try{ await window.storage.set(STORAGE_KEY, JSON.stringify({days:state.days, food:state.food, lodging:state.lodging, apiUsage:state.apiUsage}), true); }catch(e2){}
      }
      render();
    }
  }

  function applyRemote(payload, silent){
    if(editingNow){ return; }
    var incomingUsage = payload.apiUsage || {inputTokens:0, outputTokens:0};
    var changed = JSON.stringify(payload.days) !== JSON.stringify(state.days) || JSON.stringify(payload.food||[]) !== JSON.stringify(state.food) || JSON.stringify(payload.lodging||[]) !== JSON.stringify(state.lodging);
    state.days = payload.days;
    state.food = payload.food || [];
    state.lodging = payload.lodging || [];
    state.apiUsage = incomingUsage;
    if(changed || !silent) render();
    else if(changed) showToast("Aggiornato");
  }

  async function saveData(forceOverwrite){
    if(STORAGE_MODE === 'local' || STORAGE_MODE === 'unconfigured'){
      var payloadLocal = {days:state.days, food:state.food, lodging:state.lodging};
      var ok = localSet(payloadLocal);
      if(!ok) showToast("Errore nel salvataggio sul telefono");
      return;
    }
    if(STORAGE_MODE === 'remote'){
      localSet({days:state.days, food:state.food, lodging:state.lodging, apiUsage:state.apiUsage});

      if(saveInFlight){
        saveQueued = true;
        return;
      }
      saveInFlight = true;
      try{
        if(typeof navigator !== 'undefined' && navigator.onLine === false){
          state.pendingSync = true;
          markOffline();
          return;
        }
        try{
          if(forceOverwrite){
            var full = {days:state.days, food:state.food, lodging:state.lodging, apiUsage:state.apiUsage};
            await remoteSet(full);
            state.days = full.days; state.food = full.food; state.lodging = full.lodging; state.apiUsage = full.apiUsage;
          } else {
            var remote = await remoteGet();
            var merged = mergeForSave(remote.days, remote.food, remote.lodging, remote.apiUsage);
            await remoteSet(merged);
            state.days = merged.days;
            state.food = merged.food;
            state.lodging = merged.lodging;
            state.apiUsage = merged.apiUsage;
            localSet(merged);
          }
          clearDirty();
          pendingUsageDelta = {inputTokens:0, outputTokens:0};
          saveUsageDeltaToDisk();
          state.pendingSync = false;
          if(state.offline){ state.offline = false; }
          render();
        }catch(e){
          if(e && e.isSizeLimit){
            showToast("Spazio condiviso pieno (100KB): rimuovi qualche tappa e riprova");
          } else {
            state.pendingSync = true;
            markOffline();
            clearTimeout(offlineRetryTimer);
            offlineRetryTimer = setTimeout(function(){ if(state.pendingSync) saveData(); }, 15000);
          }
        }
      } finally {
        saveInFlight = false;
        if(saveQueued){
          saveQueued = false;
          saveData();
        }
      }
      return;
    }
    var payloadCloud = {days:state.days, food:state.food, lodging:state.lodging, apiUsage:state.apiUsage};
    try{
      await window.storage.set(STORAGE_KEY, JSON.stringify(payloadCloud), true);
      clearDirty();
    }catch(e){
      showToast("Errore nel salvataggio, riprova");
    }
  }

  function findItem(dayIdx,itemId){
    var day = state.days[dayIdx];
    for(var i=0;i<day.items.length;i++){ if(day.items[i].id===itemId) return {day:day,item:day.items[i],idx:i}; }
    return null;
  }
  function findFood(id){
    for(var i=0;i<state.food.length;i++){ if(state.food[i].id===id) return {item:state.food[i], idx:i}; }
    return null;
  }
  function findLodging(id){
    for(var i=0;i<state.lodging.length;i++){ if(state.lodging[i].id===id) return {item:state.lodging[i], idx:i}; }
    return null;
  }

  // Apre automaticamente il giorno corrispondente alla data di oggi in
  // Giappone, se rientra nel periodo del viaggio. Solo la prima volta.
  // Calcola sempre l'ora del Giappone esplicitamente (Asia/Tokyo), non quella
  // impostata sul telefono: così funziona anche se il fuso orario del
  // dispositivo non si è ancora aggiornato da solo dopo l'atterraggio.
  function todayInJapan(){
    try{
      var fmt = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit'});
      var obj = {};
      fmt.formatToParts(new Date()).forEach(function(p){ obj[p.type] = p.value; });
      return {year:obj.year, month:obj.month, day:obj.day};
    }catch(e){
      // fallback per browser molto vecchi senza supporto timeZone: usa l'ora locale del telefono
      var now = new Date();
      return {year:String(now.getFullYear()), month:String(now.getMonth()+1).padStart(2,'0'), day:String(now.getDate()).padStart(2,'0')};
    }
  }
  function openTodayIfInRange(){
    if(state.todayOpened) return;
    state.todayOpened = true;
    var today = todayInJapan();
    if(today.year !== TRIP_YEAR) return;
    var todayStr = today.day+'/'+today.month;
    var idx = state.days.findIndex(function(d){ return d.date === todayStr; });
    if(idx !== -1) state.openDay = idx;
  }

  function render(){
    var a = root();
    openTodayIfInRange();
    loadAllWeather();
    loadCurrencyRate();

    var pillsHtml = state.days.map(function(d,i){
      return '<button class="jg-pill'+(i===state.openDay?' active':'')+'" data-pill="'+i+'">'+d.date+'<b>'+d.city.split(' ')[0].split('→')[0].trim()+'</b></button>';
    }).join('');

    var daysHtml = state.days.map(function(d,di){
      var open = di === state.openDay;
      var itemsHtml = d.items.map(function(it){
        return renderItem(di,it);
      }).join('');
      return (
        '<div class="jg-day'+(open?' open':'')+'" data-day="'+di+'">'+
          '<button class="jg-day-head" data-daytoggle="'+di+'">'+
            '<div class="jg-date">'+d.date+'<span>'+escapeHtml(d.wd)+'</span></div>'+
            '<div class="jg-day-info"><p class="jg-city">'+escapeHtml(d.city)+'</p>'+
              '<p class="jg-count">'+d.items.length+' tapp'+(d.items.length===1?'a':'e')+'</p></div>'+
            renderWeatherBadge(d)+
            '<span class="jg-chev">&#8250;</span>'+
          '</button>'+
          '<div class="jg-items"><div class="jg-rail">'+itemsHtml+'</div>'+
            (d.routes && d.routes.length ? d.routes.map(function(r){
              return '<a class="jg-dayroute" href="'+r.url+'" target="_blank" rel="noopener">🗺️ '+escapeHtml(r.label||'Itinerario completo del giorno')+(r.note?'<span>'+escapeHtml(r.note)+'</span>':'')+'</a>';
            }).join('') : '')+
            (function(){
              var dyn = buildDynamicRoute(d);
              return dyn ? '<a class="jg-dayroute dynamic" href="'+dyn+'" target="_blank" rel="noopener">🗺️ Itinerario aggiornato<span>calcolato dalle tappe di oggi — include anche quelle aggiunte da voi</span></a>' : '';
            })()+
            '<button class="jg-add" data-addto="'+di+'">+ aggiungi tappa</button>'+
          '</div>'+
        '</div>'
      );
    }).join('');

    var bytesUsed = currentPayloadBytes();
    var bytesPct = Math.min(100, Math.round(bytesUsed / JSONBIN_LIMIT_BYTES * 100));
    var sizeClass = bytesPct >= 100 ? 'over' : (bytesPct >= 80 ? 'warn' : '');

    var tabsHtml =
      '<div class="jg-tabs">'+
        '<button class="jg-tab'+(state.activeTab==='itinerario'?' active':'')+'" data-tab="itinerario">Itinerario</button>'+
        '<button class="jg-tab'+(state.activeTab==='cibo'?' active':'')+'" data-tab="cibo">Cibo</button>'+
        '<button class="jg-tab'+(state.activeTab==='info'?' active':'')+'" data-tab="info">Info utili</button>'+
        '<button class="jg-tab'+(state.activeTab==='virtualgiu'?' active':'')+'" data-tab="virtualgiu">Virtual Giu</button>'+
      '</div>';

    var bodyHtml = '';
    if(state.activeTab === 'itinerario'){
      bodyHtml =
        '<div class="jg-pills">'+pillsHtml+'</div>'+
        '<div class="jg-toolbar">'+
          '<button class="jg-toolbtn" id="jg-export">&#11015; Salva backup</button>'+
          '<button class="jg-toolbtn ghost" id="jg-import-btn">&#11014; Ripristina da file</button>'+
          '<input type="file" accept="application/json" class="jg-photo-input" id="jg-import-input">'+
        '</div>'+
        '<div class="jg-jrpass'+(state.jrPassOpen?' open':'')+'" id="jg-jrpass">'+
          '<button class="jg-jrpass-head" id="jg-jrpass-toggle">🎫 JR Pass attivo dal '+JR_PASS.validFrom+' al '+JR_PASS.validTo+'<span class="jg-chev">&#8250;</span></button>'+
          '<div class="jg-jrpass-body">'+
            '<p>Incluse nel pass</p><ul>'+JR_PASS.covered.map(function(t){return '<li>'+escapeHtml(t)+'</li>';}).join('')+'</ul>'+
            '<p>Da pagare a parte</p><ul>'+JR_PASS.notCovered.map(function(t){return '<li>'+escapeHtml(t)+'</li>';}).join('')+'</ul>'+
          '</div>'+
        '</div>'+
        '<div class="jg-legend">'+
          '<p>⚪ Tocca il cerchio a sinistra di ogni tappa per segnare se l\'avete vista o meno.</p>'+
          '<p>★ Segna le tappe considerate imperdibili nel programma originale.</p>'+
          '<p>🗺️ Tocca mappa per vedere come arrivarci.</p>'+
          '<p>🚌 In blu le tappe che indicano uno spostamento con i mezzi.</p>'+
        '</div>'+
        '<div class="jg-body">'+daysHtml+'</div>';
    } else if(state.activeTab === 'cibo'){
      bodyHtml = renderFoodTab();
    } else if(state.activeTab === 'virtualgiu'){
      bodyHtml = renderChatTab();
    } else {
      bodyHtml = renderInfoTab();
    }

    a.innerHTML =
      '<div class="jg-header">'+
        HERO_SVG+
        '<div class="jg-header-content">'+
        '<p class="jg-eyebrow">13 – 25 settembre</p>'+
        '<p class="jg-title">Giappone</p>'+
        '<p class="jg-sub">Kyoto · Nara · Kanazawa · Takayama · Matsumoto · Tokyo</p>'+
        '<div class="jg-sync"><span class="jg-dot'+((STORAGE_MODE==='remote'||STORAGE_MODE==='cloud')&&state.offline?' offline':'')+'"></span>'+(
          (STORAGE_MODE==='remote'||STORAGE_MODE==='cloud') && state.offline ? (state.pendingSync ? '📴 offline — modifiche in attesa di rete' : '📴 offline — mostro l\'ultima versione salvata')
          : STORAGE_MODE==='cloud' ? 'sincronizzato<button class="jg-refresh" id="jg-refresh-btn">aggiorna</button>'
          : STORAGE_MODE==='remote' ? 'sincronizzato tra i telefoni<button class="jg-refresh" id="jg-refresh-btn">aggiorna</button>'
          : 'modalità locale su questo telefono — usa i pulsanti di backup per sincronizzare'
        )+'</div>'+
        (STORAGE_MODE!=='cloud' && STORAGE_MODE!=='remote' ?
          '<button id="jg-diag-toggle" style="background:none;border:none;color:#8FA3B5;font-size:10.5px;text-decoration:underline;padding:2px 0 0;">perché non è sincronizzato?</button>'+
          '<div id="jg-diag-body" style="display:'+(state.diagOpen?'block':'none')+';margin-top:6px;font-size:11px;color:#EAEEF2;background:rgba(0,0,0,0.25);padding:8px 10px;border-radius:6px;line-height:1.6;">'+
            'config.js caricato: <b>'+(typeof REMOTE_BLOB_ID !== 'undefined' ? 'sì' : 'NO — il file non è stato trovato dal browser')+'</b><br>'+
            'REMOTE_BLOB_ID: <b>'+(ACTIVE_BLOB_ID ? escapeHtml(ACTIVE_BLOB_ID) : '(vuoto)')+'</b><br>'+
            'JSONBIN_MASTER_KEY: <b>'+(ACTIVE_MASTER_KEY ? 'impostata (' + ACTIVE_MASTER_KEY.length + ' caratteri)' : '(vuota)')+'</b><br>'+
            'Modalità attuale: <b>'+STORAGE_MODE+'</b>'+
          '</div>' : '')+
        (STORAGE_MODE==='remote' ? '<div class="jg-space'+(sizeClass?' '+sizeClass:'')+'">📦 '+(bytesUsed/1024).toFixed(1)+' KB / 100 KB usati su jsonbin ('+bytesPct+'%)</div>' : '')+
        '</div>'+
        '<button class="jg-mapbox" id="jg-map-thumb" aria-label="Apri mappa itinerario">&#128506;</button>'+
      '</div>'+
      tabsHtml+
      bodyHtml+
      '<div class="jg-toast"></div>'+
      '<div class="jg-confirm" id="jg-confirm"><div class="jg-confirm-box">'+
        '<p class="jg-confirm-title" id="jg-confirm-title"></p>'+
        '<div class="jg-confirm-actions">'+
          '<button class="jg-confirm-btn seen" data-setstatus="seen">&#10003; Sì, l\'abbiamo vista</button>'+
          '<button class="jg-confirm-btn skipped" data-setstatus="skipped">&#10007; No, non l\'abbiamo vista</button>'+
          '<button class="jg-confirm-btn clear" data-setstatus="">Annulla segnalazione</button>'+
        '</div>'+
      '</div></div>';

    bindEvents();
  }

  // ============================== VIRTUAL GIU ==============================
  // Chat con Claude tramite una funzione server (la chiave resta lì, mai nel
  // browser). La cronologia NON viene mai sincronizzata su jsonbin: resta solo
  // su questo telefono, senza un limite di dimensione (tanto non pesa sullo
  // spazio condiviso). Il taglio dei messaggi più vecchi scatta solo come
  // ripiego se il telefono stesso esaurisse lo spazio di archiviazione locale.
  var CHAT_KEY = STORAGE_KEY + "_chat";
  var chatLog = [];       // [{role:'user'|'assistant', text, ts}]
  var chatBusy = false;
  var chatVoiceEnabled = true; // se true, le risposte vengono anche lette ad alta voce
  var speechRecognizer = null;
  var speechListening = false;

  // --- consumo Virtual Giu, mostrato solo come barra (mai in soldi) ---
  // Il totale condiviso vive nel bin come tutto il resto; teniamo un "delta"
  // locale (quanto abbiamo aggiunto noi dall'ultima sincronizzazione riuscita)
  // così due domande fatte quasi insieme da telefoni diversi si SOMMANO
  // invece che una cancellare l'altra.
  var USAGE_DELTA_KEY = STORAGE_KEY + "_usagedelta";
  var pendingUsageDelta = {inputTokens:0, outputTokens:0};
  var API_BUDGET_USD = (typeof API_BUDGET_USD_CONFIG !== 'undefined') ? API_BUDGET_USD_CONFIG : 5;
  var PRICE_INPUT_PER_M = 3;   // $ ogni milione di token in ingresso (Sonnet 4.6)
  var PRICE_OUTPUT_PER_M = 15; // $ ogni milione di token in uscita

  function loadUsageDeltaFromDisk(){
    try{
      var raw = window.localStorage.getItem(USAGE_DELTA_KEY);
      pendingUsageDelta = raw ? JSON.parse(raw) : {inputTokens:0, outputTokens:0};
    }catch(e){ pendingUsageDelta = {inputTokens:0, outputTokens:0}; }
  }
  function saveUsageDeltaToDisk(){
    try{ window.localStorage.setItem(USAGE_DELTA_KEY, JSON.stringify(pendingUsageDelta)); }catch(e){}
  }
  function addUsage(inputTokens, outputTokens){
    inputTokens = inputTokens||0; outputTokens = outputTokens||0;
    state.apiUsage.inputTokens += inputTokens;
    state.apiUsage.outputTokens += outputTokens;
    pendingUsageDelta.inputTokens += inputTokens;
    pendingUsageDelta.outputTokens += outputTokens;
    saveUsageDeltaToDisk();
    saveData();
  }
  function usagePercent(){
    var cost = (state.apiUsage.inputTokens/1000000*PRICE_INPUT_PER_M) + (state.apiUsage.outputTokens/1000000*PRICE_OUTPUT_PER_M);
    return Math.max(0, Math.min(100, Math.round(cost/API_BUDGET_USD*100)));
  }

  function loadChatFromDisk(){
    try{
      var raw = window.localStorage.getItem(CHAT_KEY);
      chatLog = raw ? JSON.parse(raw) : [];
    }catch(e){ chatLog = []; }
  }
  function saveChatToDisk(){
    try{
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(chatLog));
    }catch(e){
      // spazio locale esaurito: come ultima spiaggia, tolgo i messaggi più
      // vecchi finché non torna a starci.
      while(chatLog.length > 1){
        chatLog.shift();
        try{ window.localStorage.setItem(CHAT_KEY, JSON.stringify(chatLog)); break; }catch(e2){}
      }
    }
  }
  function pushChatMessage(role, text){
    chatLog.push({role:role, text:text, ts:Date.now()});
    saveChatToDisk();
  }

  function speak(text){
    if(!chatVoiceEnabled) return;
    try{
      if(!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel(); // interrompe una lettura precedente ancora in corso
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      window.speechSynthesis.speak(u);
    }catch(e){}
  }

  function speechSupported(){
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  function startListening(onResult, onEnd){
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!Recognition) return false;
    try{
      speechRecognizer = new Recognition();
      speechRecognizer.lang = 'it-IT';
      speechRecognizer.interimResults = false;
      speechRecognizer.maxAlternatives = 1;
      speechRecognizer.onresult = function(e){
        var text = e.results[0][0].transcript;
        onResult(text);
      };
      speechRecognizer.onerror = function(){ speechListening = false; if(onEnd) onEnd(); };
      speechRecognizer.onend = function(){ speechListening = false; if(onEnd) onEnd(); };
      speechRecognizer.start();
      speechListening = true;
      return true;
    }catch(e){ return false; }
  }
  function stopListening(){
    if(speechRecognizer && speechListening){ try{ speechRecognizer.stop(); }catch(e){} }
    speechListening = false;
  }

  async function askBackend(text){
    var res = await fetch('/.netlify/functions/ask', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        message:text, days:state.days, food:state.food, lodging:state.lodging,
        usefulInfo: {
          emergency: USEFUL_INFO.emergency,
          phraseGroups: USEFUL_INFO.phraseGroups,
          currencyRateJpyPerEur: getCurrencyRate()
        }
      })
    });
    var data = await res.json().catch(function(){ return null; });
    return {ok: res.ok && data && data.answer, status: res.status, data: data};
  }

  async function sendChatMessage(text){
    text = (text||'').trim();
    if(!text || chatBusy) return;
    pushChatMessage('user', text);
    chatBusy = true;
    render();
    try{
      var result = await askBackend(text);
      if(!result.ok){
        // un blip transitorio (rete, cold start della funzione) capita ogni tanto:
        // un solo ritentativo silenzioso prima di mostrare davvero un errore.
        await new Promise(function(r){ setTimeout(r, 1200); });
        result = await askBackend(text);
      }
      if(!result.ok){
        var d = result.data;
        var errMsg = (d && d.error) ? d.error : ("Errore "+result.status);
        if(d && d.detail) errMsg += " — " + d.detail;
        pushChatMessage('assistant', "Non sono riuscito a rispondere: "+errMsg);
      } else {
        pushChatMessage('assistant', result.data.answer);
        speak(result.data.answer);
        if(result.data.usage) addUsage(result.data.usage.inputTokens, result.data.usage.outputTokens);
      }
    }catch(e){
      pushChatMessage('assistant', "Connessione non riuscita. Controlla la rete e riprova.");
    }
    chatBusy = false;
    render();
  }

  function renderChatTab(){
    var supportsVoiceIn = speechSupported();
    var pct = usagePercent();
    var pctClass = pct >= 90 ? 'over' : (pct >= 65 ? 'warn' : '');
    var bubbles = chatLog.map(function(m){
      return '<div class="jg-chat-msg '+(m.role==='user'?'user':'assistant')+'">'+
        '<p>'+escapeHtml(m.text)+'</p>'+
      '</div>';
    }).join('');
    return (
      '<div class="jg-chat">'+
        '<div class="jg-chat-intro">'+
          '<p><b>Virtual Giu</b> risponde usando il vostro itinerario reale. Le conversazioni restano solo su questo telefono, non vengono salvate online.</p>'+
        '</div>'+
        '<div class="jg-usagebar-wrap">'+
          '<div class="jg-usagebar"><div class="jg-usagebar-fill '+pctClass+'" style="width:'+pct+'%;"></div></div>'+
          '<p class="jg-usagebar-label">Quanto avete usato Virtual Giu finora</p>'+
        '</div>'+
        '<div class="jg-chat-log" id="jg-chat-log">'+
          (chatLog.length ? bubbles : '<p class="jg-food-empty">Scrivi o registra un messaggio per iniziare.</p>')+
          (chatBusy ? '<div class="jg-chat-msg assistant"><p class="jg-chat-typing">Virtual Giu sta scrivendo…</p></div>' : '')+
        '</div>'+
        '<div class="jg-chat-inputrow">'+
          '<label class="jg-chat-voice-toggle"><input type="checkbox" id="jg-chat-voiceout" '+(chatVoiceEnabled?'checked':'')+'> leggi le risposte ad alta voce</label>'+
        '</div>'+
        '<div class="jg-chat-inputrow">'+
          '<input type="text" id="jg-chat-input" placeholder="Scrivi un messaggio…" autocomplete="off">'+
          (supportsVoiceIn ? '<button class="jg-chat-mic" id="jg-chat-mic" aria-label="Registra messaggio vocale">🎤</button>' : '')+
          '<button class="jg-chat-send" id="jg-chat-send" aria-label="Invia">&#10148;</button>'+
        '</div>'+
        (!supportsVoiceIn ? '<p class="jg-chat-note">Il tuo browser non supporta l\'invio vocale (capita spesso su iPhone/Safari): puoi comunque scrivere, e la risposta ti verrà letta ad alta voce.</p>' : '')+
      '</div>'
    );
  }


  function renderFoodTab(){
    var list = state.food.map(function(f){ return renderFoodItem(f); }).join('');
    return (
      '<div class="jg-food">'+
        (state.food.length===0 ? '<p class="jg-food-empty">Ancora nessun consiglio. Aggiungine uno con il pulsante qui sotto.</p>' : '<div class="jg-rail">'+list+'</div>')+
        '<button class="jg-add" id="jg-food-add">+ aggiungi consiglio</button>'+
      '</div>'
    );
  }
  function renderFoodItem(f){
    var isEditing = editingNow && editingNow.food === f.id;
    var titleHtml = f.website
      ? '<a class="jg-name jg-name-link" href="'+escapeHtml(f.website)+'" target="_blank" rel="noopener">'+escapeHtml(f.title)+' &#8599;</a>'
      : '<p class="jg-name">'+escapeHtml(f.title)+'</p>';
    var body =
      '<div class="jg-row">'+
        '<div class="jg-main">'+
          (f.zone ? '<p class="jg-time">'+escapeHtml(f.zone)+'</p>' : '')+
          titleHtml+
          (f.note ? '<p class="jg-note">'+escapeHtml(f.note)+'</p>' : '')+
          (f.link ? '<a class="jg-link" href="'+escapeHtml(f.link)+'" target="_blank" rel="noopener">mappa &#8599;</a>' : '')+
        '</div>'+
        '<button class="jg-edit-toggle" data-fedit="'+f.id+'">'+(isEditing?'chiudi':'modifica')+'</button>'+
      '</div>';
    if(isEditing){
      body += (
        '<div class="jg-form">'+
          '<label>Nome del posto</label><input type="text" data-ff="title" value="'+escapeHtml(f.title)+'">'+
          '<label>Zona / giorno (opzionale)</label><input type="text" data-ff="zone" value="'+escapeHtml(f.zone||"")+'" placeholder="es. Kyoto, 15/09">'+
          '<label>Perché lo consigli</label><input type="text" data-ff="note" value="'+escapeHtml(f.note||"")+'" placeholder="Nota libera">'+
          '<label>Sito del locale (opzionale — il nome diventa un link)</label><input type="text" data-ff="website" value="'+escapeHtml(f.website||"")+'" placeholder="https://…">'+
          '<label>Link mappa (opzionale)</label><input type="text" data-ff="link" value="'+escapeHtml(f.link||"")+'" placeholder="https://…">'+
          '<div class="jg-form-actions">'+
            '<button class="jg-btn jg-btn-primary" data-fsave="'+f.id+'">Salva</button>'+
            '<button class="jg-btn" data-fcancel="'+f.id+'">Annulla</button>'+
            '<button class="jg-btn-danger" data-fdelete="'+f.id+'">Elimina</button>'+
          '</div>'+
        '</div>'
      );
    }
    return '<div class="jg-item" data-fooditem="'+f.id+'">'+body+'</div>';
  }

  // ============================== INFO UTILI ==============================
  function renderLodgingList(){
    if(!state.lodging.length) return '<p class="jg-info-empty">Nessun alloggio inserito ancora.</p>';
    return '<div class="jg-rail">'+state.lodging.map(renderLodgingItem).join('')+'</div>';
  }
  function renderLodgingItem(l){
    var isEditing = editingNow && editingNow.lodging === l.id;
    var body =
      '<div class="jg-row">'+
        '<div class="jg-main">'+
          (l.note ? '<p class="jg-time">'+escapeHtml(l.note)+'</p>' : '')+
          '<p class="jg-name">'+escapeHtml(l.title)+'</p>'+
          (l.address ? '<p class="jg-note">'+escapeHtml(l.address)+'</p>' : '')+
          (l.phone ? '<p class="jg-note"><b>Tel.</b> '+escapeHtml(l.phone)+'</p>' : '')+
          (l.link ? '<a class="jg-link" href="'+escapeHtml(l.link)+'" target="_blank" rel="noopener">mappa &#8599;</a>' : '')+
        '</div>'+
        '<button class="jg-edit-toggle" data-ledit="'+l.id+'">'+(isEditing?'chiudi':'modifica')+'</button>'+
      '</div>';
    if(isEditing){
      body += (
        '<div class="jg-form">'+
          '<label>Nome hotel/ryokan</label><input type="text" data-lf="title" value="'+escapeHtml(l.title)+'">'+
          '<label>Indirizzo</label><input type="text" data-lf="address" value="'+escapeHtml(l.address||"")+'" placeholder="Via, città, CAP">'+
          '<label>Telefono</label><input type="text" data-lf="phone" value="'+escapeHtml(l.phone||"")+'" placeholder="+81 …">'+
          '<label>Città / date (opzionale)</label><input type="text" data-lf="note" value="'+escapeHtml(l.note||"")+'" placeholder="es. Kyoto · 14–16/09">'+
          '<label>Link mappa (opzionale)</label><input type="text" data-lf="link" value="'+escapeHtml(l.link||"")+'" placeholder="https://…">'+
          '<div class="jg-form-actions">'+
            '<button class="jg-btn jg-btn-primary" data-lsave="'+l.id+'">Salva</button>'+
            '<button class="jg-btn" data-lcancel="'+l.id+'">Annulla</button>'+
            '<button class="jg-btn-danger" data-ldelete="'+l.id+'">Elimina</button>'+
          '</div>'+
        '</div>'
      );
    }
    return '<div class="jg-item" data-lodgingitem="'+l.id+'">'+body+'</div>';
  }

  function renderInfoTab(){
    var rate = getCurrencyRate();
    var rateIsLive = currencyRate !== null;

    function collapsible(key, icon, title, bodyHtml, extraClass){
      var open = !!state.openInfoCards[key];
      return (
        '<div class="jg-info-card jg-info-collapsible'+(open?' open':'')+(extraClass?' '+extraClass:'')+'">'+
          '<button class="jg-info-collapse-head" data-infocard="'+key+'">'+icon+' '+title+
            '<span class="jg-chev">&#8250;</span>'+
          '</button>'+
          '<div class="jg-info-collapse-body">'+bodyHtml+'</div>'+
        '</div>'
      );
    }

    return (
      '<div class="jg-info">'+
        '<div class="jg-info-card">'+
          '<p class="jg-info-title">💴 Cambio veloce</p>'+
          '<p class="jg-info-empty">1€ ≈ '+rate.toFixed(2)+'¥ — '+(rateIsLive ? 'aggiornato ora' : 'stima, verifica quello del giorno')+'.</p>'+
          '<div class="jg-conv-row">'+
            '<input type="number" id="jg-conv-eur" placeholder="Euro" style="width:100%;padding:8px 10px;border:0.5px solid var(--line);border-radius:6px;font-size:13px;">'+
            '<span>=</span>'+
            '<input type="number" id="jg-conv-jpy" placeholder="Yen" style="width:100%;padding:8px 10px;border:0.5px solid var(--line);border-radius:6px;font-size:13px;">'+
          '</div>'+
        '</div>'+
        collapsible('emergenze', '🚨', 'Emergenze',
          USEFUL_INFO.emergency.map(function(e){
            return '<p class="jg-info-row"><b>'+escapeHtml(e.label)+'</b><span>'+escapeHtml(e.value)+'</span>'+(e.note?'<i>'+escapeHtml(e.note)+'</i>':'')+'</p>';
          }).join(''),
          'danger'
        )+
        collapsible('alloggi', '🏨', 'Alloggi del viaggio',
          renderLodgingList()+
          '<button class="jg-add" id="jg-lodging-add" style="margin-top:8px;">+ aggiungi alloggio</button>'
        )+
        collapsible('frasi', '💬', 'Frasi utili',
          USEFUL_INFO.phraseGroups.map(function(g, gi){
            var open = !!state.openPhraseCats[g.category];
            return (
              '<div class="jg-phrasecat'+(open?' open':'')+'">'+
                '<button class="jg-phrasecat-head" data-phrasecat="'+escapeHtml(g.category)+'">'+escapeHtml(g.category)+
                  '<span class="jg-count">'+g.items.length+'</span><span class="jg-chev">&#8250;</span>'+
                '</button>'+
                '<div class="jg-phrasecat-body">'+
                  g.items.map(function(p){
                    return '<p class="jg-info-row"><b>'+escapeHtml(p.jp)+'</b><span>'+escapeHtml(p.it)+'</span></p>';
                  }).join('')+
                '</div>'+
              '</div>'
            );
          }).join('')
        )+
      '</div>'
    );
  }

  function renderItem(dayIdx, it){
    var isEditing = editingNow && editingNow.dayIdx===dayIdx && editingNow.itemId===it.id;
    var link = it.link || mapsLink(it.title, state.days[dayIdx].city);
    var body =
      '<div class="jg-row">'+
        '<button class="jg-stamp'+(it.status?' '+it.status:'')+'" data-stamp="'+dayIdx+'|'+it.id+'" aria-label="Segna se hai visto questa tappa"></button>'+
        '<div class="jg-main">'+
          (it.time? '<p class="jg-time">'+escapeHtml(it.time)+'</p>' : '')+
          '<p class="jg-name">'+(it.top?'<span class="jg-star">&#9733;</span>':'')+escapeHtml(it.title)+(it.status==='skipped'?'<span class="jg-skiptag">non visto</span>':'')+'</p>'+
          (it.note? '<p class="jg-note">'+escapeHtml(it.note)+'</p>' : '')+
          '<a class="jg-link" href="'+link+'" target="_blank" rel="noopener">mappa &#8599;</a>'+
        '</div>'+
        '<button class="jg-edit-toggle" data-edit="'+dayIdx+'|'+it.id+'">'+(isEditing?'chiudi':'modifica')+'</button>'+
      '</div>';

    if(isEditing){
      var otherDays = state.days.map(function(d,i){return '<option value="'+i+'"'+(i===dayIdx?' selected':'')+'>'+d.date+' — '+escapeHtml(d.city)+'</option>';}).join('');
      body += (
        '<div class="jg-form">'+
          '<label>Titolo</label><input type="text" data-f="title" value="'+escapeHtml(it.title)+'">'+
          '<div class="jg-form-row">'+
            '<div><label>Orario</label><input type="text" data-f="time" value="'+escapeHtml(it.time)+'" placeholder="09:00"></div>'+
            '<div><label>Sposta al giorno</label>'+
              '<select data-f="moveto" style="width:100%;padding:7px 8px;border:0.5px solid var(--line);border-radius:6px;background:#fff;font-size:13px;">'+otherDays+'</select>'+
            '</div>'+
          '</div>'+
          '<label>Note</label><input type="text" data-f="note" value="'+escapeHtml(it.note)+'" placeholder="Note libere">'+
          '<label>Link (mappa o sito, opzionale)</label><input type="text" data-f="link" value="'+escapeHtml(it.link)+'" placeholder="https://…">'+
          '<label class="jg-check"><input type="checkbox" data-f="top" '+(it.top?'checked':'')+'> Segna come imperdibile</label>'+
          '<div class="jg-form-actions">'+
            '<button class="jg-btn jg-btn-primary" data-save="'+dayIdx+'|'+it.id+'">Salva</button>'+
            '<button class="jg-btn" data-canceledit="'+dayIdx+'|'+it.id+'">Annulla</button>'+
            '<button class="jg-btn-danger" data-delete="'+dayIdx+'|'+it.id+'">Elimina</button>'+
          '</div>'+
        '</div>'
      );
    }

    return '<div class="jg-item'+(it.status?' '+it.status:'')+(it.top?' top':'')+(it.transport?' transport':'')+'" data-item="'+it.id+'">'+body+'</div>';
  }

  function bindEvents(){
    var a = root();

    a.querySelectorAll('[data-tab]').forEach(function(el){
      el.addEventListener('click', function(){
        state.activeTab = el.getAttribute('data-tab');
        editingNow = null;
        render();
      });
    });

    a.querySelectorAll('[data-pill]').forEach(function(el){
      el.addEventListener('click', function(){
        state.openDay = parseInt(el.getAttribute('data-pill'),10);
        render();
        var d = a.querySelector('.jg-day.open');
        if(d) d.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
    a.querySelectorAll('[data-daytoggle]').forEach(function(el){
      el.addEventListener('click', function(){
        var i = parseInt(el.getAttribute('data-daytoggle'),10);
        state.openDay = (state.openDay===i)? -1 : i;
        render();
      });
    });
    a.querySelectorAll('[data-stamp]').forEach(function(el){
      el.addEventListener('click', function(){
        var key = el.getAttribute('data-stamp');
        var parts = key.split('|');
        var f = findItem(parseInt(parts[0],10), parts[1]);
        if(!f) return;
        pendingStampKey = key;
        var cf = document.getElementById('jg-confirm');
        document.getElementById('jg-confirm-title').textContent = 'Avete visto "'+f.item.title+'"?';
        cf.classList.add('open');
      });
    });
    a.querySelectorAll('[data-edit]').forEach(function(el){
      el.addEventListener('click', function(){
        var parts = el.getAttribute('data-edit').split('|');
        var dayIdx = parseInt(parts[0],10), itemId = parts[1];
        if(editingNow && editingNow.dayIdx===dayIdx && editingNow.itemId===itemId){
          editingNow = null;
        } else {
          editingNow = {dayIdx:dayIdx, itemId:itemId};
        }
        render();
      });
    });
    a.querySelectorAll('[data-canceledit]').forEach(function(el){
      el.addEventListener('click', function(){ editingNow = null; render(); });
    });
    a.querySelectorAll('[data-save]').forEach(function(el){
      el.addEventListener('click', async function(){
        var parts = el.getAttribute('data-save').split('|');
        var dayIdx = parseInt(parts[0],10), itemId = parts[1];
        var f = findItem(dayIdx, itemId);
        if(!f) return;
        var form = el.closest('.jg-form');
        var title = form.querySelector('[data-f=title]').value.trim();
        if(!title){ showToast("Serve almeno un titolo"); return; }
        f.item.title = title;
        f.item.time = form.querySelector('[data-f=time]').value.trim();
        f.item.note = form.querySelector('[data-f=note]').value.trim();
        f.item.link = form.querySelector('[data-f=link]').value.trim();
        f.item.top = form.querySelector('[data-f=top]').checked;
        var moveTo = parseInt(form.querySelector('[data-f=moveto]').value,10);
        if(moveTo !== dayIdx){
          f.day.items.splice(f.idx,1);
          state.days[moveTo].items.push(f.item);
          state.openDay = moveTo;
        }
        sortDayItems(state.days[moveTo]);
        markDirty(itemId);
        editingNow = null;
        render();
        await saveData();
        showToast("Salvato");
      });
    });
    a.querySelectorAll('[data-delete]').forEach(function(el){
      el.addEventListener('click', async function(){
        var parts = el.getAttribute('data-delete').split('|');
        var f = findItem(parseInt(parts[0],10), parts[1]);
        if(!f) return;
        f.day.items.splice(f.idx,1);
        markDeleted(parts[1]);
        editingNow = null;
        render();
        await saveData();
        showToast("Tappa eliminata");
      });
    });
    a.querySelectorAll('[data-addto]').forEach(function(el){
      el.addEventListener('click', async function(){
        var dayIdx = parseInt(el.getAttribute('data-addto'),10);
        var newItem = {id:uid(), time:"", title:"Nuova tappa", note:"", link:"", top:false, transport:false, status:""};
        state.days[dayIdx].items.push(newItem);
        markDirty(newItem.id);
        editingNow = {dayIdx:dayIdx, itemId:newItem.id};
        render();
        await saveData();
        var el2 = a.querySelector('[data-item="'+newItem.id+'"] input[data-f=title]');
        if(el2){ el2.focus(); el2.select(); }
      });
    });
    var rb = document.getElementById('jg-refresh-btn');
    if(rb) rb.addEventListener('click', function(){ loadData(false); showToast("Aggiornato"); });

    var jrToggle = document.getElementById('jg-jrpass-toggle');
    if(jrToggle) jrToggle.addEventListener('click', function(){
      state.jrPassOpen = !state.jrPassOpen;
      render();
    });

    a.querySelectorAll('[data-phrasecat]').forEach(function(el){
      el.addEventListener('click', function(){
        var cat = el.getAttribute('data-phrasecat');
        state.openPhraseCats[cat] = !state.openPhraseCats[cat];
        render();
      });
    });

    a.querySelectorAll('[data-infocard]').forEach(function(el){
      el.addEventListener('click', function(){
        var key = el.getAttribute('data-infocard');
        state.openInfoCards[key] = !state.openInfoCards[key];
        render();
      });
    });

    var diagToggle = document.getElementById('jg-diag-toggle');
    if(diagToggle) diagToggle.addEventListener('click', function(){
      state.diagOpen = !state.diagOpen;
      render();
    });

    var mapThumb = document.getElementById('jg-map-thumb');
    if(mapThumb) mapThumb.addEventListener('click', function(){
      window.open(MAP_ASSET_URL, '_blank', 'noopener');
    });

    var expBtn = document.getElementById('jg-export');
    var impBtn = document.getElementById('jg-import-btn');
    var impInput = document.getElementById('jg-import-input');
    if(expBtn) expBtn.addEventListener('click', exportBackup);
    if(impBtn) impBtn.addEventListener('click', function(){ impInput.click(); });
    if(impInput) impInput.addEventListener('change', function(){
      var file = impInput.files && impInput.files[0];
      if(file) importBackup(file);
      impInput.value = "";
    });

    var cf = document.getElementById('jg-confirm');
    a.querySelectorAll('[data-setstatus]').forEach(function(el){
      el.addEventListener('click', async function(){
        if(!pendingStampKey) { cf.classList.remove('open'); return; }
        var parts = pendingStampKey.split('|');
        var f = findItem(parseInt(parts[0],10), parts[1]);
        cf.classList.remove('open');
        if(!f){ pendingStampKey = null; return; }
        f.item.status = el.getAttribute('data-setstatus');
        markDirty(parts[1]);
        pendingStampKey = null;
        render();
        await saveData();
      });
    });
    if(cf) cf.addEventListener('click', function(e){ if(e.target===cf){ cf.classList.remove('open'); pendingStampKey = null; } });

    // --- cibo ---
    var foodAdd = document.getElementById('jg-food-add');
    if(foodAdd) foodAdd.addEventListener('click', async function(){
      var newFood = {id:uid(), title:"Nuovo consiglio", zone:"", note:"", website:"", link:""};
      state.food.push(newFood);
      markFoodDirty(newFood.id);
      editingNow = {food:newFood.id};
      render();
      await saveData();
      var el2 = a.querySelector('[data-fooditem="'+newFood.id+'"] input[data-ff=title]');
      if(el2){ el2.focus(); el2.select(); }
    });
    a.querySelectorAll('[data-fedit]').forEach(function(el){
      el.addEventListener('click', function(){
        var id = el.getAttribute('data-fedit');
        editingNow = (editingNow && editingNow.food===id) ? null : {food:id};
        render();
      });
    });
    a.querySelectorAll('[data-fcancel]').forEach(function(el){
      el.addEventListener('click', function(){ editingNow = null; render(); });
    });
    a.querySelectorAll('[data-fsave]').forEach(function(el){
      el.addEventListener('click', async function(){
        var id = el.getAttribute('data-fsave');
        var f = findFood(id);
        if(!f) return;
        var form = el.closest('.jg-form');
        var title = form.querySelector('[data-ff=title]').value.trim();
        if(!title){ showToast("Serve almeno un nome"); return; }
        f.item.title = title;
        f.item.zone = form.querySelector('[data-ff=zone]').value.trim();
        f.item.note = form.querySelector('[data-ff=note]').value.trim();
        f.item.website = form.querySelector('[data-ff=website]').value.trim();
        f.item.link = form.querySelector('[data-ff=link]').value.trim();
        markFoodDirty(id);
        editingNow = null;
        render();
        await saveData();
        showToast("Salvato");
      });
    });
    a.querySelectorAll('[data-fdelete]').forEach(function(el){
      el.addEventListener('click', async function(){
        var id = el.getAttribute('data-fdelete');
        var f = findFood(id);
        if(!f) return;
        state.food.splice(f.idx,1);
        markFoodDeleted(id);
        editingNow = null;
        render();
        await saveData();
        showToast("Consiglio eliminato");
      });
    });

    // --- alloggi ---
    var lodgingAdd = document.getElementById('jg-lodging-add');
    if(lodgingAdd) lodgingAdd.addEventListener('click', async function(){
      var newLodging = {id:uid(), title:"Nuovo alloggio", address:"", phone:"", note:"", link:""};
      state.lodging.push(newLodging);
      markLodgingDirty(newLodging.id);
      editingNow = {lodging:newLodging.id};
      render();
      await saveData();
      var el2 = a.querySelector('[data-lodgingitem="'+newLodging.id+'"] input[data-lf=title]');
      if(el2){ el2.focus(); el2.select(); }
    });
    a.querySelectorAll('[data-ledit]').forEach(function(el){
      el.addEventListener('click', function(){
        var id = el.getAttribute('data-ledit');
        editingNow = (editingNow && editingNow.lodging===id) ? null : {lodging:id};
        render();
      });
    });
    a.querySelectorAll('[data-lcancel]').forEach(function(el){
      el.addEventListener('click', function(){ editingNow = null; render(); });
    });
    a.querySelectorAll('[data-lsave]').forEach(function(el){
      el.addEventListener('click', async function(){
        var id = el.getAttribute('data-lsave');
        var l = findLodging(id);
        if(!l) return;
        var form = el.closest('.jg-form');
        var title = form.querySelector('[data-lf=title]').value.trim();
        if(!title){ showToast("Serve almeno un nome"); return; }
        l.item.title = title;
        l.item.address = form.querySelector('[data-lf=address]').value.trim();
        l.item.phone = form.querySelector('[data-lf=phone]').value.trim();
        l.item.note = form.querySelector('[data-lf=note]').value.trim();
        l.item.link = form.querySelector('[data-lf=link]').value.trim();
        markLodgingDirty(id);
        editingNow = null;
        render();
        await saveData();
        showToast("Salvato");
      });
    });
    a.querySelectorAll('[data-ldelete]').forEach(function(el){
      el.addEventListener('click', async function(){
        var id = el.getAttribute('data-ldelete');
        var l = findLodging(id);
        if(!l) return;
        state.lodging.splice(l.idx,1);
        markLodgingDeleted(id);
        editingNow = null;
        render();
        await saveData();
        showToast("Alloggio eliminato");
      });
    });

    // --- convertitore valuta ---
    var convEur = document.getElementById('jg-conv-eur');
    var convJpy = document.getElementById('jg-conv-jpy');
    if(convEur) convEur.addEventListener('input', function(){
      var v = parseFloat(convEur.value);
      if(convJpy) convJpy.value = isNaN(v) ? '' : Math.round(v * getCurrencyRate());
    });
    if(convJpy) convJpy.addEventListener('input', function(){
      var v = parseFloat(convJpy.value);
      if(convEur) convEur.value = isNaN(v) ? '' : (v / getCurrencyRate()).toFixed(2);
    });

    // --- Virtual Giu ---
    var chatLogEl = document.getElementById('jg-chat-log');
    if(chatLogEl) chatLogEl.scrollTop = chatLogEl.scrollHeight;

    var chatInput = document.getElementById('jg-chat-input');
    var chatSend = document.getElementById('jg-chat-send');
    var chatMic = document.getElementById('jg-chat-mic');
    var chatVoiceOut = document.getElementById('jg-chat-voiceout');

    function doSend(){
      if(!chatInput) return;
      var text = chatInput.value;
      chatInput.value = '';
      sendChatMessage(text);
    }
    if(chatSend) chatSend.addEventListener('click', doSend);
    if(chatInput) chatInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') doSend(); });
    if(chatVoiceOut) chatVoiceOut.addEventListener('change', function(){ chatVoiceEnabled = chatVoiceOut.checked; });
    if(chatMic) chatMic.addEventListener('click', function(){
      if(speechListening){ stopListening(); chatMic.classList.remove('listening'); return; }
      chatMic.classList.add('listening');
      var started = startListening(function(text){
        if(chatInput) chatInput.value = text;
        doSend();
      }, function(){
        chatMic.classList.remove('listening');
      });
      if(!started){
        chatMic.classList.remove('listening');
        showToast("Non sono riuscito ad attivare il microfono");
      }
    });
  }

  var GATE_PASSWORD = "Ale&Robi";

  var FOOD_SEED_KEY = STORAGE_KEY + "_foodseeded";
  function foodAlreadySeeded(){
    try{ return window.localStorage.getItem(FOOD_SEED_KEY) === '1'; }catch(e){ return false; }
  }
  function markFoodSeeded(){
    try{ window.localStorage.setItem(FOOD_SEED_KEY, '1'); }catch(e){}
  }
  // Se il bin condiviso (o la copia locale) esisteva già da prima con la
  // sezione cibo vuota, questa aggiunge una volta sola i consigli già pronti,
  // senza toccare eventuali consigli che voi due avete già aggiunto.
  async function maybeSeedFood(){
    if(foodAlreadySeeded()) return;
    markFoodSeeded();
    if(state.food && state.food.length > 0) return;
    var seed = defaultFood();
    if(!seed.length) return;
    state.food = seed;
    seed.forEach(function(f){ markFoodDirty(f.id); });
    render();
    await saveData();
  }

  var LODGING_SEED_KEY = STORAGE_KEY + "_lodgingseeded";
  function lodgingAlreadySeeded(){
    try{ return window.localStorage.getItem(LODGING_SEED_KEY) === '1'; }catch(e){ return false; }
  }
  function markLodgingSeeded(){
    try{ window.localStorage.setItem(LODGING_SEED_KEY, '1'); }catch(e){}
  }
  async function maybeSeedLodging(){
    if(lodgingAlreadySeeded()) return;
    markLodgingSeeded();
    if(state.lodging && state.lodging.length > 0) return;
    var seed = defaultLodging();
    if(!seed.length) return;
    state.lodging = seed;
    seed.forEach(function(l){ markLodgingDirty(l.id); });
    render();
    await saveData();
  }

  // Aggiunge il sito web ai consigli sul cibo già esistenti (creati prima
  // che questo campo esistesse), abbinando per nome. Non tocca nessun altro
  // campo e non ricrea/duplica nulla.
  var WEBSITE_BACKFILL_KEY = STORAGE_KEY + "_websitebackfill_v1";
  function websiteBackfillDone(){
    try{ return window.localStorage.getItem(WEBSITE_BACKFILL_KEY) === '1'; }catch(e){ return false; }
  }
  function markWebsiteBackfillDone(){
    try{ window.localStorage.setItem(WEBSITE_BACKFILL_KEY, '1'); }catch(e){}
  }
  async function maybeBackfillFoodWebsites(){
    if(websiteBackfillDone()) return;
    markWebsiteBackfillDone();
    var byTitle = {};
    defaultFood().forEach(function(d){ if(d.website) byTitle[d.title] = d.website; });
    var changed = false;
    state.food.forEach(function(f){
      if(!f.website && byTitle[f.title]){
        f.website = byTitle[f.title];
        markFoodDirty(f.id);
        changed = true;
      }
    });
    if(changed){ render(); await saveData(); }
  }

  async function startApp(){
    loadDirtyFromDisk();
    loadChatFromDisk();
    loadUsageDeltaFromDisk();
    await loadData(true);
    state.apiUsage.inputTokens += pendingUsageDelta.inputTokens;
    state.apiUsage.outputTokens += pendingUsageDelta.outputTokens;
    await maybeSeedFood();
    await maybeSeedLodging();
    await maybeBackfillFoodWebsites();
    if(STORAGE_MODE === 'cloud' || STORAGE_MODE === 'remote'){
      pollTimer = setInterval(function(){ loadData(true); }, 7000);
      window.addEventListener('focus', function(){ loadData(true); });
    }
  }

  function showSetupScreen(){
    var box = document.getElementById('loading');
    var needsKey = !ACTIVE_MASTER_KEY;

    if(needsKey){
      box.innerHTML =
        '<p style="font-size:26px;margin:0 0 6px;">🔑</p>'+
        '<p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#211E19;">Prima configurazione — passo 1 di 2</p>'+
        '<p style="font-size:12.5px;color:#8B8577;margin:0 0 14px;line-height:1.5;">Vai su <b>jsonbin.io</b>, crea un account gratuito, apri "API Keys" e copia la "X-Master-Key". Incollala qui sotto per provarla subito.</p>'+
        '<input type="text" id="jg-setup-key" placeholder="X-Master-Key" style="width:100%;max-width:280px;padding:10px 12px;border:0.5px solid #DED6C2;border-radius:8px;font-size:13px;margin-bottom:10px;box-sizing:border-box;">'+
        '<br>'+
        '<button id="jg-setup-btn" style="padding:9px 20px;border-radius:8px;border:none;background:#16283A;color:#F2EFE6;font-size:13px;font-weight:700;">Continua</button>'+
        '<button id="jg-setup-skip" style="display:block;margin:14px auto 0;background:none;border:none;color:#8B8577;font-size:11.5px;text-decoration:underline;">Continua solo su questo telefono</button>'+
        '<p id="jg-setup-error" style="display:none;margin-top:14px;font-size:12px;color:#B0392C;text-align:left;background:#F7E8E4;padding:10px;border-radius:8px;word-break:break-word;"></p>';
      document.getElementById('jg-setup-btn').addEventListener('click', function(){
        var key = document.getElementById('jg-setup-key').value.trim();
        var errBox = document.getElementById('jg-setup-error');
        if(!key){ errBox.style.display='block'; errBox.textContent = "Incolla prima la chiave."; return; }
        ACTIVE_MASTER_KEY = key;
        showSetupScreen();
      });
      document.getElementById('jg-setup-skip').addEventListener('click', function(){
        STORAGE_MODE = 'local';
        showGate();
      });
      return;
    }

    box.innerHTML =
      '<p style="font-size:26px;margin:0 0 6px;">🔗</p>'+
      '<p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#211E19;">Prima configurazione — passo 2 di 2</p>'+
      '<p style="font-size:12.5px;color:#8B8577;margin:0 0 16px;line-height:1.5;">Crea lo spazio dati condiviso tra i telefoni. Dopo, copia i due valori che ti verranno mostrati in js/config.js e ripubblica su Netlify.</p>'+
      '<button id="jg-setup-btn" style="padding:9px 20px;border-radius:8px;border:none;background:#16283A;color:#F2EFE6;font-size:13px;font-weight:700;">Crea sincronizzazione</button>'+
      '<button id="jg-setup-skip" style="display:block;margin:14px auto 0;background:none;border:none;color:#8B8577;font-size:11.5px;text-decoration:underline;">Continua solo su questo telefono</button>'+
      '<p id="jg-setup-error" style="display:none;margin-top:14px;font-size:12px;color:#B0392C;text-align:left;background:#F7E8E4;padding:10px;border-radius:8px;word-break:break-word;"></p>'+
      '<p id="jg-setup-result" style="display:none;margin-top:16px;font-size:12px;color:#211E19;text-align:left;background:#F0EAD8;padding:10px;border-radius:8px;word-break:break-all;"></p>';
    document.getElementById('jg-setup-btn').addEventListener('click', async function(){
      var btn = document.getElementById('jg-setup-btn');
      var errBox = document.getElementById('jg-setup-error');
      errBox.style.display = 'none';
      btn.textContent = "Creo...";
      btn.disabled = true;
      try{
        var seed = {days:defaultDays(), food:defaultFood(), lodging:defaultLodging()};
        var newId = await remoteCreate(seed, ACTIVE_MASTER_KEY);
        ACTIVE_BLOB_ID = newId;
        STORAGE_MODE = 'remote';
        btn.style.display = 'none';
        document.getElementById('jg-setup-skip').style.display = 'none';
        var res = document.getElementById('jg-setup-result');
        res.style.display = 'block';
        res.innerHTML = '<b>Fatto! Copia questi due valori prima di continuare:</b><br><br>'+
          '<code>var JSONBIN_MASTER_KEY = "'+ACTIVE_MASTER_KEY+'";</code><br>'+
          '<code>var REMOTE_BLOB_ID = "'+newId+'";</code><br><br>'+
          'Incollali in js/config.js e ripubblica su Netlify: da quel momento la sincronizzazione sarà permanente per chiunque apra il link. Per ora continuo qui con questa sessione.';
        var goBtn = document.createElement('button');
        goBtn.textContent = "Ho copiato, continua";
        goBtn.style.cssText = "margin-top:14px;padding:9px 20px;border-radius:8px;border:none;background:#16283A;color:#F2EFE6;font-size:13px;font-weight:700;";
        goBtn.addEventListener('click', showGate);
        res.parentNode.insertBefore(goBtn, res.nextSibling);
      }catch(e){
        btn.textContent = "Crea sincronizzazione";
        btn.disabled = false;
        errBox.style.display = 'block';
        errBox.textContent = "Errore: " + (e && e.message ? e.message : e) + ". Controlla che la chiave copiata sia corretta, o riprova tra poco.";
      }
    });
    document.getElementById('jg-setup-skip').addEventListener('click', function(){
      STORAGE_MODE = 'local';
      showGate();
    });
  }

  function showGate(){
    var box = document.getElementById('loading');
    box.innerHTML =
      '<p style="font-size:26px;margin:0 0 6px;">🔒</p>'+
      '<p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#211E19;">Itinerario Giappone</p>'+
      '<p style="font-size:12.5px;color:#8B8577;margin:0 0 18px;">Inserisci la parola d\'ordine per continuare</p>'+
      '<input type="password" id="jg-gate-input" placeholder="Password" style="width:100%;max-width:220px;padding:10px 12px;border:0.5px solid #DED6C2;border-radius:8px;font-size:14px;text-align:center;margin-bottom:10px;box-sizing:border-box;">'+
      '<br>'+
      '<button id="jg-gate-btn" style="padding:9px 20px;border-radius:8px;border:none;background:#16283A;color:#F2EFE6;font-size:13px;font-weight:700;">Entra</button>'+
      '<p id="jg-gate-error" style="display:none;color:#B0392C;font-size:12px;margin-top:10px;">Password errata, riprova.</p>';
    document.getElementById('jg-gate-btn').addEventListener('click', checkGate);
    document.getElementById('jg-gate-input').addEventListener('keydown', function(e){ if(e.key === 'Enter') checkGate(); });
  }

  function checkGate(){
    var input = document.getElementById('jg-gate-input');
    var err = document.getElementById('jg-gate-error');
    if(!input) return;
    if(input.value === GATE_PASSWORD){
      startApp();
    } else {
      err.style.display = 'block';
      input.value = '';
      input.focus();
    }
  }

  if(STORAGE_MODE === 'unconfigured'){
    showSetupScreen();
  } else {
    var gateBtn = document.getElementById('jg-gate-btn');
    var gateInput = document.getElementById('jg-gate-input');
    if(gateBtn) gateBtn.addEventListener('click', checkGate);
    if(gateInput) gateInput.addEventListener('keydown', function(e){ if(e.key === 'Enter') checkGate(); });
  }
})();
