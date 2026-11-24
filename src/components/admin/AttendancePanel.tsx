import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dateTime } from '@/lib/crm';
import { useToast } from '@/hooks/use-toast';

const db = supabase as any;
const STATUSES: [string, string][] = [['läsnä', 'Läsnä'], ['osittain', 'Osittain'], ['poissa', 'Poissa']];

/** Per-session attendance for one delivery; writes go through prod_record_attendance. */
export function AttendancePanel({ deliveryId, sessions }: { deliveryId: string; sessions: { id: string; title: string; starts_at: string; ends_at: string }[] }) {
  const qc = useQueryClient(); const { toast } = useToast();
  const q = useQuery({ queryKey: ['attendance', deliveryId], queryFn: async () => {
    const [p, a, sum] = await Promise.all([
      db.from('prod_participants').select('id,name').eq('delivery_id', deliveryId).is('removed_at', null).order('name'),
      db.from('prod_attendance').select('*').in('session_id', sessions.length ? sessions.map(s => s.id) : ['00000000-0000-0000-0000-000000000000']),
      db.rpc('prod_attendance_summary', { p_delivery: deliveryId }),
    ]);
    for (const r of [p, a, sum]) if (r.error) throw r.error;
    return { participants: p.data as any[], rows: a.data as any[], summary: sum.data as any[] };
  } });
  const record = useMutation({
    mutationFn: async (v: { session: string; participant: string; status: string; hours: number }) => { const { error } = await db.rpc('prod_record_attendance', { p_session: v.session, p_participant: v.participant, p_status: v.status, p_hours: v.hours }); if (error) throw new Error(error.message); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', deliveryId] }),
    onError: (e: Error) => toast({ title: 'Läsnäoloa ei tallennettu', description: e.message, variant: 'destructive' }),
  });
  if (!sessions.length) return <p className="text-sm text-muted-foreground">Lisää ensin opetuskerrat.</p>;
  if (q.isPending) return <p className="text-sm text-muted-foreground">Ladataan…</p>;
  if (q.isError) return <p role="alert" className="text-sm text-destructive">Läsnäoloja ei voitu hakea.</p>;
  if (!q.data.participants.length) return <p className="text-sm text-muted-foreground">Toteutuksella ei ole osallistujia.</p>;
  const hoursOf = (s: { starts_at: string; ends_at: string }) => Math.round((Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 360000) / 10;
  return <div className="space-y-3 overflow-x-auto">
    <table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1 pr-3">Osallistuja</th>{sessions.map(s => <th key={s.id} className="py-1 pr-3 font-normal">{s.title}<span className="block">{dateTime(s.starts_at)}</span></th>)}<th className="py-1">Yhteensä</th></tr></thead>
      <tbody>{q.data.participants.map(p => { const sum = q.data.summary.find(x => x.participant_id === p.id); return <tr key={p.id} className="border-t">
        <td className="py-2 pr-3">{p.name}</td>
        {sessions.map(s => { const r = q.data.rows.find(x => x.session_id === s.id && x.participant_id === p.id); return <td key={s.id} className="py-2 pr-3">
          <select aria-label={`${p.name}: ${s.title}`} className="h-8 rounded-md border bg-background px-2" value={r?.status ?? ''} disabled={record.isPending} onChange={e => e.target.value && record.mutate({ session: s.id, participant: p.id, status: e.target.value, hours: e.target.value === 'läsnä' ? hoursOf(s) : e.target.value === 'osittain' ? hoursOf(s) / 2 : 0 })}>
            <option value="">Kirjaamatta</option>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>; })}
        <td className="py-2 text-xs">{sum ? `${sum.sessions_attended}/${sum.sessions_total} · ${sum.hours} h` : '–'}</td></tr>; })}</tbody></table>
  </div>;
}
