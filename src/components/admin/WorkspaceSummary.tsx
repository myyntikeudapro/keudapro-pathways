import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { WorkspaceAvatar } from './WorkspacePerson';
import type { WorkspacePersonData } from '@/lib/workspaceAvatar';
export type SummaryTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'risk';
const tones: Record<SummaryTone, string> = { neutral: 'ws-tone-neutral', accent: 'ws-tone-accent', ok: 'ws-tone-ok', warn: 'ws-tone-warn', risk: 'ws-tone-risk' };
export function WorkspaceSymbol({ icon: Icon, tone = 'accent' }: { icon: LucideIcon; tone?: SummaryTone }) {
  return <span className={`ws-symbol ${tones[tone]}`}><Icon className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" /></span>;
}
export function WorkspaceSummary({ icon, label, value, meta, tone = 'neutral', person }: { icon: LucideIcon; label: string; value: ReactNode; meta?: ReactNode; tone?: SummaryTone; person?: WorkspacePersonData }) {
  return <div className={`ws-summary ${tones[tone]} flex items-start gap-4 rounded-lg border bg-card p-4 shadow-card sm:p-5`}>
    {person ? <WorkspaceAvatar person={person} size="lg" /> : <WorkspaceSymbol icon={icon} tone={tone} />}
    <div className="min-w-0 flex-1"><p className="ws-summary-label">{label}</p><p className={`mt-2 break-words font-bold leading-tight text-foreground ${person ? 'text-xl' : 'text-3xl tabular-nums'}`}>{value}</p>{meta && <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{meta}</div>}</div>
  </div>;
}