/** Public request boundary; origins are defense-in-depth, not authentication. Quotas are always server-enforced. */
export type PublicAiScope = 'growth-checkup' | 'smart-search' | 'veli-coach-chat' | 'chat';
const origins = new Set(['http://localhost:8080','http://127.0.0.1:8080','https://id-preview--372569a7-94e8-4660-8a21-6fa94be31047.lovable.app','https://keudapro.fi','https://www.keudapro.fi','https://keudapro.lovable.app']);
export type PublicMessage = { role: 'user' | 'assistant'; content: string };
export type PublicBody = { messages?: PublicMessage[]; query?: string; revenue?: number; team?: number; growth?: number; bottleneck?: number; focus?: string; index?: unknown };
export function validatePublicAiBody(scope: PublicAiScope, value: unknown): value is PublicBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const b = value as Record<string, unknown>;
  if (scope === 'growth-checkup') return Object.keys(b).every(k => ['revenue','team','growth','bottleneck','focus'].includes(k)) && ['revenue','team','growth','bottleneck'].every(k => typeof b[k] === 'number' && Number.isFinite(b[k])) && (b.focus === undefined || ['myynti','skaalaus','uudistuminen','osaaminen','osaamisen-johtaminen'].includes(String(b.focus)));
  if (scope === 'smart-search') return Object.keys(b).every(k => ['query','index'].includes(k)) && typeof b.query === 'string' && b.query.trim().length >= 2 && b.query.length <= 200;
  return Object.keys(b).length === 1 && Array.isArray(b.messages) && b.messages.length >= 1 && b.messages.length <= 20 && b.messages.every(m => m && typeof m === 'object' && !Array.isArray(m) && Object.keys(m).every(k => ['role','content'].includes(k)) && ['user','assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim().length > 0 && m.content.length <= 2000) && b.messages.at(-1)?.role === 'user';
}
export async function boundedJson(req: Request, maxBytes: number): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('invalid');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error('oversize'); }
    chunks.push(value);
  }
  const data = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(data));
}
export async function visitorHash(req: Request, now = new Date()) {
  // Platform-provided forwarding headers are best-effort identity; the shared global quota is the hard spend backstop.
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`keudapro-public-ai:${now.toISOString().slice(0,10)}:${ip}`));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,'0')).join('').slice(0,32);
}
export async function admitPublicAi(req: Request, scope: PublicAiScope, consume: (scope: PublicAiScope, visitor: string) => Promise<boolean>, headers: Record<string,string>): Promise<{ body: PublicBody; response?: never } | { response: Response; body?: never }> {
  const respond = (status: number, message: string) => ({ response: new Response(JSON.stringify({ error: message }), { status, headers: { ...headers, 'Content-Type':'application/json', 'Cache-Control':'no-store' } }) });
  if (!origins.has(req.headers.get('origin') ?? '')) return respond(403,'Palvelu ei ole käytettävissä tästä osoitteesta.');
  if (req.method !== 'POST') return respond(405,'Vain POST-pyynnöt sallitaan.');
  try {
    const body = await boundedJson(req, scope === 'growth-checkup' ? 4096 : scope === 'smart-search' ? 24000 : 48000);
    if (!validatePublicAiBody(scope,body)) return respond(400,'Tarkista pyynnön tiedot.');
    let allowed = false;
    try { allowed = await consume(scope,await visitorHash(req)); } catch { return respond(503,'Palvelu ei ole juuri nyt käytettävissä.'); }
    if (allowed !== true) return respond(429,'Käyttöraja täyttyi. Kokeile myöhemmin uudelleen.');
    return { body };
  } catch (e) { return respond(e instanceof Error && e.message === 'oversize' ? 413 : 400,'Pyyntö on liian suuri tai virheellinen.'); }
}
