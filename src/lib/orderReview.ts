import { BILLING_MODES, cents, validDay } from './contractBilling';
export const VAT_OPTIONS = { yleinen: 'Yleinen 25,5 %', koulutus_veroton: 'Koulutus, veroton', kaannetty: 'Käännetty verovelvollisuus', muu: 'Muu' } as const;
export type VatBasis = keyof typeof VAT_OPTIONS;
export type ContractLine = { line_no: number; description: string; quantity: number; unit_price: number };
export type Contract = { amount: number; vat_basis: string | null; vat_rate: number | null; vat_reason: string | null; content: string | null; lines: ContractLine[]; starts_on: string | null; ends_on: string | null; terms: string | null; payment_terms: string | null; billing_mode: string | null; billing_installments: { amount: number; due_on: string }[] };
export const CONTRACT_LABELS: Record<keyof Contract, string> = { amount: 'Summa (alv 0 %)', vat_basis: 'ALV-käsittely', vat_rate: 'ALV-kanta', vat_reason: 'ALV-peruste', content: 'Sovittu sisältö', lines: 'Tarjousrivit', starts_on: 'Alkaa', ends_on: 'Päättyy', terms: 'Sopimusehdot', payment_terms: 'Maksuehto', billing_mode: 'Laskutustapa', billing_installments: 'Laskutuserät' };
export const contractText = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();
export function normalizeContract(c: Contract): Contract {
  return { ...c, amount: Number(c.amount), vat_rate: c.vat_rate === null ? null : Number(c.vat_rate), vat_basis: c.vat_basis || null, vat_reason: contractText(c.vat_reason), content: contractText(c.content), terms: contractText(c.terms), payment_terms: contractText(c.payment_terms), starts_on: c.starts_on || null, ends_on: c.ends_on || null, billing_mode: c.billing_mode || null,
    lines: c.lines.map(l => ({ line_no: Number(l.line_no), description: contractText(l.description), quantity: Number(l.quantity), unit_price: Number(l.unit_price) })).sort((a,b) => a.line_no-b.line_no), billing_installments: c.billing_installments.map(i => ({amount:Number(i.amount),due_on:i.due_on})) };
}
export type ContractDifference = { before: unknown; after: unknown };
export function contractDifferences(before: Contract, after: Contract): Partial<Record<keyof Contract, ContractDifference>> {
  const a=normalizeContract(before), b=normalizeContract(after);
  return Object.fromEntries((Object.keys(a) as (keyof Contract)[]).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>[k,{before:a[k],after:b[k]}]));
}
export function vatErrors(basis: string | null | undefined, rate: number | null | undefined, reason: string | null | undefined) {
  const errors:string[]=[];
  if (!basis || !Object.prototype.hasOwnProperty.call(VAT_OPTIONS,basis)) errors.push('ALV-valinta');
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate<0 || rate>100 || (basis==='yleinen' && rate!==25.5) || ((basis==='koulutus_veroton'||basis==='kaannetty') && rate!==0)) errors.push('ALV-kanta');
  if (basis && basis!=='yleinen' && !contractText(reason)) errors.push('ALV-peruste');
  return errors;
}
export function contractErrors(c: Contract) {
  const e=vatErrors(c.vat_basis,c.vat_rate,c.vat_reason);
  if(cents(c.amount)===null) e.push('senttitarkka summa');
  if(!c.starts_on || !c.ends_on || !validDay(c.starts_on) || !validDay(c.ends_on) || c.ends_on<c.starts_on) e.push('sopimuspäivät');
  if(!c.lines.length || c.lines.length>100 || c.lines.some(l=>!Number.isInteger(l.line_no)||l.line_no<1||!contractText(l.description)||!Number.isFinite(l.quantity)||l.quantity<=0||!Number.isFinite(l.unit_price)||l.unit_price<0) || new Set(c.lines.map(l=>l.line_no)).size!==c.lines.length) e.push('tarjousrivit');
  if(Math.abs(c.lines.reduce((s,l)=>s+l.quantity*l.unit_price,0)-c.amount)>1e-7) e.push('rivien summa ei vastaa tilausta');
  return e;
}
export function contractValue(k:string,v:unknown):string {
  if(v===null||v===undefined||v==='')return 'Ei tallennettu';
  if(k==='vat_basis')return VAT_OPTIONS[v as VatBasis]??String(v);
  if(k==='billing_mode')return BILLING_MODES[v as keyof typeof BILLING_MODES]??String(v);
  if(Array.isArray(v)) return v.length?v.map(x=>'description' in x ? `${x.description} · ${x.quantity} × ${Number(x.unit_price).toLocaleString('fi-FI')} €` : `${x.due_on} · ${Number(x.amount).toLocaleString('fi-FI')} €`).join('\n'):'Ei tallennettu';
  if(typeof v==='number')return v.toLocaleString('fi-FI');
  return String(v);
}
