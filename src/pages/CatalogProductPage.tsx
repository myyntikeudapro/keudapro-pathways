import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookingRequest } from '@/contexts/BookingRequestContext';
import { catalogPath, registrationOpen, type PublicCatalog } from '@/lib/catalog';
import { dateTime, money } from '@/lib/crm';
import { CalendarDays, Loader2, MapPin, Users } from 'lucide-react';
import NotFound from './NotFound';

const db = supabase as any;
const SITE = 'https://keudapro.fi';

async function staffPreview(slug: string): Promise<PublicCatalog | null> {
  const { data: p } = await db.from('cat_products').select('*').eq('slug', slug).maybeSingle();
  if (!p) return null;
  const { data: offerings } = await db.from('cat_offerings').select('*,cat_price_versions(unit_price,vat_basis)').eq('product_id', p.id).neq('status', 'peruttu').order('starts_at');
  return { slug: p.slug, name: p.name, description: p.description, service_key: p.service_key, offerings: (offerings ?? []).map((o: any) => ({ ...o, unit_price: o.cat_price_versions?.unit_price ?? 0, vat_basis: o.cat_price_versions?.vat_basis ?? '' })) };
}

export default function CatalogProductPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const { isEditor, roleLoading } = useAuth();
  const { openBookingRequest } = useBookingRequest();
  const preview = params.get('esikatselu') === '1';
  const q = useQuery({
    queryKey: ['cat_public', slug, preview && isEditor],
    enabled: !preview || !roleLoading,
    queryFn: async () => {
      if (preview && isEditor) return staffPreview(slug);
      const { data, error } = await db.rpc('cat_public_catalog', { p_slug: slug });
      if (error) throw error;
      return data as PublicCatalog | null;
    },
  });
  if (q.isPending) return <Layout><div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" aria-label="Ladataan" /></div></Layout>;
  if (q.isError || !q.data) return <NotFound />;
  const c = q.data;
  const ask = (topic: string) => openBookingRequest({ source: `Kurssiluettelo: ${c.name}`, topic });
  return <Layout>
    <Helmet><title>{`${c.name} – KeudaPRO`}</title><meta name="description" content={c.description.slice(0, 160)} /><link rel="canonical" href={`${SITE}${catalogPath(c.slug)}`} />{preview && <meta name="robots" content="noindex" />}</Helmet>
    {preview && isEditor && <p className="bg-secondary/15 px-4 py-2 text-center text-sm">Esikatselu – vain henkilökunta näkee tämän sivun ennen julkaisua.</p>}
    <section className="bg-keuda-navy-section py-16 text-primary-foreground"><div className="container mx-auto max-w-4xl px-4"><p className="text-xs font-semibold uppercase tracking-widest opacity-80">KeudaPRO-koulutus</p><h1 className="mt-2 text-3xl font-bold text-primary-foreground sm:text-4xl">{c.name}</h1>{c.description && <p className="mt-4 max-w-2xl text-lg opacity-90">{c.description}</p>}</div></section>
    <section className="bg-gray-section py-12"><div className="container mx-auto max-w-4xl space-y-4 px-4">
      <h2 className="text-2xl font-semibold text-keuda-blue">Tulevat toteutukset</h2>
      {c.offerings.length === 0 && <div className="rounded-xl border bg-card p-5"><p>Uusia toteutuksia ei ole vielä julkaistu.</p><Button className="mt-3" onClick={() => ask(`${c.name} – tulevat toteutukset`)}>Kysy seuraavasta toteutuksesta</Button></div>}
      <ul className="space-y-3">{c.offerings.map(o => { const open = registrationOpen(o); return <li key={o.id} className="grid gap-3 rounded-xl border bg-card p-5 shadow-card sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-1 text-sm"><p className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-secondary" />{dateTime(o.starts_at)} – {dateTime(o.ends_at)}</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" />{o.location ?? 'Paikka tarkentuu'}</p><p className="flex items-center gap-2"><Users className="h-4 w-4 text-secondary" />{o.capacity} paikkaa</p>
          <p className="text-base font-semibold">{money(o.unit_price)} <span className="text-xs font-normal text-muted-foreground">(alv 0 %)</span></p>
          <p className="text-xs text-muted-foreground">Maksuton peruutus viimeistään {o.free_cancel_days} vrk ennen alkua, myöhemmin {o.late_cancel_pct} % hinnasta. {open ? `Ilmoittautuminen päättyy ${dateTime(o.reg_closes_at)}.` : 'Ilmoittautuminen ei ole nyt auki.'}</p></div>
        <Button onClick={() => ask(`${c.name} ${dateTime(o.starts_at)}`)}>Kysy tai varaa paikka</Button></li>; })}</ul>
    </div></section>
  </Layout>;
}
