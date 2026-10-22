export const ALERT_HOURS = 48;
export type EmailLead = {id:string;created_at:string;status:string;owner_id:string|null;service_key:string|null;sale_closed_at:string|null;deal_value:number|string|null;utm_source:string|null;utm_medium:string|null;utm_campaign:string|null};
export function staleLeads(leads:EmailLead[], contacted:Set<string>, now:number) {
  return leads.filter(l=>l.status==='uusi' && now-Date.parse(l.created_at)>=ALERT_HOURS*3600000 && !contacted.has(l.id));
}
export function helsinkiDay(now:Date) { return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Helsinki'}).format(now); }
export function previousWeek(now:Date) {
  const day=helsinkiDay(now);const until=new Date(`${day}T12:00:00Z`);until.setUTCDate(until.getUTCDate()-1);
  const since=new Date(until);since.setUTCDate(since.getUTCDate()-6);
  return {since:since.toISOString().slice(0,10),until:until.toISOString().slice(0,10)};
}
export function inWindow(timestamp:string, since:string,until:string) {const day=timestamp.length===10?timestamp:helsinkiDay(new Date(timestamp));return day>=since&&day<=until;}
export function mappedReturn(leads:EmailLead[],since:string,until:string,platform:string,keys:string[]) {
 const paid=['cpc','ppc','paid','paid_social','paid-social','paid_search','display','cpm'];
 const sources=platform==='meta'?['meta','facebook','instagram','fb','ig']:['google'];
 const wins=leads.filter(l=>l.status==='koulutukseen'&&l.sale_closed_at&&inWindow(l.sale_closed_at,since,until)&&sources.includes((l.utm_source??'').toLowerCase())&&paid.includes((l.utm_medium??'').toLowerCase())&&keys.includes(l.utm_campaign??''));
 return {revenue:wins.reduce((sum,l)=>sum+Number(l.deal_value??0),0),missing:wins.filter(l=>l.deal_value===null).length};
}