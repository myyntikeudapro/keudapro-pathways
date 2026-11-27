import { LeadNextStep } from './CaseNextStep';
import { NextStep } from './NextStep';
import { chooseRelated } from '@/lib/workspaceNextStep';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Building2, ChevronLeft, ChevronRight, Search, Star, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Choice } from '@/components/admin/CrmWorkspace';
import { ContactEditDialog, VerifyContactButton } from '@/components/admin/ContactEditDialog';
import { CONTACT_INTERESTS, CONTACT_ROLES, VERIFY_STATES, MARKETING_STATUS, MISSING, contactHref, filterContacts, paginate, type ContactRecord } from '@/lib/contactRegister';
import { deliveryHref, leadHref, serviceLabel, shortDate } from '@/lib/customerRegister';
import { money } from '@/lib/crm';

const withBack = (href: string, params: URLSearchParams) => `${href}${params.size ? `?${new URLSearchParams({ paluu: params.toString() })}` : ''}`;
const offerLabels: Record<string, string> = { draft: 'Luonnos', sent: 'Lähetetty', accepted: 'Hyväksytty', declined: 'Hylätty' };

export function ContactList({ records, organizations }: { records: ContactRecord[]; organizations: { id: string; name: string }[] }) {
  const [params, setParams] = useSearchParams();
  const filters = { search: params.get('hhaku') ?? '', organization: params.get('horg') ?? 'all', interest: params.get('hkiin') ?? 'all', key: params.get('havain') === '1', verify: params.get('htark') ?? 'all' };
  const set = (key: string, value: string) => { const n = new URLSearchParams(params); if (value && value !== 'all') n.set(key, value); else n.delete(key); if (key !== 'sivu') n.delete('sivu'); setParams(n, { replace: true }); };
  const filtered = filterContacts(records, filters);
  const page = paginate(filtered, Number(params.get('sivu') ?? 1));
  return <section aria-label="Yhteyshenkilöt" className="space-y-4">
    <div><h2 className="text-xl text-keuda-navy-section">Yhteyshenkilöt</h2><p className="mt-1 text-sm text-muted-foreground">{records.length.toLocaleString('fi-FI')} yhteyshenkilöä · {filtered.length.toLocaleString('fi-FI')} tällä rajauksella · Markkinointikäytön peruste tarkistetaan erikseen</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="relative self-end"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Hae yhteyshenkilöä" placeholder="Nimi, nimike, yritys tai sähköposti" className="pl-9" value={filters.search} onChange={e => set('hhaku', e.target.value)} /></div>
      <Choice label="Organisaatio" value={filters.organization} onChange={v => set('horg', v)} options={[['all', 'Kaikki organisaatiot'], ...[...organizations].sort((a, b) => a.name.localeCompare(b.name, 'fi')).map(o => [o.id, o.name] as [string, string])]} />
      <Choice label="Kiinnostusalue" value={filters.interest} onChange={v => set('hkiin', v)} options={[['all', 'Kaikki kiinnostusalueet'], ...Object.entries(CONTACT_INTERESTS)]} />
      <Choice label="Yhteystietojen tarkistus" value={filters.verify} onChange={v => set('htark', v)} options={[['all', 'Kaikki'], ...Object.entries(VERIFY_STATES)]} /></div>
    <div><Button size="sm" variant={filters.key ? 'default' : 'outline'} aria-pressed={filters.key} onClick={() => set('havain', filters.key ? '' : '1')}><Star className="mr-2 h-4 w-4" />Vain avainhenkilöt</Button></div>
    {records.length === 0 ? <div className="border-y py-14 text-center"><UserRound className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 text-lg">Ei yhteyshenkilöitä rekisterissä</h3><p className="mt-2 text-sm text-muted-foreground">Yhteyshenkilöt syntyvät, kun yhteydenotto liitetään organisaatioon.</p></div>
      : filtered.length === 0 ? <div className="space-y-4 border-y py-12 text-center"><h3 className="text-lg">Ei hakua vastaavia yhteyshenkilöitä</h3><Button variant="outline" onClick={() => { const n = new URLSearchParams(params); ['hhaku', 'horg', 'hkiin', 'havain', 'htark', 'sivu'].forEach(k => n.delete(k)); setParams(n, { replace: true }); }}>Tyhjennä rajaukset</Button></div>
      : <><ul className="divide-y border-y">{page.items.map(r => <li key={r.contact.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><Link to={withBack(contactHref(r.contact.id), params)} className="break-words font-semibold text-primary underline-offset-4 hover:underline">{r.contact.name}</Link>{r.sameName > 0 && <Badge variant="outline" className="ml-2">Samanniminen henkilö rekisterissä</Badge>}{r.isKeyPerson && <Badge className="ml-2"><Star className="mr-1 h-3 w-3" />Avainhenkilö</Badge>}<p className="mt-1 break-words text-sm text-muted-foreground">{r.jobTitle ? `${r.jobTitle} · ` : ''}{r.organizationName}</p>{r.roles.length > 0 && <p className="mt-1 flex flex-wrap gap-1">{r.roles.map(k => <Badge key={k} variant="secondary" className="whitespace-normal font-normal">{CONTACT_ROLES[k]}</Badge>)}</p>}<p className="break-all text-xs text-muted-foreground">{r.email}</p></div>
          <p className="shrink-0 text-xs text-muted-foreground sm:text-right"><span className="block font-medium">{VERIFY_STATES[r.verify]}</span>{r.leads.length} yhteydenottoa · {r.offers.length} tarjousta · {r.orders.length} tilausta</p></li>)}</ul>
        {page.pages > 1 && <nav aria-label="Sivutus" className="flex items-center justify-between gap-2"><Button variant="outline" size="sm" disabled={page.page <= 1} onClick={() => set('sivu', String(page.page - 1))}><ChevronLeft className="mr-1 h-4 w-4" />Edellinen</Button><span className="text-sm">Sivu {page.page} / {page.pages}</span><Button variant="outline" size="sm" disabled={page.page >= page.pages} onClick={() => set('sivu', String(page.page + 1))}>Seuraava<ChevronRight className="ml-1 h-4 w-4" /></Button></nav>}</>}
  </section>;
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => <div className="grid gap-1 py-3 sm:grid-cols-[220px_1fr]"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="break-words text-sm">{children}</dd></div>;
const Empty = ({ children }: { children: ReactNode }) => <p className="py-4 text-sm text-muted-foreground">{children}</p>;

export function ContactCard({ record: r, person, onSaved }: { record: ContactRecord; person: (id: string | null) => string; onSaved: () => void }) {
  const [params, setParams] = useSearchParams();
  const cases = [...new Map([...r.leads.map(l => [l.id, { id: l.id, label: `${serviceLabel(l.service_key)} · ${shortDate(l.created_at)}` }] as const), ...r.offers.map(o => [o.lead_id, { id: o.lead_id, label: o.title }] as const), ...r.orders.map(o => [o.lead_id, { id: o.lead_id, label: serviceLabel(o.service_key) }] as const)].map(([id, c]) => [id, c])).values()];
  const selected = chooseRelated(cases, params.get('henkiloTapaus'));
  const back = params.get('paluu');
  const orgHref = r.organization ? `/admin/asiakkaat/${encodeURIComponent(r.organization.id)}?osio=yhteyshenkilot` : null;
  return <div className="space-y-6">
    <Button asChild variant="ghost" className="px-0"><Link to={back ? `/admin/asiakkaat?${back}` : '/admin/asiakkaat?jono=henkilot'}><ArrowLeft className="mr-2 h-4 w-4" />Yhteyshenkilöt</Link></Button>
    <div className="border-b pb-5"><div className="flex items-start gap-3"><UserRound className="mt-1 h-7 w-7 shrink-0 text-primary" /><h2 className="break-words text-2xl text-keuda-navy-section">{r.contact.name}</h2>{r.isKeyPerson && <Badge className="mt-1.5"><Star className="mr-1 h-3 w-3" />Avainhenkilö</Badge>}</div>
      <div className="mt-3 flex flex-wrap gap-2"><ContactEditDialog record={r} onSaved={onSaved} /><VerifyContactButton record={r} onSaved={onSaved} /></div>
      <p className="mt-2 text-sm text-muted-foreground">{orgHref ? <Link to={orgHref} className="inline-flex items-center text-primary underline"><Building2 className="mr-1 h-4 w-4" />{r.organizationName}</Link> : r.organizationName}</p>
      {r.sameName > 0 && <p className="mt-2 text-xs text-muted-foreground">Rekisterissä on {r.sameName} muu samanniminen henkilö. Tiedot on yhdistetty vain tunnisteiden perusteella.</p>}</div>
    {cases.length > 1 && <div><label htmlFor="person-case" className="text-xs text-muted-foreground">Henkilöön liitetty tapaus</label><select id="person-case" className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={selected?.id ?? ''} onChange={e => { const n = new URLSearchParams(params); n.set('henkiloTapaus', e.target.value); setParams(n); }}><option value="">Valitse tapaus</option>{cases.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>}
    {selected ? <LeadNextStep leadId={selected.id} person={person} /> : <NextStep step={{ stage: cases.length ? 'Valitse henkilöön liitetty tapaus' : 'Ei henkilöön liitettyjä tapauksia', role: 'Myyjä', issues: [] }} />}
    <section aria-labelledby="ch-info"><h3 id="ch-info" className="text-lg">Perustiedot</h3><dl className="divide-y">
      <Row label="Sähköposti">{r.email === MISSING ? MISSING : <a className="break-all text-primary underline" href={`mailto:${r.email}`} target="_blank" rel="noopener noreferrer">{r.email}</a>}</Row>
      <Row label="Puhelin">{r.phone === MISSING ? MISSING : <a className="text-primary underline" href={`tel:${r.phone}`} target="_blank" rel="noopener noreferrer">{r.phone}</a>}</Row>
      <Row label="Tehtävänimike">{r.jobTitle ?? MISSING}</Row>
      <Row label="Asiakkuusroolit">{r.roles.length ? r.roles.map(k => CONTACT_ROLES[k]).join(', ') : MISSING}</Row>
      <Row label="Ammatilliset kiinnostusalueet">{r.interests.length ? r.interests.map(k => CONTACT_INTERESTS[k]).join(', ') : MISSING}<span className="block text-xs text-muted-foreground">Kiinnostusalue ei ole markkinointisuostumus.</span></Row>
      <Row label="Yhteystiedot tarkistettu">{r.contact.contact_verified_at ? `${shortDate(r.contact.contact_verified_at)} · ${person(r.contact.contact_verified_by)} (${VERIFY_STATES[r.verify]})` : VERIFY_STATES.never}</Row>
      <Row label="Viimeksi muokattu">{r.contact.edited_at ? `${shortDate(r.contact.edited_at)} · ${person(r.contact.edited_by)}` : 'Ei muokattu henkilökortilta'}</Row>
      <Row label="Markkinointikäyttö">{MARKETING_STATUS}</Row>
      <Row label="Lisätty rekisteriin">{shortDate(r.contact.created_at)}</Row></dl></section>
    <section aria-labelledby="ch-leads"><h3 id="ch-leads" className="text-lg">Liitetyt yhteydenotot ({r.leads.length})</h3>{r.leads.length ? <ul className="divide-y">{r.leads.map(l => <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{serviceLabel(l.service_key)} · {shortDate(l.created_at)} · {l.status}</span><Link className="inline-flex items-center text-primary underline" to={leadHref(l.id)}>Avaa myynnissä<ArrowUpRight className="ml-1 h-4 w-4" /></Link></li>)}</ul> : <Empty>Ei liitettyjä yhteydenottoja.</Empty>}</section>
    <section aria-labelledby="ch-offers"><h3 id="ch-offers" className="text-lg">Tarjoukset ({r.offers.length})</h3>{r.offers.length ? <ul className="divide-y">{r.offers.map(o => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{o.title} · {money(Number(o.amount))} · {offerLabels[o.status] ?? 'Tila ei saatavilla'}</span><Link className="inline-flex items-center text-primary underline" to={leadHref(o.lead_id)}>Avaa myynnissä<ArrowUpRight className="ml-1 h-4 w-4" /></Link></li>)}</ul> : <Empty>Ei tarjousversioita, joissa henkilö on yhteyshenkilönä.</Empty>}</section>
    <section aria-labelledby="ch-orders"><h3 id="ch-orders" className="text-lg">Tilaukset ({r.orders.length})</h3>{r.orders.length ? <ul className="divide-y">{r.orders.map(o => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{serviceLabel(o.service_key)} · {money(Number(o.total_net))} (alv 0 %) · vahvistettu {shortDate(o.confirmed_at)}</span><Link className="inline-flex items-center text-primary underline" to={leadHref(o.lead_id)}>Avaa myynnissä<ArrowUpRight className="ml-1 h-4 w-4" /></Link></li>)}</ul> : <Empty>Ei tilauksia, joissa henkilö on yhteyshenkilönä.</Empty>}</section>
    <section aria-labelledby="ch-del"><h3 id="ch-del" className="text-lg">Koulutukset ({r.deliveries.length})</h3>{r.deliveries.length ? <ul className="divide-y">{r.deliveries.map(d => <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span>{d.title} · {d.production_status}</span><Link className="inline-flex items-center text-primary underline" to={deliveryHref(d.id)}>Avaa tuotannossa<ArrowUpRight className="ml-1 h-4 w-4" /></Link></li>)}</ul> : <Empty>Ei koulutuksia henkilön tilauksista.</Empty>}</section>
  </div>;
}
