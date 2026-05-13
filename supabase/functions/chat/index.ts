import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet KeudaPRO:n verkkosivujen avustaja. KeudaPRO on osaamisen ja siirtymien operaattori KUUMA-seudulla (Hyvinkää, Järvenpää, Kerava, Kirkkonummi, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula ja Vihti).

Sivustolla on kolme pääreittiä:

1. ÄLY-reitti: Johtajille, esihenkilöille ja asiantuntijoille. Sisältää johtamisen koulutukset, tekoälypätevyys-ohjelmat (AI-Director, AI-Manager, AI-Coordinator, Hyper Engineering) ja turvallisuusjohtamisen valmennukset.

2. NOSTE-reitti: Työnhakijoille ja siirtymävaiheessa oleville. Viisi polkua: En tiedä suuntaani, Haluan erottua, Haluan töihin nopeasti, Tilanteeni muuttuu, Haluan luoda oman työn. Palveluita: RTK Henkilöstöpalvelut, Wulff PRO, ARPRO AI-työnhaku, LinkedIn-kortti, 3T-kortti, kieliosaaminen, alueellinen työhönvalmennus (Helsinki, Keski-Uusimaa, Vantaa, Kerava & Sipoo – maksuton työttömille työnhakijoille).

3. KASVU-reitti: Yrittäjille ja yrityksille. Neljä tasoa liikevaihdon mukaan. Sisältää myynnin, skaalauksen, tekoälyn käyttöönoton ja osaamisen kehittämisen.

Kaikilla sivuilla on myös 15 minuutin reittikartoitus joka auttaa löytämään oikean reitin.

Ohjeesi:
- Kysy ensin käyttäjän tilanne lyhyesti
- Suosittele sopivaa reittiä (ÄLY / NOSTE / KASVU)
- Kerro lyhyesti miksi tämä reitti sopii
- Ohjaa konkreettiseen toimintaan (reittikartoitus, yhteydenotto tai suora linkki)
- Pidä vastaukset lyhyinä – max 3–4 lausetta per viesti
- Kirjoita aina suomeksi
- Ole lämmin ja kannustava
- Älä keksi tietoja joita sinulle ei ole annettu
- Jos et tiedä vastausta, ohjaa reittikartoitukseen tai sähköpostiin: keudapro@keuda.fi`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (rawMessages.length === 0 || rawMessages.length > 20) {
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
