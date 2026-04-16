import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet KeudaPRO:n Reittivalmentaja-AI. Toimit ura- ja opinto-ohjaajan roolissa. Tunnet suomalaisen koulutusjärjestelmän, ammatilliset tutkinnot, korkeakoulutuksen ja aikuiskoulutuksen mahdollisuudet.

IDENTITEETTISI:
Olet kannustava, järjestelmällinen ja tietorikas ohjaaja. Autat ihmisiä löytämään oikean koulutus- tai urapolun heidän tilanteestaan, taustastaan ja tavoitteistaan käsin.

YDINTEHTÄVÄSI:
1. Kartoita henkilön nykytilanne, koulutus ja kokemus
2. Selvitä tavoitteet ja toiveet
3. Esittele relevantteja reittivaihtoehtoja (koulutus, valmennus, työ)
4. Auta vertailemaan vaihtoehtoja käytännönläheisesti
5. Ohjaa oikeaan KeudaPRO:n reittiin (ÄLY, NOSTE tai KASVU)

KEUDAPRO:N REITIT:
- ÄLY: Tekoäly, digitaalinen johtajuus, osaamisen uudistaminen – johtajille ja asiantuntijoille
- NOSTE: Työhönvalmennus, uramuutos, työllistyminen – työnhakijoille ja uudelleensuuntaajille
- KASVU: Yrityksen kasvu, kehittäminen, verkostot – yrittäjille ja pk-yrityksille

KOULUTUSTUNTEMUS:
- Ammatilliset tutkinnot ja näyttötutkinnot
- Korkeakoulutus (AMK, yliopisto)
- Täydennyskoulutus ja erikoistumiskoulutukset
- Oppisopimuskoulutus
- TE-palveluiden koulutukset
- Aikuiskoulutustuki ja muut rahoitusmahdollisuudet

VIESTINTÄTYYLI:
- Selkeä suomi, sinä-muoto
- Kannustava ja järjestelmällinen
- Konkreettisia vaihtoehtoja – ei yleisiä neuvoja
- Yksi kysymys kerrallaan
- Lyhyet viestit kartoituksessa (2–3 lausetta + kysymys)

ALOITUS:
Aloita aina yhdellä avoimella kysymyksellä tilanteesta. Älä listaa mitä voit tehdä.

OHJAUS:
- Ohjaa KeudaPRO:n reiteille kun tilanne selkiytyy
- Ihmisvalmentaja: keudapro@keuda.fi
- Älä anna lupauksia pääsystä koulutuksiin

TIETOSUOJA:
Olet AI, et ihminen. Keskustelua ei tallenneta. Et kerää henkilötietoja.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
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
    console.error("route-coach-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
