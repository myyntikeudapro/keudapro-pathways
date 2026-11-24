import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dateTime, money } from '@/lib/crm';
import { emptyProgramForm, programFormErrors, programFormPayload, type ProgramFormConfig, type ProgramFormValues } from '@/lib/programForm';
import { phoneCountries } from '@/lib/phoneCountries';

type Result = { registration_id: string; held: number; waitlisted: number; billing_details_pending?: boolean; payer_option?: string };

const ExtLink = ({ href, children }: { href: string | null; children: string }) => href
  ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{children}</a>
  : <span>{children} <span className="text-xs text-muted-foreground">(linkki vahvistettava)</span></span>;

export function ProgramRegistrationForm({ config, preview, onBack, onDone }: { config: ProgramFormConfig; preview: boolean; onBack: () => void; onDone: (r: Result) => void }) {
  const [v, setV] = useState<ProgramFormValues>(emptyProgramForm());
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [phoneRegion, setPhoneRegion] = useState('FI');
  const set = <K extends keyof ProgramFormValues>(k: K, val: ProgramFormValues[K]) => setV(prev => ({ ...prev, [k]: val }));
  const field = (k: keyof ProgramFormValues, label: string, type = 'text', auto?: string) => <label className="space-y-1 text-sm"><span>{label} *</span>
    <Input type={type} autoComplete={auto} value={String(v[k])} onChange={e => set(k, e.target.value as never)} required /></label>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = programFormErrors(config, v); setErrors(errs); if (errs.length || preview) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('cat_register_program' as never, { p_offering: config.offering_id, p_form: programFormPayload(config, v) } as never);
    setBusy(false);
    if (error) setErrors([error.message]); else onDone({ ...data as unknown as Result, payer_option: v.payer_option });
  };

  return <form className="space-y-5" onSubmit={submit} noValidate>
    <div><p className="text-sm text-muted-foreground">Ilmoittaudun</p><p className="font-semibold">{config.form_title}</p>
      <p className="text-sm text-muted-foreground">{dateTime(config.starts_at)} – {dateTime(config.ends_at)}</p></div>
    <fieldset className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"><legend className="px-1 text-sm font-semibold text-keuda-blue">Osallistujan tiedot</legend>
      {field('first_name', 'Etunimi', 'text', 'given-name')}{field('last_name', 'Sukunimi', 'text', 'family-name')}
      <div className="sm:col-span-2">{field('email', 'Sähköposti', 'email', 'email')}</div>
      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
        <label className="min-w-0 space-y-1 text-sm"><span>Maakoodi *</span><select aria-label="Maakoodi" className="h-10 w-full min-w-0 rounded-md border bg-background px-3" value={phoneRegion} onChange={e => { setPhoneRegion(e.target.value); set('phone_country', phoneCountries.find(c => c.country === e.target.value)?.code ?? '+358'); }}>{phoneCountries.map(c => <option key={c.country} value={c.country}>{c.name} ({c.code})</option>)}</select></label>
        {field('phone_number', 'Matkapuhelinnumero', 'tel', 'tel-national')}
      </div>
      <div className="sm:col-span-2">{field('street_address', 'Katuosoite', 'text', 'street-address')}</div>
      {field('postal_code', 'Postinumero', 'text', 'postal-code')}{field('city', 'Postitoimipaikka', 'text', 'address-level2')}
    </fieldset>
    {config.orientation_required && <label className="block space-y-1 text-sm"><span>Valitse toiminto tai toimiala (koulutusohjelman suuntautuminen) *</span>
      <select className="h-10 w-full rounded-md border bg-background px-3" value={v.orientation} onChange={e => set('orientation', e.target.value)} required>
        <option value="">Valitse…</option>{config.orientations?.map(o => <option key={o} value={o}>{o}</option>)}</select></label>}
    {config.extra_info && <label className="block space-y-1 text-sm"><span>Lisätiedot</span><Textarea maxLength={1000} value={v.extra_info} onChange={e => set('extra_info', e.target.value)} /></label>}
    <fieldset className="space-y-2 rounded-md border p-4"><legend className="px-1 text-sm font-semibold text-keuda-blue">Koulutuksen maksaminen *</legend>
      {config.payer_options.map(p => <label key={p.key} className={`flex items-start gap-2 text-sm ${p.enabled === false ? 'text-muted-foreground' : ''}`}><input type="radio" name="payer" disabled={p.enabled === false} className="mt-1 h-4 w-4" checked={v.payer_option === p.key} onChange={() => set('payer_option', p.key)} /><span>{p.label}{p.enabled === false && ' (odottaa hyväksyntää)'}</span></label>)}
    </fieldset>
    {v.payer_option === 'employer' && <fieldset className="grid gap-3 border-t pt-4 sm:grid-cols-2"><legend className="text-sm font-semibold text-keuda-blue">Työnantajan laskutustiedot</legend>
      {([['billing_org', 'Yrityksen nimi'], ['billing_business_id', 'Y-tunnus'], ['billing_address', 'Laskutusosoite'], ['billing_postal_code', 'Laskutuksen postinumero'], ['billing_city', 'Laskutuksen postitoimipaikka'], ['billing_einvoice', 'Verkkolaskuosoite'], ['billing_operator', 'Verkkolaskuvälittäjä'], ['billing_contact', 'Laskutusyhteyshenkilö'], ['billing_email', 'Laskutussähköposti'], ['billing_reference', 'Tilausviite (vapaaehtoinen)']] as const).map(([k, label]) => <label key={k} className="min-w-0 space-y-1 text-sm"><span>{label}</span><Input maxLength={160} type={k === 'billing_email' ? 'email' : 'text'} value={v[k]} onChange={e => set(k, e.target.value)} /></label>)}
    </fieldset>}
    <div className="space-y-3 rounded-md bg-muted/40 p-4 text-sm">
      <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4" checked={v.accept_price} onChange={e => set('accept_price', e.target.checked)} /><span>Hyväksyn koulutusmaksun {money(config.price_amount)} ({config.vat_basis}). *</span></label>
      <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4" checked={v.accept_privacy} onChange={e => set('accept_privacy', e.target.checked)} /><span>Olen tutustunut <ExtLink href={config.privacy_url}>tietosuojaselosteeseen</ExtLink>. *</span></label>
      <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4" checked={v.accept_cancellation} onChange={e => set('accept_cancellation', e.target.checked)} /><span>Ilmoittautuminen on sitova. Olen tutustunut <ExtLink href={config.cancellation_url}>peruutusehtoihin</ExtLink> ja hyväksyn ne. *</span></label>
      <p className="text-xs text-muted-foreground">Ehtoversio: {config.terms_version ?? config.version}{config.terms_review_status !== 'approved' && ' · kehitystesti, lopullinen teksti vahvistettava'}</p>
    </div>
    {errors.length > 0 && <ul role="alert" className="list-disc rounded-md border-l-4 border-destructive p-3 pl-8 text-sm text-destructive">{errors.map(x => <li key={x}>{x}</li>)}</ul>}
    <div className="flex gap-2"><Button type="button" variant="ghost" onClick={onBack}>Takaisin</Button><Button disabled={busy || preview}>{busy ? 'Lähetetään…' : 'Lähetä ilmoittautuminen'}</Button></div>
    {preview && <p className="text-xs text-muted-foreground">Esikatselussa lähettäminen on estetty.</p>}
  </form>;
}
