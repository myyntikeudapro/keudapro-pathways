import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 try{
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');const gateway=Deno.env.get('LOVABLE_API_KEY');const gmail=Deno.env.get('GOOGLE_MAIL_API_KEY');
  if(!url||!key||!gateway||!gmail)return json({error:'Sähköpostiyhteys puuttuu'},503);
  const db=createClient(url,key);const {data:auth,error}=await db.auth.getUser((req.headers.get('Authorization')??'').replace(/^Bearer /,''));
  if(error||!auth.user)return json({error:'Kirjaudu sisään'},401);
  const {data:allowed}=await db.rpc('is_editor_or_admin',{_user_id:auth.user.id});if(!allowed)return json({error:'Ei käyttöoikeutta'},403);
  const parsed=z.object({lead_id:z.string().uuid()}).safeParse(await req.json());if(!parsed.success)return json({error:'Virheellinen asiakas'},400);
  const {data:lead,error:le}=await db.from('booking_requests').select('id,name,owner_id').eq('id',parsed.data.lead_id).single();if(le||!lead)return json({error:'Asiakasta ei löytynyt'},404);
  const {data:notices,error:ne}=await db.from('crm_notifications').select('*').eq('lead_id',lead.id).is('emailed_at',null).gte('created_at',new Date(Date.now()-300000).toISOString());if(ne)throw ne;
  let sent=0;
  for(const recipient of new Set((notices??[]).map(n=>n.recipient_id))){
   const {data:role}=await db.rpc('is_editor_or_admin',{_user_id:recipient});if(!role)continue;
   const {data:user}=await db.auth.admin.getUserById(recipient);const email=user.user?.email;if(!email)continue;
   const ids=(notices??[]).filter(n=>n.recipient_id===recipient).map(n=>n.id);
   const {data:claimed,error:claimError}=await db.from('crm_notifications').update({emailed_at:new Date().toISOString()}).in('id',ids).is('emailed_at',null).select('id');
   if(claimError)throw claimError;if(!claimed?.length)continue;
   const b64=(s:string)=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
   const subject='KeudaPRO – uusi asiakas tai tehtävä';
   const raw=[`To: ${email}`,`Subject: =?UTF-8?B?${b64(subject)}?=`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',b64('Sinulle on uusi ilmoitus KeudaPROn työtilassa. Tarkista asiakas ja seuraava tehtävä: https://keudapro.fi/admin/markkinointi?tab=daily')].join('\r\n');
   const res=await fetch('https://connector-gateway.lovable.dev/google_mail/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${gateway}`,'X-Connection-Api-Key':gmail,'Content-Type':'application/json'},body:JSON.stringify({raw:b64(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')})});
   if(!res.ok){const details=await res.text();console.error(`CRM mail [${res.status}]`,details);await db.from('crm_notifications').update({emailed_at:null}).in('id',claimed.map(n=>n.id));return json({error:'Ilmoitus tallentui, sähköpostilähetys epäonnistui',status:res.status},502);}sent++;
  }
  return json({ok:true,sent});
 }catch{return json({error:'Ilmoituksen lähetys epäonnistui'},500);}
});