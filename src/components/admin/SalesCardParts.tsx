import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CircleDashed, FileText, Mail } from 'lucide-react';
import { CRM_SERVICES, dateTime, money, type Lead, type TeamMember } from '@/lib/crm';
import { companyWorkflow, type CompanyStaffSnapshot } from '@/lib/companyTrainingWorkflow';
import { cardIssues, importedSources, type CardFacts, type CardIssue } from '@/lib/salesCard';

const db = supabase as any;
const workflow = companyWorkflow(async (name, args) => { const { data, error } = await db.rpc(name, args); if (error) throw new Error(error.message || 'rpc_failed'); return data; });
const OFFER_STATUS: Record<string, string> = { draft: 'Luonnos', sent: 'Lähetetty', accepted: 'Hyväksytty', declined: 'Hylätty' };
const HANDOFF: Record<string, string> = { submitted: 'Luovutettu, odottaa vastaanottoa', accepted: 'Tuotanto vastaanotti', returned: 'Palautettu täydennettäväksi' };

/** Read-only facts for the card header; all writes stay in the existing panels. */
export function useSalesCardFacts(lead: Lead, team: TeamMember[]) {
  return useQuery({ queryKey: ['sales_card_facts', lead.id], queryFn: async () => {
    const offers = await db.from('crm_offers').select('id,title,amount,status,expected_close,created_at').eq('lead_id', lead.id).order('created_at', { ascending: false });
    if (offers.error) throw offers.error;
    const ids = (offers.data ?? []).map((o: any) => o.id);
    const versions = ids.length ? await db.from('crm_offer_versions').select('id,offer_id,version_no,vat_rate,approved_at,content,starts_on,imported').in('offer_id', ids).order('version_no', { ascending: false }) : { data: [], error: null };
    if (versions.error) throw versions.error;
    const orders = await db.from('crm_orders').select('id,total_net,vat_rate,vat_basis,starts_on,cancelled_at,created_at').eq('lead_id', lead.id).is('cancelled_at', null).order('created_at', { ascending: false });
    if (orders.error) throw orders.error;
    const handoffs = orders.data.length ? await db.from('crm_production_handoffs').select('order_id,company_state').in('order_id', orders.data.map((o: any) => o.id)) : { data: [], error: null };
    if (handoffs.error) throw handoffs.error;
    const inter = await db.from('crm_interactions').select('id,kind,summary,occurred_at').eq('lead_id', lead.id).order('occurred_at', { ascending: false });
    if (inter.error) throw inter.error;
    let snapshot: CompanyStaffSnapshot | null = null;
    if (lead.company_programme_id) { try { snapshot = await workflow.read(lead.company_programme_id) as CompanyStaffSnapshot; } catch { snapshot = null; } }
    const org = lead.organization_id ? await db.from('crm_organizations').select('id,name').eq('id', lead.organization_id).maybeSingle() : { data: null };
    const contact = lead.contact_id ? await db.from('crm_contacts').select('id,name,email').eq('id', lead.contact_id).maybeSingle() : { data: null };
    return { offers: offers.data as any[], versions: versions.data as any[], orders: orders.data as any[], handoffs: handoffs.data as any[], interactions: inter.data as any[], snapshot, org: org.data, contact: contact.data };
  }, select: d => {
    const offer = d.offers.find(o => o.status === 'accepted') ?? d.offers[0] ?? null;
    const version = offer ? d.versions.find(v => v.offer_id === offer.id) ?? null : null;
    const order = d.orders[0] ?? null;
    const sources = importedSources(d.interactions);
    const sourceText = sources.map(s => [s.pdf, s.email, s.other].join('\n')).join('\n');
    const s = d.snapshot;
    const trainerLabel = s?.responsible_trainer_id ? team.find(t => t.id === s.responsible_trainer_id)?.email ?? null : null;
    const facts: CardFacts = {
      offer: offer ? { status: offer.status, vatRate: version?.vat_rate ?? null, approved: !!version?.approved_at, content: version?.content ?? null, startsOn: version?.starts_on ?? null } : null,
      order: order ? { vatRate: order.vat_rate, vatBasis: order.vat_basis, startsOn: order.starts_on } : null,
      programme: s ? { trainers: s.programme?.trainers ?? [], trainerLabel, promises: s.promises ?? '', startsAt: s.programme?.startsAt ?? null } : null,
      sourceText, organizationLinked: !!lead.organization_id, contactLinked: !!lead.contact_id, ownerSet: !!lead.owner_id, valueSet: lead.deal_value !== null,
    };
    const handoff = order ? d.handoffs.find(h => h.order_id === order.id) : null;
    const latest = d.interactions.find(i => !/^Tuotu alkuperäinen teksti \(/.test(i.summary)) ?? null;
    return { ...d, offer, version, order, sources, facts, issues: cardIssues(facts), handoff, latest };
  } });
}
export type SalesCardData = NonNullable<ReturnType<typeof useSalesCardFacts>['data']>;

export const deliveryOf = (content?: string | null) => content?.match(/Toteutustapa:\s*([^\n]+)/)?.[1]?.trim() ?? null;
export function cardTitle(lead: Lead, d?: SalesCardData) {
  const training = d?.offer?.title ?? CRM_SERVICES[lead.service_key ?? 'muu'] ?? null;
  return [d?.org?.name ?? lead.organization ?? lead.name, training].filter(Boolean).join(' – ');
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="text-sm font-medium break-words">{children}</dd></div>;
}

export function SalesCardHeader({ lead, data, team }: { lead: Lead; data?: SalesCardData; team: TeamMember[] }) {
  const owner = team.find(t => t.id === lead.owner_id)?.email ?? 'Ei myyntivastaavaa';
  const value = data?.order ? `${money(Number(data.order.total_net))} (vahvistettu tilaus)` : data?.offer ? `${money(Number(data.offer.amount))} (tarjottu)` : lead.deal_value !== null ? `${money(Number(lead.deal_value))} (arvio)` : 'Arvo puuttuu';
  const prod = data?.handoff ? HANDOFF[data.handoff.company_state] ?? 'Luovutus kesken' : data?.snapshot ? (data.snapshot.state === 'approved' ? 'Ohjelma hyväksytty' : 'Ohjelmaluonnos') : 'Ei aloitettu';
  if (!data) return <p role="status" className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">Ladataan kortin perustietoja…</p>;
  return <section aria-label="Kortin perustiedot" className="rounded-lg border bg-muted/30 p-3 space-y-3">
    <dl className="grid gap-3 grid-cols-2 sm:grid-cols-3">
      <Fact label="Organisaatio">{data?.org?.name ?? lead.organization ?? 'Ei liitetty'}</Fact>
      <Fact label="Yhteyshenkilö">{data?.contact?.name ?? lead.name}</Fact>
      <Fact label="Myyntivastaava">{owner}</Fact>
      <Fact label="Koulutus">{data?.offer?.title ?? 'Ei tarjousta'}</Fact>
      <Fact label="Toteutustapa">{deliveryOf(data?.version?.content) ?? 'Ei kirjattu'}</Fact>
      <Fact label="Arvo (alv 0 %)">{value}</Fact>
    </dl>
    <div className="flex flex-wrap gap-2 text-xs">
      <Badge variant="outline">Myyntivaihe: {lead.status}</Badge>
      <Badge variant="outline">Tarjous: {data?.offer ? OFFER_STATUS[data.offer.status] ?? data.offer.status : 'puuttuu'}</Badge>
      <Badge variant={data?.order ? 'default' : 'outline'}>Tilaus: {data?.order ? 'vahvistettu' : 'ei vahvistettu'}</Badge>
      <Badge variant="outline">Tuotanto: {prod}</Badge>
      {!!data?.issues.length && <Badge variant="destructive">{data.issues.length} huomioitavaa</Badge>}
    </div>
  </section>;
}

export function IssueList({ issues }: { issues: CardIssue[] }) {
  if (!issues.length) return <p className="text-sm text-muted-foreground">Ei havaittuja ristiriitoja tai puuttuvia tietoja.</p>;
  return <ul aria-label="Ristiriidat ja puuttuvat tiedot" className="space-y-1.5">{issues.map(i => <li key={i.key} className={`flex gap-2 text-sm ${i.kind === 'conflict' ? 'text-destructive' : 'text-muted-foreground'}`}>{i.kind === 'conflict' ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> : <CircleDashed className="h-4 w-4 shrink-0 mt-0.5" />}<span>{i.text}</span></li>)}
    <li className="text-xs text-muted-foreground pt-1">Tiedot vain näytetään: mitään ei korjata tai hyväksytä automaattisesti.</li></ul>;
}

export function SourceMaterial({ data }: { data?: SalesCardData }) {
  const sources = data?.sources ?? [];
  return <details className="rounded-md border p-3"><summary className="cursor-pointer font-semibold text-sm">Lähdeaineisto ({sources.length})</summary>
    <div className="space-y-3 pt-3">{sources.length === 0 ? <p className="text-sm text-muted-foreground">Tuotua tarjousta tai keskustelua ei ole.</p> : sources.map((s, i) => <div key={i} className="space-y-2">
      <p className="text-xs text-muted-foreground">Tuotu {s.importedAt ? dateTime(s.importedAt) : ''}</p>
      {s.pdf && <details className="rounded border p-2"><summary className="cursor-pointer text-sm inline-flex items-center gap-2"><FileText className="h-4 w-4" />Tarjous-PDF{s.pdfName ? `: ${s.pdfName}` : ''}</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{s.pdf}</pre></details>}
      {s.email && <details className="rounded border p-2"><summary className="cursor-pointer text-sm inline-flex items-center gap-2"><Mail className="h-4 w-4" />Sähköpostikeskustelu</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{s.email}</pre></details>}
      {s.other && <details className="rounded border p-2"><summary className="cursor-pointer text-sm">Tuotu teksti</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{s.other}</pre></details>}
    </div>)}</div></details>;
}
