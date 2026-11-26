import { expect, it } from 'vitest';
import { sessionInput, bookingToReuse } from './productionSession';

it('session 09–12 stays 09–12 Helsinki when saved', () => {
  expect(sessionInput(' Aamupäivä ', '2026-11-24T09:00', '2026-11-24T12:00')).toEqual({ title: 'Aamupäivä', starts_at: '2026-11-24T07:00:00.000Z', ends_at: '2026-11-24T10:00:00.000Z' });
});
it('session cannot end before it starts', () => expect(() => sessionInput('T', '2026-11-24T12:00', '2026-11-24T09:00')).toThrow());
it('session cannot have zero duration', () => expect(() => sessionInput('T', '2026-11-24T09:00', '2026-11-24T09:00')).toThrow());
it('rebooking the same trainer restores the cancelled booking instead of creating a duplicate', () => expect(bookingToReuse([{ id: 'b', session_id: 's', trainer_id: 't', status: 'peruttu' }], 's', 't')).toBe('b'));
it('a different trainer needs a new booking', () => expect(bookingToReuse([{ id: 'b', session_id: 's', trainer_id: 't', status: 'peruttu' }], 's', 'other')).toBeNull());