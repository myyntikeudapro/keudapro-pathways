// Workspace date/time fields always represent Helsinki wall time, not browser time.
export function helsinkiLocal(iso?: string): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return '';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Helsinki', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const get = (key: string) => parts.find(p => p.type === key)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function helsinkiIso(value: string): string {
  if (/([zZ]|[+-]\d{2}:\d{2})$/.test(value)) {
    if (!Number.isFinite(Date.parse(value))) throw new Error('INVALID_HELSINKI_TIME');
    return new Date(value).toISOString();
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('INVALID_HELSINKI_TIME');
  const wall = Date.parse(`${value}:00Z`);
  // Both Finnish offsets are tested by round-trip: nonexistent/ambiguous DST times fail closed.
  const matches = [2, 3].map(offset => new Date(wall - offset * 3_600_000).toISOString()).filter(iso => helsinkiLocal(iso) === value);
  if (matches.length !== 1) throw new Error('INVALID_HELSINKI_TIME');
  return matches[0];
}