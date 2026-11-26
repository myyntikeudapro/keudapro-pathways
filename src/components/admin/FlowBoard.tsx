import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { readAll } from '@/lib/crm';
import { flowBoard, type Light } from '@/lib/flowBoard';
import { AlertTriangle, CheckCircle2, Gauge, Loader2, XOctagon } from 'lucide-react';

const db = supabase as any;
const all = (table: string, cols: string) => readAll((f, t) => db.from(table).select(cols).order('id').range(f, t)) as Promise<any[]>;
const STYLE: Record<Light, { box: string; dot: string; text: string; Icon: typeof CheckCircle2 }> = {
  green: { box: 'border-l-flow-ok', dot: 'bg-flow-ok', text: 'Kunnossa', Icon: CheckCircle2 },
  yellow: { box: 'border-l-flow-warn', dot: 'bg-flow-warn', text: 'Seuraa', Icon: AlertTriangle },
  red: { box: 'border-l-destructive', dot: 'bg-destructive', text: 'Pullonkaula', Icon: XOctagon },
};
const nf = new Intl.NumberFormat('fi-FI', { maximumFractionDigits: 0 });

export function FlowBoard({ enabled }: { enabled: boolean }) {
  const q = useQuery({ queryKey: ['flow_board'], enabled, queryFn: async () => {
    const [offers, orders, handoffs, deliveries, sessions, actuals, tasks, blockers, billing] = await Promise.all([
      all('crm_offers', 'id,lead_id,title,status,created_at'), all('crm_orders', 'id,lead_id,confirmed_at,created_at,crm_organizations(name)'),
      all('crm_production_handoffs', 'id,order_id,handed_at,cancelled_at,company_state,mt_state'), all('prod_deliveries', 'id,order_id,title'),
      all('prod_sessions', 'id,delivery_id,starts_at,ends_at'), all('prod_actuals', 'id,session_id,held'), all('prod_tasks', 'id,delivery_id,blocks_start,completed_at'),
      all('prod_blockers', 'id,delivery_id,resolved_at'), all('prod_billing_readiness', 'id,delivery_id,billing_ready')]);
    return flowBoard({ offers, orders: orders.map(o => ({ ...o, name: o.crm_organizations?.name ?? 'Tilaus' })), handoffs, deliveries, sessions, actuals, tasks, blockers, billing });
  } });
  const overall: Light | null = q.data ? (q.data.some(s => s.light === 'red') ? 'red' : q.data.some(s => s.light === 'yellow') ? 'yellow' : 'green') : null;
  return <section className="space-y-4" aria-labelledby="flow-board">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="flow-board" className="flex items-center gap-2 text-lg font-semibold text-keuda-blue"><Gauge className="h-5 w-5"/>Virtaustaulu · yrityskoulutus</h2>
      {overall && <span className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium"><span className={`h-2.5 w-2.5 rounded-full ${STYLE[overall].dot}`}/>{overall === 'green' ? 'Kaikki virtaa' : overall === 'yellow' ? 'Seurattavaa' : 'Pullonkauloja'}</span>}
    </div>
    {q.isPending ? <p role="status" className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Ladataan virtausta…</p>
      : q.isError ? <p role="alert" className="text-destructive">Virtaustaulun tietoja ei voitu hakea.</p>
      : <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{q.data.map((s, n) => { const st = STYLE[s.light]; return <li key={s.key} className={`flex flex-col gap-2 rounded-lg border border-l-4 bg-background p-3 ${st.box}`}>
        <div className="flex items-start justify-between gap-2"><span className="text-xs text-muted-foreground">Vaihe {n + 1}</span><span className="flex items-center gap-1 text-xs font-medium"><st.Icon className="h-3.5 w-3.5"/>{st.text}</span></div>
        <h3 className="text-sm font-semibold leading-tight">{s.title}</h3>
        <p className="text-2xl font-semibold tabular-nums text-keuda-blue">{s.items.length}<span className="ml-1 text-xs font-normal text-muted-foreground">odottaa</span></p>
        {s.items.length > 0 && <ul className="space-y-1 text-xs">{s.items.slice(0, 3).map(it => <li key={it.id}><Link to={it.link} className="flex items-center gap-1.5 hover:underline"><span className={`h-2 w-2 shrink-0 rounded-full ${STYLE[it.light].dot}`}/><span className="truncate">{it.label}</span>{s.key !== 'start' && <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">{nf.format(Math.floor(it.days))} vrk</span>}</Link></li>)}{s.items.length > 3 && <li className="text-muted-foreground">+ {s.items.length - 3} muuta</li>}</ul>}
        <p className="mt-auto pt-1 text-[11px] leading-snug text-muted-foreground">{s.rule}</p>
      </li>; })}</ol>}
  </section>;
}
