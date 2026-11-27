import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CircleDashed, FileText, Mail } from 'lucide-react';
import { CRM_SERVICES, dateTime, money, type Lead, type TeamMember } from '@/lib/crm';
import { fetchCardRaw, buildCardFacts } from '@/lib/salesCardData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { issueTarget, promiseDraft, promiseSuggestions, sourceLabel, type CardFacts, type CardIssue, type IssueTarget } from '@/lib/salesCard';

const db = supabase as any;
const OFFER_STATUS: Record<string, string> = { draft: 'Luonnos', sent: 'Lähetetty', accepted: 'Hyväksytty', declined: 'Hylätty' };
const HANDOFF: Record<string, string> = { submitted: 'Luovutettu, odottaa vastaanottoa', accepted: 'Tuotanto vastaanotti', returned: 'Palautettu täydennettäväksi' };
export const SOURCE_BUCKET = 'crm-source-files';

/** Read-only facts for the card header; built with the same batched reads and rules as the kanban badges. */
export function useSalesCardFacts(lead: Lead, team: TeamMember[]) {
  return useQuery({ queryKey: ['sales_card_facts', lead.id], queryFn: async () => {
    const raw = await fetchCardRaw(db, [lead]);
    const orderIds = raw.orders.map(o => o.id);
    const handoffs = orderIds.length ? await db.from('crm_production_handoffs').select('order_id,company_state').in('order_id', orderIds) : { data: [], error: null };
    if (handoffs.error) throw handoffs.error;
    const latest = await db.from('crm_interactions').select('id,kind,summary,occurred_at').eq('lead_id', lead.id).not('summary', 'like', 'Tuotu alkuperäinen teksti (%').order('occurred_at', { ascending: false }).limit(1);
    if (latest.error) throw latest.error;
    const org = lead.organization_id ? await db.from('crm_organizations').select('id,name').eq('id', lead.organization_id).maybeSingle() : { data: null };
    const contact = lead.contact_id ? await db.from('crm_contacts').select('id,name,email').eq('id', lead.contact_id).maybeSingle() : { data: null };
    return { raw, handoffs: handoffs.data as any[], latest: (latest.data?.[0] ?? null) as any, org: org.data, contact: contact.data };
  }, select: d => {
    const built = buildCardFacts(lead, d.raw, team);
    const handoff = built.order ? d.handoffs.find(h => h.order_id === built.order.id) : null;
    return { ...d, ...built, handoff, programmeState: built.programme?.state as string | undefined };
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
  const prod = data?.handoff ? HANDOFF[data.handoff.company_state] ?? 'Luovutus kesken' : data?.programme ? (data.programmeState === 'approved' ? 'Ohjelma hyväksytty' : 'Ohjelmaluonnos') : 'Ei aloitettu';
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

export function IssueList({ issues, facts, onFix }: { issues: CardIssue[]; facts?: CardFacts; onFix?: (issue: CardIssue, target: IssueTarget) => void }) {
  if (!issues.length) return <p className="text-sm text-muted-foreground">Ei havaittuja ristiriitoja tai puuttuvia tietoja.</p>;
  return <ul aria-label="Ristiriidat ja puuttuvat tiedot" className="space-y-1.5">{issues.map(i => { const target = facts ? issueTarget(i, facts) : null; return <li key={i.key} data-issue={i.key} className={`flex flex-wrap items-start gap-2 text-sm ${i.kind === 'conflict' ? 'text-destructive' : 'text-muted-foreground'}`}>{i.kind === 'conflict' ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> : <CircleDashed className="h-4 w-4 shrink-0 mt-0.5" />}<span className="min-w-0 flex-1">{i.text}</span>{target && onFix && <Button type="button" size="sm" variant="outline" className="h-7 shrink-0" aria-label={`${target.action}: ${i.text}`} onClick={() => onFix(i, target)}>{target.action}</Button>}</li>; })}
    <li className="text-xs text-muted-foreground pt-1">Painikkeet vain avaavat oikean kentän: mitään ei korjata, tallenneta tai hyväksytä automaattisesti.</li></ul>;
}

/** Sends a reviewed draft to the open programme form. The form decides; nothing is saved here. */
export const PROMISE_EVENT = 'keuda:promise-draft';
export function PromiseSuggestionPanel({ data }: { data?: SalesCardData }) {
  const items = promiseSuggestions(data?.sources ?? []);
  const [picked, setPicked] = useState<Set<number>>(() => new Set(items.map((_, i) => i)));
  const [draft, setDraft] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [note, setNote] = useState('');
  const current = data?.facts.programme?.promises ?? '';
  const text = draft ?? promiseDraft(items.filter((_, i) => picked.has(i)));
  const transfer = () => {
    const detail = { text, handled: false };
    window.dispatchEvent(new CustomEvent(PROMISE_EVENT, { detail }));
    if (!detail.handled) return setNote('Ohjelmalomake ei ole auki tällä kortilla. Ehdotusta ei siirretty.');
    setNote('Ehdotus siirretty Asiakkaalle luvattu -kenttään. Tarkista ja tallenna ohjelma lomakkeen omalla painikkeella.');
    toast.message('Ehdotus siirretty lomakkeeseen – ei vielä tallennettu');
  };
  return <section id="promise-suggestion" tabIndex={-1} aria-label="Asiakkaalle luvattu – ehdotus" className="rounded-md border border-dashed p-3 space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <h3 className="text-sm font-semibold">Asiakkaalle luvattu – ehdotus lähdeaineistosta</h3>
    {!data ? <p role="status" className="text-sm text-muted-foreground">Ladataan lähdeaineistoa…</p>
      : dismissed ? <p className="text-sm text-muted-foreground">Ehdotus hylätty tältä kerralta. Kenttään ei tehty muutoksia. <button type="button" className="underline" onClick={() => setDismissed(false)}>Näytä uudelleen</button></p>
      : items.length === 0 ? <p className="text-sm text-muted-foreground">Lähdeaineistosta ei löytynyt yksiselitteisesti luvattuja asioita. Kenttä jätetään tyhjäksi ehdotuksen osalta.</p>
      : <>
        <p className="text-xs text-muted-foreground">Vain lähteessä suoraan luvatut asiat. Kielteiset, ehdolliset ja kysymysmuotoiset maininnat on jätetty pois. Ehdotus ei korvaa nykyistä kenttää.</p>
        <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="flex items-start gap-2 text-sm"><input id={`promise-${i}`} type="checkbox" className="mt-1" checked={picked.has(i)} onChange={e => { const n = new Set(picked); if (e.target.checked) n.add(i); else n.delete(i); setPicked(n); setDraft(null); }} /><label htmlFor={`promise-${i}`} className="min-w-0"><span className="font-medium">{it.text}</span><span className="block text-xs text-muted-foreground"><Badge variant="outline" className="mr-1 text-[10px]">{it.source}</Badge>”{it.quote}”</span></label></li>)}</ul>
        <label htmlFor="promise-draft" className="text-xs text-muted-foreground">Muokattava ehdotus</label>
        <Textarea id="promise-draft" rows={3} maxLength={4000} value={text} onChange={e => setDraft(e.target.value)} />
        {current.trim() && <p className="text-xs text-muted-foreground">Kentässä on jo tekstiä. Siirto lisää ehdotuksen sen perään eikä korvaa olemassa olevaa.</p>}
        <div className="flex flex-wrap gap-2"><Button type="button" size="sm" disabled={!text.trim()} onClick={transfer}>Siirrä lomakkeeseen</Button><Button type="button" size="sm" variant="ghost" onClick={() => { setDismissed(true); setNote(''); }}>Hylkää ehdotus</Button></div>
      </>}
    {note && <p role="status" className="text-xs">{note}</p>}
  </section>;
}

async function openStoredPdf(path: string) {
  const { data, error } = await supabase.storage.from(SOURCE_BUCKET).download(path);
  if (error || !data) return toast.error('PDF-tiedostoa ei voitu avata.');
  const url = URL.createObjectURL(data);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function SourceMaterial({ data }: { data?: SalesCardData }) {
  const sources = data?.sources ?? [];
  return <details className="rounded-md border p-3"><summary className="cursor-pointer font-semibold text-sm">Lähdeaineisto ({sources.length})</summary>
    <div className="space-y-3 pt-3">{sources.length === 0 ? <p className="text-sm text-muted-foreground">Tuotua tarjousta tai keskustelua ei ole.</p> : sources.map((s, i) => <details key={i} className="rounded border p-2" data-source-kind={s.kind}>
      <summary className="cursor-pointer text-sm inline-flex flex-wrap items-center gap-2">{s.kind === 'pdf' ? <FileText className="h-4 w-4" /> : <Mail className="h-4 w-4" />}{sourceLabel(s)}<span className="text-xs text-muted-foreground">· {s.at ? dateTime(s.at) : ''} · {s.stored ? 'tallennettu erillisenä lähteenä' : 'vanha tuonti (historiasta)'}</span></summary>
      {s.storagePath && <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => openStoredPdf(s.storagePath!)}>Avaa alkuperäinen PDF</Button>}
      {!s.stored && s.kind === 'pdf' && <p className="mt-2 text-xs text-muted-foreground">Vanhasta tuonnista on tallessa vain luettu teksti, ei alkuperäistä tiedostoa.</p>}
      <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{s.text}</pre>
    </details>)}</div></details>;
}
