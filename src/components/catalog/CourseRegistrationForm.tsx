import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dateTime, money } from '@/lib/crm';
import { PRIVACY_VERSION, registrationErrors, type Party, type Participant, type PublicOffering, type RegistrationResult } from '@/lib/catalog';

const emptyParty = (): Party => ({ org_name: '', business_id: '', contact_name: '', email: '', phone: '', einvoice_address: '' });

function PartyFields({ label, value, onChange, org }: { label: string; value: Party; onChange: (p: Party) => void; org: boolean }) {
  const f = (k: keyof Party, l: string, type = 'text', req = false, auto?: string) => <label className="min-w-0 space-y-1 text-sm"><span>{l}{req ? ' *' : ''}</span><Input type={type} autoComplete={auto} maxLength={160} value={value[k] ?? ''} onChange={e => onChange({ ...value, [k]: e.target.value })} required={req} /></label>;
  return <fieldset className="grid gap-3 rounded-md border p-4 sm:grid-cols-2"><legend className="px-1 text-sm font-semibold text-keuda-blue">{label}</legend>
    {org && f('org_name', 'Organisaatio tai maksajan nimi', 'text', true, 'organization')}{org && f('business_id', 'Y-tunnus (yrityksille)')}
    {f('contact_name', org ? 'Laskutuksen yhteyshenkilö' : 'Nimi', 'text', true, 'name')}{f('email', 'Sähköposti', 'email', true, 'email')}
    {!org && f('phone', 'Puhelin (vapaaehtoinen)', 'tel', false, 'tel')}{org && f('einvoice_address', 'Verkkolaskuosoite (vapaaehtoinen)')}
  </fieldset>;
}

/** General course sign-up: reserves seats (or waitlist) for KeudaPRO to confirm; no payment in this phase. */
export function CourseRegistrationForm({ courseName, offering, preview, onBack, onDone }: { courseName: string; offering: PublicOffering; preview: boolean; onBack: () => void; onDone: (r: RegistrationResult) => void }) {
  const [seats, setSeats] = useState(1);
  const [buyer, setBuyer] = useState<Party>(emptyParty());
  const [billing, setBilling] = useState<Party>(emptyParty());
  const [participants, setParticipants] = useState<Participant[]>([{ name: '', email: '' }]);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const named = participants.filter(p => p.name.trim() || p.email.trim());
    const errs = registrationErrors({ seats, buyer, billing, participants: named, terms }); setErrors(errs);
    if (errs.length || preview) return;
    setBusy(true);
    const { data, error } = await (supabase as any).rpc('cat_register', { p_offering_id: offering.id, p_seats: seats, p_buyer: buyer, p_billing: billing, p_payer: null, p_participants: named, p_terms_accepted: terms, p_marketing_consent: false, p_privacy_version: PRIVACY_VERSION });
    setBusy(false);
    if (error) setErrors([error.message]); else onDone(data as RegistrationResult);
  };

  return <form className="space-y-5" onSubmit={submit} noValidate>
    <div><p className="text-sm text-muted-foreground">Ilmoittaudun</p><p className="font-semibold">{courseName}</p><p className="text-sm text-muted-foreground">{dateTime(offering.starts_at)} – {dateTime(offering.ends_at)} · {money(offering.unit_price)} / osallistuja (alv 0 %)</p></div>
    <label className="block max-w-[10rem] space-y-1 text-sm"><span>Paikkamäärä *</span><Input type="number" min={1} max={50} value={seats} onChange={e => { const n = Math.max(1, Math.min(50, Number(e.target.value) || 1)); setSeats(n); setParticipants(p => p.slice(0, n)); }} /></label>
    {offering.free_seats !== undefined && seats > offering.free_seats && <p className="text-sm text-muted-foreground">Vapaita paikkoja on {offering.free_seats}. Loput paikat menevät jonotuslistalle.</p>}
    <PartyFields label="Ilmoittajan tiedot" value={buyer} onChange={setBuyer} org={false} />
    <PartyFields label="Laskutustiedot" value={billing} onChange={setBilling} org />
    <fieldset className="space-y-3 rounded-md border p-4"><legend className="px-1 text-sm font-semibold text-keuda-blue">Osallistujat (voi toimittaa myöhemmin)</legend>
      {participants.map((p, i) => <div key={i} className="grid gap-2 sm:grid-cols-2">
        <Input aria-label={`Osallistuja ${i + 1}: nimi`} placeholder="Nimi" value={p.name} onChange={e => setParticipants(ps => ps.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
        <Input aria-label={`Osallistuja ${i + 1}: sähköposti`} type="email" placeholder="Sähköposti" value={p.email} onChange={e => setParticipants(ps => ps.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></div>)}
      {participants.length < seats && <Button type="button" variant="outline" size="sm" onClick={() => setParticipants(ps => [...ps, { name: '', email: '' }])}>Lisää osallistuja</Button>}
    </fieldset>
    <label className="flex items-start gap-2 rounded-md bg-muted/40 p-4 text-sm"><input type="checkbox" className="mt-1 h-4 w-4" checked={terms} onChange={e => setTerms(e.target.checked)} />
      <span>Hyväksyn peruutusehdot (maksuton peruutus viimeistään {offering.free_cancel_days} vrk ennen alkua, myöhemmin {offering.late_cancel_pct} % hinnasta) ja olen tutustunut <a className="underline" href="https://www.keuda.fi/tietosuojaseloste/" target="_blank" rel="noopener noreferrer">tietosuojaselosteeseen</a>. *</span></label>
    {errors.length > 0 && <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-destructive">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
    {preview && <p className="text-sm font-semibold text-secondary">Esikatselu: lomaketta ei lähetetä.</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || preview}>{busy ? 'Lähetetään…' : 'Lähetä ilmoittautuminen'}</Button><Button type="button" variant="ghost" onClick={onBack}>Takaisin</Button></div>
  </form>;
}
