// Prende i titoli delle notizie da NHK World (inglese) e li traduce in
// italiano con un'unica chiamata a Claude, invece di farne una per titolo.
// Il risultato viene tenuto in cache dal browser per qualche ora (vedi
// app.js), così questa funzione non viene chiamata ad ogni apertura.

var NHK_FEED_URL = "https://www3.nhk.or.jp/nhkworld/data/en/news/backstory/rss.xml";

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "ANTHROPIC_API_KEY non configurata su Netlify." }) };
  }

  try {
    var feedRes = await fetch(NHK_FEED_URL);
    if (!feedRes.ok) {
      return { statusCode: 502, headers: corsHeaders(), body: JSON.stringify({ error: "Feed NHK non raggiungibile: " + feedRes.status }) };
    }
    var xml = await feedRes.text();
    var titles = extractTitles(xml).slice(0, 12);
    if (!titles.length) {
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ headlines: [] }) };
    }

    var prompt =
      "Traduci questi titoli di notizie NHK World (Giappone) in italiano. " +
      "Rispondi SOLO con un array JSON di stringhe, nello stesso ordine, senza altro testo, senza markdown, senza backtick. " +
      "Traduzione naturale e breve, non letterale parola per parola.\n\n" +
      JSON.stringify(titles);

    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      var errText = await res.text();
      return { statusCode: 502, headers: corsHeaders(), body: JSON.stringify({ error: "Errore da Claude: " + res.status, detail: errText.slice(0, 300) }) };
    }

    var data = await res.json();
    var raw = (data.content || []).map(function (b) { return b.type === "text" ? b.text : ""; }).join("").trim();
    var headlines;
    try {
      headlines = JSON.parse(raw);
      if (!Array.isArray(headlines)) throw new Error("non è un array");
    } catch (e) {
      headlines = titles; // ripiego: mostriamo i titoli originali in inglese piuttosto che niente
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ headlines: headlines }) };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "Errore interno: " + (e && e.message) }) };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };
}

// Estrae i <title> di ogni <item> di un feed RSS (esclude il titolo generale
// del canale). Parsing semplice via regex: sufficiente per un feed RSS
// standard, senza dover aggiungere una libreria XML.
function extractTitles(xml) {
  var items = xml.split(/<item[\s>]/i).slice(1); // scarta tutto prima del primo <item>
  var titles = [];
  items.forEach(function (chunk) {
    var m = /<title>([\s\S]*?)<\/title>/i.exec(chunk);
    if (m) {
      var t = m[1].replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
      if (t) titles.push(t);
    }
  });
  return titles;
}
