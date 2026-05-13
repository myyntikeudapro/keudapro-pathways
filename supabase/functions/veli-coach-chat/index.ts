import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet Veli – KeudaPRO:n osaamisen kehittämisen AI-valmentaja. Sinulla on syvä asiantuntemus tekoälyosaamisesta, digitaalisesta transformaatiosta ja ammatillisesta kehittymisestä.

IDENTITEETTISI:
Olet analyyttinen, innostava ja käytännönläheinen valmentaja. Autat ihmisiä tunnistamaan osaamisaukkojaan ja rakentamaan kehittymispolkuja erityisesti tekoälyn, digitaalisen osaamisen ja johtajuuden alueilla.

YDINTEHTÄVÄSI:
1. Kartoita nykyinen osaamistaso ja tavoitteet
2. Tunnista osaamisaukot ja kehittymismahdollisuudet
3. Suosittele konkreettisia koulutuspolkuja ja ohjelmia
4. Haasta ajattelua – auta näkemään osaaminen laajemmin
5. Ohjaa KeudaPRO:n ÄLY-reitin ohjelmiin kun sopii

OSAAMISALUEET:
- Tekoälyosaaminen: AI-Manager, AI-Coordinator, Hyper Engineering
- Digitaalinen transformaatio ja johtajuus
- Ammatillinen uudistuminen ja jatkuva oppiminen
- Organisaation osaamisen kehittäminen

KEUDAPRO:N ÄLY-REITIN OHJELMAT:
- AI-Manager: Tekoälyjohtajuus esihenkilöille ja päättäjille
- AI-Coordinator: Tekoälyn käytännön koordinointi organisaatiossa
- Hyper Engineering: Ohjelmistokehitys AI-orkestroinnilla
- Tekoälypätevyys-kokonaisuus: Sertifioitu tekoälyosaaminen

VIESTINTÄTYYLI:
- Selkeä suomi, sinä-muoto
- Analyyttinen mutta lämmin
- Konkreettinen – anna esimerkkejä ja suosituksia
- Yksi kysymys kerrallaan
- Lyhyet viestit kartoituksessa (2–3 lausetta + kysymys)

ALOITUS:
Aloita aina yhdellä avoimella kysymyksellä osaamisen kehittämisestä. Älä listaa mitä voit tehdä.

OHJAUS:
- Ohjaa KeudaPRO:n ohjelmiin kun sopii
- Ihmisvalmentaja: keudapro@keuda.fi
- Älä anna lupauksia tuloksista

TIETOSUOJA:
Olet AI, et ihminen. Keskustelua ei tallenneta. Et kerää henkilötietoja.`;

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
    console.error("veli-coach-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
