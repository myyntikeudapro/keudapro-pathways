import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { WorkspacePerson } from '@/components/admin/WorkspacePerson';
import type { ProductionData } from '@/lib/productionCenter';
import { helsinkiLocal } from '@/lib/helsinkiTime';
import { TASK_GROUP_LABEL, addDays, daySessions, groupTasks, hkiDay, taskKpis, trainerLoad, type TaskGroup } from '@/lib/productionDaily';

type Member = { id: string; email: string };
const db = supabase as any;
const fiDate = (day: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC', ...opts }).format(new Date(`${day}T12:00:00Z`));
const hm = (iso: string) => helsinkiLocal(iso).slice(11, 16).replace(':', '.');
const minutes = (iso: string) => { const t = helsinkiLocal(iso).slice(11, 16).split(':'); return +t[0] * 60 + +t[1]; };
const START = 8 * 60, END = 17 * 60, PX = 0.8;

export function ProductionDaily({ data, team, userId, email, open }: { data: ProductionData; team: Member[]; userId: string; email: (id: string | null) => string; open: (id: string) => void }) {
  const qc = useQueryClient(); const { toast } = useToast();
  const now = new Date(); const today = hkiDay(now.toISOString());
  const [who, setWho] = useState<string>(userId);
  const [day, setDay] = useState(today);
  const [showLoad, setShowLoad] = useState(false);
  const filter = who || undefined;
  const k = taskKpis(data, now, filter); const groups = groupTasks(data, now, filter);
  const sessions = daySessions(data, day, filter); const load = trainerLoad(data, day);
  const title = (id: string) => data.deliveries.find(d => d.id === id)?.title ?? '';
  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => { const { error } = await db.from('prod_tasks').update({ completed_at: done ? new Date().toISOString() : null }).eq('id', id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['production_data'] }),
    onError: (e: Error) => toast({ title: 'Tallennus ei onnistunut', description: e.message, variant: 'destructive' }),
  });
  const people = [userId, ...team.map(m => m.id).filter(id => id !== userId)];
  const nowMin = minutes(now.toISOString());
  const kpis: [string, number, string, boolean?][] = [['Valmistuneet tehtävät tässä kuussa', k.doneThisMonth, 'tehtävää'], ['Määräaika 2 viikon sisällä', k.dueIn2Weeks, 'määräaikaa'], ['Myöhässä olevat tehtävät', k.late, 'myöhässä', true], ['Tämän päivän avoimet tehtävät', k.openToday, 'tehtävää']];

  return <section aria-label="Päivän työ" className="space-y-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Käyttäjä</span>
      {people.map(id => <Button key={id} size="sm" variant={who === id ? 'default' : 'outline'} onClick={() => setWho(id)}><WorkspacePerson person={team.find(m => m.id === id)} name={id === userId ? 'Minä' : email(id)} size="xs" /></Button>)}
      <Button size="sm" variant={who === '' ? 'default' : 'outline'} onClick={() => setWho('')}>Kaikki</Button>
    </div>
    <div className="grid divide-y rounded-xl border bg-card shadow-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
      {kpis.map(([label, n, unit, risk]) => <div key={label} className="p-4"><p className="flex items-center justify-between text-sm text-muted-foreground">{label}{risk && n > 0 && <AlertCircle className="h-4 w-4 text-destructive" />}</p><p className={`mt-1 ${risk && n > 0 ? 'text-destructive' : 'text-keuda-navy-section'}`}><span className="text-2xl font-semibold tabular-nums">{n}</span> <span className="text-sm">{unit}</span></p></div>)}
    </div>
    <div className="rounded-xl border bg-card shadow-card">
      <button className="flex w-full items-center gap-2 p-4 text-left font-semibold text-keuda-navy-section" aria-expanded={showLoad} onClick={() => setShowLoad(!showLoad)}><ChevronRight className={`h-4 w-4 transition-transform ${showLoad ? 'rotate-90' : ''}`} />Kouluttajien kuormitus · viikko alkaen {fiDate(load.days[0], { day: 'numeric', month: 'numeric' })}</button>
      {showLoad && <div className="overflow-x-auto px-4 pb-4"><table className="w-full min-w-[32rem] text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1 font-medium">Kouluttaja</th>{load.days.map(d => <th key={d} className="py-1 text-center font-medium">{fiDate(d, { weekday: 'short', day: 'numeric', month: 'numeric' })}</th>)}<th className="py-1 text-right font-medium">Yht.</th></tr></thead>
        <tbody>{load.rows.length === 0 ? <tr><td colSpan={7} className="py-2 text-muted-foreground">Ei kouluttajavarauksia tällä viikolla.</td></tr> : load.rows.map(r => <tr key={r.trainerId} className="border-t"><td className="py-2"><WorkspacePerson person={team.find(m => m.id === r.trainerId)} name={email(r.trainerId)} size="xs" /></td>{r.hours.map((h, i) => <td key={i} className="py-2 text-center"><span className={`inline-block min-w-10 rounded px-1.5 py-0.5 tabular-nums ${h === 0 ? 'text-muted-foreground' : h > 8 ? 'bg-ws-risk-light text-destructive' : h >= 6 ? 'bg-ws-warn/15 text-ws-warn' : 'bg-ws-ok/15 text-ws-ok'}`}>{h ? `${h.toLocaleString('fi-FI')} h` : '–'}</span></td>)}<td className="py-2 text-right font-semibold tabular-nums">{r.hours.reduce((a, b) => a + b, 0).toLocaleString('fi-FI')} h</td></tr>)}</tbody></table></div>}
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <div className="rounded-xl border bg-card shadow-card">
        <h3 className="p-4 pb-2 text-lg font-semibold text-keuda-navy-section">Suunnitellut tehtävät</h3>
        {(Object.keys(groups) as TaskGroup[]).map(g => groups[g].length > 0 && <div key={g}>
          <p className={`border-y bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide ${g === 'myohassa' ? 'text-destructive' : 'text-muted-foreground'}`}>{TASK_GROUP_LABEL[g]} ({groups[g].length})</p>
          <ul className="divide-y">{groups[g].map(t => <li key={t.id} className={`flex items-start gap-3 border-l-4 px-4 py-3 ${g === 'myohassa' ? 'border-l-destructive' : t.blocks_start ? 'border-l-ws-warn' : 'border-l-primary'}`}>
            <input type="checkbox" className="mt-1 h-4 w-4" aria-label={`Merkitse tehdyksi: ${t.title}`} disabled={toggle.isPending} onChange={e => toggle.mutate({ id: t.id, done: e.target.checked })} />
            <button className="grid min-w-0 flex-1 gap-0.5 text-left sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:gap-3" onClick={() => open(t.delivery_id)}>
              <span><span className="block font-medium text-foreground">{t.title}{t.blocks_start && <span className="ml-2 text-xs text-ws-warn">estää aloituksen</span>}</span><span className="block text-xs text-muted-foreground">{t.due_at ? helsinkiLocal(t.due_at).slice(0, 10).split('-').reverse().join('.') : 'Ei määräaikaa'} · {t.owner_id ? email(t.owner_id) : `rooli: ${t.owner_role}`}</span></span>
              <span className="truncate text-sm text-primary">{title(t.delivery_id)}</span>
            </button></li>)}</ul></div>)}
        {Object.values(groups).every(x => x.length === 0) && <p className="p-4 text-sm text-muted-foreground">Ei avoimia tehtäviä.</p>}
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <h3 className="text-lg font-semibold text-keuda-navy-section">Kalenteri</h3>
        <div className="mt-2 flex items-center gap-2"><Button size="icon" variant="ghost" aria-label="Edellinen päivä" onClick={() => setDay(addDays(day, -1))}><ChevronLeft className="h-4 w-4" /></Button><span className="flex-1 text-center text-sm font-medium uppercase tracking-wide">{fiDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}</span><Button size="icon" variant="ghost" aria-label="Seuraava päivä" onClick={() => setDay(addDays(day, 1))}><ChevronRight className="h-4 w-4" /></Button></div>
        <Button size="sm" variant="outline" className="mt-1" disabled={day === today} onClick={() => setDay(today)}><CalendarDays className="mr-2 h-4 w-4" />Tänään</Button>
        <div className="relative mt-3 border-l" style={{ height: (END - START) * PX }}>
          {Array.from({ length: 10 }, (_, i) => <div key={i} className="absolute left-0 right-0 border-t border-dashed text-[10px] text-muted-foreground" style={{ top: i * 60 * PX }}><span className="-ml-0.5 bg-card pr-1">{String(8 + i).padStart(2, '0')}.00</span></div>)}
          {day === today && nowMin >= START && nowMin <= END && <div aria-label="Nyt" className="absolute left-0 right-0 z-10 border-t-2 border-destructive" style={{ top: (nowMin - START) * PX }}><span className="absolute -left-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-destructive" /></div>}
          {sessions.map(s => { const a = Math.max(START, minutes(s.starts_at)), b = Math.min(END, Math.max(a + 30, minutes(s.ends_at))); return <button key={s.id} onClick={() => open(s.delivery_id)} className="absolute left-10 right-1 overflow-hidden rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-left text-xs hover:bg-primary/20" style={{ top: (a - START) * PX, height: (b - a) * PX }}><span className="block font-semibold text-foreground">{hm(s.starts_at)}–{hm(s.ends_at)} {s.title}</span><span className="block truncate text-muted-foreground">{s.delivery.title}{s.trainers.length ? ` · ${s.trainers.map(email).join(', ')}` : ' · ei kouluttajaa'}</span></button>; })}
        </div>
        {sessions.length === 0 && <p className="mt-5 text-sm text-muted-foreground">Ei sessioita tänä päivänä.</p>}
      </div>
    </div>
  </section>;
}
