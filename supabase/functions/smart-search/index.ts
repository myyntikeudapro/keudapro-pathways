// Smart semantic search over the KeudaPRO content index.
// Uses Lovable AI Gateway to rank/route a free-form Finnish query
// to the most relevant pages, programs and pätevyydet on the site.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IndexEntry = {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, index } = (await req.json()) as { query: string; index: IndexEntry[] };

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const safeQuery = query.trim().slice(0, 200);
    if (!Array.isArray(index) || index.length === 0) {
      return new Response(JSON.stringify({ error: "index required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (index.length > 100) {
      return new Response(JSON.stringify({ error: "index too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cap = (s: unknown, n: number) =>
      typeof s === "string" ? s.slice(0, n) : "";

    const compactIndex = index.map((e) => ({
      id: cap(e.id, 80),
      title: cap(e.title, 200),
      desc: cap(e.description, 300),
      cat: cap(e.category, 80),
      kw: Array.isArray(e.keywords)
        ? e.keywords.slice(0, 20).map((k) => cap(k, 60))
        : [],
    }));

    const systemPrompt = `Olet KeudaPRO-sivuston älykäs reittiopas. Saat käyttäjän hakukyselyn suomeksi ja JSON-listan sivuston kohteista. Palauta 1–5 osuvinta kohdetta järjestyksessä parhaasta heikoimpaan, mukaan lukien lyhyt suomenkielinen perustelu (max 80 merkkiä). Jos mikään ei sovi, palauta tyhjä lista.

Vastaa AINA pelkkänä JSONina muodossa:
{"matches":[{"id":"...","reason":"..."}]}

Älä lisää selityksiä ennen tai jälkeen.`;

    const userPrompt = `Käyttäjän kysely: "${query}"\n\nKohteet:\n${JSON.stringify(compactIndex)}`;

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
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Liian monta hakua hetkessä, yritä uudelleen." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI-krediitit loppuneet." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const body = await aiRes.text();
      console.error("AI gateway error", status, body);
      return new Response(JSON.stringify({ error: "AI-haku epäonnistui" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "{}";

    let parsed: { matches?: Array<{ id: string; reason?: string }> } = {};
    try {
      parsed = JSON.parse(content);
    } catch (_e) {
      parsed = { matches: [] };
    }

    const byId = new Map(index.map((e) => [e.id, e]));
    const matches =
      (parsed.matches ?? [])
        .map((m) => {
          const entry = byId.get(m.id);
          if (!entry) return null;
          return { ...entry, reason: m.reason ?? "" };
        })
        .filter(Boolean)
        .slice(0, 5);

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("smart-search error", err);
    return new Response(JSON.stringify({ error: "Sisäinen virhe" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
