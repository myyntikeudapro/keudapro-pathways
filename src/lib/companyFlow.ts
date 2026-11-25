// Pure flow-stage rules for the company-training value stream (sales → production → billing).
export type FlowStep = { key: string; label: string; done: boolean };
export type FlowState = { steps: FlowStep[]; current: number; next: { who: string; text: string } | null };

const CAPACITY_CODES = ['capacity_unapproved', 'capacity_shape', 'capacity_empty', 'stale_approval'];

export function salesFlow(i: { hasOffer: boolean; hasOrder: boolean; programmeSaved: boolean; programmeApproved: boolean; missing: string[]; attached: boolean; handoff?: string | null }): FlowState {
  const capacityOk = i.programmeSaved && !i.missing.some(m => CAPACITY_CODES.includes(m));
  const steps: FlowStep[] = [
    { key: 'offer', label: 'Tarjous hyväksytty', done: i.hasOffer || i.hasOrder },
    { key: 'order', label: 'Tilaus vahvistettu', done: i.hasOrder },
    { key: 'programme', label: 'Ohjelma hyväksytty', done: i.programmeApproved },
    { key: 'capacity', label: 'Kapasiteetti hyväksytty', done: capacityOk },
    { key: 'attach', label: 'Tilaus kytketty', done: i.attached },
    { key: 'handoff', label: 'Luovutettu tuotantoon', done: i.handoff === 'submitted' || i.handoff === 'accepted' },
    { key: 'accepted', label: 'Tuotanto vastaanotti', done: i.handoff === 'accepted' },
  ];
  const NEXT: Record<string, { who: string; text: string }> = {
    offer: { who: 'Myyjä', text: 'Tallenna tarjous asiakaskortilla ja vaihda sen tila Hyväksytyksi.' },
    order: { who: 'Myyjä', text: 'Paina Vahvista tilaus asiakaskortin yrityskoulutusosiossa.' },
    programme: { who: 'Myyjä', text: i.programmeSaved ? 'Kirjoita tarkistusmerkintä ja paina Hyväksy ohjelma.' : 'Täytä ohjelma, ajat ja vastuuhenkilöt ja paina Tallenna ohjelmaluonnos.' },
    capacity: { who: 'Kouluttaja', text: 'Kouluttaja kirjautuu omalla tunnuksellaan Tuotantoon, asettaa osallistujamäärän ja painaa Tallenna kapasiteetti ja Hyväksy kapasiteetti.' },
    attach: { who: 'Myyjä', text: 'Valitse vahvistettu tilaus ja toteutuspohja ja paina Kytke tilaus.' },
    handoff: { who: 'Myyjä', text: i.handoff === 'returned' ? 'Tuotanto palautti täydennettäväksi: korjaa syyn mukaan ja paina Luovuta tuotantoon.' : 'Paina Luovuta tuotantoon.' },
    accepted: { who: 'Tuotanto', text: 'Tuotantovastaava avaa Tuotanto-näkymän ja vastaanottaa luovutuksen.' },
  };
  const current = steps.findIndex(s => !s.done);
  return { steps, current, next: current === -1 ? null : NEXT[steps[current].key] };
}

export function productionFlow(i: { sessions: number; sessionsBooked: boolean; ready: boolean; allHeld: boolean; billingReady: boolean }): FlowState {
  const steps: FlowStep[] = [
    { key: 'sessions', label: 'Sessiot ja kouluttajat', done: i.sessions > 0 && i.sessionsBooked },
    { key: 'ready', label: 'Aloitusvalmis', done: i.ready },
    { key: 'held', label: 'Toteumat kirjattu', done: i.sessions > 0 && i.allHeld },
    { key: 'billing', label: 'Laskutusvalmis', done: i.billingReady },
  ];
  const NEXT: Record<string, { who: string; text: string }> = {
    sessions: { who: 'Tuotanto', text: 'Lisää sessiot kohdassa Sessiot ja varaa jokaiselle kouluttaja.' },
    ready: { who: 'Tuotanto', text: 'Kuittaa kriittiset tehtävät valmiiksi ja tarkista aloitusvalmiuden puutteet.' },
    held: { who: 'Tuotanto / kouluttaja', text: 'Paina session jälkeen Kirjaa toteuma jokaiselle sessiolle.' },
    billing: { who: 'Tuotanto', text: 'Tarkista laskutusvalmius ja maksutila Laskutus-osiossa.' },
  };
  const current = steps.findIndex(s => !s.done);
  return { steps, current, next: current === -1 ? null : NEXT[steps[current].key] };
}
