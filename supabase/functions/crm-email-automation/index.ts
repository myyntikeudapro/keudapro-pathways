import {createClient} from 'npm:@supabase/supabase-js@2';
import {corsHeaders} from 'npm:@supabase/supabase-js@2/cors';
import {z} from 'npm:zod@3';
import {sendMail} from '../_shared/gmail.ts';
import {readAdSpend} from '../_shared/adSpend.ts';
import {staleLeads,previousWeek,helsinkiDay,inWindow,mappedReturn} from '../_shared/crmEmailRules.ts';
import type {EmailLead} from '../_shared/crmEmailRules.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
const schema=z.union([z.object({run_id:z.string().uuid()}).strict(),z.object({kind:z.enum(['daily','weekly']),preview:z.boolean().default(true)}).strict()]);
const money=(n:number)=>new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR'}).format(n);
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return json({error:'Vain POST on sallittu'},405);
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return json({error:'Yhteys puuttuu'},503);
 const db=createClient(url,key);
 let runId:string|undefined;
 try{
  const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return json({error:'Virheellinen pyyntö'},400);
  const input=parsed.data;let kind:'daily'|'weekly';let preview=false;
  // Scheduler capability: an opaque run ID in a service-only writable table.
  // It is accepted once, only while pending, within 15 minutes of creation.
  // No client can create a run; admin manual requests use a validated session.
  if('run_id' in input){
   const {data:run,error}=await db.from('crm_email_runs').update({state:'processing'}).eq('id',input.run_id).eq('state','pending').gte('created_at',new Date(Date.now()-900000).toISOString()).select('*').maybeSingle();
   if(error)throw error;if(!run)return json({error:'Ajopyyntö ei ole voimassa'},403);
   runId=run.id;kind=run.kind;
  }else{
   const {data:auth}=await db.auth.getUser((req.headers.get('Authorization')??'').replace(/^Bearer /,''));
   if(!auth.user)return json({error:'Kirjaudu sisään'},401);
   const {data:allowed}=await db.rpc('has_role',{_user_id:auth.user.id,_role:'admin'});if(!allowed)return json({error:'Vain pääkäyttäjä'},403);
   kind=input.kind;preview=input.preview;
   if(!preview){
    const now=new Date();const period=kind==='daily'?helsinkiDay(now):previousWeek(now).since;
    const {data:run,error}=await db.from('crm_email_runs').insert({kind,period_key:period,state:'processing'}).select('*').single();
    if(error?.code==='23505')return json({ok:true,alreadyProcessed:true});if(error)throw error;runId=run.id;
   }
  }
  async function all(table:string,columns='*'){
   const result:Record<string,unknown>[]=[];
   for(let from=0;;from+=500){const {data,error}=await db.from(table).select(columns).order('id').range(from,from+499);if(error)throw error;result.push(...(data??[]));if(!data||data.length<500)return result;}
  }
  const leads=await all('booking_requests') as unknown as EmailLead[];
  const {data:roles,error:roleError}=await db.from('user_roles').select('user_id,role');if(roleError)throw roleError;
  const team=new Map<string,{id:string;email:string;admin:boolean}>();
  for(const role of roles??[]){
   if(!['admin','editor'].includes(role.role))continue;
   const {data:user,error}=await db.auth.admin.getUserById(role.user_id);if(error)throw error;
   if(user.user?.email)team.set(role.user_id,{id:role.user_id,email:user.user.email,admin:role.role==='admin'||team.get(role.user_id)?.admin===true});
  }
  const messages:{id:string;email:string;subject:string;text:string}[]=[];
  if(kind==='daily'){
   const history=await all('crm_interactions','id,lead_id,kind');
   const contacted=new Set(history.filter(h=>['call','email','meeting'].includes(String(h.kind))).map(h=>String(h.lead_id)));
   const stale=staleLeads(leads,contacted,Date.now());
   for(const member of team.values()){
    const assigned=stale.filter(l=>l.owner_id===member.id||((!l.owner_id||!team.has(l.owner_id))&&member.admin));
    if(assigned.length)messages.push({id:member.id,email:member.email,subject:'KeudaPRO – käsittelemättömiä yhteydenottoja',text:`${assigned.length} yhteydenottoa on odottanut vähintään 48 tuntia. Niiden tila on Uusi, eikä puhelua, sähköpostia tai tapaamista ole kirjattu.\n\n${assigned.map(l=>`${l.service_key??'Muu'} · saapunut ${helsinkiDay(new Date(l.created_at))}\nhttps://keudapro.fi/admin/markkinointi?tab=leads&asiakas=${l.id}`).join('\n\n')}\n\nKäsittele asiakas ja kirjaa yhteydenpito työtilassa.`});
   }
  }else{
   const window=previousWeek(new Date());
   const offers=await all('crm_offers');const campaigns=await all('marketing_campaigns');
   const spend=await readAdSpend(window.since,window.until);
   const wins=leads.filter(l=>l.status==='koulutukseen'&&l.sale_closed_at&&inWindow(l.sale_closed_at,window.since,window.until));
   const open=offers.filter(o=>['draft','sent'].includes(String(o.status)));
   const lines=[`KeudaPRO · viikkoraportti ${window.since}–${window.until}`,`Uudet yhteydenotot: ${leads.filter(l=>inWindow(l.created_at,window.since,window.until)).length}`,`Uudet tarjoukset: ${offers.filter(o=>inWindow(String(o.created_at),window.since,window.until)).length}`,`Avoimet tarjoukset nyt: ${open.length}`,`Painotettu avoin ennuste: ${money(open.reduce((s,o)=>s+Number(o.amount)*Number(o.probability)/100,0))}`,`Toteutuneet kaupat: ${wins.length}`,`Vahvistettu myynti: ${money(wins.reduce((s,l)=>s+Number(l.deal_value??0),0))}`,`Kaupat ilman kirjattua arvoa: ${wins.filter(l=>l.deal_value===null).length}`,'','Mainonnan tuotto (vain vahvistetut, maksettuun kampanjaan kohdistetut kaupat):'];
   for(const platform of ['meta','google']){
    const status=spend.status[platform];
    if(!status.connected||status.error){lines.push(`${platform==='meta'?'Meta':'Google Ads'}: kulut eivät ole saatavilla${status.error?` – ${status.error}`:''}`);continue;}
    const rows=spend.rows.filter(r=>r.platform===platform);
    const currencies=new Set(rows.map(r=>r.currency));
    if([...currencies].some(c=>c!=='EUR')){lines.push(`${platform}: valuuttaero, tuottoa ei lasketa`);continue;}
    const total=rows.reduce((s,r)=>s+r.spend,0);lines.push(`${platform==='meta'?'Meta':'Google Ads'} · kaikki kulut: ${money(total)}`);
    for(const row of rows){
     const matches=campaigns.filter(c=>c.platform===platform&&c.ad_campaign_id===row.campaign_id);
     const keys=matches.map(c=>String(c.utm_campaign));
     const ambiguous=keys.some(k=>campaigns.some(c=>c.platform===platform&&c.utm_campaign===k&&c.ad_campaign_id!==row.campaign_id));
     if(!keys.length||ambiguous){lines.push(`  ${row.campaign}: ${money(row.spend)}, kohdistus puuttuu tai on epäselvä`);continue;}
     const revenue=mappedReturn(leads,window.since,window.until,platform,keys);
     lines.push(`  ${row.campaign}: kulut ${money(row.spend)}, myynti ${money(revenue.revenue)}, ROAS ${revenue.missing?'ei lasketa: kauppojen arvoja puuttuu':row.spend>0?(revenue.revenue/row.spend).toLocaleString('fi-FI',{maximumFractionDigits:2}):'ei lasketa: ei kuluja'}`);
    }
   }
   lines.push('','Myynti perustuu päätöspäivään. Saman viikon kulut ja kaupat eivät yksin todista syy-yhteyttä. Hyväksytyt tarjoukset eivät ole automaattisesti myyntiä.','https://keudapro.fi/admin/markkinointi?tab=sales');
   for(const member of team.values())messages.push({id:member.id,email:member.email,subject:'KeudaPRO – myynnin ja markkinoinnin viikkoraportti',text:lines.join('\n')});
  }
  if(preview)return json({ok:true,kind,recipientCount:messages.length,messages:messages.map(m=>({subject:m.subject,text:m.text}))});
  if(!runId)throw new Error('Ajotieto puuttuu');
  let sent=0,failed=0;
  for(const message of messages){
   const {data:delivery,error:de}=await db.from('crm_email_deliveries').insert({run_id:runId,recipient_id:message.id,kind,state:'sending'}).select('id').single();
   if(de)throw de;
   try{
    const messageId=await sendMail(message.email,message.subject,message.text);
    const {error}=await db.from('crm_email_deliveries').update({state:'sent',message_id:messageId}).eq('id',delivery.id);if(error)throw error;
    await db.from('email_send_log').insert({template_name:`crm_${kind}`,recipient_email:message.email,status:'sent',message_id:messageId,metadata:{run_id:runId}});sent++;
   }catch{
    await db.from('crm_email_deliveries').update({state:'failed'}).eq('id',delivery.id);
    await db.from('email_send_log').insert({template_name:`crm_${kind}`,recipient_email:message.email,status:'failed',error_message:'Gmail-lähetys epäonnistui',metadata:{run_id:runId}});failed++;
   }
  }
  const {error:finishError}=await db.from('crm_email_runs').update({state:failed?'failed':'sent',finished_at:new Date().toISOString(),error_message:failed?'Osa sähköposteista epäonnistui':null}).eq('id',runId);if(finishError)throw finishError;
  return json({ok:failed===0,sent,failed},failed?502:200);
 }catch{
  if(runId)await db.from('crm_email_runs').update({state:'failed',finished_at:new Date().toISOString(),error_message:'Raportin käsittely epäonnistui'}).eq('id',runId);
  return json({error:'Sähköpostitoiminto epäonnistui'},500);
 }
});