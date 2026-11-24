import { WorkspaceHeader, headerGhost } from '@/components/admin/WorkspaceHeader';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Choice } from '@/components/admin/CrmWorkspace';
import { WorkspaceNav } from '@/components/admin/WorkspaceNav';
import { WorkspaceIdentity } from '@/components/admin/WorkspacePerson';
import { SEO } from '@/components/seo/SEO';
import { CRM_SERVICES, dateTime, money } from '@/lib/crm';
import { OFFERING_STATUS, PRODUCT_STATUS, SLUG_PATTERN, catalogPath, latestVersion, priceVersionFor, slugify, type PriceVersion } from '@/lib/catalog';
import { useToast } from '@/hooks/use-toast';
import { OfferingRegistrations } from '@/components/admin/CatalogRegistrations';
import { CohortSchedulePanel } from '@/components/admin/CohortSchedulePanel';
import { Loader2, LogOut } from 'lucide-react';

const db = supabase as any;
const SERVICES = Object.entries(CRM_SERVICES).filter(([k]) => k !== 'all') as [string, string][];

function Box({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 rounded-xl border bg-card p-4 shadow-card sm:p-5"><h2 className="text-base font-semibold text-keuda-navy-section">{title}</h2>{children}</section>;
}

export default function AdminCatalogPage() {
  const { user, loading, roleLoading, isEditor, signOut } = useAuth();
  if (loading || roleLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Tarkistetaan käyttöoikeutta" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isEditor) return <main className="mx-auto max-w-lg p-6"><h1 className="text-xl font-semibold">Ei käyttöoikeutta</h1><Button className="mt-4" onClick={signOut}>Kirjaudu ulos</Button></main>;
  return <div className="ws-page ws-with-nav"><WorkspaceNav />
    <SEO title="Kurssiluettelo – KeudaPRO" description="Koulutustuotteet, hinnat ja toteutuskerrat." path="/admin/kurssiluettelo" />
    <WorkspaceHeader title="Kurssiluettelo" subtitle="Koulutustuotteet, hintaversiot ja toteutuskerrat" onSignOut={signOut} actions={<WorkspaceIdentity />} />
    <main className="container mx-auto space-y-4 px-4 py-8"><Catalog userId={user.id} /></main>
  </div>;
}

function Catalog({ userId }: { userId: string }) {
  const qc = useQueryClient(); const { toast } = useToast();
  const data = useQuery({ queryKey: ['cat_admin'], queryFn: async () => {
    const r = await Promise.all(['cat_products', 'cat_price_versions', 'cat_offerings'].map(n => db.from(n).select('*')));
    r.forEach((x: any) => { if (x.error) throw x.error; });
    const [products, prices, offerings] = r.map((x: any) => x.data as any[]);
    return { products, prices: prices as PriceVersion[], offerings };
  } });
  const act = useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: any }>) => { const { error } = await fn(); if (error) throw new Error(error.message); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cat_admin'] }),
    onError: (e: Error) => toast({ title: 'Toiminto ei onnistunut', description: e.message, variant: 'destructive' }),
  });
  const [p, setP] = useState({ slug: '', name: '', service_key: 'osaaminen', description: '' });
  const [o, setO] = useState({ product_id: '', starts: '', ends: '', closes: '', location: '', capacity: '12', price: '' });
  if (data.isPending) return <Loader2 className="h-5 w-5 animate-spin" aria-label="Ladataan" />;
  if (data.isError) return <p role="alert" className="text-destructive">Tietoja ei voitu hakea.</p>;
  const d = data.data;
  const productName = (id: string) => d.products.find(x => x.id === id)?.name ?? '–';

  const addProduct = (e: FormEvent) => {
    e.preventDefault();
    const slug = p.slug || slugify(p.name);
    if (!SLUG_PATTERN.test(slug)) { toast({ title: 'Tarkista osoite', description: 'Vain pienet kirjaimet a–z, numerot ja väliviivat (3–80 merkkiä).', variant: 'destructive' }); return; }
    act.mutate(() => db.from('cat_products').insert({ ...p, slug, sales_owner_id: userId, production_owner_id: userId }));
    setP({ ...p, slug: '', name: '', description: '' });
  };
  const addOffering = (e: FormEvent) => {
    e.preventDefault();
    act.mutate(async () => {
      const choice = priceVersionFor(d.prices, o.product_id, Number(o.price || 0));
      let versionId: string;
      if ('reuse' in choice) versionId = choice.reuse.id;
      else {
        const r = await db.from('cat_price_versions').insert({ product_id: o.product_id, version_no: choice.create, unit_price: Number(o.price || 0), vat_basis: 'koulutus_veroton', valid_from: new Date().toISOString().slice(0, 10) }).select('id').single();
        if (r.error) return r; versionId = r.data.id;
      }
      const starts = new Date(o.starts).toISOString();
      return db.from('cat_offerings').insert({ product_id: o.product_id, price_version_id: versionId, starts_at: starts, ends_at: new Date(o.ends).toISOString(), location: o.location || null, reg_opens_at: new Date().toISOString(), reg_closes_at: o.closes ? new Date(o.closes).toISOString() : new Date(Date.parse(starts) - 86_400_000).toISOString(), capacity: Number(o.capacity) });
    });
  };

  return <>
    <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Julkaistu tuote näkyy osoitteessa /kurssit/osoite. Verkkoilmoittautuminen avataan toteutuskerroittain; kiinni olevissa sivun painike ohjaa yhteydenottoon. Verkkomaksu ei ole vielä käytössä eikä ilmoittautujille lähetetä automaattisia viestejä.</p>
    <Box title="Tuotteet">
      {d.products.length === 0 && <p className="text-sm text-muted-foreground">Ei vielä tuotteita.</p>}
      <ul className="divide-y text-sm">{d.products.map(x => { const pv = d.prices.filter(v => v.product_id === x.id).sort((a, b) => b.version_no - a.version_no); return <li key={x.id} className="grid items-end gap-2 py-3 sm:grid-cols-[1fr_12rem]">
        <span><strong>{x.name}</strong> · <a className="underline" href={`${catalogPath(x.slug)}${x.status === 'julkaistu' ? '' : '?esikatselu=1'}`} target="_blank" rel="noreferrer">{x.status === 'julkaistu' ? catalogPath(x.slug) : 'Esikatsele'}</a>
          <span className="block text-xs text-muted-foreground">{CRM_SERVICES[x.service_key] ?? x.service_key} · {pv.map(v => `v${v.version_no} ${money(v.unit_price)}${v.locked_at ? ' (lukittu)' : ''}`).join(', ') || 'ei hintaversiota'}{x.published_at ? ` · julkaistu ${dateTime(x.published_at)}` : ''}</span></span>
        <Choice label="Julkaisutila" value={x.status} onChange={v => act.mutate(() => db.from('cat_products').update({ status: v }).eq('id', x.id))} options={PRODUCT_STATUS} /></li>; })}</ul>
      <form className="grid gap-2 sm:grid-cols-2" onSubmit={addProduct}>
        <Input aria-label="Tuotteen nimi" placeholder="Tuotteen nimi" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} required />
        <Input aria-label="Osoite" placeholder={p.name ? slugify(p.name) : 'osoite (tehdään nimestä)'} value={p.slug} onChange={e => setP({ ...p, slug: e.target.value })} />
        <Choice label="Palvelu" value={p.service_key} onChange={v => setP({ ...p, service_key: v })} options={SERVICES} />
        <Input aria-label="Kuvaus" placeholder="Lyhyt kuvaus" value={p.description} onChange={e => setP({ ...p, description: e.target.value })} />
        <Button variant="secondary" className="sm:col-span-2" disabled={act.isPending}>Luo tuote (luonnos)</Button>
      </form>
    </Box>
    <Box title="Toteutuskerrat">
      {d.offerings.length === 0 && <p className="text-sm text-muted-foreground">Ei vielä toteutuskertoja.</p>}
      <ul className="divide-y text-sm">{[...d.offerings].sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map(x => { const v = d.prices.find(pv => pv.id === x.price_version_id); return <li key={x.id} className="grid items-end gap-2 py-3 sm:grid-cols-[1fr_12rem]">
        <span><strong>{productName(x.product_id)}</strong> · {dateTime(x.starts_at)}–{dateTime(x.ends_at)}<span className="block text-xs text-muted-foreground">{x.location ?? 'Paikka avoinna'} · {x.capacity} paikkaa · {v ? `${money(v.unit_price)} (v${v.version_no})` : ''} · ilmoittautuminen päättyy {dateTime(x.reg_closes_at)}</span>{x.status === 'julkaistu' && <Badge variant="outline" className="mt-1">Näkyy sivulla</Badge>}</span>
        <Choice label="Tila" value={x.status} onChange={s => act.mutate(() => db.from('cat_offerings').update({ status: s }).eq('id', x.id))} options={OFFERING_STATUS} />
        <div className="sm:col-span-2"><OfferingRegistrations offering={x} /></div></li>; })}</ul>
      {d.products.length > 0 && <form className="grid gap-2 sm:grid-cols-3" onSubmit={addOffering}>
        <Choice label="Tuote" value={o.product_id} onChange={v => setO({ ...o, product_id: v, price: String(latestVersion(d.prices, v)?.unit_price ?? '') })} options={[...d.products.filter(x => x.status !== 'arkistoitu').map(x => [x.id, x.name] as [string, string])]} />
        <label className="text-xs">Alkaa<Input type="datetime-local" value={o.starts} onChange={e => setO({ ...o, starts: e.target.value })} required /></label>
        <label className="text-xs">Päättyy<Input type="datetime-local" value={o.ends} onChange={e => setO({ ...o, ends: e.target.value })} required /></label>
        <label className="text-xs">Ilmoittautuminen päättyy (oletus vrk ennen)<Input type="datetime-local" value={o.closes} onChange={e => setO({ ...o, closes: e.target.value })} /></label>
        <label className="text-xs">Paikka<Input value={o.location} onChange={e => setO({ ...o, location: e.target.value })} placeholder="Esim. Mäntsälä tai Teams" /></label>
        <label className="text-xs">Paikkoja<Input type="number" min={1} value={o.capacity} onChange={e => setO({ ...o, capacity: e.target.value })} required /></label>
        <label className="text-xs">Hinta € (alv 0 %)<Input type="number" min={0} step="0.01" value={o.price} onChange={e => setO({ ...o, price: e.target.value })} required /></label>
        <Button variant="secondary" className="self-end sm:col-span-2" disabled={!o.product_id || act.isPending}>Lisää toteutuskerta (luonnos)</Button>
      </form>}
      <p className="text-xs text-muted-foreground">Kun toteutuskerta julkaistaan, sen hinta lukittuu. Uusi hinta tekee automaattisesti uuden hintaversion.</p>
    </Box>
    <Box title="AI-ohjelmien ryhmät ja aikataulut"><CohortSchedulePanel /></Box>
  </>;
}
