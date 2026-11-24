import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { dateTime, readAll } from '@/lib/crm';
import { GO_STATUS, REG_STATUS, SEAT_STATE } from '@/lib/catalog';
import { Loader2 } from 'lucide-react';

const db = supabase as any;

/** Staff view of one offering: open sign-up, see registrations, confirm seats, waitlist and go/no-go. */
export function OfferingRegistrations({ offering }: { offering: any }) {
  const qc = useQueryClient(); const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [names, setNames] = useState<Record<string, { name: string; email: string }>>({});
  const data = useQuery({ queryKey: ['cat_regs', offering.id], enabled: open, queryFn: async () => {
    const [regs, seats, waitlist, answers, status] = await Promise.all([
      readAll<any>((f, t) => db.from('cat_registrations').select('*').eq('offering_id', offering.id).order('created_at').range(f, t)),
      readAll<any>((f, t) => db.from('cat_seats').select('*').eq('offering_id', offering.id).order('created_at').range(f, t)),
      readAll<any>((f, t) => db.from('cat_waitlist').select('*').eq('offering_id', offering.id).order('position').range(f, t)),
      readAll<any>((f, t) => db.from('cat_registration_answers').select('registration_id,payer_option_label,orientation,billing_details_pending,phone_country,phone_number').eq('offering_id', offering.id).range(f, t)),
      db.rpc('cat_group_status', { p_offering: offering.id }),
    ]);
    const partyIds = [...new Set(regs.flatMap((r: any) => [r.buyer_party_id, r.billing_party_id]))];
    const parties = partyIds.length ? (await db.from('cat_parties').select('*').in('id', partyIds)).data ?? [] : [];
    return { regs, seats, waitlist, answers, parties, status: status.data };
  } });
  const act = useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: any }>) => { const { error } = await fn(); if (error) throw new Error(error.message); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cat_regs', offering.id] }); qc.invalidateQueries({ queryKey: ['cat_admin'] }); },
    onError: (e: Error) => toast({ title: 'Toiminto ei onnistunut', description: e.message, variant: 'destructive' }),
  });
  const now = Date.now();
  const activeSeats = (data.data?.seats ?? []).filter((s: any) => s.state === 'confirmed' || (s.state === 'hold' && Date.parse(s.hold_expires_at) > now));

  return <div className="space-y-3 rounded-md bg-muted/30 p-3">
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm"><Switch checked={!!offering.registration_enabled} disabled={act.isPending} onCheckedChange={v => act.mutate(() => db.from('cat_offerings').update({ registration_enabled: v }).eq('id', offering.id))} aria-label="Verkkoilmoittautuminen auki" />Verkkoilmoittautuminen {offering.registration_enabled ? 'auki' : 'kiinni'}</label>
      <label className="flex items-center gap-2 text-sm">Vähimmäismäärä<Input className="h-8 w-20" type="number" min={1} defaultValue={offering.min_participants ?? ''} onBlur={e => { const v = e.target.value ? Number(e.target.value) : null; if (v !== offering.min_participants) act.mutate(() => db.from('cat_offerings').update({ min_participants: v }).eq('id', offering.id)); }} /></label>
      <Badge variant={offering.go_status === 'toteutuu' ? 'default' : 'outline'}>{GO_STATUS[offering.go_status] ?? offering.go_status}</Badge>
      <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>{open ? 'Piilota ilmoittautumiset' : 'Näytä ilmoittautumiset'}</Button>
    </div>
    {open && (data.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Ladataan" /> : data.isError ? <p role="alert" className="text-sm text-destructive">Ilmoittautumisia ei voitu hakea.</p> : <div className="space-y-4 text-sm">
      <p className="text-xs text-muted-foreground">{activeSeats.length} / {offering.capacity} paikkaa varattu · vahvistettu {data.data.status?.confirmed ?? 0}{data.data.status?.min_participants ? ` (vähintään ${data.data.status.min_participants})` : ''}</p>
      {data.data.regs.length === 0 && <p className="text-muted-foreground">Ei ilmoittautumisia.</p>}
      <ul className="divide-y">{data.data.regs.map((r: any) => {
        const buyer = data.data.parties.find((p: any) => p.id === r.buyer_party_id); const bill = data.data.parties.find((p: any) => p.id === r.billing_party_id);
        const ans = data.data.answers.find((a: any) => a.registration_id === r.id); const seats = data.data.seats.filter((s: any) => s.registration_id === r.id);
        const w = data.data.waitlist.find((x: any) => x.registration_id === r.id && x.state === 'jonossa');
        const n = names[r.id] ?? { name: '', email: '' };
        return <li key={r.id} className="space-y-2 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><strong>{buyer?.contact_name}</strong> · <span className="break-all">{buyer?.email}</span>{buyer?.phone && ` · ${buyer.phone}`}
            <p className="text-xs text-muted-foreground">{dateTime(r.created_at)} · {r.seats_requested} paikkaa · laskutus: {bill?.org_name}{bill?.business_id ? ` (${bill.business_id})` : ''}{ans ? ` · ${ans.payer_option_label}${ans.orientation ? ` · ${ans.orientation}` : ''}` : ''}</p>
            <div className="mt-1 flex flex-wrap gap-1"><Badge variant="outline">{REG_STATUS[r.status] ?? r.status}</Badge>{w && <Badge variant="secondary">Jonossa {w.seats} paikkaa (sija {w.position})</Badge>}{ans?.billing_details_pending && <Badge variant="secondary">Laskutustiedot puuttuvat</Badge>}{r.source === 'staff' && <Badge variant="outline">Henkilökunnan lisäämä</Badge>}</div></div>
            {r.status === 'avoin' && seats.some((s: any) => s.state === 'hold') && <Button size="sm" disabled={act.isPending} onClick={() => act.mutate(() => db.rpc('cat_confirm_registration', { p_registration_id: r.id }))}>Vahvista paikat</Button>}</div>
          <ul className="space-y-1 pl-3 text-xs">{seats.map((s: any) => { const expired = s.state === 'hold' && Date.parse(s.hold_expires_at) <= now; return <li key={s.id} className="flex flex-wrap items-center gap-2">
            <span>{s.participant_name ?? 'Nimeämätön paikka'}{s.participant_email ? ` · ${s.participant_email}` : ''}</span><Badge variant="outline">{expired ? 'Varaus vanhentunut' : SEAT_STATE[s.state]}{s.state === 'hold' && !expired ? ` (voimassa ${dateTime(s.hold_expires_at)} asti)` : ''}</Badge>
            {s.state !== 'released' && <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" disabled={act.isPending} onClick={() => { if (confirm('Vapautetaanko paikka?')) act.mutate(() => db.rpc('cat_release_seat', { p_seat_id: s.id })); }}>Vapauta</Button>}</li>; })}</ul>
          {seats.some((s: any) => !s.participant_name && s.state !== 'released') && <form className="flex flex-wrap gap-2 pl-3" onSubmit={e => { e.preventDefault(); act.mutate(() => db.rpc('cat_add_participant', { p_registration_id: r.id, p_name: n.name, p_email: n.email })); setNames({ ...names, [r.id]: { name: '', email: '' } }); }}>
            <Input className="h-8 w-44" placeholder="Osallistujan nimi" aria-label="Osallistujan nimi" value={n.name} onChange={e => setNames({ ...names, [r.id]: { ...n, name: e.target.value } })} />
            <Input className="h-8 w-52" type="email" placeholder="Sähköposti" aria-label="Osallistujan sähköposti" value={n.email} onChange={e => setNames({ ...names, [r.id]: { ...n, email: e.target.value } })} />
            <Button size="sm" variant="outline" className="h-8">Nimeä paikka</Button></form>}
        </li>; })}</ul>
      <div className="flex flex-wrap gap-2 border-t pt-3">
        {data.data.waitlist.some((w: any) => w.state === 'jonossa') && <Button size="sm" variant="outline" disabled={act.isPending} onClick={() => act.mutate(async () => { const r = await db.rpc('cat_offer_from_waitlist', { p_offering_id: offering.id }); if (!r.error && !r.data) toast({ title: 'Jonosta ei voitu nostaa', description: 'Vapaita paikkoja ei ole riittävästi seuraavalle jonottajalle.' }); return r; })}>Nosta seuraava jonosta</Button>}
        {offering.go_status === 'toteutuu' && !offering.delivery_id && <Button size="sm" disabled={act.isPending} onClick={() => act.mutate(() => db.rpc('prod_create_group_delivery', { p_offering: offering.id }))}>Siirrä tuotantoon</Button>}
        {offering.delivery_id && <Badge>Siirretty tuotantoon</Badge>}
      </div>
      {offering.go_status === 'avoin' && <div className="flex flex-wrap items-end gap-2 border-t pt-3">
        <label className="min-w-[16rem] flex-1 text-xs">Toteutumispäätöksen perustelu (10–500 merkkiä)<Input value={reason} onChange={e => setReason(e.target.value)} /></label>
        <Button size="sm" disabled={act.isPending || reason.trim().length < 10} onClick={() => { act.mutate(() => db.rpc('cat_decide_go', { p_offering: offering.id, p_go: true, p_reason: reason })); setReason(''); }}>Ryhmä toteutuu</Button>
        <Button size="sm" variant="outline" disabled={act.isPending || reason.trim().length < 10} onClick={() => { if (confirm('Merkitäänkö, ettei ryhmä toteudu?')) { act.mutate(() => db.rpc('cat_decide_go', { p_offering: offering.id, p_go: false, p_reason: reason })); setReason(''); } }}>Ei toteudu</Button>
      </div>}
    </div>)}
  </div>;
}
