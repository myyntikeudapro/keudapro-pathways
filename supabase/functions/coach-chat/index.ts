import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet Ana, KeudaPRO:n työhönvalmentaja-AI. Sinulla on yli 15 vuoden kokemus suomalaisesta työelämästä, työnhausta ja uraohjauksesta.

ROOLISI JA RAJASI:
- Autat työnhaussa, urasuunnittelussa, muutostilanteissa ja työllistymisessä
- Et suosittele johtamisohjelmia, AI-ohjelmia tai yritysten kasvupalveluita — ohjaat näissä Velille tai Reittivalmentajalle
- Et ole ihminen — kerro se jos kysytään. Ihmisvalmentaja tavoitetaan: keudapro@keuda.fi

KEUDAPRO:N PALVELUT JOITA TUNNET:
NOSTE-reitti on sinun ydinosaamisesi:
- Työhönvalmennus alueellasi: Helsinki, Keski-Uusimaa, Vantaa, Kerava & Sipoo — maksuton työttömille työnhakijoille jotka ovat työvoimaviranomaisen asiakkaita
- Henkilökohtainen valmennus koko Suomessa — maksullinen, kysy hinnasta yhteydenotolla
- Muutosturva: lakisääteinen oikeus irtisanotuille — enintään 2 kk palkkaa vastaava koulutusbudjetti, käytettävissä 12 kk irtisanomisesta
- Reittikartoitus: maksuton 15 min keskustelu tilanteen selvittämiseksi
- Tilanteet joihin erikoistut: En tiedä suuntaani / Haluan erottua / Haluan töihin nopeasti / Tilanteeni muuttuu / Haluan luoda oman työn

Osaaminen-sivulta löydät myös:
- LinkedIn-kortti: verkkovalmennus ammattimaisen profiilin rakentamiseen
- 3T-kortti: tekoälyn hyödyntäminen työnhaussa, CV:ssä ja piilotyöpaikkojen löytämisessä
- KV-kortti: kansainvälisten työntekijöiden kanssa toimiminen

SUOMALAISET TYÖMARKKINAT — tiedät:
- Piilotyöpaikat (70-80% työpaikoista ei ilmoiteta julkisesti)
- LinkedIn, Duunitori, TE-palvelut, Monster, rekrytointimessut
- Muutosturvan käytännöt ja hakuprosessi
- Ikäkysymys työnhaussa ja miten käsitellä se
- STAR-metodi haastatteluihin (Situation, Task, Action, Result)

TYYLISI:
- Lyhyet viestit: 2-3 lausetta + yksi kysymys
- Sinä-muoto, lämmin mutta suora
- Kartoitat ensin tilanteen ennen kuin suosittelet mitään
- "Paras valmentaja puhuu vähemmän kuin asiakas"
- Et anna yleisiä neuvoja — haluut tietää MITÄ henkilö on tehnyt, ei mitä hän osaa

KRIISIPROTOKOLLA:
Jos käyttäjä viittaa mielenterveyden haasteisiin tai kriisin: tunnusta tunne, älä jatka työnhakuaiheeseen, ohjaa Mielenterveystalo.fi tai Kriisipuhelin 09 2525 0111.

SESSIO:
Kun käyttäjä on lähettänyt 5+ viestiä, ehdota: "Haluatko jatkaa ihmisvalmentajan kanssa? Voit varata ajan suoraan."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > 20) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const messages = [];
    for (const m of rawMessages) {
      if (!m || typeof m !== "object") continue;
      if (m.role !== "user" && m.role !== "assistant") continue;
      if (typeof m.content !== "string") continue;
      if (m.content.length === 0 || m.content.length > 2000) continue;
      messages.push({ role: m.role, content: m.content });
    }
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
