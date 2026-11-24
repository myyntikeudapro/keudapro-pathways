// Capacity-risk metrics for the expert registry. Tiles and the linked /admin/asiantuntijat queues
// both use expertQueue, so counts and rows always match. Only stored data is used — nothing is inferred.
export type ExpertData = {
  templates: { key: string; name: string }[];
  deliveries: { id: string; template_key: string; title: string; production_status?: string }[];
  sessions: { id: string; delivery_id: string; title: string; starts_at: string; ends_at: string; delivery_mode?: string; region?: string | null }[];
  experts: { id: string; name: string; status: string; kind: string; region: string; remote_ok: boolean; user_id: string | null }[];
  fits: { expert_id: string; template_key: string; status: string }[];
  availability: { expert_id: string; kind: string; starts_at: string; ends_at: string }[];
  assignments: { id: string; session_id: string; expert_id: string; status: string; needs_approval: boolean; approved_at: string | null; expert_accepted_at: string | null; created_at: string; conflict_reasons: string[] }[];
};
export const EMPTY_EXPERT: ExpertData = { templates: [], deliveries: [], sessions: [], experts: [], fits: [], availability: [], assignments: [] };

export const EXPERT_QUEUES: Record<string, string> = {
  unstaffed14: 'Sessiot ilman vahvistettua asiantuntijaa (14 pv)',
  unstaffed30: 'Sessiot ilman vahvistettua asiantuntijaa (30 pv)',
  pendingApproval: 'Päällekkäisyydet odottavat hyväksyntää',
  staleRequests: 'Pyynnöt ilman vastausta yli 3 pv',
  thinTemplates: 'Pohjat, joilla alle 2 soveltuvaa asiantuntijaa',
};
export const EXPERT_FORMULAS: Record<string, string> = {
  unstaffed14: 'Sessiot, jotka alkavat seuraavan 14 vrk aikana, eivät kuulu perutulle toteutukselle ja joilla ei ole vahvistettua toimeksiantoa.',
  unstaffed30: 'Kuten yllä, 30 vrk ikkuna.',
  pendingApproval: 'Pyydetyt toimeksiannot, joilla on päällekkäisyys- tai soveltuvuusmerkintä eikä pääkäyttäjän hyväksyntää.',
  staleRequests: 'Pyydetyt toimeksiannot, joihin asiantuntija ei ole vastannut ja pyynnöstä on yli 72 tuntia.',
  thinTemplates: 'Toteutuspohjat, joille on alle 2 aktiivista asiantuntijaa hyväksytyllä soveltuvuudella.',
  utilization: 'Vahvistettujen toimeksiantojen tunnit / merkityt käytettävissä-tunnit seuraavan 30 vrk aikana.',
};

const DAY = 86_400_000;
const hours = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 3_600_000;

export function expertQueue(data: ExpertData, key: string, now: Date): { id: string; label: string; detail?: string }[] {
  const t = now.getTime();
  const confirmed = new Set(data.assignments.filter(a => a.status === 'vahvistettu').map(a => a.session_id));
  const cancelled = new Set(data.deliveries.filter(d => d.production_status === 'peruttu').map(d => d.id));
  const delivery = new Map(data.deliveries.map(d => [d.id, d]));
  const session = new Map(data.sessions.map(s => [s.id, s]));
  const expert = new Map(data.experts.map(e => [e.id, e]));
  const label = (a: ExpertData['assignments'][number]) => `${expert.get(a.expert_id)?.name ?? '?'} – ${session.get(a.session_id)?.title ?? '?'}`;
  switch (key) {
    case 'unstaffed14': case 'unstaffed30': {
      const until = t + (key === 'unstaffed14' ? 14 : 30) * DAY;
      return data.sessions.filter(s => { const st = Date.parse(s.starts_at); return st >= t && st <= until && !cancelled.has(s.delivery_id) && !confirmed.has(s.id); })
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map(s => ({ id: s.id, label: `${delivery.get(s.delivery_id)?.title ?? ''} – ${s.title}`, detail: s.starts_at }));
    }
    case 'pendingApproval':
      return data.assignments.filter(a => a.status === 'pyydetty' && a.needs_approval && !a.approved_at).map(a => ({ id: a.id, label: label(a), detail: a.conflict_reasons.join(', ') }));
    case 'staleRequests':
      return data.assignments.filter(a => a.status === 'pyydetty' && !a.expert_accepted_at && t - Date.parse(a.created_at) > 3 * DAY).map(a => ({ id: a.id, label: label(a), detail: a.created_at }));
    case 'thinTemplates': {
      const active = new Set(data.experts.filter(e => e.status === 'aktiivinen').map(e => e.id));
      return data.templates.map(tp => ({ tp, n: new Set(data.fits.filter(f => f.template_key === tp.key && f.status === 'hyväksytty' && active.has(f.expert_id)).map(f => f.expert_id)).size }))
        .filter(x => x.n < 2).map(x => ({ id: x.tp.key, label: `${x.tp.key} – ${x.tp.name}`, detail: `${x.n} soveltuvaa` }));
    }
    default: return [];
  }
}

/** Confirmed hours / available hours in the next 30 days; null when no availability is recorded. */
export function utilization(data: ExpertData, now: Date): number | null {
  const from = now.getTime(), to = from + 30 * DAY;
  const clip = (a: string, b: string) => Math.max(0, (Math.min(Date.parse(b), to) - Math.max(Date.parse(a), from)) / 3_600_000);
  const available = data.availability.filter(v => v.kind === 'käytettävissä').reduce((s, v) => s + clip(v.starts_at, v.ends_at), 0);
  if (available <= 0) return null;
  const session = new Map(data.sessions.map(s => [s.id, s]));
  const used = data.assignments.filter(a => a.status === 'vahvistettu').reduce((s, a) => { const x = session.get(a.session_id); return x ? s + clip(x.starts_at, x.ends_at) : s; }, 0);
  return used / available;
}
export { hours };
