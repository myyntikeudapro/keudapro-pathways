import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { readAdSpend } from '../_shared/adSpend.ts';
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 try {
 const url=Deno.env.get('SUPABASE_URL'); const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return json({error:'Yhteys puuttuu'},503);
 const db=createClient(url,key);
 const {data:u}=await db.auth.getUser((req.headers.get('Authorization')??'').replace(/^Bearer /,''));
 if(!u.user)return json({error:'Kirjaudu sisään.'},401);
 const {data:allowed}=await db.rpc('is_editor_or_admin',{_user_id:u.user.id});
 if(!allowed)return json({error:'Ei oikeutta.'},403);
 const body=await req.json().catch(()=>({}));
 const days=Math.min(Math.max(Number(body.days)||30,1),365);
 const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(new Date());
 const until=new Date(`${day}T12:00:00Z`); const since=new Date(until); since.setUTCDate(since.getUTCDate()-days+1);
 const from=since.toISOString().slice(0,10),to=until.toISOString().slice(0,10);
 return json({ok:true,...await readAdSpend(from,to),fetched_at:new Date().toISOString(),since:from,until:to});
 }catch{return json({error:'Mainoskulujen haku epäonnistui.'},500);}
});
