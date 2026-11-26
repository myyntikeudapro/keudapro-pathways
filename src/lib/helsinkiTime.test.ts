import { describe, expect, it } from 'vitest';
import { helsinkiIso, helsinkiLocal } from './helsinkiTime';
import { nextRevisionInput, buildCapacity } from './companyTrainingWorkflow';

describe('Helsinki workspace times', () => {
  it('09.00 in January saves as 07.00 UTC and reads back as 09.00', () => {
    expect(helsinkiIso('2027-01-20T09:00')).toBe('2027-01-20T07:00:00.000Z');
    expect(helsinkiLocal('2027-01-20T07:00:00Z')).toBe('2027-01-20T09:00');
  });
  it('summer deadlines use the summer offset', () => expect(helsinkiIso('2027-07-20T12:00')).toBe('2027-07-20T09:00:00.000Z'));
  it('invalid and DST gap/duplicate clock times are rejected', () => {
    for (const v of ['x', '2027-02-30T09:00', '2027-03-28T03:30', '2027-10-31T03:30']) expect(() => helsinkiIso(v)).toThrow();
  });
  it('programme year is the Helsinki year across the UTC year boundary', () => {
    const result = nextRevisionInput({ caseId: 'c', current: null, text: 'Ohjelma', promises: '', startsAt: '2027-01-01T00:30', endsAt: '2027-01-01T01:30', receiverId: 'p', trainerId: 't', trainers: ['T'] });
    expect(result.programme.year).toBe(2027);
    expect(result.programme.startsAt).toBe('2026-12-31T22:30:00.000Z');
  });
  it('capacity slots use Helsinki time too', () => {
    const result = buildCapacity({ participants: 1, trainerId: 't', stations: [], slots: [{ stationId: 's', participantId: 'p1', machineId: '', startsAt: '2027-01-20T09:00', endsAt: '2027-01-20T10:00' }] });
    expect(result.slots[0].startsAt).toBe('2027-01-20T07:00:00.000Z');
  });
});