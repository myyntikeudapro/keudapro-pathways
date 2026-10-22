import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {Mail,Eye,Send} from 'lucide-react';
import {toast} from 'sonner';
import {dateTime} from '@/lib/crm';
export function EmailAutomationPanel({userId}:{userId:string}){
 const [busy,setBusy]=useState(false);const [preview,setPreview]=useState('');
 const role=useQuery({queryKey:['email_admin_role',userId],queryFn:async()=>{const {data,error}=await supabase.rpc('has_role',{_user_id:userId,_role:'admin'});if(error)throw error;return data;}});
 const runs=useQuery({queryKey:['crm_email_runs'],enabled:role.data===true,queryFn:async()=>{const {data,error}=await supabase.from('crm_email_runs').select('*').order('created_at',{ascending:false}).limit(10);if(error)throw error;return data;}});
 const act=async(kind:'daily'|'weekly',isPreview:boolean)=>{
  setBusy(true);
  try{
   const {data,error}=await supabase.functions.invoke('crm-email-automation',{body:{kind,preview:isPreview}});
   if(error||!data?.ok)throw new Error('Lähetys epäonnistui');
   if(isPreview)setPreview(data.messages?.length?data.messages.map((m:{text:string})=>m.text).join('\n\n────────────────\n\n'):'Ei hälytystä vaativia yhteydenottoja.');
   else {toast.success(data.alreadyProcessed?'Tämän jakson lähetys on jo käsitelty':`${data.sent} sähköpostia lähetetty`);runs.refetch();}
  }catch{toast.error('Sähköpostitoiminto epäonnistui. Tarkista lähetyshistoria.');runs.refetch();}finally{setBusy(false);}
 };
 if(!role.data)return null;
 const states:Record<string,string>={pending:'Odottaa',processing:'Käsittelyssä',sent:'Valmis',failed:'Epäonnistui'};
 return <section className="border-t pt-5 mt-6 space-y-4 min-w-0"><h2 className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4"/>Sähköpostit</h2><dl className="grid sm:grid-cols-3 gap-4 text-sm"><div><dt className="font-medium">Asiakkaan vahvistus</dt><dd className="text-muted-foreground">Yhteydenoton tallennuksen jälkeen</dd></div><div><dt className="font-medium">Käsittelemättömät yhteydenotot</dt><dd className="text-muted-foreground">48 tunnin jälkeen · päivittäin klo 9</dd></div><div><dt className="font-medium">Tiimin viikkoraportti</dt><dd className="text-muted-foreground">Maanantaisin klo 9 · Suomen aika</dd></div></dl><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={()=>act('daily',true)}><Eye className="h-4 w-4 mr-2"/>Hälytysten esikatselu</Button><Button variant="outline" disabled={busy} onClick={()=>act('weekly',true)}><Eye className="h-4 w-4 mr-2"/>Raportin esikatselu</Button><Button disabled={busy} onClick={()=>act('weekly',false)}><Send className="h-4 w-4 mr-2"/>Lähetä viikkoraportti</Button></div>{preview&&<pre className="whitespace-pre-wrap break-words font-sans text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto" aria-live="polite">{preview}</pre>}<h3 className="font-medium text-sm">Lähetyshistoria</h3>{runs.isError?<p role="alert" className="text-destructive text-sm">Lähetyshistoriaa ei voitu hakea.</p>:runs.data?.length?<ul className="space-y-2 text-sm">{runs.data.map(r=><li key={r.id} className="border-b pb-2 flex flex-wrap justify-between gap-2"><span>{r.kind==='daily'?'Yhteydenottohälytys':'Viikkoraportti'} · {dateTime(r.created_at)}</span><span className={r.state==='failed'?'text-destructive':'text-muted-foreground'}>{states[r.state]??r.state}</span></li>)}</ul>:<p className="text-muted-foreground text-sm">Ei vielä ajastettuja lähetyksiä.</p>}</section>;
}