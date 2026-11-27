"""Persistent acceptance checks: isolated loopback draft only, synthetic fixtures only."""
import os,json,unittest,uuid,requests,urllib.parse,concurrent.futures
if urllib.parse.urlparse(os.environ.get('SUPABASE_DB_URL','')).hostname not in ('localhost','127.0.0.1'):
 raise RuntimeError('Isolated draft required')
BASE='http://127.0.0.1:8001';KEY=os.environ['SUPABASE_ANON_KEY'];SERVICE=os.environ['SUPABASE_SERVICE_ROLE_KEY']
TOKENS={}
for role,email,password in [('admin','admin-testi@example.com','Testi-Admin-2026'),('editor','heikki-testi@example.com','Testi-Heikki-2026'),('editor2','satu-testi@example.com','Testi-Satu-2026'),('trainer','kouluttaja-testi@example.com','Testi-Kouluttaja-2026')]:
 r=requests.post(BASE+'/auth/v1/token?grant_type=password',headers={'apikey':KEY},json={'email':email,'password':password});r.raise_for_status();TOKENS[role]=r.json()['access_token']
def headers(role='editor'):return {'apikey':SERVICE if role=='service' else KEY,'Authorization':'Bearer '+(SERVICE if role=='service' else TOKENS.get(role,KEY))}
def rpc(fn,args,role='editor'):return requests.post(BASE+'/rest/v1/rpc/'+fn,headers=headers(role),json=args)
def read(table,params,role='editor'):return must(requests.get(BASE+'/rest/v1/'+table,headers=headers(role),params=params))
def patch(table,params,values,role='editor'):return requests.patch(BASE+'/rest/v1/'+table,headers=headers(role),params=params,json=values)
def must(r):
 if not r.ok:raise AssertionError(f'{r.status_code}: {r.text[:800]}')
 return r.json() if r.content else None
OFFSET=0
def identity(prefix,n):return f'{prefix}000000-0000-4000-8000-{n+OFFSET:012d}'
ORG='22000000-0000-4000-8000-000000000001';CONTACT='23000000-0000-4000-8000-000000000001'
def args(n=100,**changes):
 a=dict(p_lead_id=identity('24',n),p_offer_id=identity('25',n),p_source_version_id=identity('26',n),p_content='2 h Teams-aseptiikkakoulutus',p_amount=900,p_vat_basis='yleinen',p_vat_rate=25.5,p_vat_reason=None,p_starts_on='2026-11-26',p_ends_on='2026-11-27',p_terms='Synteettiset sopimusehdot',p_payment_terms='14 päivää netto',p_approval_method='sahkoposti',p_approval_note='Synteettinen hyväksyntä 27.11.2026',p_idempotency_key=str(uuid.uuid4()),p_lines=[dict(line_no=1,description='2 h Teams-aseptiikkakoulutus',quantity=1,unit_price=900)],p_billing_mode='end',p_billing_installments=[],p_change_accepted=False,p_change_method=None,p_change_reference=None,p_expected_organization_id=ORG,p_expected_contact_id=CONTACT)
 a.update(changes);return a
def approve(n):
 v=read('crm_offer_versions',{'id':'eq.'+identity('26',n)})[0]
 if not v['approved_at']:must(patch('crm_offer_versions',{'id':'eq.'+v['id']},{'approved_at':'2026-11-27T00:00:00Z','approval_method':'sahkoposti','approval_note':'Synteettinen hyväksyntä 27.11.2026'}))
for offset in [0,100,200,300]:
 OFFSET=offset
 if not read('crm_orders',{'source_offer_version_id':'eq.'+identity('26',100)}):break
else:raise RuntimeError('Acceptance fixture pools exhausted; use a fresh isolated draft')
print('Synthetic acceptance pool:',100+OFFSET)
for n in range(100,130):approve(n)
class OrderSafety(unittest.TestCase):
 def blocked(self,r,code=None):
  self.assertFalse(r.ok,r.text)
  if code:self.assertIn(code,r.text)
 def test_01_missing_vat(self):self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis=None)),'VAT_SELECTION_REQUIRED')
 def test_02_exempt_reason(self):self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis='koulutus_veroton',p_vat_rate=0)),'VAT_REASON_REQUIRED')
 def test_03_reverse_reason(self):self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis='kaannetty',p_vat_rate=0)),'VAT_REASON_REQUIRED')
 def test_04_other_reason(self):self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis='muu',p_vat_rate=10)),'VAT_REASON_REQUIRED')
 def test_05_other_explicit_rate(self):self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis='muu',p_vat_rate=None,p_vat_reason='Testiperuste')),'VAT_RATE_INVALID')
 def test_06_general_rate(self):
  for r in [None,0,24,101,-1]:self.blocked(rpc('crm_confirm_company_order',args(p_vat_rate=r)),'VAT_RATE_INVALID')
 def test_07_tax_consistency(self):
  for b in ['koulutus_veroton','kaannetty']:self.blocked(rpc('crm_confirm_company_order',args(p_vat_basis=b,p_vat_rate=25.5,p_vat_reason='Testiperuste')),'VAT_RATE_INVALID')
 def test_08_money_lines(self):
  for value in [0,-1,900.001]:self.blocked(rpc('crm_confirm_company_order',args(p_amount=value)),'AMOUNT_REQUIRED')
  self.blocked(rpc('crm_confirm_company_order',args(p_amount=901)),'ORDER_LINE_TOTAL_MISMATCH')
 def test_09_old_and_internal_paths_blocked(self):
  a=args();old={k:v for k,v in a.items() if k in ['p_lead_id','p_offer_id','p_content','p_amount','p_vat_basis','p_starts_on','p_ends_on','p_terms','p_payment_terms','p_approval_method','p_approval_note','p_idempotency_key']}
  self.blocked(rpc('crm_confirm_company_order',old),'ORDER_RELOAD_REQUIRED')
  self.blocked(rpc('crm_confirm_order',{'p_version_id':a['p_source_version_id'],'p_idempotency_key':str(uuid.uuid4())}))
 def test_10_identical_and_replay(self):
  a=args(100);before=read('crm_offer_versions',{'id':'eq.'+a['p_source_version_id']});lines=read('crm_offer_version_lines',{'version_id':'eq.'+a['p_source_version_id']})
  oid=must(rpc('crm_confirm_company_order',a));self.assertEqual(must(rpc('crm_confirm_company_order',a)),oid)
  o=read('crm_orders',{'id':'eq.'+oid})[0];self.assertEqual(o['total_net'],900);self.assertEqual(o['vat_rate'],25.5);self.assertEqual(round(o['total_net']*o['vat_rate']/100,2),229.50);self.assertEqual(o['confirmed_by'],'10000000-0000-4000-8000-000000000001');self.assertEqual(o['approval_differences'],{});self.assertEqual(o['offer_version_id'],a['p_source_version_id']);self.assertIsNone(o['change_approved_by'])
  self.assertEqual(read('crm_offer_versions',{'id':'eq.'+a['p_source_version_id']}),before);self.assertEqual(read('crm_offer_version_lines',{'version_id':'eq.'+a['p_source_version_id']}),lines)
  self.blocked(rpc('crm_confirm_company_order',{**a,'p_amount':901}),'OP_KEY_REUSED')
 def test_11_changes_require_evidence_and_preserve_source(self):
  cases=[('amount',dict(p_amount=950,p_lines=[dict(line_no=1,description='2 h Teams-aseptiikkakoulutus',quantity=1,unit_price=950)])),('content',dict(p_content='3 h Teams')),('lines',dict(p_lines=[dict(line_no=1,description='Muuttunut sisältö',quantity=2,unit_price=450)])),('starts_on',dict(p_starts_on='2026-11-25')),('ends_on',dict(p_ends_on='2026-11-28')),('terms',dict(p_terms='Uusi sopimusehto')),('payment_terms',dict(p_payment_terms='30 päivää netto')),('billing_mode',dict(p_billing_mode='start')),('vat_basis',dict(p_vat_basis='koulutus_veroton',p_vat_rate=0,p_vat_reason='Synteettinen verottomuuden peruste')),('vat_rate',dict(p_vat_basis='muu',p_vat_rate=10,p_vat_reason='Synteettinen muu peruste')),('vat_reason',dict(p_vat_reason='Muuttunut veroperuste')),('billing_installments',dict(p_billing_mode='installments',p_billing_installments=[{'amount':300,'due_on':'2026-11-26'},{'amount':600,'due_on':'2026-11-27'}])),('vat_basis',dict(p_vat_basis='kaannetty',p_vat_rate=0,p_vat_reason='Synteettinen käännetyn peruste'))]
  for n,(field,changes) in enumerate(cases,101):
   with self.subTest(field=field,n=n):
    a=args(n,**changes);before=read('crm_offer_versions',{'id':'eq.'+a['p_source_version_id']});lines=read('crm_offer_version_lines',{'version_id':'eq.'+a['p_source_version_id']})
    self.blocked(rpc('crm_confirm_company_order',a),'ORDER_CHANGE_APPROVAL_REQUIRED')
    self.blocked(rpc('crm_confirm_company_order',{**a,'p_change_accepted':True}),'ORDER_CHANGE_APPROVAL_REQUIRED')
    a.update(p_change_accepted=True,p_change_method='sahkoposti',p_change_reference='Synteettinen asiakkaan hyväksyntä 27.11.2026')
    oid=must(rpc('crm_confirm_company_order',a));o=read('crm_orders',{'id':'eq.'+oid})[0];self.assertIn(field,o['approval_differences']);self.assertEqual(o['source_offer_version_id'],a['p_source_version_id']);self.assertNotEqual(o['offer_version_id'],a['p_source_version_id']);self.assertEqual(o['change_approved_by'],'10000000-0000-4000-8000-000000000001')
    self.assertEqual(read('crm_offer_versions',{'id':'eq.'+a['p_source_version_id']}),before);self.assertEqual(read('crm_offer_version_lines',{'version_id':'eq.'+a['p_source_version_id']}),lines)
 def test_12_immutable_direct_source(self):
  self.blocked(patch('crm_offer_versions',{'id':'eq.'+identity('26',100)},{'content':'Illegal change'}))
  self.blocked(patch('crm_offer_version_lines',{'version_id':'eq.'+identity('26',100)},{'unit_price':1}))
 def test_13_whitespace_and_numeric_normalization(self):
  a=args(114,p_content=' 2 h\n Teams-aseptiikkakoulutus ',p_terms='Synteettiset  sopimusehdot',p_vat_reason=' ',p_lines=[dict(line_no=1,description=' 2 h   Teams-aseptiikkakoulutus ',quantity=1.0,unit_price=900.0)])
  oid=must(rpc('crm_confirm_company_order',a));self.assertEqual(read('crm_orders',{'id':'eq.'+oid})[0]['approval_differences'],{})
 def test_14_roles(self):
  for role,n in [('admin',115),('editor2',116)]:
   oid=must(rpc('crm_confirm_company_order',args(n),role));self.assertTrue(read('crm_orders',{'id':'eq.'+oid},role))
  for role in ['trainer','anonymous']:
   self.blocked(rpc('crm_confirm_company_order',args(117),role))
   for table in ['crm_orders','crm_offer_versions','crm_billing_plans','crm_billing_installments']:
    r=requests.get(BASE+'/rest/v1/'+table,headers=headers(role),params={'select':'*','limit':1});self.assertTrue(not r.ok or r.json()==[],table)
 def test_15_concurrent_same_key(self):
  a=args(117)
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rs=list(pool.map(lambda _:rpc('crm_confirm_company_order',a),range(4)))
  ids=[must(r) for r in rs];self.assertEqual(len(set(ids)),1);self.assertEqual(len(read('crm_orders',{'source_offer_version_id':'eq.'+a['p_source_version_id']})),1)
 def test_16_concurrent_different_key(self):
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rs=list(pool.map(lambda _:rpc('crm_confirm_company_order',args(118)),range(2)))
  self.assertEqual(sum(r.ok for r in rs),1);self.assertTrue(any('ORDER_ALREADY_CONFIRMED'in r.text for r in rs))
 def test_17_link_concurrency(self):self.blocked(rpc('crm_confirm_company_order',args(119,p_expected_contact_id='13000000-0000-4000-8000-000000000001')),'LINK_CHANGED')
 def test_18_source_required(self):self.blocked(rpc('crm_confirm_company_order',args(119,p_source_version_id=None)),'ACCEPTED_VERSION_REQUIRED')
 def test_19_dates_required(self):
  for c in [{'p_starts_on':None},{'p_ends_on':None},{'p_ends_on':'2026-11-25'}]:self.blocked(rpc('crm_confirm_company_order',args(119,**c)),'ORDER_DATES_INVALID')
 def test_20_billing_no_delivery_and_marking(self):
  a=args(119,p_billing_mode='start',p_change_accepted=True,p_change_method='sahkoposti',p_change_reference='Synteettinen ennakkolaskutuksen hyväksyntä');oid=must(rpc('crm_confirm_company_order',a));self.assertEqual(read('prod_deliveries',{'order_id':'eq.'+oid}),[])
  snap=must(rpc('crm_read_billing_plan',{'p_order_id':oid}));self.assertEqual(len(snap['installments']),1);self.assertTrue(snap['installments'][0]['due']);self.assertEqual(snap['installments'][0]['amount'],900)
  for role in ['admin','editor']:self.assertTrue(rpc('crm_read_billing_plan',{'p_order_id':oid},role).ok)
  for role in ['trainer','anonymous']:self.blocked(rpc('crm_read_billing_plan',{'p_order_id':oid},role))
  for status in ['laskutettu','maksettu','ei_laskutettu']:
   snap=must(rpc('crm_set_installment_payment',{'p_installment_id':snap['installments'][0]['id'],'p_status':status,'p_expected_version':snap['plan']['version'],'p_op_key':str(uuid.uuid4())}));self.assertEqual(snap['installments'][0]['due'],status=='ei_laskutettu')
 def test_21_missing_plan(self):
  a=args(120,p_billing_mode=None,p_change_accepted=True,p_change_method='sahkoposti',p_change_reference='Sopimuksen laskutustapa avoin');oid=must(rpc('crm_confirm_company_order',a));snap=must(rpc('crm_read_billing_plan',{'p_order_id':oid}));self.assertIsNone(snap['plan']);self.assertEqual(snap['installments'],[])
 def test_22_plan_race_and_replay(self):
  oid=read('crm_orders',{'source_offer_version_id':'eq.'+identity('26',119)})[0]['id'];s=must(rpc('crm_read_billing_plan',{'p_order_id':oid}));a={'p_order_id':oid,'p_mode':'installments','p_installments':[{'amount':300,'due_on':'2026-11-26'},{'amount':600,'due_on':'2026-11-27'}],'p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}
  s=must(rpc('crm_save_billing_plan',a));self.assertEqual(must(rpc('crm_save_billing_plan',a)),s)
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rs=list(pool.map(lambda mode:rpc('crm_save_billing_plan',{**a,'p_mode':mode,'p_installments':[],'p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}),['start','end']))
  self.assertEqual(sum(r.ok for r in rs),1);self.assertTrue(any('BILLING_CHANGED'in r.text for r in rs))
 def test_23_cancelled_order(self):
  oid=read('crm_orders',{'source_offer_version_id':'eq.'+identity('26',119)})[0]['id'];must(patch('crm_orders',{'id':'eq.'+oid},{'cancelled_at':'2026-11-27T00:00:00Z'},'service'))
  try:
   snap=must(rpc('crm_read_billing_plan',{'p_order_id':oid}));self.assertTrue(snap['cancelled']);self.assertFalse(any(i['due'] for i in snap['installments']))
  finally:must(patch('crm_orders',{'id':'eq.'+oid},{'cancelled_at':None},'service'))
 def test_24_staff_direct_order_write_denied(self):
  r=patch('crm_orders',{'source_offer_version_id':'eq.'+identity('26',100)},{'vat_rate':0});self.assertFalse(r.ok)
 def test_25_empty_change_reference(self):
  self.blocked(rpc('crm_confirm_company_order',args(125,p_content='Muutos',p_change_accepted=True,p_change_method='sahkoposti',p_change_reference=' ')),'ORDER_CHANGE_APPROVAL_REQUIRED')
 def test_26_future_installment_marking(self):
  oid=read('crm_orders',{'source_offer_version_id':'eq.'+identity('26',119)})[0]['id'];s=must(rpc('crm_read_billing_plan',{'p_order_id':oid}))
  s=must(rpc('crm_save_billing_plan',{'p_order_id':oid,'p_mode':'installments','p_installments':[{'amount':900,'due_on':'2099-01-01'}],'p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}))
  self.assertFalse(s['installments'][0]['due'])
  self.blocked(rpc('crm_set_installment_payment',{'p_installment_id':s['installments'][0]['id'],'p_status':'laskutettu','p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}),'BILLING_NOT_DUE')
 def test_27_latest_accepted_source_changed(self):
  v=identity('27',124)
  must(patch('crm_offer_versions',{'id':'eq.'+v},{'approved_at':'2026-11-27T00:00:00Z','approval_method':'sahkoposti','approval_note':'Uudemman synteettisen version hyväksyntä'}))
  self.blocked(rpc('crm_confirm_company_order',args(124)),'OFFER_CHANGED')
if __name__=='__main__':unittest.main(verbosity=2)
