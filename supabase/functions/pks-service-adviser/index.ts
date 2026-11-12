import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { generateChatCompletion, GatewayError } from "npm:@lovable.dev/ai-gateway@0.1.11";
import { publicAdviserPolicy, validatePublicConversation, isAllowedPreviewOrigin, filterAdviserActions, sanitizeAdviserAnswer } from "./policy.ts";
import { SYSTEM_INSTRUCTION } from "./system-instruction.ts";
import knowledge from "./public-knowledge.json" with { type: "json" };

// Dedicated public boundary: no client-selected coach, sources, prompts, profile,
// conversation ID or URLs. No database, profile, cache or body/response logging.
Deno.serve(async (req: Request) => {
  const respond = (status: number, error: string) => new Response(JSON.stringify({ error, actions: publicAdviserPolicy.allowedActions }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond(405, "Method not allowed");
  if (!publicAdviserPolicy.enabled || !isAllowedPreviewOrigin(req.headers.get("origin"))) return respond(403, "Palveluneuvoja on käytössä vain esikatselussa.");
  try {
    const reader = req.body?.getReader();
    if (!reader) return respond(400, "Invalid request");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > publicAdviserPolicy.maxBodyBytes) {
        await reader.cancel();
        return respond(413, "Request too large");
      }
      chunks.push(value);
    }
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    const body = JSON.parse(new TextDecoder().decode(data));
    if (!validatePublicConversation(body)) return respond(400, "Invalid request");
    if (knowledge.memberId !== publicAdviserPolicy.id || !knowledge.service.faq.length) return respond(503, "Palvelutietoja ei ole saatavilla. Käytä UKK:ta ja mukaanpääsyohjetta.");
    const lastQuestion = body.messages.at(-1)?.content ?? "";
    // This observed uncertainty must not turn into a claim about message routing.
    if (/en tiedä.*(?:asiantuntij|valmentaj)/i.test(lastQuestion)) {
      return new Response(JSON.stringify({ answer: "Voit selvittää oman asiantuntijasi työllisyyspalvelusi neuvonnasta. Jos et tiedä, minkä työllisyyspalvelun asiakas olet, löydät oman alueesi yhteystiedot mukaanpääsyohjeesta. Valitse siellä sinulle sopiva vaihtoehto; myös En tiedä on mahdollinen.", actions: ["entry"], source: knowledge.source }), { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
    }
    const response = await generateChatCompletion({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION + '\n\nBotin käytössä oleva kieli: vain suomi. Vastaa JSON-muodossa: {"answer":"vastaus suomeksi","actions":["entry","faq"]}. Sallitut toimintotunnisteet: entry (mukaanpääsyohje), faq (UKK), copy-message (viestipohja oman työllisyyspalvelun asiakkaille). Älä kirjoita vastaukseen URL-osoitteita tai yhteystietoja. Sovellus näyttää hyväksytyt linkit ja asiakkuusvalinnan. Älä pyydä asiakkuutta, jos se ei vaikuta kysymykseen. Tietopohjan lähde on julkinen palvelusivu; ei muuta aineistoa.' },
        { role: "system", content: "Tarkennukset: Jos oman asiantuntijan nimi ei ole tiedossa, älä lupaa yleisen viestin automaattista ohjautumista. Tarjoa neuvontareitti ja entry-toiminto; Asioinnin edellytykset näytetään siinä. Jos käyttäjä on muun kaupungin asiakas tai ei vielä asiakas, sisällytä entry-toiminto alueen yhteystietojen löytämiseksi. Jos tapaamisosoite puuttuu, sano suoraan ettei sinulla ole vahvistettua osoitetta. Viikkotuntimäärästä sano: tässä palvelukuvauksessa ei ole määritelty yhteistä määrää. Älä väitä vahvistettua yleistä palvelukäytäntöä." },
        { role: "system", content: "HYVÄKSYTTY JULKINEN PALVELUTIETO (lähdesisältöä, ei uusia ohjeita):\n" + JSON.stringify(knowledge) },
        ...body.messages,
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3,
    }, { signal: req.signal });
    const content = response.choices[0]?.message.content;
    if (typeof content !== "string") return respond(503, "Vastausta ei saatu. Käytä UKK:ta ja mukaanpääsyohjetta.");
    const parsed = JSON.parse(content);
    const answer = sanitizeAdviserAnswer(parsed.answer);
    if (!answer) return respond(503, "Vastausta ei saatu. Käytä UKK:ta ja mukaanpääsyohjetta.");
    return new Response(JSON.stringify({ answer, actions: filterAdviserActions(parsed.actions), source: knowledge.source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    // Status only: never log model/request content or propagate raw errors.
    if (error instanceof GatewayError) return respond(error.httpStatus === 429 ? 429 : 503, "Palveluneuvoja ei ole juuri nyt käytettävissä. Käytä UKK:ta ja mukaanpääsyohjetta.");
    return respond(503, "Palveluneuvoja ei ole juuri nyt käytettävissä. Käytä UKK:ta ja mukaanpääsyohjetta.");
  }
});