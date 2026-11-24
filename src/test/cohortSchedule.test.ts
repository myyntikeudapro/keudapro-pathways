import { describe, it, expect } from 'vitest';
import source from '@/data/aiCohorts.json';
import { cohortSourceKey, cohortSourceStatus, sourceAdministrativeEnd } from '@/lib/cohortSchedule';
describe('AI-ryhmien alkuperäinen lähdeaineisto', () => {
  it('sisältää 24 ryhmää', () => expect(source.cohorts).toHaveLength(24));
  it('sisältää 190 aikataulutettua opetuskertaa', () => expect(source.cohorts.reduce((n, c) => n + c.fixed_sessions.length, 0)).toBe(190));
  it('ei sisällä keksittyjä Director 2027 -aloituksia', () => expect(source.cohorts.filter(c => c.program === 'AI Director').map(c => c.start_date)).toEqual(['2026-09-07', '2026-10-26']));
  it('27.10.2026 mennessä alkaneet ovat historiallisia', () => expect(cohortSourceStatus({ start_date: '2026-10-27' })).toBe('historical'));
  it('2027 lähdealoitus tarvitsee hyväksynnän', () => expect(cohortSourceStatus({ start_date: '2027-01-12' })).toBe('approval_pending'));
  it('ei päättele muiden ryhmien hallinnollista loppua', () => expect(sourceAdministrativeEnd({ program: 'AI Coordinator', start_date: '2027-02-09' })).toBeNull());
  it('säilyttää erilliset tunnetut hallinnolliset loppupäivät', () => {
    expect(sourceAdministrativeEnd({ program: 'AI Coordinator', start_date: '2027-01-12' })).toBe('2027-05-12T17:00');
    expect(sourceAdministrativeEnd({ program: 'AI Manager', start_date: '2027-01-12' })).toBe('2027-07-12T17:00');
    expect(sourceAdministrativeEnd({ program: 'AI Director', start_date: '2026-10-26' })).toBe('2026-12-18T10:30');
  });
  it('pysyvät lähdeavaimet ovat yksilöllisiä', () => expect(new Set(source.cohorts.map(cohortSourceKey)).size).toBe(24));
  it('Coordinatorissa kolme ja Managerissa kaksi kolmen workshopin kokonaisuutta', () => {
    expect(source.cohorts.filter(c => c.program === 'AI Coordinator').every(c => c.flexible_blocks.length === 1 && c.flexible_blocks[0].quantity === 3)).toBe(true);
    expect(source.cohorts.filter(c => c.program === 'AI Manager').every(c => c.flexible_blocks.length === 2 && c.flexible_blocks.every(b => b.quantity === 3))).toBe(true);
  });
  it('Directorin ryhmissä on seitsemän moduulia', () => expect(source.cohorts.filter(c => c.program === 'AI Director').map(c => c.fixed_sessions.length)).toEqual([7, 7]));
});