import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useBillingPlan } from '@/hooks/useBillingPlan';
import { BILLING_MODES, billingError, contractBilling, installmentErrors, type BillingMode, type BillingSnapshot } from '@/lib/contractBilling';
import { money } from '@/lib/crm';
import { PAYMENT_LABEL } from '@/lib/productionStatus';

export function BillingPlanPanel({ orderId }: { orderId: string }) {
  const query = useBillingPlan(orderId);
  if (query.isPending) return <p role="status">Ladataan sopimuslaskutusta…</p>;
  if (query.isError) return <p role="alert" className="text-sm text-destructive">Sopimuslaskutusta ei voitu lukea.</p>;
  return <BillingPlanForm key={`${orderId}:${query.data.plan?.version ?? 0}`} snapshot={query.data} reload={() => query.refetch()} />;
}
function BillingPlanForm({ snapshot: s, reload }: { snapshot: BillingSnapshot; reload: () => Promise<unknown> }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<BillingMode | ''>(s.plan?.mode ?? '');
  const [rows, setRows] = useState(s.plan?.mode === 'installments' ? s.installments.map(i => ({ amount: String(i.amount), due_on: i.due_on })) : [{ amount: String(s.order.total_net), due_on: s.order.starts_on ?? '' }]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState('');
  const [command, setCommand] = useState<{ fingerprint: string; key: string } | null>(null);
  const saved = contractBilling(s.order, s.plan, s.installments, new Date(), s.cancelled);
  const input = rows.map(r => ({ amount: Number(r.amount.replace(',', '.')), due_on: r.due_on }));
  const selected = mode === 'installments' ? input : [];
  const errors = installmentErrors(s.order, mode, selected);
  const sum = selected.reduce((a, r) => a + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  const locked = s.installments.some(i => i.payment_status !== 'ei_laskutettu');
  async function run(kind: 'save' | 'payment', installmentId?: string, status?: string) {
    const fingerprint = JSON.stringify([kind, mode, selected, installmentId, status, s.plan?.version ?? 0]);
    const op = command?.fingerprint === fingerprint ? command.key : crypto.randomUUID();
    setCommand({ fingerprint, key: op }); setBusy(true); setError('');
    try {
      const response = kind === 'save' ? await supabase.rpc('crm_save_billing_plan', { p_order_id: s.order.id, p_mode: mode, p_installments: selected, p_expected_version: s.plan?.version ?? 0, p_op_key: op })
        : await supabase.rpc('crm_set_installment_payment', { p_installment_id: installmentId ?? '', p_status: status ?? '', p_expected_version: s.plan?.version ?? 0, p_op_key: op });
      if (response.error) throw response.error;
      setResult('Tallennettu.');
      await Promise.all([qc.invalidateQueries({ queryKey: ['production_data'] }), qc.invalidateQueries({ queryKey: ['customer_register'] }), qc.invalidateQueries({ queryKey: ['billing_plan'] })]);
      await reload();
    } catch (e) { setError(billingError(e)); }
    finally { setBusy(false); }
  }
  return <section aria-label="Sopimuslaskutus" className="space-y-4 border-t py-4">
    <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-lg font-semibold text-keuda-blue">Sopimuslaskutus</h3><span className="text-sm font-semibold">Tilaus {money(s.order.total_net)} (alv 0 %)</span></div>
    <p className={saved.state === 'review' ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>{saved.label}</p>
    {s.plan && <div className="space-y-2"><p className="text-sm font-medium">Tallennettu: {BILLING_MODES[s.plan.mode]} · versio {s.plan.version}</p>
      {saved.rows.map(i => <div key={i.id} className="grid items-center gap-2 border-b py-2 sm:grid-cols-[2rem_1fr_1fr_minmax(12rem,2fr)]"><span className="text-sm">{i.seq}.</span><span className="text-sm">{i.due_on}</span><span className="text-sm tabular-nums">{money(i.amount)}</span><div><label htmlFor={`payment-${i.id}`} className="text-xs text-muted-foreground">Erän maksutila (käsin)</label><select id={`payment-${i.id}`} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={i.payment_status} disabled={busy} onChange={e => run('payment', i.id, e.target.value)}>{Object.entries(PAYMENT_LABEL).map(([value, label]) => <option key={value} value={value} disabled={value !== 'ei_laskutettu' && (i.due_on > s.today || saved.state === 'review' || s.cancelled)}>{label}</option>)}</select></div></div>)}
    </div>}
    {locked ? <p className="text-sm text-muted-foreground">Erissä on käsin tehtyjä laskutusmerkintöjä. Suunnitelmaa ei voi korvata.</p> : <>
      <div><label htmlFor={`billing-mode-${s.order.id}`} className="text-sm font-medium">Sopimuksen laskutustapa</label><select id={`billing-mode-${s.order.id}`} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={mode} onChange={e => setMode(e.target.value as BillingMode | '')}><option value="">Laskutustapa vahvistamatta</option>{Object.entries(BILLING_MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {mode === 'installments' ? <div className="space-y-2">{rows.map((r, i) => <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.5rem] items-end gap-2"><div><label htmlFor={`amount-${s.order.id}-${i}`} className="text-xs text-muted-foreground">Erä {i + 1} € (alv 0 %)</label><Input id={`amount-${s.order.id}-${i}`} inputMode="decimal" value={r.amount} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} /></div><div><label htmlFor={`date-${s.order.id}-${i}`} className="text-xs text-muted-foreground">Erä {i + 1} laskutuspäivä</label><Input id={`date-${s.order.id}-${i}`} type="date" value={r.due_on} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, due_on: e.target.value } : x))} /></div><Button size="icon" variant="ghost" title="Poista erä" aria-label={`Poista erä ${i + 1}`} onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button></div>)}<Button variant="outline" size="sm" onClick={() => setRows([...rows, { amount: '', due_on: '' }])}><Plus className="mr-2 h-4 w-4" />Lisää laskutuserä</Button><p className="text-sm">Erät yhteensä {money(sum)} · erotus tilaukseen {money(Math.round((s.order.total_net - sum) * 100) / 100)}</p></div>
        : mode && <p className="text-sm">Laskutuspäivä: {mode === 'start' ? s.order.starts_on : s.order.ends_on} (Helsingin sopimuskalenteri) · {money(s.order.total_net)}</p>}
      {mode && errors.length > 0 && <ul className="list-inside list-disc text-sm text-destructive">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
      <Button disabled={busy || errors.length > 0} onClick={() => run('save')}><Save className="mr-2 h-4 w-4" />Vahvista laskutussuunnitelma</Button>
    </>}
    {error && <div><p role="alert" className="text-sm text-destructive">{error}</p><Button variant="ghost" size="sm" onClick={() => reload()}><RotateCcw className="mr-2 h-4 w-4" />Lataa tallennettu suunnitelma</Button></div>}
    {result && <p role="status" className="text-sm text-primary">{result}</p>}
  </section>;
}
