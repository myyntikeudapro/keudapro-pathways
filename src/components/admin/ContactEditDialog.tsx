import { useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CONTACT_INTERESTS, CONTACT_ROLES, type ContactRecord } from '@/lib/contactRegister';

/** Saves only through crm_update_contact; success is shown after the server confirms. */
export function ContactEditDialog({ record: r, onSaved }: { record: ContactRecord; onSaved: () => void }) {
  const init = () => ({ name: r.contact.name, email: r.contact.email, phone: r.contact.phone ?? '', job_title: r.jobTitle ?? '', roles: r.roles, interests: r.interests, is_key_person: r.isKeyPerson });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggle = (key: 'roles' | 'interests', value: string) => setForm(f => ({ ...f, [key]: f[key].includes(value) ? f[key].filter(x => x !== value) : [...f[key], value] }));
  const save = async () => {
    setSaving(true); setError(null);
    const { error } = await supabase.rpc('crm_update_contact', { p_contact_id: r.contact.id, p_expected_updated_at: r.contact.updated_at, p: form });
    setSaving(false);
    if (error) { setError(error.message || 'Tallennus epäonnistui.'); return; }
    toast.success('Yhteyshenkilön tiedot tallennettu.');
    setOpen(false); onSaved();
  };
  const Group = ({ title, k, options }: { title: string; k: 'roles' | 'interests'; options: Record<string, string> }) => <fieldset className="space-y-2"><legend className="text-sm font-medium">{title}</legend><div className="grid gap-2 sm:grid-cols-2">{Object.entries(options).map(([v, n]) => <label key={v} className="flex items-start gap-2 text-sm"><Checkbox checked={form[k].includes(v)} onCheckedChange={() => toggle(k, v)} className="mt-0.5" />{n}</label>)}</div></fieldset>;
  return <Dialog open={open} onOpenChange={o => { setOpen(o); if (o) { setForm(init()); setError(null); } }}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" />Muokkaa tietoja</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Muokkaa yhteyshenkilöä</DialogTitle><DialogDescription>Roolit ja avainhenkilömerkintä koskevat asemaa organisaatiossa {r.organizationName}. Kiinnostusalue ei ole markkinointisuostumus. Tallennus ei vahvista tietojen oikeellisuutta.</DialogDescription></DialogHeader>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1"><Label htmlFor="ce-name">Nimi</Label><Input id="ce-name" disabled={r.historyLocked} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ce-title">Tehtävänimike</Label><Input id="ce-title" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ce-email">Sähköposti</Label><Input id="ce-email" type="email" disabled={r.historyLocked} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-1"><Label htmlFor="ce-phone">Puhelin</Label><Input id="ce-phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        {r.historyLocked && <p className="text-sm text-muted-foreground">Henkilö on hyväksytyn tarjouksen tai tilauksen yhteyshenkilö, joten nimeä ja sähköpostia ei voi muuttaa, jotta sopimushistoria säilyy.</p>}
        <label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={form.is_key_person} onCheckedChange={v => setForm({ ...form, is_key_person: v === true })} />Avainhenkilö tässä organisaatiossa</label>
        <Group title="Asiakkuusroolit" k="roles" options={CONTACT_ROLES} />
        <Group title="Ammatilliset kiinnostusalueet" k="interests" options={CONTACT_INTERESTS} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Peruuta</Button><Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Tallenna</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

export function VerifyContactButton({ record: r, onSaved }: { record: ContactRecord; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  return <Button variant="outline" size="sm" disabled={saving} onClick={async () => {
    setSaving(true);
    const { error } = await supabase.rpc('crm_verify_contact', { p_contact_id: r.contact.id, p_expected_updated_at: r.contact.updated_at });
    setSaving(false);
    if (error) { toast.error(error.message || 'Vahvistus epäonnistui.'); return; }
    toast.success('Yhteystietojen tarkistus kirjattu.'); onSaved();
  }}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Vahvista yhteystiedot tarkistetuiksi</Button>;
}
