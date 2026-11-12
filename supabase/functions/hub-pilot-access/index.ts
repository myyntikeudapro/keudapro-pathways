// Server-side password check for unfinished hub pilots; URLs never ship in client code.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const PILOTS: Record<string, { url: string; hash: string }> = {
  aukee: { url: "https://aukee-open-doors.lovable.app", hash: "6381f4529149ed1ed1a53078d8ca89e43b814aeaa24ca60aa2335ee142d1ab78" },
};
async function sha256(v: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const { pilot, password } = await req.json();
    if (typeof pilot !== "string" || typeof password !== "string" || password.length > 200) return json({ error: "Invalid request" }, 400);
    const p = PILOTS[pilot];
    if (!p || (await sha256(password)) !== p.hash) return json({ error: "Väärä salasana" }, 401);
    return json({ url: p.url });
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
});
