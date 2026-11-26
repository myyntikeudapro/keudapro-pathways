import { helsinkiIso } from './helsinkiTime';

export function sessionInput(title: string, start: string, end: string) {
  const starts_at = helsinkiIso(start), ends_at = helsinkiIso(end);
  if (!title.trim() || Date.parse(ends_at) <= Date.parse(starts_at)) throw new Error('Anna session nimi ja loppuaika alkamisajan jälkeen.');
  return { title: title.trim(), starts_at, ends_at };
}

export function bookingToReuse(bookings: { id: string; session_id: string; trainer_id: string; status: string }[], sessionId: string, trainerId: string) {
  return bookings.find(b => b.session_id === sessionId && b.trainer_id === trainerId)?.id ?? null;
}