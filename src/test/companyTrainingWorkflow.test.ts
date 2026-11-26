import { describe, expect, it, vi } from 'vitest';
import { companyWorkflow, readCompanySnapshot } from '@/lib/companyTrainingWorkflow';
const snapshot = {id:'v1',revision:1,programme:{version:'v1'},capacity:{programmeVersion:'v1'},readiness:{ready:false,missing:['capacity_unapproved']}};
describe('Yrityskoulutuksen yhteinen aktivoimaton RPC-portti',()=>{
 it('kapasiteetin hyväksyntä luetaan takaisin eikä selain lähetä hyväksyjää tai ready-tilaa',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(snapshot);
  expect(await companyWorkflow(rpc).approveCapacity('v1')).toEqual(snapshot);
  expect(rpc.mock.calls).toEqual([['company_capacity_approve',{p_id:'v1'}],['company_programme_read',{p_id:'v1'}]]);
 });
 it('vastaanotto sitoutuu ohjelmaversioon ja tilaukseen',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(snapshot);
  await companyWorkflow(rpc).respond('v1','o1',true);
  expect(rpc.mock.calls[0]).toEqual(['company_handoff_respond',{p_id:'v1',p_order:'o1',p_accept:true,p_reason:null}]);
 });
 it('palautus ilman syytä estyy ennen kutsua',async()=>{
  const rpc=vi.fn();expect(()=>companyWorkflow(rpc).respond('v1','o1',false,' ')).toThrow('COMPANY_RETURN_REASON_REQUIRED');expect(rpc).not.toHaveBeenCalled();
 });
 it('väärän käyttäjän palvelinvirhe ei muutu onnistuneeksi vastaanotoksi',async()=>{
  const rpc=vi.fn().mockRejectedValue(new Error('COMPANY_RECEIVER_REQUIRED'));
  await expect(companyWorkflow(rpc).respond('v1','o1',true)).rejects.toThrow('COMPANY_RECEIVER_REQUIRED');expect(rpc).toHaveBeenCalledTimes(1);
 });
 it('vanhan revision palvelinvirhe ei laukaise automaattista toistoa',async()=>{
  const rpc=vi.fn().mockRejectedValue(new Error('COMPANY_STALE_REVISION'));
  await expect(companyWorkflow(rpc).approveCapacity('v0')).rejects.toThrow('COMPANY_STALE_REVISION');expect(rpc).toHaveBeenCalledTimes(1);
 });
 it('epäonnistunut takaisinluku estää onnistumisvahvistuksen',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce(null).mockRejectedValueOnce(new Error('read_failed'));
  await expect(companyWorkflow(rpc).approveProgramme('v1','tarkistettu')).rejects.toThrow('read_failed');
 });
 it('ready-teksti ei kelpaa palvelimen boolean-tilan sijaan',()=>expect(()=>readCompanySnapshot({...snapshot,readiness:{ready:'true',missing:[]}})).toThrow('COMPANY_RESPONSE_INVALID'));
});import { nextRevisionInput, companyErrorText } from '@/lib/companyTrainingWorkflow';
describe('Myynnin revisiosyöte',()=>{
 const base={caseId:'c1',current:null,text:'Ohjelma',promises:'',startsAt:'2027-02-15T09:00',endsAt:'2027-02-15T15:00',receiverId:'p1',trainerId:'t1',trainers:['t']};
 it('ensimmäinen tallennus odottaa tyhjää versiota',()=>expect(nextRevisionInput(base).expectedId).toBeNull());
 it('uuden yritysasiakkaan ensimmäinen ohjelma tallentuu nykyisen portin kautta ja luetaan takaisin',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce('v1').mockResolvedValueOnce(snapshot);
  const result=await companyWorkflow(rpc).save(nextRevisionInput(base));
  expect(rpc.mock.calls[0]).toEqual(['company_programme_save',expect.objectContaining({p_case:'c1',p_expected:null,p_receiver:'p1',p_trainer:'t1',p_capacity:{},p_resources:[],p_resource_verified:false})]);
  expect(rpc.mock.calls[1]).toEqual(['company_programme_read',{p_id:'v1'}]);
  expect(result.id).toBe('v1');expect(result.readiness.ready).toBe(false);
 });
 it('ensimmäisen luonnoksen tallennusvirhe ei käynnistä takaisinlukua tai automaattista toistoa',async()=>{
  const rpc=vi.fn().mockRejectedValue(new Error('COMPANY_SALES_REQUIRED'));
  await expect(companyWorkflow(rpc).save(nextRevisionInput(base))).rejects.toThrow('COMPANY_SALES_REQUIRED');
  expect(rpc).toHaveBeenCalledTimes(1);
 });
 it('uusi revisio sitoutuu luettuun versioon ja kantaa kapasiteetin, ei hyväksyntää',()=>{
  const r=nextRevisionInput({...base,current:{id:'v3',revision:3,programme:{} as any,capacity:{x:1} as any,readiness:{ready:true,missing:[]},state:'approved',resource_plan:[{a:1}],resource_list_verified:true}});
  expect(r.expectedId).toBe('v3');expect(r.capacity).toEqual({x:1});expect(r.resources).toEqual([{a:1}]);expect(JSON.stringify(r)).not.toContain('approved');
 });
 it('loppu ennen alkua estyy ennen kutsua',()=>expect(()=>nextRevisionInput({...base,endsAt:'2027-02-15T08:00'})).toThrow('COMPANY_PROGRAMME_INVALID'));
 it('puuttuva kouluttaja estyy',()=>expect(()=>nextRevisionInput({...base,trainerId:''})).toThrow('COMPANY_PROGRAMME_INVALID'));
 it('tuntematon virhe ei näytä onnistumista',()=>expect(companyErrorText(new Error('x'))).toContain('eikä mitään'));
});
import { buildCapacity, readinessLabel } from '@/lib/companyTrainingWorkflow';
describe('Kouluttajan kapasiteettisyöte',()=>{
 const st={id:'s1',requirement:'required' as const,guidedMinutes:60,transitionMinutes:0,safeParallel:2,participantsPerTrainer:2,machineIds:['m1']};
 it('osallistujat ovat suunnittelutunnuksia, eivät henkilötietoja',()=>expect(buildCapacity({participants:3,trainerId:'t1',stations:[st],slots:[]}).participantIds).toEqual(['p1','p2','p3']));
 it('kouluttaja tulee nimetystä vastuukouluttajasta',()=>{const c=buildCapacity({participants:1,trainerId:'t1',stations:[st],slots:[{stationId:'s1',participantId:'p1',machineId:'m1',startsAt:'2027-01-15T09:00',endsAt:'2027-01-15T10:00'}]});expect(c.stations[0].trainerIds).toEqual(['t1']);expect(c.slots[0].trainerId).toBe('t1');});
 it('ei hyväksyntä- tai valmiustietoja',()=>expect(JSON.stringify(buildCapacity({participants:1,trainerId:'t1',stations:[st],slots:[]}))).not.toMatch(/approv|ready/));
 it('nolla osallistujaa estyy',()=>expect(()=>buildCapacity({participants:0,trainerId:'t1',stations:[],slots:[]})).toThrow('COMPANY_CAPACITY_INVALID'));
 it('virheellinen aika estyy',()=>expect(()=>buildCapacity({participants:1,trainerId:'t1',stations:[st],slots:[{stationId:'s1',participantId:'p1',machineId:'m1',startsAt:'x',endsAt:'y'}]})).toThrow('COMPANY_CAPACITY_INVALID'));
 it('tuntematon puute näytetään koodina eikä piiloteta',()=>expect(readinessLabel('uusi_puute')).toBe('uusi_puute'));
});
import { readTrainerProgrammes, listTrainerProgrammes } from '@/lib/companyTrainingWorkflow';
describe('Kouluttajan omat ohjelmat',()=>{
 const row={id:'v1',revision:2,state:'draft',starts_at:'2027-01-15T07:00:00Z',ends_at:'2027-01-15T13:00:00Z',capacity_approved:false,company_name:'TESTI 2 Oy'};
 it('kouluttaja näkee yrityksen nimen',async()=>{const rpc=vi.fn().mockResolvedValue([row]);expect(await listTrainerProgrammes(rpc)).toEqual([row]);expect(rpc).toHaveBeenCalledWith('company_my_trainer_programmes_with_company',{});});
 it('yhteystiedot ja hinnat eivät kelpaa rajattuun vastaukseen',()=>{for(const extra of [{email:'asiakas@example.com'},{phone:'0400000000'},{total_net:4800}]) expect(()=>readTrainerProgrammes([{...row,...extra}])).toThrow('COMPANY_RESPONSE_INVALID');});
 it('puuttuva yritysnimi ei muutu henkilön nimeksi',()=>expect(readTrainerProgrammes([{...row,company_name:null}])[0].company_name).toBeNull());
 it('yritysnimen on oltava tekstiä tai puuttuva tieto',()=>expect(()=>readTrainerProgrammes([{...row,company_name:42}])).toThrow('COMPANY_RESPONSE_INVALID'));
 it('asiakaskenttä vastauksessa hylätään',()=>expect(()=>readTrainerProgrammes([{...row,customer:'X Oy'}])).toThrow('COMPANY_RESPONSE_INVALID'));
 it('ei-lista hylätään',()=>expect(()=>readTrainerProgrammes({})).toThrow('COMPANY_RESPONSE_INVALID'));
});

import { buildCapacity as buildCap } from '@/lib/companyTrainingWorkflow';
describe('koneeton kapasiteetti', () => {
  it('sallii kapasiteetin ilman rasteja ja jättää konetunnisteen pois tyhjästä vuorosta', () => {
    expect(buildCap({ participants: 8, trainerId: 't1', stations: [], slots: [] })).toEqual({ participantIds: ['p1','p2','p3','p4','p5','p6','p7','p8'], stations: [], slots: [] });
    const c = buildCap({ participants: 1, trainerId: 't1', stations: [{ id: 's1', requirement: 'required', guidedMinutes: 30, transitionMinutes: 0, safeParallel: 1, participantsPerTrainer: 1, machineIds: [] }], slots: [{ stationId: 's1', participantId: 'p1', machineId: '', startsAt: '2027-01-01T08:00:00Z', endsAt: '2027-01-01T09:00:00Z' }] });
    expect('machineId' in c.slots[0]).toBe(false);
  });
});
