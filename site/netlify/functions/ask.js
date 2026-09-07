// Funzione server (Netlify Function). Gira SOLO sul server di Netlify, mai
// nel browser: è l'unico posto dove la chiave API è al sicuro, perché non
// finisce mai nel codice del sito né in una richiesta di rete visibile a chi
// visita la pagina.
//
// Configurazione richiesta su Netlify (una tantum, dalla dashboard):
// Site configuration → Environment variables → aggiungi ANTHROPIC_API_KEY
// con il valore della tua chiave. NON scriverla mai qui nel codice.

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: "Metodo non permesso" }) };
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY non configurata su Netlify (Site configuration → Environment variables)." }),
    };
  }

  var body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Corpo della richiesta non valido" }) };
  }

  var message = (body.message || "").toString().trim().slice(0, 2000);
  if (!message) {
    return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: "Messaggio mancante" }) };
  }

  var context = buildContext(body.days, body.food, body.lodging);
  var systemPrompt =
    "Sei 'Virtual Giu', l'assistente di viaggio per un gruppo in Giappone dal 13 al 25 settembre 2026. " +
    "Rispondi in italiano, in modo breve, chiaro e colloquiale (la risposta verrà spesso letta ad alta voce dal telefono: " +
    "evita elenchi puntati, markdown, o formattazioni — scrivi come parleresti). " +
    "Usa SOLO le informazioni sull'itinerario reale fornite qui sotto; se non trovi la risposta in questi dati, dillo onestamente " +
    "invece di inventare orari, prezzi o indirizzi.\n\n" + context;

  try {
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      var errText = await res.text();
      return {
        statusCode: 502,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "Errore da Claude: " + res.status, detail: errText.slice(0, 300) }),
      };
    }

    var data = await res.json();
    var answer = (data.content || [])
      .map(function (b) { return b.type === "text" ? b.text : ""; })
      .join("")
      .trim() || "Non sono riuscito a generare una risposta.";

    var usage = data.usage || {};
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        answer: answer,
        usage: { inputTokens: usage.input_tokens || 0, outputTokens: usage.output_tokens || 0 }
      }),
    };
  } catch (e) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: "Errore interno: " + (e && e.message) }) };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

// Riassume l'itinerario reale (con le modifiche fatte finora) in testo
// semplice, così Virtual Giu risponde in base a quello che avete DAVVERO
// pianificato, non a un itinerario generico.
function buildContext(days, food, lodging) {
  var lines = [];
  lines.push("ITINERARIO:");
  (days || []).forEach(function (d) {
    lines.push(d.date + " (" + d.wd + ") - " + d.city + ":");
    (d.items || []).forEach(function (it) {
      var tag = it.status === "seen" ? " [già visitata]" : it.status === "skipped" ? " [saltata]" : "";
      lines.push("  - " + (it.time ? it.time + " " : "") + it.title + (it.note ? ": " + it.note : "") + tag);
    });
  });
  if (food && food.length) {
    lines.push("\nCIBO CONSIGLIATO:");
    food.forEach(function (f) {
      lines.push("- " + f.title + (f.zone ? " (" + f.zone + ")" : "") + (f.note ? ": " + f.note : ""));
    });
  }
  if (lodging && lodging.length) {
    lines.push("\nALLOGGI:");
    lodging.forEach(function (l) {
      lines.push(
        "- " + l.title + (l.note ? " (" + l.note + ")" : "") +
        (l.address ? ", indirizzo: " + l.address : "") +
        (l.phone ? ", tel: " + l.phone : "")
      );
    });
  }
  var full = lines.join("\n");
  if (full.length > 12000) full = full.slice(0, 12000) + "\n[...troncato per lunghezza...]";
  return full;
}
