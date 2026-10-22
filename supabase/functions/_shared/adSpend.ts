const GW = "https://connector-gateway.lovable.dev";
type Row = { campaign_id: string; platform: "meta" | "google"; campaign: string; spend: number; impressions: number; clicks: number; currency: string };
type Status = { connected: boolean; error?: string };


export async function readAdSpend(since:string,until:string) {
    const lov = Deno.env.get("LOVABLE_API_KEY");
    const rows: Row[] = [];
    const status: Record<string, Status> = { meta: { connected: false }, google: { connected: false } };

    // Meta
    const metaKey = Deno.env.get("META_ADS_API_KEY");
    const metaAcc = Deno.env.get("META_AD_ACCOUNT_ID") ?? "1588371865850122";
    if (lov && metaKey && metaAcc) {
      const q = new URLSearchParams({ level: "campaign", fields: "campaign_id,campaign_name,spend,impressions,clicks,account_currency", time_range: JSON.stringify({ since: since, until: until }), limit: "200" });
      const collected: Row[] = [];
      try {
        let after = '';
        for (let page = 0; ; page++) {
          if (page >= 100) throw new Error('Meta-raportti jäi osittaiseksi.');
          if (after) q.set('after',after);
          const r = await fetch(`${GW}/meta_ads/v26.0/act_${metaAcc}/insights?${q}`, { headers: { Authorization:`Bearer ${lov}`, 'X-Connection-Api-Key':metaKey }});
          const text = await r.text();
          if (!r.ok) { console.error(`Meta [${r.status}]: ${text}`); throw new Error(`Meta-tilin luku epäonnistui (${r.status}).`); }
          const payload = JSON.parse(text);
          for (const x of payload.data ?? []) collected.push({platform:'meta',campaign_id:String(x.campaign_id),campaign:x.campaign_name,spend:Number(x.spend)||0,impressions:Number(x.impressions)||0,clicks:Number(x.clicks)||0,currency:x.account_currency??'EUR'});
          if (!payload.paging?.next) break;
          const next = payload.paging?.cursors?.after;
          if (!next || next===after) throw new Error('Meta-raportin jatkosivu puuttuu.');
          after=next;
        }
        status.meta={connected:true}; rows.push(...collected);
      } catch(e) { status.meta={connected:true,error:e instanceof Error?e.message:'Meta-raportti ei ole saatavilla.'}; }

    }

    // Google Ads
    const gKey = Deno.env.get("GOOGLE_ADS_API_KEY");
    const gCust = (Deno.env.get("GOOGLE_ADS_CUSTOMER_ID") ?? "").replace(/-/g, "");
    if (lov && gKey) {
      if (!gCust) status.google = { connected: true, error: "Google Ads -tiliä ei ole vielä valittu." };
      else {
        const query = `SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.impressions, metrics.clicks, customer.currency_code FROM campaign WHERE segments.date BETWEEN '${since}' AND '${until}'`;
        const headers: Record<string, string> = { Authorization: `Bearer ${lov}`, "X-Connection-Api-Key": gKey, "Content-Type": "application/json" };
        const login = Deno.env.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID");
        if (login) headers["login-customer-id"] = login.replace(/-/g, "");
        try {
          let pageToken = '';
          const agg = new Map<string, Row>();
          for (let page=0; ;page++) {
            if (page>=100) throw new Error('Google-raportti jäi osittaiseksi.');
            const r = await fetch(`${GW}/google_ads/v25/customers/${gCust}/googleAds:search`, {method:'POST',headers,body:JSON.stringify({query,...(pageToken?{pageToken}:{})})});
            const text=await r.text();
            if (!r.ok) { console.error(`Google [${r.status}]: ${text}`); throw new Error(`Google Ads -tilin luku epäonnistui (${r.status}).`); }
            const payload=JSON.parse(text);
            for (const x of payload.results??[]) {
              const id=String(x.campaign?.id);
              const a=agg.get(id)??{platform:'google' as const,campaign_id:id,campaign:x.campaign?.name??'?',spend:0,impressions:0,clicks:0,currency:x.customer?.currencyCode??'EUR'};
              a.spend+=Number(x.metrics?.costMicros??0)/1e6; a.impressions+=Number(x.metrics?.impressions??0); a.clicks+=Number(x.metrics?.clicks??0); agg.set(id,a);
            }
            if (!payload.nextPageToken) break;
            if (payload.nextPageToken===pageToken) throw new Error('Google-raportin jatkosivu puuttuu.');
            pageToken=payload.nextPageToken;
          }
          status.google={connected:true}; rows.push(...agg.values());
        } catch(e) { status.google={connected:true,error:e instanceof Error?e.message:'Google-raportti ei ole saatavilla.'}; }

      }
    }

 return {rows,status};
}
