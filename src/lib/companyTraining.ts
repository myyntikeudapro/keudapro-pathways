// Pure preparation rules only. Not a permission check, persistence layer or live readiness gate.
export type Programme = {
  version: string; customer: string; year: number; text: string;
  startsAt: string; endsAt: string; trainers: string[];
  customerAliases?: string[];
};
export function programmeReview(source: Programme, target: Programme) {
  const findings: string[] = [];
  const normalized = target.text.toLocaleLowerCase('fi');
  if (source.customer !== target.customer && [source.customer, ...(source.customerAliases ?? [])].some(name => name.trim() && normalized.includes(name.toLocaleLowerCase('fi')))) findings.push('old_customer');
  if (source.year !== target.year && new RegExp(`\\b${source.year}\\b`).test(target.text)) findings.push('old_year');
  if (source.trainers.some(name => !target.trainers.includes(name) && normalized.includes(name.toLocaleLowerCase('fi')))) findings.push('old_trainer');
  const start = Date.parse(target.startsAt), end = Date.parse(target.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) findings.push('invalid_times');
  else {
    const fmt = new Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const clock = (date: number) => fmt.format(new Date(date)).replace('.', ':');
    const mentions = [...target.text.matchAll(/klo\s+(\d{1,2})(?:[.:](\d{2}))?\s*[–-]\s*(\d{1,2})(?:[.:](\d{2}))?/gi)];
    for (const mention of mentions) {
      const from = `${mention[1].padStart(2, '0')}:${mention[2] ?? '00'}`;
      const to = `${mention[3].padStart(2, '0')}:${mention[4] ?? '00'}`;
      if (from !== clock(start) || to !== clock(end)) { findings.push('conflicting_clock'); break; }
    }
    const localYear = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Helsinki', year: 'numeric' }).format(new Date(start)));
    if (localYear !== target.year) findings.push('conflicting_year');
    for (const date of target.text.matchAll(/\b\d{1,2}\.\d{1,2}\.(\d{4})\b/g)) {
      if (Number(date[1]) !== target.year && !findings.includes('old_year')) findings.push('old_year');
    }
    const startClock = clock(start);
    const startMinutes = Number(startClock.slice(0, 2)) * 60 + Number(startClock.slice(3));
    for (const time of target.text.matchAll(/klo\s+(\d{1,2})[.:](\d{2})(?!\s*[–-])/gi)) {
      if (Number(time[1]) * 60 + Number(time[2]) < startMinutes && !findings.includes('conflicting_clock')) findings.push('conflicting_clock');
    }
  }
  return findings;
}

// Only explicitly allow-listed programme content is copied; no participant data or approvals.
export function copyProgramme(source: Programme, target: Pick<Programme, 'version' | 'customer' | 'year' | 'startsAt' | 'endsAt' | 'trainers'>) {
  const programme: Programme = { version: target.version, customer: target.customer, year: target.year,
    startsAt: target.startsAt, endsAt: target.endsAt, trainers: [...target.trainers], text: source.text };
  return { sourceVersion: source.version, state: 'draft' as const, programme, findings: programmeReview(source, programme) };
}

export type Station = {
  id: string; machineIds: string[]; trainerIds: string[];
  requirement?: 'required' | 'optional';
  safeParallel: number | null; participantsPerTrainer: number | null;
  guidedMinutes: number | null; transitionMinutes: number | null;
};
export type PracticeSlot = {
  stationId: string; participantId: string; machineId: string; trainerId: string;
  startsAt: string; endsAt: string;
};
export type CapacityPlan = {
  programmeVersion: string; responsibleTrainerId: string; startsAt: string; endsAt: string;
  participantIds: string[]; stations: Station[]; slots: PracticeSlot[];
  electiveRequirements?: { participantId: string; stationIds: string[] }[];
};
// Canonical comparison key, not a cryptographic signature or authorization token.
// The future DB checkpoint must calculate/check its own locked revision.
export function capacityRevision(plan: CapacityPlan): string {
  return JSON.stringify({ ...plan, participantIds: [...plan.participantIds].sort(),
    stations: plan.stations.map(station => ({ ...station, machineIds: [...station.machineIds].sort(), trainerIds: [...station.trainerIds].sort() })).sort((a,b) => a.id.localeCompare(b.id)),
    slots: [...plan.slots].sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) });
}
export type CapacityApproval = { revision: string; trainerId: string; approvedAt: string };

export function capacityReview(plan: CapacityPlan, approval: CapacityApproval | null) {
  const reasons = new Set<string>();
  const positive = (value: number | null) => typeof value === 'number' && Number.isFinite(value) && value > 0;
  const unique = (values: string[]) => values.every(value => value.trim().length > 0) && new Set(values).size === values.length;
  const start = Date.parse(plan.startsAt), end = Date.parse(plan.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) reasons.add('invalid_window');
  if (!plan.programmeVersion.trim() || !plan.responsibleTrainerId.trim()) reasons.add('missing_identity');
  if (!plan.participantIds.length || !unique(plan.participantIds)) reasons.add('invalid_participants');
  if (!plan.stations.length || !unique(plan.stations.map(station => station.id))) reasons.add('invalid_stations');
  for (const station of plan.stations) {
    if (station.requirement !== undefined && !['required', 'optional'].includes(station.requirement)) reasons.add(`invalid_requirement:${station.id}`);
    if (!station.machineIds.length || !unique(station.machineIds) || !station.trainerIds.length || !unique(station.trainerIds)
      || !positive(station.safeParallel) || !Number.isInteger(station.safeParallel)
      || !positive(station.participantsPerTrainer) || !Number.isInteger(station.participantsPerTrainer)
      || !positive(station.guidedMinutes) || station.transitionMinutes === null || !Number.isFinite(station.transitionMinutes) || station.transitionMinutes < 0) reasons.add(`missing_inputs:${station.id}`);
  }
  const checked: { slot: PracticeSlot; start: number; end: number; available: number; station: Station }[] = [];
  for (const slot of plan.slots) {
    const station = plan.stations.find(item => item.id === slot.stationId);
    const from = Date.parse(slot.startsAt), to = Date.parse(slot.endsAt);
    if (!station || !plan.participantIds.includes(slot.participantId) || !station.machineIds.includes(slot.machineId) || !station.trainerIds.includes(slot.trainerId)) { reasons.add('invalid_slot_identity'); continue; }
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from || from < start || to > end) { reasons.add('invalid_slot_time'); continue; }
    if (station.guidedMinutes === null || to - from < station.guidedMinutes * 60_000) reasons.add(`short_practice:${station.id}:${slot.participantId}`);
    checked.push({ slot, station, start: from, end: to, available: to + (station.transitionMinutes ?? 0) * 60_000 });
  }
  for (const item of checked) {
    const simultaneous = checked.filter(other => other.start <= item.start && other.end > item.start);
    if (item.station.safeParallel !== null && simultaneous.filter(other => other.slot.stationId === item.slot.stationId).length > item.station.safeParallel) reasons.add(`parallel_limit:${item.slot.stationId}`);
    if (item.station.participantsPerTrainer !== null && simultaneous.filter(other => other.slot.stationId === item.slot.stationId && other.slot.trainerId === item.slot.trainerId).length > item.station.participantsPerTrainer) reasons.add(`trainer_limit:${item.slot.stationId}`);
  }
  for (let i=0; i<checked.length; i++) for (let j=i+1; j<checked.length; j++) {
    const a=checked[i], b=checked[j];
    if (a.start >= b.available || b.start >= a.available) continue;
    if (a.slot.participantId === b.slot.participantId) reasons.add('participant_overlap');
    if (a.slot.machineId === b.slot.machineId) reasons.add('machine_overlap');
    if (a.slot.trainerId === b.slot.trainerId && a.slot.stationId !== b.slot.stationId) reasons.add('trainer_station_overlap');
  }
  for (const station of plan.stations.filter(station => station.requirement !== 'optional')) for (const participant of plan.participantIds) {
    if (!checked.some(item => item.slot.stationId === station.id && item.slot.participantId === participant)) reasons.add(`missing_practice:${station.id}:${participant}`);
  }
  for (const requirement of plan.electiveRequirements ?? []) {
    if (!plan.participantIds.includes(requirement.participantId)) reasons.add('invalid_elective_participant');
    for (const stationId of requirement.stationIds) {
      if (!plan.stations.some(station => station.id === stationId && station.requirement === 'optional')) reasons.add('invalid_elective_station');
      else if (!checked.some(item => item.slot.stationId === stationId && item.slot.participantId === requirement.participantId)) reasons.add(`missing_practice:${stationId}:${requirement.participantId}`);
    }
  }
  if (!approval || approval.trainerId !== plan.responsibleTrainerId || !Number.isFinite(Date.parse(approval.approvedAt))) reasons.add('missing_approval');
  else if (approval.revision !== capacityRevision(plan)) reasons.add('stale_approval');
  return { ready: reasons.size === 0, reasons: [...reasons] };
}