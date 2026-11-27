import { contractBilling, type BillingOrder, type BillingPlan, type BillingInstallment } from './contractBilling';
export type QueueOrder = BillingOrder & { organization_id?: string; lead_id?: string; service_key?: string; cancelled_at?: string | null };
export type QueueDelivery = { id:string; order_id:string; title:string; production_status?:string };
export type BillingQueueData = { orders?:QueueOrder[]; billingPlans?:BillingPlan[]; billingInstallments?:BillingInstallment[]; deliveries:QueueDelivery[] };
export function orderBillingQueue(d:BillingQueueData,now=new Date(),filter:{ownerId?:string;service?:string}={}) {
  return (d.orders??[]).filter(o=>(!filter.ownerId||o.owner_id===filter.ownerId)&&(!filter.service||filter.service==='all'||o.service_key===filter.service)).flatMap(o=>{
    const deliveries=d.deliveries.filter(x=>x.order_id===o.id);
    const cancelled=!!o.cancelled_at||deliveries.some(x=>x.production_status==='peruttu');
    const state=contractBilling(o,d.billingPlans?.find(p=>p.order_id===o.id),d.billingInstallments??[],now,cancelled);
    return state.due.map(i=>({id:i.id,orderId:o.id,deliveryId:deliveries[0]?.id??null,deliveryIds:deliveries.map(x=>x.id),title:deliveries[0]?.title??`Tilaus ${o.id.slice(0,8)}`,detail:`Erä ${i.seq} · ${i.due_on} · ${Number(i.amount).toLocaleString('fi-FI')} € (alv 0 %)${deliveries.length?'':' · Toteutus ei vielä tuotannossa'}`,ownerId:o.owner_id??null,dueOn:i.due_on,amount:Number(i.amount),href:o.organization_id?`/admin/asiakkaat/${encodeURIComponent(o.organization_id)}?osio=tilaukset&tilaus=${encodeURIComponent(o.id)}`:o.lead_id?`/admin/markkinointi?tab=leads&asiakas=${encodeURIComponent(o.lead_id)}`:'/admin/asiakkaat'}));
  }).sort((a,b)=>a.dueOn.localeCompare(b.dueOn)||a.id.localeCompare(b.id));
}
