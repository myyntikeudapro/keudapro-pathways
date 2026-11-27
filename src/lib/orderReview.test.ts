import { describe,it,expect } from 'vitest';
import { contractDifferences,vatErrors,contractErrors,type Contract } from './orderReview';
const offer:Contract={amount:900,vat_basis:'yleinen',vat_rate:25.5,vat_reason:null,content:'2 h Teams-aseptiikkakoulutus',lines:[{line_no:1,description:'2 h Teams-aseptiikkakoulutus',quantity:1,unit_price:900}],starts_on:'2026-11-26',ends_on:'2026-11-27',terms:'Sopimusehdot',payment_terms:'14 päivää netto',billing_mode:'end',billing_installments:[]};
describe('explicit VAT',()=>{
 it('requires the choice',()=>expect(vatErrors('',25.5,'')).toContain('ALV-valinta'));
 it('general is exactly 25.5 percent',()=>{expect(vatErrors('yleinen',25.5,'')).toEqual([]);expect(vatErrors('yleinen',24,'')).toContain('ALV-kanta');});
 it('900 net plus 25.5 percent is 229.50 VAT and 1129.50 gross',()=>{expect(offer.amount*25.5/100).toBe(229.5);expect(offer.amount*(1+25.5/100)).toBe(1129.5);});
 it('exempt requires a reason and zero rate',()=>{expect(vatErrors('koulutus_veroton',0,' ')).toContain('ALV-peruste');expect(vatErrors('koulutus_veroton',25.5,'Peruste')).toContain('ALV-kanta');expect(vatErrors('koulutus_veroton',0,'Peruste')).toEqual([]);});
 it('reverse charge requires a reason and zero rate',()=>{expect(vatErrors('kaannetty',0,'')).toContain('ALV-peruste');expect(vatErrors('kaannetty',25.5,'Peruste')).toContain('ALV-kanta');expect(vatErrors('kaannetty',0,'Peruste')).toEqual([]);});
 it('other requires an explicit rate',()=>expect(vatErrors('muu',null,'Peruste')).toContain('ALV-kanta'));
 it('other requires a reason',()=>expect(vatErrors('muu',10,'')).toContain('ALV-peruste'));
 it('other accepts explicit zero through 100 only',()=>{expect(vatErrors('muu',0,'Peruste')).toEqual([]);expect(vatErrors('muu',101,'Peruste')).toContain('ALV-kanta');});
});
describe('accepted contract comparison',()=>{
 it('identical contract has no differences',()=>expect(contractDifferences(offer,{...offer})).toEqual({}));
 it('null/empty text and whitespace/line ordering are normalized',()=>expect(contractDifferences(offer,{...offer,vat_reason:' ',terms:' Sopimusehdot\n',content:' 2 h\nTeams-aseptiikkakoulutus ',lines:[{...offer.lines[0],description:' 2 h  Teams-aseptiikkakoulutus '}]})).toEqual({}));
 const changes:Partial<Contract>={amount:901,vat_basis:'muu',vat_rate:10,vat_reason:'Peruste',content:'3 h Teams',lines:[{...offer.lines[0],quantity:2}],starts_on:'2026-11-25',ends_on:'2026-11-28',terms:'Uudet ehdot',payment_terms:'30 päivää netto',billing_mode:'start',billing_installments:[{amount:900,due_on:'2026-11-27'}]};
 for(const [field,value] of Object.entries(changes))it(`detects ${field} independently`,()=>expect(contractDifferences(offer,{...offer,[field]:value})).toHaveProperty(field));
 it('adding previously missing dates is a visible difference',()=>expect(contractDifferences({...offer,starts_on:null},offer)).toHaveProperty('starts_on'));
 it('money is cent precise',()=>expect(contractErrors({...offer,amount:900.001})).toContain('senttitarkka summa'));
 it('line sum must equal 900',()=>expect(contractErrors({...offer,lines:[{...offer.lines[0],unit_price:901}]})).toContain('rivien summa ei vastaa tilausta'));
 it('requires both finite calendar days',()=>expect(contractErrors({...offer,ends_on:'2026-02-30'})).toContain('sopimuspäivät'));
});
