import { describe, expect, it } from 'vitest';
import { EMPTY_EXPERT, expertQueue, utilization, type ExpertData } from './expertCapacity';

const now = new Date('2027-01-01T08:00:00Z');
const d = (days: number, h = 9) => new Date(Date.UTC(2027, 0, 1 + days, h)).toISOString();
const base: ExpertData = {
  ...EMPTY_EXPERT,
  templates: [{ key: 'A', name: 'A' }, { key: 'B', name: 'B' }],
  deliveries: [{ id: 'd1', template_key: 'A', title: 'T1' }, { id: 'd2', template_key: 'A', title: 'T2', production_status: 'peruttu' }],
  sessions: [
    { id: 's1', delivery_id: 'd1', title: 'S1', starts_at: d(5), ends_at: d(5, 13) },
    { id: 's2', delivery_id: 'd1', title: 'S2', starts_at: d(20), ends_at: d(20, 13) },
    { id: 's3', delivery_id: 'd1', title: 'S3', starts_at: d(6), ends_at: d(6, 13) },
    { id: 's4', delivery_id: 'd2', title: 'S4', starts_at: d(3), ends_at: d(3, 13) },
  ],
  experts: [{ id: 'e1', name: 'E1', status: 'aktiivinen', kind: 'ulkoinen', region: 'Uusimaa', remote_ok: true, user_id: null }, { id: 'e2', name: 'E2', status: 'passiivinen', kind: 'sisäinen', region: 'Uusimaa', remote_ok: true, user_id: null }],
  fits: [{ expert_id: 'e1', template_key: 'A', status: 'hyväksytty' }, { expert_id: 'e2', template_key: 'A', status: 'hyväksytty' }],
  availability: [{ expert_id: 'e1', kind: 'käytettävissä', starts_at: d(5, 8), ends_at: d(5, 16) }],
  assignments: [
    { id: 'a1', session_id: 's3', expert_id: 'e1', status: 'vahvistettu', needs_approval: false, approved_at: null, expert_accepted_at: d(0), created_at: d(-1), conflict_reasons: [] },
    { id: 'a2', session_id: 's1', expert_id: 'e1', status: 'pyydetty', needs_approval: true, approved_at: null, expert_accepted_at: null, created_at: d(-5), conflict_reasons: ['merkitty estyneeksi'] },
  ],
};

describe('expert capacity queues', () => {
  it('lists unstaffed sessions within 14 days, excluding confirmed and cancelled deliveries', () => {
    expect(expertQueue(base, 'unstaffed14', now).map(r => r.id)).toEqual(['s1']);
    expect(expertQueue(base, 'unstaffed30', now).map(r => r.id)).toEqual(['s1', 's2']);
  });
  it('flags unapproved conflicts and requests unanswered for over 3 days', () => {
    expect(expertQueue(base, 'pendingApproval', now).map(r => r.id)).toEqual(['a2']);
    expect(expertQueue(base, 'staleRequests', now).map(r => r.id)).toEqual(['a2']);
  });
  it('treats templates with fewer than 2 active fitting experts as a capacity risk', () => {
    expect(expertQueue(base, 'thinTemplates', now).map(r => r.id)).toEqual(['A', 'B']);
  });
  it('computes utilization only from recorded availability', () => {
    expect(utilization({ ...base, availability: [] }, now)).toBeNull();
    // 8 h available, confirmed s3 is 4 h but outside availability window still counts as used
    expect(utilization(base, now)).toBe(0.5);
  });
});
