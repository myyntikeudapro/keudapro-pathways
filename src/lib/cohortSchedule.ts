export type SourceSession = { date: string; start_time: string; end_time: string; trainer_or_provider: string | null; topic: string };
export type SourceCohort = { program: string; title: string; start_date: string; start_time: string; registration_deadline: string; original_link: string; fixed_sessions: SourceSession[]; flexible_blocks: { quantity: number; type: string; time_status: string; provider: string; topic: string }[]; individual_sparring: string | null };
export const SOURCE_REFERENCE_DATE = '2026-10-27';
export function cohortSourceKey(c: Pick<SourceCohort, 'program' | 'start_date'>) {
  return `${c.program.toLowerCase().replace(/ /g, '-')}:${c.start_date}`;
}
export function cohortSourceStatus(c: Pick<SourceCohort, 'start_date'>) {
  return c.start_date <= SOURCE_REFERENCE_DATE ? 'historical' : 'approval_pending';
}
export function sourceAdministrativeEnd(c: Pick<SourceCohort, 'program' | 'start_date'>): string | null {
  if (c.start_date === '2027-01-12' && c.program === 'AI Coordinator') return '2027-05-12T17:00';
  if (c.start_date === '2027-01-12' && c.program === 'AI Manager') return '2027-07-12T17:00';
  if (c.start_date === '2026-10-26' && c.program === 'AI Director') return '2026-12-18T10:30';
  return null;
}
export function sourceDate(date: string) { return new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki' }).format(new Date(`${date}T12:00:00Z`)); }