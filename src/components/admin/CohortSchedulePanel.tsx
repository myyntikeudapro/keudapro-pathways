import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import source from '@/data/aiCohorts.json';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Choice } from '@/components/admin/CrmWorkspace';
import { cohortSourceKey, cohortSourceStatus, sourceAdministrativeEnd, sourceDate, type SourceCohort } from '@/lib/cohortSchedule';
import { readAll } from '@/lib/crm';
import { ScheduleDetails } from '@/components/catalog/ScheduleDetails';
import { useToast } from '@/hooks/use-toast';

export function CohortSchedulePanel() {
  const qc = useQueryClient(); const { toast } = useToast();
  const [program, setProgram] = useState('AI Coordinator');
  const [key, setKey] = useState('');
  const [draft, setDraft] = useState<SourceCohort | null>(null);
  const [config, setConfig] = useState({ capacity: '', unit_price: '', vat_basis: '', reg_opens_at: '', reg_closes_at: '' });
  const selected = source.cohorts.find(c => cohortSourceKey(c) === key) as SourceCohort | undefined;
  const q = useQuery({ queryKey: ['cohort_offerings'], queryFn: () => readAll((f,t) => supabase.from('cat_offerings').select('id,source_key,source_status,status,delivery_id,schedule').not('source_key','is',null).order('id').range(f,t)) });
  const existing = q.data?.find(o => o.source_key === key);
  const save = useMutation({mutationFn:async()=>{
    if(!existing || !draft) throw new Error('Valitse tallennettu ryhmä.');
    const {error}=await supabase.from('cat_offerings').update({schedule:JSON.parse(JSON.stringify(draft))}).eq('id',existing.id);
    if(error)throw error;
  },onSuccess:async()=>{setDraft(null);await qc.invalidateQueries({queryKey:['cohort_offerings']});toast({title:'Ryhmän opetuskerrat tallennettu'});},onError:(e:Error)=>toast({title:'Tallennus ei onnistunut',description:e.message,variant:'destructive'})});
  const create = useMutation({ mutationFn: async () => {
    if (!selected) throw new Error('Valitse aloitusryhmä.');
    // Local datetime fields are explicitly Helsinki times, converted by PostgreSQL below.
    const { data,error } = await supabase.rpc('cat_create_source_group', { p_source: JSON.parse(JSON.stringify(selected)), p_config: { ...config, reg_opens_at: `${config.reg_opens_at} Europe/Helsinki`, reg_closes_at: `${config.reg_closes_at} Europe/Helsinki`, administrative_ends_at: sourceAdministrativeEnd(selected) ? `${sourceAdministrativeEnd(selected)} Europe/Helsinki` : null } });
    if (error) throw error; return data;
  }, onSuccess: async () => { await Promise.all([qc.invalidateQueries({queryKey:['cohort_offerings']}),qc.invalidateQueries({queryKey:['cat_admin']}),qc.invalidateQueries({queryKey:['production_groups']})]); toast({title:'Aloitusryhmä tallennettu luonnoksena'}); }, onError: (e: Error) => toast({title:'Ryhmää ei voitu tallentaa',description:e.message,variant:'destructive'}) });
  return <section aria-label="AI-ohjelmien aloitusryhmät" className="space-y-5 border-t pt-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-keuda-blue">AI-ohjelmien aloitusryhmät</h2><Badge variant="outline">24 ryhmää · 190 opetuskertaa</Badge></div>
    <div className="grid gap-4 sm:grid-cols-2"><Choice label="Koulutusohjelma" value={program} options={['AI Coordinator','AI Manager','AI Director'].map(p=>[p,p])} onChange={p=>{setProgram(p);setKey('');setDraft(null);}} />
      <Choice label="Aloitusryhmä" value={key} onChange={k=>{setKey(k);setDraft(null);}} options={source.cohorts.filter(c=>c.program===program).map(c=>[cohortSourceKey(c),`${sourceDate(c.start_date)} · ${cohortSourceStatus(c)==='historical'?'Historiallinen':'Odottaa hyväksyntää'}`])} /></div>
    {selected && <>
      <div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">{selected.program} · {sourceDate(selected.start_date)}</h3><Badge variant="outline">{cohortSourceStatus(selected)==='historical'?'Historiallinen vertailuaineisto':'Julkaisematon lähderyhmä'}</Badge></div>
      <p className="text-sm">Ilmoittautumisen määräpäivä {sourceDate(selected.registration_deadline)} · sulkeutumisen kellonaika puuttuu lähteestä.</p>
      <ScheduleDetails schedule={existing ? existing.schedule as unknown as SourceCohort : selected} administrativeEnd={sourceAdministrativeEnd(selected) ? `${sourceAdministrativeEnd(selected)} Europe/Helsinki` : null} />
      {existing && !existing.delivery_id && <Button variant="outline" onClick={()=>setDraft(existing.schedule as unknown as SourceCohort)}>Muokkaa ryhmän opetuskertoja</Button>}
      {draft && <form className="space-y-4" onSubmit={e=>{e.preventDefault();save.mutate();}}>{draft.fixed_sessions.map((s,i)=><fieldset key={i} className="grid gap-2 border-t pt-3 sm:grid-cols-3"><legend className="text-sm font-semibold">Opetuskerta {i+1}</legend>{(['date','start_time','end_time','topic','trainer_or_provider'] as const).map(field=><label key={field} className="space-y-1 text-sm">{{date:'Päivä',start_time:'Alkaa',end_time:'Päättyy',topic:'Sisältö',trainer_or_provider:'Toteuttaja'}[field]}<Input required={field!=='trainer_or_provider'} type={field==='date'?'date':field.endsWith('time')?'time':'text'} value={s[field] ?? ''} onChange={e=>setDraft({...draft,fixed_sessions:draft.fixed_sessions.map((x,j)=>j===i?{...x,[field]:e.target.value}:x)})}/></label>)}</fieldset>)}<div className="flex gap-2"><Button disabled={save.isPending}>Tallenna opetuskerrat</Button><Button variant="outline" type="button" onClick={()=>setDraft(null)}>Peruuta</Button></div></form>}
      {existing ? <div className="space-y-2 border-t pt-4"><p className="text-sm">Ryhmätunniste: {existing.id} · {existing.status}</p><Button asChild variant="outline"><a href={`/koulutukset/${program.toLowerCase().replace(/ /g,'-')}?esikatselu=${existing.id}`} target="_blank" rel="noreferrer">Avaa ilmoittautumisen esikatselu</a></Button></div> : <form className="grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={e=>{e.preventDefault();create.mutate();}}>
        <label className="space-y-1 text-sm">Kapasiteetti<Input required type="number" min={1} value={config.capacity} onChange={e=>setConfig({...config,capacity:e.target.value})} /></label>
        <label className="space-y-1 text-sm">Hyväksytty nettohinta (€)<Input required type="number" min={0} step="0.01" value={config.unit_price} onChange={e=>setConfig({...config,unit_price:e.target.value})} /></label>
        <label className="space-y-1 text-sm">ALV-peruste<Input required value={config.vat_basis} onChange={e=>setConfig({...config,vat_basis:e.target.value})} /></label>
        <label className="space-y-1 text-sm">Ilmoittautuminen avautuu (Suomen aika)<Input required type="datetime-local" value={config.reg_opens_at} onChange={e=>setConfig({...config,reg_opens_at:e.target.value})} /></label>
        <label className="space-y-1 text-sm">Ilmoittautuminen sulkeutuu (Suomen aika)<Input required type="datetime-local" value={config.reg_closes_at} onChange={e=>setConfig({...config,reg_closes_at:e.target.value})} /></label>
        <Button className="self-end" disabled={create.isPending}>{create.isPending?'Tallennetaan…':'Perusta ryhmä luonnoksena'}</Button>
      </form>}
      {q.isError && <p role="alert" className="text-destructive">Tallennettuja ryhmiä ei voitu hakea.</p>}
    </>}
  </section>;
}