import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { publicAdviserPolicy, validatePublicConversation } from "./policy.ts";

// Dedicated public boundary: no client-selected coach, sources, prompts, profile,
// conversation ID or URLs. No database, cache, logging of bodies, or model call.
// Model instruction and SDK inference are intentionally not implemented yet.
Deno.serve(async (req: Request) => {
  const respond = (status: number, error: string) => new Response(JSON.stringify({ error, actions: publicAdviserPolicy.allowedActions }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond(405, "Method not allowed");
  try {
    const reader = req.body?.getReader();
    if (!reader) return respond(400, "Invalid request");
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > publicAdviserPolicy.maxBodyBytes) {
        await reader.cancel();
        return respond(413, "Request too large");
      }
      chunks.push(value);
    }
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    if (!validatePublicConversation(JSON.parse(new TextDecoder().decode(data)))) return respond(400, "Invalid request");
    return respond(503, "Palveluneuvoja ei ole vielä käytössä. Käytä UKK:ta ja mukaanpääsyohjetta.");
  } catch {
    return respond(400, "Invalid request");
  }
});