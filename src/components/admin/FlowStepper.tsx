import { Check, ArrowRight } from 'lucide-react';
import type { FlowState } from '@/lib/companyFlow';

export function FlowStepper({ title, flow }: { title: string; flow: FlowState }) {
  return <section aria-label={title} className="space-y-3 rounded-lg border bg-card p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
    <ol className="flex flex-wrap items-center gap-1.5">
      {flow.steps.map((s, i) => {
        const cur = i === flow.current;
        return <li key={s.key} className="flex items-center gap-1.5" aria-current={cur ? 'step' : undefined}>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${s.done ? 'border-primary/30 bg-primary/10 text-primary' : cur ? 'border-keuda-blue bg-keuda-blue text-primary-foreground' : 'text-muted-foreground'}`}>
            {s.done ? <Check className="h-3 w-3" /> : <span className="tabular-nums">{i + 1}.</span>}{s.label}
          </span>
          {i < flow.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />}
        </li>;
      })}
    </ol>
    {flow.next ? <div className="rounded-md border-l-4 border-keuda-blue bg-muted/40 p-2.5 text-sm"><strong>Seuraava askel</strong> <span className="text-muted-foreground">({flow.next.who})</span>: {flow.next.text}</div>
      : <div className="rounded-md border-l-4 border-primary bg-primary/10 p-2.5 text-sm"><strong>Valmis.</strong> Kaikki tämän näkymän vaiheet on tehty.</div>}
  </section>;
}
