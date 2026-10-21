import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const GW = "https://connector-gateway.lovable.dev";
type Row = { platform: "meta" | "google"; campaign: string; spend: number; impressions: number; clicks: number; currency: string };
type Status = { connected: boolean; error?: string };

// Editor-only: returns ad spend per campaign from Meta and Google Ads for the selected window.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ error: "Kirjaudu sisään." }, 401);
    const { data: ok } = await admin.rpc("is_editor_or_admin", { _user_id: u.user.id });
    if (!ok) return json({ error: "Ei oikeutta." }, 403);

    const body = await req.json().catch(() => ({}));
    const days = Math.min(Math.max(Number(body.days) || 30, 1), 365);
    const until = new Date();
    const since = new Date(Date.now() - (days - 1) * 864e5);
    const d = (x: Date) => x.toISOString().slice(0, 10);
    const lov = Deno.env.get("LOVABLE_API_KEY");
    const rows: Row[] = [];
    const status: Record<string, Status> = { meta: { connected: false }, google: { connected: false } };

    // Meta
    const metaKey = Deno.env.get("META_ADS_API_KEY");
    const metaAcc = Deno.env.get("META_AD_ACCOUNT_ID") ?? "1588371865850122";
    if (lov && metaKey) {
      const q = new URLSearchParams({ level: "campaign", fields: "campaign_name,spend,impressions,clicks,account_currency", time_range: JSON.stringify({ since: d(since), until: d(until) }), limit: "200" });
      const r = await fetch(`${GW}/meta_ads/v26.0/act_${metaAcc}/insights?${q}`, { headers: { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": metaKey } });
      const t = await r.text();
      if (!r.ok) { console.error(`Meta [${r.status}]: ${t}`); status.meta = { connected: true, error: `Meta-tilin luku epäonnistui (${r.status}).` }; }
      else {
        status.meta = { connected: true };
        for (const x of JSON.parse(t).data ?? []) rows.push({ platform: "meta", campaign: x.campaign_name, spend: Number(x.spend) || 0, impressions: Number(x.impressions) || 0, clicks: Number(x.clicks) || 0, currency: x.account_currency ?? "EUR" });
      }
    }

    // Google Ads
    const gKey = Deno.env.get("GOOGLE_ADS_API_KEY");
    const gCust = (Deno.env.get("GOOGLE_ADS_CUSTOMER_ID") ?? "").replace(/-/g, "");
    if (lov && gKey) {
      if (!gCust) status.google = { connected: true, error: "Google Ads -tiliä ei ole vielä valittu." };
      else {
        const query = `SELECT campaign.name, metrics.cost_micros, metrics.impressions, metrics.clicks, customer.currency_code FROM campaign WHERE campaign.status != 'REMOVED' AND segments.date BETWEEN '${d(since)}' AND '${d(until)}'`;
        const headers: Record<string, string> = { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": gKey, "Content-Type": "application/json" };
        const login = Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID");
        if (login) headers["login-customer-id"] = login.replace(/-/g, "");
        const r = await fetch(`${GW}/google_ads/v25/customers/${gCust}/googleAds:search`, { method: "POST", headers, body: JSON.stringify({ query }) });
        const t = await r.text();
        if (!r.ok) { console.error(`Google [${r.status}]: ${t}`); status.google = { connected: true, error: `Google Ads -tilin luku epäonnistui (${r.status}).` }; }
        else {
          status.google = { connected: true };
          const agg = new Map<string, Row>();
          for (const x of JSON.parse(t).results ?? []) {
            const name = x.campaign?.name ?? "?";
            const a = agg.get(name) ?? { platform: "google", campaign: name, spend: 0, impressions: 0, clicks: 0, currency: x.customer?.currencyCode ?? "EUR" };
            a.spend += Number(x.metrics?.costMicros ?? 0) / 1e6; a.impressions += Number(x.metrics?.impressions ?? 0); a.clicks += Number(x.metrics?.clicks ?? 0);
            agg.set(name, a);
          }
          rows.push(...agg.values());
        }
      }
    }
    return json({ ok: true, rows, status, since: d(since), until: d(until) });
  } catch (e) {
    console.error(e);
    return json({ error: "Mainoskulujen haku epäonnistui." }, 500);
  }
});
