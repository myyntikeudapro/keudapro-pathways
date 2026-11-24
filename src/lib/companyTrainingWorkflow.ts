import type { Programme, CapacityPlan } from './companyTraining';

// Backend-neutral, typed RPC port; no generated schema bypass or fabricated approval.
// Production binding remains unmounted until migration + authenticated acceptance pass.
export type CompanyRpc = (name: string, args: Record<string, unknown>) => Promise<unknown>;
export type CompanySnapshot = {
  id: string; revision: number; programme: Programme; capacity: CapacityPlan;
  readiness: { ready: boolean; missing: string[] };
};
export function readCompanySnapshot(value: unknown): CompanySnapshot {
  if (!value || typeof value !== 'object') throw new Error('COMPANY_RESPONSE_INVALID');
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.revision !== 'number' || !row.programme || !row.capacity || !row.readiness || typeof row.readiness !== 'object') throw new Error('COMPANY_RESPONSE_INVALID');
  const readiness = row.readiness as Record<string, unknown>;
  if (typeof readiness.ready !== 'boolean' || !Array.isArray(readiness.missing) || !readiness.missing.every(item => typeof item === 'string')) throw new Error('COMPANY_RESPONSE_INVALID');
  return row as unknown as CompanySnapshot;
}
export function companyWorkflow(rpc: CompanyRpc) {
  const read = async (id: string) => readCompanySnapshot(await rpc('company_programme_read', { p_id: id }));
  const act = async (name: string, args: Record<string, unknown>, id: string) => {
    await rpc(name, args);
    return read(id); // command success is not persisted state until the read succeeds
  };
  return {
    read,
    save: async (input: { caseId: string; expectedId: string | null; programme: Programme; capacity: CapacityPlan; resources: unknown[]; resourceVerified: boolean; receiverId: string; trainerId: string; sourceId?: string }) => {
      const id = await rpc('company_programme_save', { p_case: input.caseId, p_expected: input.expectedId,
        p_programme: input.programme, p_capacity: input.capacity, p_resources: input.resources,
        p_resource_verified: input.resourceVerified, p_receiver: input.receiverId, p_trainer: input.trainerId,
        p_source: input.sourceId ?? null });
      if (typeof id !== 'string') throw new Error('COMPANY_RESPONSE_INVALID');
      return read(id);
    },
    saveCapacity: async (id: string, capacity: CapacityPlan) => {
      const nextId = await rpc('company_capacity_save', {p_id:id,p_capacity:capacity});
      if (typeof nextId !== 'string') throw new Error('COMPANY_RESPONSE_INVALID');
      return read(nextId);
    },
    approveProgramme: (id: string, note: string) => act('company_programme_approve',{p_id:id,p_review_note:note},id),
    approveCapacity: (id: string) => act('company_capacity_approve',{p_id:id},id),
    attachOrder: async (id: string, orderId: string, template: string) => {
      const deliveryId = await rpc('company_attach_order',{p_id:id,p_order:orderId,p_template:template});
      if (typeof deliveryId !== 'string') throw new Error('COMPANY_RESPONSE_INVALID');
      return {deliveryId,programme:await read(id)};
    },
    submit: (id: string, orderId: string) => act('company_handoff_submit',{p_id:id,p_order:orderId},id),
    respond: (id: string, orderId: string, accept: boolean, reason?: string) => {
      if (!accept && !reason?.trim()) throw new Error('COMPANY_RETURN_REASON_REQUIRED');
      return act('company_handoff_respond',{p_id:id,p_order:orderId,p_accept:accept,p_reason:accept?null:reason?.trim()},id);
    },
  };
}
// Staff snapshot fields used to carry a revision forward; approvals/readiness are never copied by the browser.
export type CompanyStaffSnapshot = CompanySnapshot & {
  state?: string; sales_owner_id?: string; production_owner_id?: string; responsible_trainer_id?: string | null;
  resource_plan?: unknown[]; resource_list_verified?: boolean; promises?: string; case_lead_id?: string;
};
export function nextRevisionInput(input: { caseId: string; current: CompanyStaffSnapshot | null; text: string; promises: string;
  startsAt: string; endsAt: string; receiverId: string; trainerId: string; trainers: string[] }) {
  const start = Date.parse(input.startsAt), end = Date.parse(input.endsAt);
  if (!input.text.trim() || !input.receiverId || !input.trainerId || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('COMPANY_PROGRAMME_INVALID');
  const startsAt = new Date(start).toISOString(), endsAt = new Date(end).toISOString();
  return {
    caseId: input.caseId, expectedId: input.current?.id ?? null,
    programme: { version: '', customer: '', year: new Date(start).getUTCFullYear(), text: input.text.trim(), startsAt, endsAt, trainers: input.trainers, promises: input.promises.trim() } as Programme & { promises: string },
    capacity: ((input.current?.capacity ?? {}) as CapacityPlan),
    resources: Array.isArray(input.current?.resource_plan) ? input.current.resource_plan : [],
    resourceVerified: input.current?.resource_list_verified === true,
    receiverId: input.receiverId, trainerId: input.trainerId,
  };
}
const COMPANY_ERRORS: Record<string, string> = {
  COMPANY_STALE_REVISION: 'Ohjelmasta on tallennettu uudempi revisio. Lataa kortti uudelleen.',
  COMPANY_SALES_REQUIRED: 'Vain asiakkaan vastuumyyjä voi tehdä tämän.',
  COMPANY_RESPONSIBILITIES_INVALID: 'Tuotantovastaavan tai kouluttajan rooli ei kelpaa.',
  COMPANY_PROGRAMME_INVALID: 'Täytä ohjelma sekä kelvollinen alku- ja loppuaika.',
  COMPANY_REVIEW_NOTE_REQUIRED: 'Kirjoita tarkistusmerkintä.',
  COMPANY_PROGRAMME_REVIEW_BLOCKED: 'Ohjelmassa on tarkistuspuutteita, joten sitä ei voi hyväksyä.',
  COMPANY_CONFIRMED_ORDER_REQUIRED: 'Valitse tämän asiakkaan vahvistettu tilaus.',
  COMPANY_ORDER_LINK_REQUIRED: 'Kytke ensin tilaus toteutukseen.',
  COMPANY_HANDOFF_APPROVAL_REQUIRED: 'Luovutus vaatii voimassa olevan ohjelma- ja kapasiteettihyväksynnän.',
  COMPANY_RETURN_REQUIRES_NEW_REVISION: 'Palautettu ohjelma vaatii uuden revision ennen uutta luovutusta.',
  COMPANY_EXECUTION_ALREADY_STARTED: 'Toteutus on jo aloitettu, joten ohjelmaa ei voi muuttaa.',
  COMPANY_LEGACY_DELIVERY_REVIEW_REQUIRED: 'Tilauksella on jo muu toteutus, joka vaatii erillisen tarkistuksen.',
  COMPANY_LEGACY_HANDOFF_REVIEW_REQUIRED: 'Tilauksella on aiempi luovutus, joka vaatii erillisen tarkistuksen.',
  COMPANY_TRAINER_REQUIRED: 'Vain ohjelmaan nimetty kouluttaja voi tehdä tämän.',
  COMPANY_RECEIVER_REQUIRED: 'Vain nimetty tuotantovastaava voi vastaanottaa tai palauttaa.',
  COMPANY_STALE_HANDOFF: 'Luovutus koskee vanhaa revisiota. Lataa näkymä uudelleen.',
  COMPANY_HANDOFF_ALREADY_DECIDED: 'Luovutus on jo päätetty.',
  COMPANY_RETURN_REASON_REQUIRED: 'Kirjoita palautuksen syy.',
  COMPANY_CAPACITY_CHANGED: 'Kapasiteetissa on puutteita, joten vastaanotto estyi.',
  COMPANY_CAPACITY_INVALID: 'Kapasiteettisuunnitelma ei kelpaa.',
  COMPANY_CAPACITY_BLOCKED: 'Kapasiteetissa on puutteita, joten sitä ei voi hyväksyä.',
  COMPANY_ACCESS_DENIED: 'Sinulla ei ole oikeutta tähän ohjelmaan.',
  COMPANY_NOT_FOUND: 'Ohjelmaa ei löytynyt.',
  COMPANY_RESPONSE_INVALID: 'Tallennusta ei voitu vahvistaa takaisinluvulla.',
};
export function companyErrorText(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? '');
  if (message.includes('company_programme_') && (message.includes('Could not find') || message.includes('does not exist'))) return 'Yrityskoulutuksen tallennustoimintoa ei ole vielä otettu käyttöön tässä ympäristössä. Ohjelmaa ei vahvistettu tallennetuksi.';
  const code = Object.keys(COMPANY_ERRORS).find(key => message.includes(key));
  return code ? COMPANY_ERRORS[code] : 'Toiminto epäonnistui eikä mitään vahvistettu tallennetuksi.';
}

export type CapacityStationInput = { id: string; requirement: 'required' | 'optional'; guidedMinutes: number; transitionMinutes: number; safeParallel: number; participantsPerTrainer: number; machineIds: string[] };
export type CapacitySlotInput = { stationId: string; participantId: string; machineId: string; startsAt: string; endsAt: string };
// Builds the trainer-entered plan; server adds version/trainer/window identity and computes all defects.
export function buildCapacity(input: { participants: number; trainerId: string; stations: CapacityStationInput[]; slots: CapacitySlotInput[] }) {
  if (!Number.isInteger(input.participants) || input.participants < 1 || input.participants > 500 || !input.trainerId) throw new Error('COMPANY_CAPACITY_INVALID');
  const iso = (v: string) => { const t = Date.parse(v); if (!Number.isFinite(t)) throw new Error('COMPANY_CAPACITY_INVALID'); return new Date(t).toISOString(); };
  return {
    participantIds: Array.from({ length: input.participants }, (_, i) => `p${i + 1}`),
    stations: input.stations.map(s => ({ ...s, trainerIds: [input.trainerId] })),
    slots: input.slots.map(({ machineId, ...s }) => ({ ...s, ...(machineId ? { machineId } : {}), trainerId: input.trainerId, startsAt: iso(s.startsAt), endsAt: iso(s.endsAt) })),
  };
}
export const READINESS_LABELS: Record<string, string> = {
  programme_unapproved: 'Ohjelmaa ei ole hyväksytty', capacity_unapproved: 'Kapasiteettia ei ole hyväksytty',
  approval_snapshot_mismatch: 'Hyväksyntä koskee vanhaa sisältöä', stale_revision: 'Uudempi revisio olemassa',
  confirmed_order_delivery_missing: 'Tilausta ei ole kytketty toteutukseen', preparation_tasks_open: 'Kriittisiä tehtäviä kesken',
  blockers_open: 'Avoimia puutteita', programme_session_mismatch: 'Opetuskerta ei vastaa ohjelman aikaa',
  handoff_not_accepted: 'Tuotanto ei ole vastaanottanut', capacity_shape: 'Kapasiteettisuunnitelma puuttuu',
  capacity_empty: 'Osallistujat tai rastit puuttuvat', missing_practice: 'Osallistujalta puuttuu pakollinen harjoitus',
  parallel_limit: 'Rastin rinnakkaisraja ylittyy', trainer_limit: 'Kouluttajan osallistujaraja ylittyy',
  machine_overlap: 'Kone on varattu päällekkäin', participant_overlap: 'Osallistuja on kahdessa paikassa',
  short_practice: 'Harjoitusaika on liian lyhyt', slot_window: 'Harjoitus on koulutusajan ulkopuolella',
  slot_identity: 'Harjoitusrivillä on tuntematon rasti, kone tai osallistuja', station_inputs: 'Rastin tiedot ovat puutteelliset',
  station_resources: 'Rastilta puuttuu kouluttaja', resource_invalid_data: 'Resurssitiedot virheelliset',
  multiple_delivery_review_required: 'Useita toteutuksia, vaatii tarkistuksen',
};
export const readinessLabel = (code: string) => READINESS_LABELS[code] ?? code;

export type TrainerProgrammeRow = { id: string; revision: number; state: string; starts_at: string | null; ends_at: string | null; capacity_approved: boolean };
const TRAINER_ROW_KEYS = ['capacity_approved', 'ends_at', 'id', 'revision', 'starts_at', 'state'];
// Fails closed if the server ever returns extra (e.g. customer) fields or malformed rows.
export function readTrainerProgrammes(value: unknown): TrainerProgrammeRow[] {
  if (!Array.isArray(value)) throw new Error('COMPANY_RESPONSE_INVALID');
  return value.map(row => {
    if (!row || typeof row !== 'object' || Object.keys(row).sort().join() !== TRAINER_ROW_KEYS.join()) throw new Error('COMPANY_RESPONSE_INVALID');
    const r = row as TrainerProgrammeRow;
    if (typeof r.id !== 'string' || typeof r.revision !== 'number' || typeof r.state !== 'string' || typeof r.capacity_approved !== 'boolean') throw new Error('COMPANY_RESPONSE_INVALID');
    return r;
  });
}
export const listTrainerProgrammes = async (rpc: CompanyRpc) => readTrainerProgrammes(await rpc('company_my_trainer_programmes', {}));
