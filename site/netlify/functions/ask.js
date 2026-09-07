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

  var context = buildContext(body.days, body.food, body.lodging, body.usefulInfo);
  var systemPrompt =
    "Sei 'Virtual Giu', l'assistente di viaggio per un gruppo in Giappone dal 13 al 25 settembre 2026. " +
    "Rispondi in italiano, in modo breve, chiaro e colloquiale (la risposta verrà spesso letta ad alta voce dal telefono: " +
    "evita elenchi puntati, markdown, o formattazioni — scrivi come parleresti). " +
    "Usa SOLO le informazioni sull'itinerario, cibo, alloggi ed emergenze fornite qui sotto; se non trovi la risposta in questi dati, dillo onestamente " +
    "invece di inventare orari, prezzi o indirizzi. " +
    "Se ti chiedono di convertire euro in yen (o viceversa), usa il tasso di cambio indicato qui sotto e fai tu il calcolo. " +
    "Se ti chiedono come si dice qualcosa in giapponese, cerca prima tra le frasi fornite; se non c'è, puoi comunque aiutare con la tua conoscenza generale del giapponese, specificando che non è una frase pre-verificata dell'itinerario.\n\n" + context;

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
function buildContext(days, food, lodging, usefulInfo) {
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
  if (usefulInfo) {
    if (usefulInfo.emergency && usefulInfo.emergency.length) {
      lines.push("\nEMERGENZE:");
      usefulInfo.emergency.forEach(function (e) {
        lines.push("- " + e.label + ": " + e.value + (e.note ? " (" + e.note + ")" : ""));
      });
    }
    if (typeof usefulInfo.currencyRateJpyPerEur === "number") {
      lines.push("\nCAMBIO VALUTA: 1 EUR = " + usefulInfo.currencyRateJpyPerEur + " JPY (tasso attuale, usalo per qualunque conversione ti venga chiesta).");
    }
    if (usefulInfo.phraseGroups && usefulInfo.phraseGroups.length) {
      lines.push("\nFRASI IN GIAPPONESE GIÀ PRONTE (categoria: frase romaji = traduzione):");
      usefulInfo.phraseGroups.forEach(function (g) {
        (g.items || []).forEach(function (p) {
          lines.push("- [" + g.category + "] " + p.jp + " = " + p.it);
        });
      });
    }
  }
  var full = lines.join("\n");
  if (full.length > 16000) full = full.slice(0, 16000) + "\n[...troncato per lunghezza...]";
  return full;
}
