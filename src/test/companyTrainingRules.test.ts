import { describe, expect, it } from 'vitest';
import { capacityRevision, capacityReview, copyProgramme, programmeReview, type CapacityPlan, type Programme } from '@/lib/companyTraining';
const old: Programme = { version:'2025-1', customer:'TESTI Vanha Oy', year:2025, text:'TESTI Vanha Oy 2025, kouluttaja TESTI Vanha, klo 9–14', trainers:['TESTI Vanha'], startsAt:'2025-04-02T06:00:00Z', endsAt:'2025-04-02T11:00:00Z' };
const target = { version:'2026-1', customer:'TESTI Uusi Oy', year:2026, trainers:['TESTI Uusi'], startsAt:'2026-04-02T06:00:00Z', endsAt:'2026-04-02T11:00:00Z' };
// All numerical capacities below are explicitly synthetic test inputs, not Luotea assumptions.
function plan(count: number): CapacityPlan {
  const participantIds = Array.from({length:count},(_,i)=>`test-${i}`);
  const stations = Array.from({length:3},(_,i)=>({id:`r${i}`,machineIds:[`m${i}`],trainerIds:[`t${i}`],safeParallel:1,participantsPerTrainer:1,guidedMinutes:1,transitionMinutes:1}));
  return {programmeVersion:'2026-1',responsibleTrainerId:'test-responsible',startsAt:target.startsAt,endsAt:target.endsAt,participantIds,stations,
    slots:stations.flatMap((station,s)=>participantIds.map((participantId,p)=>({stationId:station.id,participantId,machineId:station.machineIds[0],trainerId:station.trainerIds[0],startsAt:new Date(Date.parse(target.startsAt)+(s*80+p*2)*60_000).toISOString(),endsAt:new Date(Date.parse(target.startsAt)+(s*80+p*2+1)*60_000).toISOString()})))};
}
const approve = (p: CapacityPlan) => ({revision:capacityRevision(p),trainerId:p.responsibleTrainerId,approvedAt:'2026-04-01T10:00:00Z'});
describe('Ohjelmakopion tarkistukset',()=>{
  it('nostaa vanhan asiakkaan tarkistettavaksi',()=>expect(programmeReview(old,{...target,text:old.customer})).toContain('old_customer'));
  it('nostaa vuoden 2025 tarkistettavaksi vuoden 2026 luonnoksessa',()=>expect(programmeReview(old,{...target,text:'Vuoden 2025 ohjelma'})).toContain('old_year'));
  it('nostaa vanhan kouluttajan tarkistettavaksi',()=>expect(programmeReview(old,{...target,text:'TESTI Vanha'})).toContain('old_trainer'));
  it('tarkistaa klo 9–14 Helsinki-ajassa eikä UTC-ajassa',()=>expect(programmeReview(old,{...target,text:'klo 9–14'})).toEqual([]));
  it('tunnistaa ristiriitaisen klo 9–13',()=>expect(programmeReview(old,{...target,text:'klo 9–13'})).toContain('conflicting_clock'));
  it('kopioi vain ohjelman eikä osallistujia, läsnäoloa tai hyväksyntää',()=>{
    const copy=copyProgramme({...old,participants:['private'],approvedAt:'old',attendance:['old']} as Programme,target);
    expect(copy.state).toBe('draft');expect(copy.sourceVersion).toBe('2025-1');
    expect(Object.keys(copy.programme).sort()).toEqual(['customer','endsAt','startsAt','text','trainers','version','year']);
  });
});
describe('Kapasiteetin valmistelusäännöt, eivät nykykannan valmiusportti',()=>{
  for(const count of [35,20]) {
    it(`${count} osallistujaa, kolme rastia ja 9–14 ei hyväksy puuttuvia syötteitä`,()=>{
      const p=plan(count);p.stations[0].guidedMinutes=null;
      expect(capacityReview(p,approve(p))).toMatchObject({ready:false});expect(capacityReview(p,approve(p)).reasons).toContain('missing_inputs:r0');
    });
    it(`${count} osallistujaa ei hyväksy suunnitelmaa ilman kouluttajan hyväksyntää`,()=>expect(capacityReview(plan(count),null).reasons).toContain('missing_approval'));
    it(`${count} osallistujan synteettinen kattava harjoitteluaikataulu hyväksytään vain täsmäävällä hyväksynnällä`,()=>{const p=plan(count);expect(p.slots).toHaveLength(count*3);expect(capacityReview(p,approve(p))).toEqual({ready:true,reasons:[]});});
  }
  it('osallistujamäärän muutos vanhentaa hyväksynnän',()=>{const p=plan(20),approval=approve(p);p.participantIds.push('new');expect(capacityReview(p,approval).reasons).toContain('stale_approval');});
  it('harjoitteluajan muutos vanhentaa hyväksynnän',()=>{const p=plan(20),approval=approve(p);p.stations[0].guidedMinutes=10;expect(capacityReview(p,approval).reasons).toContain('stale_approval');});
  it('liian lyhyt ohjattu harjoittelu estyy',()=>{const p=plan(20);p.stations[0].guidedMinutes=10;expect(capacityReview(p,approve(p)).reasons).toContain('short_practice:r0:test-0');});
  it('yksi puuttuva rastikäynti estää kattavuuden',()=>{const p=plan(20);p.slots.shift();expect(capacityReview(p,approve(p)).reasons).toContain('missing_practice:r0:test-0');});
  it('sama kone ei voi olla samanaikaisesti kahdella osallistujalla',()=>{const p=plan(20);p.slots[1]={...p.slots[1],startsAt:p.slots[0].startsAt,endsAt:p.slots[0].endsAt};expect(capacityReview(p,approve(p)).reasons).toContain('machine_overlap');});
  it('sama osallistuja ei voi olla samanaikaisesti kahdella rastilla',()=>{const p=plan(20);p.slots[20]={...p.slots[20],startsAt:p.slots[0].startsAt,endsAt:p.slots[0].endsAt};expect(capacityReview(p,approve(p)).reasons).toContain('participant_overlap');});
  it('siirtymäaika ei saa kadota peräkkäisistä harjoitteluista',()=>{const p=plan(20);p.slots[1].startsAt=p.slots[0].endsAt;expect(capacityReview(p,approve(p)).reasons).toContain('machine_overlap');});
  it('vastuukouluttajaan täsmäämätön valmisteluhyväksyntä estyy',()=>{const p=plan(20);expect(capacityReview(p,{...approve(p),trainerId:'wrong'}).reasons).toContain('missing_approval');});
  it('valinnainen rasti ei vaadi kaikilta käyntiä',()=>{const p=plan(20);p.stations[2].requirement='optional';p.slots=p.slots.filter(s=>s.stationId!=='r2');expect(capacityReview(p,approve(p)).ready).toBe(true);});
  it('osallistujalle valittu valinnainen rasti vaatii käynnin',()=>{const p=plan(20);p.stations[2].requirement='optional';p.slots=p.slots.filter(s=>s.stationId!=='r2');p.electiveRequirements=[{participantId:'test-0',stationIds:['r2']}];expect(capacityReview(p,approve(p)).reasons).toContain('missing_practice:r2:test-0');});
  it('valinnaisen rastin valinta vanhentaa hyväksynnän',()=>{const p=plan(20);p.stations[2].requirement='optional';const a=approve(p);p.electiveRequirements=[{participantId:'test-0',stationIds:['r2']}];expect(capacityReview(p,a).reasons).toContain('stale_approval');});
});
describe('Lähdemäärittelyn kopioitumisriskit synteettisin nimin',()=>{
  it('vanhan asiakkaan lyhenne nousee tarkistettavaksi',()=>expect(programmeReview({...old,customerAliases:['V&O']},{...target,text:'V&O ohjelma'})).toContain('old_customer'));
  it('väärä 2.4.2025-päivä nousee tarkistettavaksi',()=>expect(programmeReview(old,{...target,text:'Ohjelma 2.4.2025'})).toContain('old_year'));
  it('kierroksen 8.30 aloitus ennen klo 9 alkua nousee tarkistettavaksi',()=>expect(programmeReview(old,{...target,text:'Rasti klo 8.30'})).toContain('conflicting_clock'));
});