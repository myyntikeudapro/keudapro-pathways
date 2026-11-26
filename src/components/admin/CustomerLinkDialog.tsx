import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Loader2, Search, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { findOrganizations, linkErrorText, linkLeadCustomer, normalizeBusinessId, type LinkChoice, type OrganizationCandidate } from '@/lib/customerLink';

export type LinkableLead = { id: string; name: string; email?: string | null; organization: string | null; organization_id: string | null; contact_id: string | null };
type Contact = { id: string; name: string; email: string; phone: string | null };
const db = supabase as any;

/** Staff-confirmed customer choice. Nothing is saved before the confirmation step; the server re-validates everything. */
export function CustomerLinkDialog({ lead, label = 'Valitse asiakas', onLinked }: { lead: LinkableLead; label?: string; onLinked?: () => void }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button variant="outline" size="sm"><Building2 className="mr-2 h-4 w-4" />{label}</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">{open && <LinkFlow lead={lead} onClose={() => setOpen(false)} onLinked={onLinked} />}</DialogContent>
  </Dialog>;
}

function LinkFlow({ lead, onClose, onLinked }: { lead: LinkableLead; onClose: () => void; onLinked?: () => void }) {
  const qc = useQueryClient();
  const [term, setTerm] = useState(lead.organization ?? ''); const [searched, setSearched] = useState('');
  const [org, setOrg] = useState<OrganizationCandidate | null>(null);
  const [newOrg, setNewOrg] = useState<{ name: string; businessId: string } | null>(null);
  const [contactMode, setContactMode] = useState<'existing' | 'new' | 'pending'>('existing');
  const [contactId, setContactId] = useState('');
  const [nc, setNc] = useState({ name: lead.name ?? '', email: lead.email ?? '', phone: '' });
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState('');
  const candidates = useQuery({ queryKey: ['org_candidates', searched], enabled: searched.length >= 2, queryFn: () => findOrganizations(searched) });
  const contacts = useQuery({ queryKey: ['org_contacts', org?.id], enabled: !!org, queryFn: async () => {
    const { data, error } = await db.from('crm_contacts').select('id,name,email,phone').eq('organization_id', org!.id).order('name');
    if (error) throw error; return data as Contact[];
  } });
  const bid = newOrg ? normalizeBusinessId(newOrg.businessId) : null;
  const orgReady = !!org || (!!newOrg && !!bid && !!newOrg.name.trim());
  const contactReady = contactMode === 'pending' || (contactMode === 'existing' && !!contactId) || (contactMode === 'new' && !!nc.name.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nc.email.trim()));
  const sameEmail = contactMode === 'new' ? contacts.data?.find(c => c.email.toLowerCase() === nc.email.trim().toLowerCase()) : undefined;
  const choice = (key: string): LinkChoice => ({
    leadId: lead.id, expectedOrganizationId: lead.organization_id, expectedContactId: lead.contact_id, opKey: key,
    organization: org ? { id: org.id } : { name: newOrg!.name, businessId: bid! },
    contact: contactMode === 'pending' ? null : contactMode === 'existing' ? { id: contactId } : { name: nc.name, email: nc.email, phone: nc.phone },
  });
  const edit = () => { setConfirmKey(null); setError(''); };
  const save = async () => {
    if (!confirmKey || busy) return;
    setBusy(true); setError('');
    try {
      const r = await linkLeadCustomer(choice(confirmKey));
      await Promise.all([qc.invalidateQueries({ queryKey: ['customer_register'] }), qc.invalidateQueries({ queryKey: ['company_case'] }), qc.invalidateQueries({ queryKey: ['org_contacts'] })]);
      setDone(r.contact_pending ? 'Yhteydenotto liitetty organisaatioon. Yhteyshenkilö jäi keskeneräiseksi.' : 'Yhteydenotto liitetty organisaatioon ja yhteyshenkilöön.');
      onLinked?.();
    } catch (e) {
      const msg = linkErrorText(e); setError(msg);
      if (/LINK_CHANGED/.test((e as any)?.message ?? '')) { await qc.invalidateQueries({ queryKey: ['customer_register'] }); await qc.invalidateQueries({ queryKey: ['company_case'] }); onLinked?.(); }
      setConfirmKey(null);
    } finally { setBusy(false); }
  };

  if (done) return <><DialogHeader><DialogTitle>Asiakas tallennettu</DialogTitle><DialogDescription>{done}</DialogDescription></DialogHeader><DialogFooter><Button onClick={onClose}>Sulje</Button></DialogFooter></>;
  return <>
    <DialogHeader><DialogTitle>Valitse asiakasorganisaatio</DialogTitle><DialogDescription>Yhteydenotto: {lead.name}{lead.organization ? ` · ilmoitettu organisaatio ${lead.organization}` : ''}. Mitään ei tallenneta ennen vahvistusta.</DialogDescription></DialogHeader>
    {confirmKey ? <div className="space-y-3 text-sm">
      <h3 className="font-semibold">Vahvista liittäminen</h3>
      <dl className="grid grid-cols-[8rem_1fr] gap-2"><dt className="text-muted-foreground">Organisaatio</dt><dd>{org ? `${org.name} · ${org.business_id ?? 'ei Y-tunnusta'}` : `UUSI: ${newOrg!.name} · ${bid}`}</dd>
        <dt className="text-muted-foreground">Yhteyshenkilö</dt><dd>{contactMode === 'pending' ? 'Keskeneräinen – täydennetään myöhemmin' : contactMode === 'existing' ? contacts.data?.find(c => c.id === contactId)?.name : `UUSI: ${nc.name} · ${nc.email}`}</dd></dl>
      <p className="text-xs text-muted-foreground">Myyntivastuu, tarjoukset ja vahvistetut tilaukset eivät muutu.</p>
    </div> : <div className="space-y-4">
      <section className="space-y-2">
        <label htmlFor="cl-search" className="text-sm font-medium">1. Hae Y-tunnuksella tai nimellä</label>
        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); setSearched(term.trim()); }}><Input id="cl-search" value={term} onChange={e => setTerm(e.target.value)} placeholder="1234567-8 tai yrityksen nimi" /><Button type="submit" variant="outline"><Search className="mr-2 h-4 w-4" />Hae</Button></form>
        {candidates.isFetching && <p role="status" className="text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />Haetaan…</p>}
        {candidates.isError && <p role="alert" className="text-xs text-destructive">{linkErrorText(candidates.error)}</p>}
        {candidates.isSuccess && <ul className="divide-y rounded-md border">{candidates.data.length === 0 && <li className="p-2 text-xs text-muted-foreground">Ei osumia. Nimen samankaltaisuus ei yhdistä yrityksiä automaattisesti.</li>}
          {candidates.data.map(c => <li key={c.id}><button type="button" aria-pressed={org?.id === c.id} onClick={() => { setOrg(c); setNewOrg(null); setContactId(''); setContactMode('existing'); }} className={`flex w-full items-center justify-between gap-2 p-2 text-left text-sm hover:bg-muted ${org?.id === c.id ? 'bg-muted' : ''}`}><span>{c.name}<span className="block text-xs text-muted-foreground">{c.business_id ?? 'Ei Y-tunnusta'}</span></span>{c.match === 'business_id' && <Badge>Y-tunnus täsmää</Badge>}</button></li>)}</ul>}
        {!newOrg ? <Button type="button" variant="ghost" size="sm" onClick={() => { setOrg(null); setNewOrg({ name: lead.organization ?? '', businessId: normalizeBusinessId(term) ?? '' }); setContactMode('new'); }}>+ Perusta uusi organisaatio</Button>
        : <div className="grid gap-2 rounded-md border p-2 sm:grid-cols-2"><div><label htmlFor="cl-oname" className="text-xs text-muted-foreground">Uuden organisaation nimi</label><Input id="cl-oname" value={newOrg.name} onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} /></div>
          <div><label htmlFor="cl-bid" className="text-xs text-muted-foreground">Y-tunnus (pakollinen)</label><Input id="cl-bid" value={newOrg.businessId} onChange={e => setNewOrg({ ...newOrg, businessId: e.target.value })} placeholder="1234567-8" /></div>
          <p className="text-xs text-muted-foreground sm:col-span-2">{newOrg.businessId && !bid ? 'Y-tunnus ei ole kelvollinen.' : 'Tarkista Y-tunnus YTJ:stä: tarkistusnumero ei yksin todista yrityksen olemassaoloa. Ilman Y-tunnusta (esim. ulkomainen organisaatio) yhteydenotto jää jonoon käsiteltäväksi.'}</p></div>}
      </section>
      {orgReady && <section className="space-y-2">
        <p className="text-sm font-medium">2. Yhteyshenkilö</p>
        {org && contacts.isPending && <p role="status" className="text-xs text-muted-foreground">Ladataan yhteyshenkilöitä…</p>}
        {org && contacts.data?.map(c => <label key={c.id} className="flex items-center gap-2 text-sm"><input type="radio" name="cl-contact" checked={contactMode === 'existing' && contactId === c.id} onChange={() => { setContactMode('existing'); setContactId(c.id); }} />{c.name} <span className="text-xs text-muted-foreground">{c.email}</span></label>)}
        <label className="flex items-center gap-2 text-sm"><input type="radio" name="cl-contact" checked={contactMode === 'new'} onChange={() => setContactMode('new')} /><UserPlus className="h-4 w-4" />Lisää uusi yhteyshenkilö</label>
        {contactMode === 'new' && <div className="grid gap-2 pl-6 sm:grid-cols-3">
          <div><label htmlFor="cl-cname" className="text-xs text-muted-foreground">Nimi</label><Input id="cl-cname" value={nc.name} onChange={e => setNc({ ...nc, name: e.target.value })} /></div>
          <div><label htmlFor="cl-cmail" className="text-xs text-muted-foreground">Sähköposti</label><Input id="cl-cmail" type="email" value={nc.email} onChange={e => setNc({ ...nc, email: e.target.value })} /></div>
          <div><label htmlFor="cl-cphone" className="text-xs text-muted-foreground">Puhelin (valinnainen)</label><Input id="cl-cphone" value={nc.phone} onChange={e => setNc({ ...nc, phone: e.target.value })} /></div>
          {sameEmail && <p className="text-xs text-destructive sm:col-span-3">Henkilö {sameEmail.name} on jo tällä sähköpostilla – valitse hänet yllä.</p>}
        </div>}
        <label className="flex items-center gap-2 text-sm"><input type="radio" name="cl-contact" checked={contactMode === 'pending'} onChange={() => setContactMode('pending')} />Jätä yhteyshenkilö keskeneräiseksi (esim. sähköposti puuttuu)</label>
      </section>}
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <DialogFooter className="gap-2">
      {confirmKey ? <><Button variant="outline" disabled={busy} onClick={edit}>Muuta valintaa</Button><Button disabled={busy} onClick={save}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Vahvista ja tallenna</Button></>
      : <><Button variant="outline" onClick={onClose}>Peruuta</Button><Button disabled={!orgReady || !contactReady || !!sameEmail} onClick={() => { setError(''); setConfirmKey(crypto.randomUUID()); }}>Jatka vahvistukseen</Button></>}
    </DialogFooter>
  </>;
}
