// Mirrors the server checkpoint; this is display logic, never authorization.
export function billingEligible(sessions: { id: string; ends_at: string }[], actuals: { session_id: string; held?: boolean }[], now = Date.now()) {
  return sessions.length > 0 && sessions.every(s => Date.parse(s.ends_at) <= now && actuals.some(a => a.session_id === s.id && a.held === true));
}