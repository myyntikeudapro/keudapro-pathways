// Shared batched reads for the sales card and the kanban conflict badges: both build CardFacts with the
// same function from the same rows, so the badge count always equals the open card's conflicts.
import { readAll } from '@/lib/crm';
import { cardIssues, cardSources, conflictCount, type CardFacts, type SourceInteraction, type StoredSourceDoc } from '@/lib/salesCard';

export type FactsLead = { id: string; organization_id: string | null; contact_id: string | null; owner_id: string | null; deal_value: number | null; company_programme_id: string | null };
type Team = { id: string; email: string }[];
export type CardRaw = {
  offers: any[]; versions: any[]; orders: any[]; importRows: (SourceInteraction & { lead_id: string })[];
  docs: (StoredSourceDoc & { lead_id: string; id: string; file_size: number | null })[]; programmes: any[];
};
type Db = { from: (t: string) => any };

const CHUNK = 100;
const chunks = <T,>(xs: T[]) => Array.from({ length: Math.ceil(xs.length / CHUNK) }, (_, i) => xs.slice(i * CHUNK, (i + 1) * CHUNK));
/** Every id list is chunked and every chunk fully paginated, so no rows are cut off and no per-lead request is made. */
async function inAll(db: Db, table: string, cols: string, col: string, ids: string[], extra?: (q: any) => any): Promise<any[]> {
  const out: any[] = [];
  for (const part of chunks([...new Set(ids)])) out.push(...await readAll((f, t) => { let q = db.from(table).select(cols).in(col, part); if (extra) q = extra(q); return q.order('id').range(f, t); }));
  return out;
}

export async function fetchCardRaw(db: Db, leads: FactsLead[]): Promise<CardRaw> {
  const ids = leads.map(l => l.id);
  if (!ids.length) return { offers: [], versions: [], orders: [], importRows: [], docs: [], programmes: [] };
  const [offers, orders, importRows, docs, programmes] = await Promise.all([
    inAll(db, 'crm_offers', 'id,lead_id,title,amount,status,expected_close,created_at', 'lead_id', ids),
    inAll(db, 'crm_orders', 'id,lead_id,total_net,vat_rate,vat_basis,starts_on,cancelled_at,created_at', 'lead_id', ids, q => q.is('cancelled_at', null)),
    inAll(db, 'crm_interactions', 'id,lead_id,kind,summary,occurred_at', 'lead_id', ids, q => q.like('summary', 'Tuotu alkuperäinen teksti (%')),
    inAll(db, 'crm_source_documents', 'id,lead_id,kind,original_name,text_content,storage_path,file_size,created_at', 'lead_id', ids),
    inAll(db, 'prod_programme_versions', 'id,case_lead_id,revision,state,promises,programme,responsible_trainer_id', 'case_lead_id', ids),
  ]);
  const versions = offers.length ? await inAll(db, 'crm_offer_versions', 'id,offer_id,version_no,vat_rate,approved_at,content,starts_on,imported', 'offer_id', offers.map(o => o.id)) : [];
  return { offers, versions, orders, importRows, docs, programmes };
}

const newestFirst = (a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at));
/** Pure: the facts the conflict rules see for one lead. */
export function buildCardFacts(lead: FactsLead, raw: CardRaw, team: Team) {
  const offers = raw.offers.filter(o => o.lead_id === lead.id).sort(newestFirst);
  const offer = offers.find(o => o.status === 'accepted') ?? offers[0] ?? null;
  const version = offer ? raw.versions.filter(v => v.offer_id === offer.id).sort((a, b) => b.version_no - a.version_no)[0] ?? null : null;
  const order = raw.orders.filter(o => o.lead_id === lead.id).sort(newestFirst)[0] ?? null;
  const sources = cardSources(raw.docs.filter(d => d.lead_id === lead.id), raw.importRows.filter(r => r.lead_id === lead.id));
  // Latest revision of the lead's programme, read by case so a just-saved revision counts before the lead list reloads.
  const prog = raw.programmes.filter(p => p.case_lead_id === lead.id).sort((a, b) => b.revision - a.revision)[0] ?? null;
  const trainerLabel = prog?.responsible_trainer_id ? team.find(t => t.id === prog.responsible_trainer_id)?.email ?? null : null;
  const facts: CardFacts = {
    offer: offer ? { status: offer.status, vatRate: version?.vat_rate ?? null, approved: !!version?.approved_at, content: version?.content ?? null, startsOn: version?.starts_on ?? null } : null,
    order: order ? { vatRate: order.vat_rate, vatBasis: order.vat_basis, startsOn: order.starts_on } : null,
    programme: prog ? { trainers: prog.programme?.trainers ?? [], trainerLabel, promises: prog.promises ?? '', startsAt: prog.programme?.startsAt ?? null } : null,
    sourceText: sources.map(s => s.text).join('\n'), sources,
    organizationLinked: !!lead.organization_id, contactLinked: !!lead.contact_id, ownerSet: !!lead.owner_id, valueSet: lead.deal_value !== null,
  };
  return { offer, version, order, sources, programme: prog, facts, issues: cardIssues(facts) };
}

export function conflictCounts(leads: FactsLead[], raw: CardRaw, team: Team): Map<string, number> {
  return new Map(leads.map(l => [l.id, conflictCount(buildCardFacts(l, raw, team).issues)]));
}
