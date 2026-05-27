// Älykäs tilannetsekkaus KASVU-sivulle.
// Ottaa vastaan yrityksen perustiedot ja palauttaa lyhyen suomenkielisen
// yhteenvedon + suositellun kasvureitin.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Input = {
  revenue: number;        // €/v
  team: number;           // henkilöä
  growth: number;         // 0-100, kasvuvauhti / skaalausvalmius
  bottleneck: number;     // 0-100, kuinka paljon yrittäjä on itse pullonkaula
  focus?: string;         // valittu painopiste (esim. "myynti", "rekrytointi")
};

const ROUTES = ["kaynistys", "skaalaus", "kasvu-uudistuminen", "osaaminen"] as const;
type RouteId = (typeof ROUTES)[number];

function ruleBasedRoute(i: Input): RouteId {
  if (i.focus === "osaaminen") return "osaaminen";
  if (i.revenue >= 600_000 || i.team >= 15) return "kasvu-uudistuminen";
  if (i.revenue >= 120_000 || i.team >= 4 || i.growth >= 55) return "skaalaus";
  return "kaynistys";
}

const labels: Record<RouteId, string> = {
  kaynistys: "Kasvu käyntiin",
  skaalaus: "Skaalaus ja systematisointi",
  "kasvu-uudistuminen": "Teollistuminen ja uudistuminen",
  osaaminen: "Osaaminen käytäntöön",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ALLOWED_FOCUS = ["myynti", "skaalaus", "uudistuminen", "osaaminen"] as const;

  try {
    const raw = (await req.json()) as Input;
    if (
      typeof raw?.revenue !== "number" ||
      typeof raw?.team !== "number" ||
      typeof raw?.growth !== "number" ||
      typeof raw?.bottleneck !== "number"
    ) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Server-side allowlist for `focus` to prevent prompt injection.
    const safeFocus =
      typeof raw.focus === "string" && (ALLOWED_FOCUS as readonly string[]).includes(raw.focus)
        ? raw.focus
        : undefined;
    const input: Input = {
      revenue: Math.max(0, Math.min(1e10, raw.revenue)),
      team: Math.max(0, Math.min(100000, raw.team)),
      growth: Math.max(0, Math.min(100, raw.growth)),
      bottleneck: Math.max(0, Math.min(100, raw.bottleneck)),
      focus: safeFocus,
    };

    const recommended = ruleBasedRoute(input);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          summary:
            "Tilanteesi perusteella sopiva lähtökohta on " +
            labels[recommended] +
            ". Avaa polku alta nähdäksesi konkreettiset ratkaisut.",
          recommended,
          recommendedLabel: labels[recommended],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `Olet KeudaPRO:n kasvuvalmentaja. Saat yrityksen perustiedot ja palautat tiiviin suomenkielisen tilannekuvan.

Vastaa AINA pelkkänä JSONina:
{"summary":"...", "strengths":["..."], "focus":["..."]}

- summary: 2-3 lyhyttä lausetta. Kerro missä vaiheessa yritys on ja miksi suositeltu reitti sopii. Älä toista numeroita sellaisenaan.
- strengths: 1-2 lyhyttä positiivista havaintoa (max 60 merkkiä / kpl).
- focus: 2-3 konkreettista painopistettä joihin keskittyä seuraavaksi (max 60 merkkiä / kpl, verbi edessä).

Älä lisää selityksiä ennen tai jälkeen JSONia.`;

    const userPrompt = `Yrityksen tilanne:
- Liikevaihto: ${input.revenue.toLocaleString("fi-FI")} €/v
- Tiimin koko: ${input.team} henkilöä
- Kasvuvauhti / skaalausvalmius (0-100): ${input.growth}
- Yrittäjän pullonkaula-aste (0-100, 100 = tekee kaiken itse): ${input.bottleneck}
- Painopiste: ${input.focus ?? "ei valittu"}

Suositeltu kasvureitti: ${labels[recommended]}.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
      }),
    });

    if (!aiRes.ok) {
      const fallback = {
        summary: `Tilanteesi perusteella sopiva lähtökohta on ${labels[recommended]}. Avaa polku alta nähdäksesi konkreettiset ratkaisut ja varaa tarvittaessa sparrausaika valmentajalta.`,
        strengths: [] as string[],
        focus: [] as string[],
      };
      return new Response(
        JSON.stringify({ ...fallback, recommended, recommendedLabel: labels[recommended] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; strengths?: string[]; focus?: string[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch (_e) {
      parsed = {};
    }

    return new Response(
      JSON.stringify({
        summary: parsed.summary ?? `Sopiva lähtökohta on ${labels[recommended]}.`,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 2) : [],
        focus: Array.isArray(parsed.focus) ? parsed.focus.slice(0, 3) : [],
        recommended,
        recommendedLabel: labels[recommended],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("growth-checkup error", err);
    return new Response(JSON.stringify({ error: "Sisäinen virhe" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
