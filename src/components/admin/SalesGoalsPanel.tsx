import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Choice } from './CrmWorkspace';
import { SALES_SERVICES, goalActuals, localMonth, targetPercent } from '@/lib/salesGoals';
import { money, readAll } from '@/lib/crm';
import type { Lead, TeamMember } from '@/lib/crm';
import type { Tables } from '@/integrations/supabase/types';
import { Save, Settings2, Target, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Goal = Tables<'crm_sales_goals'>;
type Rule = Tables<'crm_assignment_rules'>;
const nf = new Intl.NumberFormat('fi-FI');

export function SalesGoalsPanel({ leads, team, userId, service, unavailable }: { leads: Lead[]; team: TeamMember[]; userId: string; service: string; unavailable: boolean }) {
  const [month, setMonth] = useState(localMonth());
  const [editing, setEditing] = useState<string | null>(null);
  const qc = useQueryClient();
  const role = useQuery({ queryKey:['email_admin_role',userId], queryFn:async()=>{const {data,error}=await supabase.rpc('has_role',{_user_id:userId,_role:'admin'});if(error)throw error;return data;} });
  const goals = useQuery({ queryKey:['crm_goals',month], enabled:/^\d{4}-\d{2}$/.test(month), queryFn:()=>readAll((from,to)=>supabase.from('crm_sales_goals').select('*').eq('month',`${month}-01`).order('id').range(from,to)) });
  const services = Object.entries(SALES_SERVICES).filter(([key])=>service==='all'||service===key);
  return <div className="space-y-6 min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-semibold text-xl flex items-center gap-2"><Target className="h-5 w-5 text-keuda-blue"/>Myyntitavoitteet</h2><p className="text-sm text-muted-foreground mt-1">Kuukausi · Suomen aika · myynti ilman alv:tä</p></div><div><label htmlFor="goal-month" className="text-xs text-muted-foreground">Tavoitekuukausi</label><Input id="goal-month" type="month" value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value);}} className="w-44"/></div></div>
    {goals.isLoading?<Loader2 className="h-5 w-5 animate-spin"/>:goals.isError||unavailable?<p role="alert" className="text-destructive">Tavoitteita tai toteumaa ei voitu hakea. Päivitä näkymä.</p>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{services.map(([key,label])=>{
      const goal = goals.data?.find(g=>g.service_key===key);
      const actual = goalActuals(leads,key,month);
      return <Card key={key} className="min-w-0 border-t-4 border-t-keuda-blue"><CardHeader className="pb-3"><div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{label}</CardTitle>{role.data&&<Button variant="ghost" size="icon" aria-label={`Muokkaa tavoitetta: ${label}`} title="Muokkaa tavoitetta" onClick={()=>setEditing(key)}><Settings2 className="h-4 w-4"/></Button>}</div>{!goal&&<Badge variant="outline" className="w-fit">Tavoite asettamatta</Badge>}</CardHeader><CardContent className="space-y-4"><Metric label="Vahvistettu myynti" actual={actual.revenue} target={goal?.revenue_target} currency/><Metric label="Toteutuneet kaupat" actual={actual.wins} target={goal?.wins_target}/><Metric label="Uudet yhteydenotot" actual={actual.leads} target={goal?.leads_target}/>{actual.missingValues>0&&<p className="text-sm text-destructive">{actual.missingValues} kaupasta puuttuu arvo – myynnin toteuma on puutteellinen.</p>}</CardContent></Card>;
    })}</div>}
    <Dialog open={editing!==null} onOpenChange={open=>{if(!open)setEditing(null);}}><DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">{editing&&<GoalEditor key={`${editing}-${month}`} service={editing} month={month} goal={goals.data?.find(g=>g.service_key===editing)} onSaved={()=>{qc.invalidateQueries({queryKey:['crm_goals']});setEditing(null);}}/>}</DialogContent></Dialog>
    <AssignmentPanel team={team} admin={role.data===true}/>
  </div>;
}

function Metric({label,actual,target,currency=false}:{label:string;actual:number;target?:number;currency?:boolean}) {
  const percent = target===undefined?null:targetPercent(actual,target);
  const format = currency?money:(n:number)=>nf.format(n);
  return <div className="space-y-2"><div className="flex flex-wrap justify-between gap-x-2 gap-y-1"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-medium text-keuda-blue">{percent===null?'–':`${percent} %`}</span></div><p className="text-lg font-semibold tabular-nums break-words">{format(actual)} <span className="font-normal text-sm text-muted-foreground">/ {target===undefined?'–':format(target)}</span></p><Progress className="h-2 bg-muted" value={Math.min(percent??0,100)} aria-label={label}/></div>;
}

function GoalEditor({service,month,goal,onSaved}:{service:string;month:string;goal?:Goal;onSaved:()=>void}) {
  const [revenue,setRevenue]=useState(goal?String(goal.revenue_target):'');
  const [wins,setWins]=useState(goal?String(goal.wins_target):'');
  const [leads,setLeads]=useState(goal?String(goal.leads_target):'');
  const [busy,setBusy]=useState(false);
  const save=async()=>{
    const r=Number(revenue.replace(',','.')),w=Number(wins),l=Number(leads);
    if(!revenue.trim()||!wins.trim()||!leads.trim()||!Number.isFinite(r)||r<0||!Number.isInteger(w)||w<0||!Number.isInteger(l)||l<0)return toast.error('Anna kaikki tavoitteet nollana tai positiivisena lukuna.');
    setBusy(true);
    try{const {error}=await supabase.from('crm_sales_goals').upsert({service_key:service,month:`${month}-01`,revenue_target:r,wins_target:w,leads_target:l,updated_at:new Date().toISOString()},{onConflict:'service_key,month'});if(error)throw error;toast.success('Tavoitteet tallennettu');onSaved();}catch{toast.error('Tavoitteiden tallennus epäonnistui.');}finally{setBusy(false);}
  };
  return <><DialogHeader><DialogTitle>{SALES_SERVICES[service]} · tavoitteet</DialogTitle><DialogDescription>{month} · myynti ilman alv:tä</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={e=>{e.preventDefault();save();}}>{[[revenue,setRevenue,'Myyntitavoite €'],[wins,setWins,'Kauppatavoite kpl'],[leads,setLeads,'Yhteydenottotavoite kpl']].map(([value,setValue,label],i)=><div key={i}><label htmlFor={`goal-${i}`} className="text-sm font-medium">{String(label)}</label><Input id={`goal-${i}`} required inputMode={i===0?'decimal':'numeric'} value={String(value)} onChange={e=>{if(typeof setValue==='function')setValue(e.target.value);}}/></div>)}<Button type="submit" disabled={busy}><Save className="h-4 w-4 mr-2"/>Tallenna tavoitteet</Button></form></>;
}

function AssignmentPanel({team,admin}:{team:TeamMember[];admin:boolean}) {
  const [scope,setScope]=useState('all');
  const rules=useQuery({queryKey:['crm_assignment_rules'],queryFn:async()=>{const {data,error}=await supabase.from('crm_assignment_rules').select('*').order('service_key');if(error)throw error;return data;}});
  const qc=useQueryClient();
  const rule=rules.data?.find(r=>r.service_key===scope);
  const global=rules.data?.find(r=>r.service_key==='all');
  return <section className="border-t pt-6 space-y-4"><h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-keuda-blue"/>Automaattinen asiakasjako</h2><Choice label="Jaon palvelu" value={scope} onChange={setScope} options={[["all","Koko sivusto – oletus"],...Object.entries(SALES_SERVICES)]}/>{rules.isError?<p role="alert" className="text-destructive">Asiakasjaon asetuksia ei voitu hakea.</p>:rules.isLoading?<Loader2 className="h-5 w-5 animate-spin"/>:<>
    <p className="text-sm text-muted-foreground">{rule?rule.enabled?'Jako käytössä · uudet yhteydenotot jaetaan vuorotellen.':'Automaattinen jako pois käytöstä.':scope!=='all'&&global?.enabled?'Palvelu käyttää koko sivuston oletusjakoa.':'Jakoa ei ole määritetty.'}</p>
    {admin&&team.length===0?<p className="text-muted-foreground text-sm">Tiimin tietoja odotetaan.</p>:admin?<AssignmentEditor key={`${scope}-${rule?.updated_at??'new'}`} scope={scope} rule={rule} team={team} onSaved={()=>qc.invalidateQueries({queryKey:['crm_assignment_rules']})}/>:<div className="flex flex-wrap gap-2">{(rule?.member_ids??global?.member_ids??[]).map(id=><Badge variant="outline" key={id}>{team.find(t=>t.id===id)?.email??'Käyttäjä ei enää tiimissä'}</Badge>)}</div>}
  </>}</section>;
}

function AssignmentEditor({scope,rule,team,onSaved}:{scope:string;rule?:Rule;team:TeamMember[];onSaved:()=>void}) {
  const [enabled,setEnabled]=useState(rule?.enabled??false);
  const [members,setMembers]=useState((rule?.member_ids??[]).filter(id=>team.some(t=>t.id===id)));
  const [busy,setBusy]=useState(false);
  const save=async()=>{
    if(enabled&&!members.length)return toast.error('Valitse vähintään yksi vastuuhenkilö.');
    setBusy(true);try{const {error}=await supabase.from('crm_assignment_rules').upsert({service_key:scope,enabled,member_ids:members},{onConflict:'service_key'});if(error)throw error;toast.success('Asiakasjako tallennettu');onSaved();}catch{toast.error('Asiakasjaon tallennus epäonnistui. Tarkista vastuuhenkilöiden oikeudet.');}finally{setBusy(false);}
  };
  const reset=async()=>{setBusy(true);try{const {error}=await supabase.from('crm_assignment_rules').delete().eq('service_key',scope);if(error)throw error;toast.success('Palvelu käyttää nyt oletusjakoa');onSaved();}catch{toast.error('Asetuksen poisto epäonnistui.');}finally{setBusy(false);}};
  return <div className="space-y-4"><label className="flex items-center gap-3 text-sm font-medium"><Switch checked={enabled} onCheckedChange={setEnabled} disabled={busy}/>Jako käytössä</label><div className="grid sm:grid-cols-2 gap-3">{team.map(t=><label key={t.id} className="flex items-center gap-3 text-sm min-w-0"><Checkbox checked={members.includes(t.id)} disabled={busy} onCheckedChange={checked=>setMembers(current=>checked===true?[...current,t.id]:current.filter(id=>id!==t.id))}/><span className="break-all">{t.email}</span></label>)}</div>{members.some(id=>!team.some(t=>t.id===id))&&<p className="text-destructive text-sm">Poista tiimistä poistuneet vastuuhenkilöt tallentamalla nykyinen valinta.</p>}<div className="flex flex-wrap gap-2"><Button onClick={save} disabled={busy}><Save className="h-4 w-4 mr-2"/>Tallenna jako</Button>{scope!=='all'&&rule&&<Button variant="outline" onClick={reset} disabled={busy}>Käytä oletusjakoa</Button>}</div></div>;
}