import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Building2, Loader2, RefreshCw, Search, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomers } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Choice } from '@/components/admin/CrmWorkspace';
import { WorkspaceHeader } from '@/components/admin/WorkspaceHeader';
import { WorkspaceNav } from '@/components/admin/WorkspaceNav';
import { CustomerCard } from '@/components/admin/CustomerCard';
import { UnlinkedCustomerQueue } from '@/components/admin/UnlinkedCustomerQueue';
import { OfferImportDialog } from '@/components/admin/OfferImportDialog';
import { SEO } from '@/components/seo/SEO';
import { CUSTOMER_STATES, EMPTY_CUSTOMERS, customerRecord, filterCustomers, unlinkedLeads, shortDate, serviceLabel } from '@/lib/customerRegister';
import { money } from '@/lib/crm';

type TeamPerson = { id: string; email: string };
export default function AdminCustomersPage() {
  const { user, loading, roleLoading, isEditor, signOut } = useAuth();
  const { organizationId } = useParams();
  const [params, setParams] = useSearchParams();
  const enabled = Boolean(user && isEditor && !loading && !roleLoading);
  const query = useCustomers(enabled);
  const team = useQuery<TeamPerson[]>({ queryKey: ['customer_team'], enabled, queryFn: async () => {
    const { data, error } = await supabase.functions.invoke('admin-users', { body: { action: 'team' } });
    if (error) throw error;
    if (!Array.isArray(data?.users)) throw new Error('Tiimihakemisto puuttuu');
    return data.users;
  } });
  if (loading || roleLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Tarkistetaan käyttöoikeutta" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) return <div className="ws-page ws-with-nav"><WorkspaceNav /><WorkspaceHeader title="Asiakkaat" home={false} onSignOut={signOut} /><main className="container px-4 py-8"><h2 className="text-xl">Ei käyttöoikeutta</h2><p className="mt-3 text-sm text-muted-foreground">Asiakasrekisteri on henkilöstön käytössä.</p></main></div>;
  const person = (id: string | null) => !id ? 'Ei määritelty' : id === user.id ? user.email ?? 'Oma vastuu' : team.data?.find(p => p.id === id)?.email ?? 'Vastuuhenkilön nimi ei saatavilla';
  const records = (query.data?.organizations ?? []).map(o => customerRecord(query.data ?? EMPTY_CUSTOMERS, o));
  const filters = { search: params.get('haku') ?? '', owner: params.get('vastuu') ?? 'all', service: params.get('palvelu') ?? 'all', state: params.get('asiakkuus') ?? 'all', attention: params.get('yhteys') === '1' };
  const filtered = filterCustomers(records, filters);
  const set = (key: string, value: string) => { const n = new URLSearchParams(params); if (value && value !== 'all') n.set(key, value); else n.delete(key); setParams(n, { replace: true }); };
  const services = [...new Set(records.flatMap(r => r.services))].sort();
  const ownerIds = [...new Set(records.map(r => r.organization.owner_id).filter((id): id is string => Boolean(id)))];
  const selected = records.find(r => r.organization.id === organizationId);
  const unlinked = unlinkedLeads(query.data?.leads ?? []);
  const queueView = params.get('jono') === 'liittamattomat';
  const href = (id: string) => `/admin/asiakkaat/${encodeURIComponent(id)}${params.size ? `?${new URLSearchParams({ paluu: params.toString() })}` : ''}`;
  return <div className="ws-page ws-with-nav ws-area-sales"><WorkspaceNav /><SEO title="Asiakkaat – KeudaPRO" description="Organisaatioiden asiakkuudet ja ostohistoria." path="/admin/asiakkaat" /><WorkspaceHeader title="Asiakkaat" subtitle={user.email} onSignOut={signOut} actions={<div className="flex flex-wrap gap-2"><OfferImportDialog leads={unlinked} onImported={() => query.refetch()} /><Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" disabled={query.isFetching} onClick={() => { query.refetch(); team.refetch(); }}><RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />Päivitä</Button></div>} />
    <main className="container mx-auto space-y-6 px-4 py-7 sm:py-8">
      {query.isPending ? <p role="status" className="flex items-center gap-2 py-8"><Loader2 className="h-5 w-5 animate-spin" />Ladataan asiakastietoja…</p> : query.isError ? <div role="alert" className="space-y-3 py-8"><h2 className="text-xl">Asiakastietoja ei voitu hakea</h2><p className="text-sm text-muted-foreground">Tietoja ei voida näyttää juuri nyt.</p><Button variant="outline" onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Yritä uudelleen</Button></div> : organizationId ? selected ? <CustomerCard record={selected} person={person} /> : <div className="space-y-4 py-8"><h2 className="text-xl">Asiakasta ei löydy</h2><p className="text-sm text-muted-foreground">Organisaatiota ei löytynyt tai sinulla ei ole siihen oikeutta.</p><Button asChild variant="outline"><Link to="/admin/asiakkaat">Takaisin asiakkaisiin</Link></Button></div> : <>
        <nav aria-label="Asiakasrekisterin näkymät" className="flex flex-wrap gap-2 border-b pb-4"><Button variant={queueView ? 'outline' : 'default'} aria-pressed={!queueView} onClick={() => set('jono', '')}>Organisaatiot ({records.length})</Button><Button variant={queueView ? 'default' : 'outline'} aria-pressed={queueView} onClick={() => set('jono', 'liittamattomat')}>Liittämättömät yhteydenotot ({unlinked.length})</Button></nav>
        {queueView ? <UnlinkedCustomerQueue leads={unlinked} person={person} /> : <>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl text-keuda-navy-section">Organisaatiot</h2><p className="mt-1 text-sm text-muted-foreground">{records.length.toLocaleString('fi-FI')} organisaatiota · {filtered.length.toLocaleString('fi-FI')} tällä rajauksella</p></div><Button variant={filters.attention ? 'default' : 'outline'} onClick={() => set('yhteys', filters.attention ? '' : '1')}><Users className="mr-2 h-4 w-4" />Ota yhteyttä ({records.filter(r => r.needsContact).length})</Button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="relative self-end"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Hae organisaatiota" placeholder="Yritys, Y-tunnus tai yhteyshenkilö" className="pl-9" value={filters.search} onChange={e => set('haku', e.target.value)} /></div><Choice label="Asiakkuuden tilanne" value={filters.state} onChange={v => set('asiakkuus', v)} options={[["all", "Kaikki asiakkuudet"], ...Object.entries(CUSTOMER_STATES)]} /><Choice label="Asiakkuusvastaava" value={filters.owner} onChange={v => set('vastuu', v)} options={[["all", "Kaikki vastuuhenkilöt"], ["none", "Ei määritelty"], ...ownerIds.map(id => [id, person(id)] as [string, string])]} /><Choice label="Palvelutyyppi" value={filters.service} onChange={v => set('palvelu', v)} options={[["all", "Kaikki palvelut"], ...services.map(key => [key, serviceLabel(key)] as [string, string])]} /></div>
        {team.isError && <p role="alert" className="text-sm text-muted-foreground">Vastuuhenkilöiden nimiä ei voitu hakea. Asiakastiedot näkyvät ilman puuttuvia nimiä.</p>}
        {records.length === 0 ? <section className="border-y py-16 text-center"><Building2 className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 text-lg">Ei organisaatioita asiakasrekisterissä</h3><Button asChild variant="outline" className="mt-5"><Link to="/admin/markkinointi?tab=leads">Avaa myynnin yhteydenotot<ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button></section> : filtered.length === 0 ? <div className="space-y-4 border-y py-12 text-center"><h3 className="text-lg">Ei organisaatioita tällä rajauksella</h3><Button variant="outline" onClick={() => setParams({})}>Tyhjennä rajaukset</Button></div> : <Table><TableHeader><TableRow><TableHead>Organisaatio / Y-tunnus</TableHead><TableHead>Asiakkuus</TableHead><TableHead>Asiakkuusvastaava</TableHead><TableHead>Ostohistoria (alv 0 %)</TableHead><TableHead>Tarjoukset / koulutukset</TableHead><TableHead>Seuraava toimenpide</TableHead><TableHead><span className="sr-only">Avaa asiakaskortti</span></TableHead></TableRow></TableHeader><TableBody>{filtered.map(r => <TableRow key={r.organization.id}><TableCell className="min-w-[180px]"><Link to={href(r.organization.id)} className="font-semibold text-primary underline-offset-4 hover:underline">{r.organization.name}</Link><p className="mt-1 text-xs text-muted-foreground">{r.organization.business_id || 'Y-tunnus puuttuu'}</p>{r.issues.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{r.issues.length} tarkistustarvetta</p>}</TableCell><TableCell className="min-w-[150px]"><Badge variant={r.state === 'unknown' ? 'outline' : 'secondary'} className="whitespace-normal">{CUSTOMER_STATES[r.state]}</Badge></TableCell><TableCell className="max-w-[210px] break-words text-xs">{person(r.organization.owner_id)}</TableCell><TableCell className="min-w-[145px]"><p className="font-medium tabular-nums">{money(r.totalNet)}</p><p className="mt-1 text-xs text-muted-foreground">{r.orders.length} tilausta · {shortDate(r.lastOrder?.confirmed_at)}</p></TableCell><TableCell className="min-w-[150px] text-xs"><p>{r.openOffers.length} avointa tarjousta</p><p className="mt-1 text-muted-foreground">{r.deliveries.filter(d => !['päättynyt', 'peruttu'].includes(d.production_status)).length} avointa koulutusta</p></TableCell><TableCell className="min-w-[180px] max-w-[260px] text-xs">{r.nextTask ? <><p className="break-words font-medium">{r.nextTask.title}</p><p className="mt-1 text-muted-foreground">{shortDate(r.nextTask.due_at)}</p></> : r.noNext.length ? <span className="text-destructive">Jatkotoimi puuttuu</span> : <span className="text-muted-foreground">Ei sovittuja tehtäviä</span>}{r.overdue.length > 0 && <p className="mt-1 text-destructive">{r.overdue.length} myöhässä</p>}</TableCell><TableCell><Button asChild variant="outline" size="icon"><Link to={href(r.organization.id)} aria-label={`Avaa asiakaskortti: ${r.organization.name}`}><ArrowUpRight className="h-4 w-4" /></Link></Button></TableCell></TableRow>)}</TableBody></Table>}
        </>}
      </>}
    </main>
  </div>;
}