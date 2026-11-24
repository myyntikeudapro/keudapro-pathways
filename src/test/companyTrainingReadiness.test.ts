import { describe, expect, it } from 'vitest';
import { companyReadiness, type CompanyReadinessEvidence } from '@/lib/companyTrainingReadiness';
import { capacityRevision } from '@/lib/companyTraining';
function evidence(): CompanyReadinessEvidence {
  const capacity = { programmeVersion:'v1',responsibleTrainerId:'synthetic-trainer',startsAt:'2026-04-02T06:00:00Z',endsAt:'2026-04-02T11:00:00Z',participantIds:['synthetic-participant'],stations:[{id:'r1',requirement:'required' as const,machineIds:['m1'],trainerIds:['t1'],safeParallel:1,participantsPerTrainer:1,guidedMinutes:10,transitionMinutes:2}],slots:[{stationId:'r1',participantId:'synthetic-participant',machineId:'m1',trainerId:'t1',startsAt:'2026-04-02T06:00:00Z',endsAt:'2026-04-02T06:10:00Z'}] };
  return {programmeVersion:'v1',programmeApprovedVersion:'v1',capacity,capacityApproval:{revision:capacityRevision(capacity),trainerId:'synthetic-trainer',approvedAt:'2026-04-01T10:00:00Z'},criticalResources:[{id:'m1',confirmed:true}],criticalResourceListVerified:true,acceptedProgrammeVersion:'v1',confirmedOrder:true};
}
describe('Yritysmallin aktivoimaton valmiusadapteri',()=>{
  it('puuttuva näyttö estää valmiuden',()=>expect(companyReadiness(null).ready).toBe(false));
  it('hyväksytty kokonaisuus on valmis valmistelulaskennassa',()=>expect(companyReadiness(evidence())).toEqual({ready:true,missing:[]}));
  it('suunnitelma ennen tilausta ei oikeuta aloitukseen',()=>expect(companyReadiness({...evidence(),confirmedOrder:false}).ready).toBe(false));
  it('vanha ohjelmahyväksyntä ei kelpaa',()=>expect(companyReadiness({...evidence(),programmeApprovedVersion:'v0'}).ready).toBe(false));
  it('vanha kapasiteettiversio ei kelpaa',()=>{const e=evidence();if(e.capacity)e.capacity.programmeVersion='v0';expect(companyReadiness(e).ready).toBe(false);});
  it('vastuukouluttajan hyväksyntä on pakollinen',()=>expect(companyReadiness({...evidence(),capacityApproval:null}).ready).toBe(false));
  it('vahvistamaton kriittinen resurssi estää aloituksen',()=>expect(companyReadiness({...evidence(),criticalResources:[{id:'m1',confirmed:false}]}).ready).toBe(false));
  it('tarkistamaton resurssilista ei vastaa vahvistettua tyhjää listaa',()=>expect(companyReadiness({...evidence(),criticalResourceListVerified:false,criticalResources:[]}).ready).toBe(false));
  it('vastaanotto vaaditaan voimassa olevalle versiolle',()=>expect(companyReadiness({...evidence(),acceptedProgrammeVersion:'v0'}).ready).toBe(false));
});