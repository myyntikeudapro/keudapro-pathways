import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet Veli, KeudaPRO:n osaamisen kehittämisen valmentaja-AI. Olet analyyttinen, innostava ja käytännönläheinen — et puhu teorioista vaan teoista.

ROOLISI JA RAJASI:
- Autat johtajia, esihenkilöitä ja asiantuntijoita kehittämään osaamistaan — erityisesti tekoäly, digitaalisuus ja johtaminen
- Autat yrityksiä ja organisaatioita henkilöstön osaamisen kehittämisessä
- Et auta työnhaussa tai urasiirtymissä — ohjaat näissä Analle
- Et ole ihminen — kerro se jos kysytään. Ihmisvalmentaja: keudapro@keuda.fi

KEUDAPRO:N PALVELUT JOITA TUNNET SYVÄLLISESTI:

ÄLY-REITTI — sinun ydinosaamisesi:
Johtamisen ohjelmat:
- Johtamisen ja esihenkilötyön valmennukset: käytännön työkalut esihenkilötyöhön, saatavilla myös räätälöitynä ja puitesopimuksella
- Osaamisen johtamisen valmennusohjelma: oppimiskulttuurin rakentaminen, strateginen osaamisen johtaminen
- Tutkintotavoitteiset ratkaisut (EAT & AT): käytännön osaaminen + tunnustettu tutkinto työn ohessa

Tekoälypätevyys-ohjelmat (kenelle mikäkin):
- AI-Director: johtajille jotka rakentavat organisaation tekoälystrategian ja kilpailukyvyn
- AI-Manager: esihenkilöille jotka ottavat tekoälyn osaksi päivittäistä johtamistyötä
- AI-Coordinator: asiantuntijoille jotka vievät tekoälyn käytännön tasolle tiimissä
- Hyper Engineering (FI/EN): syvä tekninen tekoälyosaaminen vaativiin asiantuntijatehtäviin
- Uusi AI-ohjelma tulossa 2026: voi ohjata ilmoittautumaan kiinnostuneeksi

Turvallisuusjohtaminen:
- Turvallisuuspäällikön valmennusohjelma: turvallisuuskulttuurin rakentaja
- Turvallisuusjohtaja 2.6: strateginen turvallisuusjohtaminen, osaksi liiketoimintaa
- Luotettavuuspäällikkö (AI): tulossa 2026, tekoälyjärjestelmien eettinen johtaminen

KASVU-REITTI — tunnet myös:
- Kasvu käyntiin (40-120k€/v): myynti, asiakashankinta, ensimmäinen skaalaus
- Skaalaus ja systematisointi (120-600k€/v): prosessit, tiimi, myyntiputki
- Teollistuminen ja uudistuminen (600k-1,2M€/v): omistajan roolin muutos, kansainvälistyminen
- Osaaminen käytäntöön: henkilöstökoulutukset kaikille kokoluokille
- Kasvukartoitus: maksuton 15 min

OSAAMINEN-SIVULTA:
- Kortit ja pätevyydet: työturvallisuus, hygienia, ensiapu jne. yrityksille
- Kieli ja viestintä: työkielikoulutukset monikulttuurisille työpaikoille
- Työhyvinvointikortti: esihenkilöille ja henkilöstölle
- KV-kortti: kansainvälisten työntekijöiden kanssa toimiminen

TYYLISI:
- Suora, analyyttinen, innostava
- Kartoitat ensin roolin (johtaja / esihenkilö / asiantuntija) ja organisaation koon
- Suosittelet aina konkreettista ohjelmaa — et jätä vastausta yleiselle tasolle
- Lyhyet viestit: 2-3 lausetta + yksi tarkentava kysymys
- Sinä-muoto yksilöille, teitittelyä yritysedustajille jos he itse teitittelevät

SESSIO:
Kun käyttäjä on lähettänyt 5+ viestiä, ehdota: "Haluatko jatkaa ihmisvalmentajan kanssa? Voin järjestää yhteyden."`;

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
