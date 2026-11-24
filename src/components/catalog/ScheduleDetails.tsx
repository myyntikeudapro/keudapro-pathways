import { sourceDate, type SourceCohort } from '@/lib/cohortSchedule';
export function ScheduleDetails({schedule,administrativeEnd}: {schedule: Pick<SourceCohort,'fixed_sessions'|'flexible_blocks'|'individual_sparring'>; administrativeEnd?: string | null}) {
  return <div className="space-y-4">
    <ol className="divide-y">{schedule.fixed_sessions.map((s,i)=><li key={`${s.date}-${i}`} className="grid gap-1 py-3 text-sm sm:grid-cols-[11rem_1fr]"><p className="font-medium">{sourceDate(s.date)}<span className="block text-xs text-muted-foreground">{s.start_time}–{s.end_time} · Suomen aika</span></p><div><p>{s.topic}</p><p className="text-xs text-muted-foreground">{s.trainer_or_provider ?? 'Kouluttajaa ei ilmoitettu'}</p></div></li>)}</ol>
    {schedule.flexible_blocks.map((b,i)=><p key={i} className="text-sm"><strong>{b.quantity} workshopia</strong> · {b.topic}<span className="block text-xs text-muted-foreground">{b.time_status} · {b.provider}</span></p>)}
    {schedule.individual_sparring && <p className="text-sm">{schedule.individual_sparring} · Ajankohta sovitaan erikseen</p>}
    <p className="text-xs text-muted-foreground">Hallinnollinen päättyminen: {administrativeEnd ? administrativeEnd.replace('T',' ').replace(' Europe/Helsinki','') : 'Ei ilmoitettu'}</p>
  </div>;
}