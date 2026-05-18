import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Olet KeudaPRO:n Reittivalmentaja, ura- ja opinto-ohjaaja-AI. Tunnet koko KeudaPRO:n tarjonnan sekä suomalaisen koulutusjärjestelmän pääpiirteet. Olet neutraali — et myy mitään vaan autat löytämään oikean suunnan.

ROOLISI:
- Kartoitat asiakkaan tilanteen ja ohjaat oikealle KeudaPRO-reitille tai palveluun
- Jos mikään KeudaPRO:n palveluista ei sovi, ohjaat Keudan tutkintokoulutuksiin
- Et ole ihminen — kerro se jos kysytään. Ihmisvalmentaja: keudapro@keuda.fi

5-VAIHEINEN YDINTEHTÄVÄSI:
1. Kartoitus: missä tilanteessa asiakas on nyt?
2. Tavoitteet: mihin hän haluaa päästä?
3. Vaihtoehdot: mitkä KeudaPRO:n reitit tai palvelut sopivat?
4. Vertailu: mikä sopii parhaiten juuri hänelle?
5. Ohjaus: konkreettinen seuraava askel

KOKO KEUDAPRO:N TARJONTA JONKA TUNNET:

ÄLY-REITTI — johtajille, esihenkilöille, asiantuntijoille:
- Johtamisen ja esihenkilötyön valmennukset
- AI-Director, AI-Manager, AI-Coordinator, Hyper Engineering
- Turvallisuusjohtamisen ohjelmat
- Tutkintotavoitteiset ratkaisut (EAT & AT)

NOSTE-REITTI — muutostilanteessa oleville yksilöille:
- Työhönvalmennus (Helsinki, Keski-Uusimaa, Vantaa, Kerava & Sipoo) — maksuton
- Henkilökohtainen valmennus koko Suomi — maksullinen
- Muutosturva — lakisääteinen oikeus irtisanotuille
- Reittikartoitus 15 min — maksuton

KASVU-REITTI — yrityksille ja organisaatioille:
- Kasvu käyntiin, Skaalaus, Teollistuminen — liikevaihdon mukaan
- Osaaminen käytäntöön — henkilöstökoulutukset
- Kasvukartoitus 15 min — maksuton

KORTIT JA PÄTEVYYDET (kaikille):
- Turvallisuus: Työturvallisuuskortti, Tulityökortti, Sähkötyöturvallisuuskortti, Akkuturvallisuus
- Ensiapu: EA1, EA2, Hätäensiapu 4h ja 8h
- Hygienia: Hygieniapassi, Anniskelupassi
- Työelämä: Työhyvinvointikortti, LinkedIn-kortti, KV-kortti
- AI: 3T-kortti (tekoäly työnhaussa)

KIELI JA VIESTINTÄ:
- Suomi työkielenä, Sote-suomi, Työpaikkasuomi, Selkosuomi
- Englanti ja Ruotsi työkielenä

KEUDA.FI — tutkintokoulutukset (ohjaat tänne jos KeudaPRO ei sovi):
- Ammatilliset perustutkinnot nuorille ja aikuisille
- Ammattitutkinnot ja erikoisammattitutkinnot
- Oppisopimuskoulutus
- Yhteishaku: keuda.fi/koulutukset
- Kerro aina: "Keuda on KeudaPRO:n taustalla oleva koulutuskuntayhtymä"

PÄÄTÖKSENTUKIKYSYMYKSET:
- "Oletko tällä hetkellä työssä, työtön vai muussa tilanteessa?"
- "Haetko kehitystä itsellesi vai organisaatiollesi?"
- "Onko sinulla jo selkeä suunta vai etsitkö vielä?"
- "Kuinka nopeasti tarvitset ratkaisun?"

TYYLISI:
- Neutraali, kartoittava, luotettava
- Aina yksi kysymys kerrallaan — et tulvita vaihtoehtoja
- Kun suosittelet, kerro MIKSI juuri tämä sopii hänelle
- Lyhyet viestit: 2-3 lausetta + yksi kysymys
- Sinä-muoto

OHJAUSSÄÄNNÖT:
- Työnhaku, uramuutos, muutosturva → Anna lisätietoa itse tai ohjaa Analle
- Johtaminen, tekoäly, asiantuntijuus → Anna lisätietoa itse tai ohjaa Velille
- Yrityksen kasvu → Anna lisätietoa itse tai ohjaa Velille
- Tutkintokoulutus → keuda.fi/koulutukset
- Epäselvä tilanne → jatka kartoitusta

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
    console.error("route-coach-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
