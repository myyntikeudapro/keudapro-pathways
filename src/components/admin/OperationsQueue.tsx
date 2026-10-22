import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOperationsData } from '@/hooks/useOperationsData';
import { QUEUES, queueRows, periodStart } from '@/lib/operationsCenter';
import { dateTime, money } from '@/lib/crm';
import { ArrowLeft, ArrowUpRight, Loader2 } from 'lucide-react';

export function OperationsQueue({ userId }: { userId: string }) {
  const [params] = useSearchParams();
  const query = useOperationsData(true, userId);
  const key = params.get('jono') ?? 'open';
  const valid = (s: string | null) => s && Number.isFinite(Date.parse(s)) ? s : null;
  const filter = { service: params.get('palvelu') ?? 'all', mine: params.get('oma') === '1', userId, since: valid(params.get('alku')) ?? periodStart(30), until: valid(params.get('loppu')) ?? new Date().toISOString() };
  const rows = queueRows(query.data, key, filter);
  return <section className="space-y-4">
    <Button asChild variant="outline"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4"/>Tilannekeskus</Link></Button>
    <h2 className="text-xl font-semibold text-keuda-blue">{QUEUES[key] ?? 'Työjono'}</h2>
    <p className="text-sm text-muted-foreground">{filter.mine ? 'Omat vastuut' : 'Koko tiimi'} · Tilanne {dateTime(filter.until)}{['fresh','wins','revenue','missingValue','cycle'].includes(key) ? ` · Alkaen ${dateTime(filter.since)}` : ''}</p>
    {query.pending ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Ladataan työjonoa"/> : query.error ? <p role="alert" className="text-destructive">Työjonon tietoja ei voitu hakea.</p> : <>
      <p className="text-sm font-medium">{rows.length} kohdetta</p>
      {rows.length === 0 && <p className="py-6 text-muted-foreground">Ei kohteita tässä työjonossa.</p>}
      {rows.map(r => { const target = new URLSearchParams(params); target.delete('jono'); target.set('tab','leads'); target.set('asiakas',r.lead.id); return <div key={r.id} className="flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><h3 className="font-semibold">{r.lead.name}</h3><p className="text-sm text-muted-foreground">{r.title} · {dateTime(r.date)}{r.amount !== undefined ? ` · ${r.amount === null ? 'Arvo puuttuu' : money(r.amount)}` : ''}</p></div><Button asChild variant="outline" className="self-start"><Link to={`/admin/markkinointi?${target}`}>Asiakaskortti<ArrowUpRight className="ml-2 h-4 w-4"/></Link></Button></div>; })}
    </>}
  </section>;
}