import { describe, expect, it } from 'vitest';
import { ganttBar, ganttWeeks } from './productionBoard';

const now = new Date('2026-11-26T10:00:00Z');
describe('production gantt', () => {
  it('starts two weeks before the current Monday', () => {
    const w = ganttWeeks(now);
    expect(w[0]).toBe('2026-11-09'); expect(w[2]).toBe('2026-11-23'); expect(w).toHaveLength(14);
  });
  it('spans the weeks from first to last session', () => {
    expect(ganttBar(ganttWeeks(now), '2026-11-24T08:00:00Z', '2026-12-09T14:00:00Z')).toEqual({ start: 2, span: 3 });
  });
  it('clips to the visible range and hides unscheduled or out-of-range trainings', () => {
    expect(ganttBar(ganttWeeks(now), '2026-10-01T08:00:00Z', '2026-11-12T14:00:00Z')).toEqual({ start: 0, span: 1 });
    expect(ganttBar(ganttWeeks(now), null, null)).toBeNull();
    expect(ganttBar(ganttWeeks(now), '2027-06-01T08:00:00Z', null)).toBeNull();
  });
});
