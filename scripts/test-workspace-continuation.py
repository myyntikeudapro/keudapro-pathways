"""Synthetic isolated-draft acceptance tests. Never runs against a non-loopback backend."""
import os, json, unittest, uuid, urllib.parse, concurrent.futures
import requests
BASE='http://127.0.0.1:8001'
if urllib.parse.urlparse(os.environ.get('SUPABASE_DB_URL','')).hostname not in ('127.0.0.1','localhost'):
 raise RuntimeError('Isolated database required; no writes performed')
KEY=os.environ['SUPABASE_ANON_KEY']; SERVICE=os.environ['SUPABASE_SERVICE_ROLE_KEY']
STAFF={}
for name,email,password in [('admin','admin-testi@example.com','Testi-Admin-2026'),('editor','heikki-testi@example.com','Testi-Heikki-2026'),('editor2','satu-testi@example.com','Testi-Satu-2026'),('trainer','kouluttaja-testi@example.com','Testi-Kouluttaja-2026')]:
 r=requests.post(BASE+'/auth/v1/token?grant_type=password',headers={'apikey':KEY},json={'email':email,'password':password});r.raise_for_status();STAFF[name]=r.json()['access_token']
def call(name,args,role='editor'):
 token=STAFF.get(role, SERVICE if role=='service' else KEY)
 return requests.post(BASE+'/rest/v1/rpc/'+name,headers={'apikey':SERVICE if role=='service' else KEY,'Authorization':'Bearer '+token},json=args)
def read(table,params,role='editor'):
 return requests.get(BASE+'/rest/v1/'+table,headers={'apikey':KEY,'Authorization':'Bearer '+STAFF.get(role,KEY)},params=params)
def must(r):
 if not r.ok: raise AssertionError(str(r.status_code)+' '+r.text[:500])
 return r.json()
def link_args(lead,org=None,bid=None,name=None,contact=None,expected_org=None,expected_contact=None,key=None,email=None):
 return dict(p_lead_id=lead,p_expected_organization_id=expected_org,p_expected_contact_id=expected_contact,p_organization_id=org,p_new_organization_name=name,p_new_business_id=bid,p_contact_id=contact,p_new_contact_name='Eero Esimerkki' if email else None,p_new_contact_email=email,p_new_contact_phone=None,p_op_key=key or str(uuid.uuid4()))
LEAD='14000000-0000-4000-8000-000000000006'; OFFER='15000000-0000-4000-8000-000000000007'
# Idempotently establish the synthetic case, exclusively through approved server functions.
existing=must(read('booking_requests',{'id':'eq.'+LEAD,'select':'organization_id,contact_id'}))[0]
if not existing['organization_id']:
 linked=must(call('crm_link_lead_customer',link_args(LEAD,bid='2345678-0',name='Rajakoe TESTI Oy',email='eero@example.com')))
else: linked=existing
ORDER_ARGS=dict(p_lead_id=LEAD,p_offer_id=OFFER,p_content='Rajasääntöjen esimerkkikoulutus',p_amount=2400,p_vat_basis='koulutus_veroton',p_starts_on='2026-11-26',p_ends_on='2026-12-10',p_terms='Testiehdot',p_payment_terms='14 päivää netto',p_approval_method='sahkoposti',p_approval_note='Synteettinen hyväksyntä, ei lähetystä',p_idempotency_key='jatko-rajatest-order-2026')
ORDER=must(call('crm_confirm_company_order',ORDER_ARGS))
def snapshot(): return must(call('crm_read_billing_plan',{'p_order_id':ORDER}))
def save(mode='start',rows=None,version=None,key=None):
 return call('crm_save_billing_plan',dict(p_order_id=ORDER,p_mode=mode,p_installments=rows or [],p_expected_version=snapshot()['plan']['version'] if version is None and snapshot()['plan'] else (version or 0),p_op_key=key or str(uuid.uuid4())))
class Acceptance(unittest.TestCase):
 def assertBlocked(self,r,code=None):
  self.assertFalse(r.ok,r.text)
  if code:self.assertIn(code,r.text)
 def test_01_order_replay_and_buyer(self):
  self.assertEqual(must(call('crm_confirm_company_order',ORDER_ARGS)),ORDER)
  self.assertBlocked(call('crm_confirm_company_order',{**ORDER_ARGS,'p_amount':2500}),'OP_KEY_REUSED')
  order=must(read('crm_orders',{'id':'eq.'+ORDER}))[0]
  self.assertEqual(order['organization_id'],linked['organization_id']);self.assertEqual(order['contact_id'],linked['contact_id']);self.assertEqual(order['owner_id'],'10000000-0000-4000-8000-000000000001')
 def test_02_roles(self):
  for role in ['admin','editor']:
   self.assertTrue(call('crm_find_organization_candidates',{'p_query':'2345678-0'},role).ok)
   self.assertTrue(call('crm_read_billing_plan',{'p_order_id':ORDER},role).ok)
  for role in ['trainer','anonymous']:
   for name,args in [('crm_find_organization_candidates',{'p_query':'2345678-0'}),('crm_link_lead_customer',link_args(LEAD,org=linked['organization_id'])),('crm_confirm_company_order',ORDER_ARGS),('crm_read_billing_plan',{'p_order_id':ORDER}),('crm_save_billing_plan',dict(p_order_id=ORDER,p_mode='start',p_installments=[],p_expected_version=0,p_op_key=str(uuid.uuid4()))),('public_ai_consume',{'p_scope':'chat','p_visitor':'a'*32})]:
    self.assertBlocked(call(name,args,role))
   for table in ['crm_organizations','crm_contacts','crm_orders','crm_billing_plans','crm_billing_installments']:
    r=read(table,{'select':'*','limit':'1'},role); self.assertTrue(not r.ok or r.json()==[],table+' disclosed')
 def test_03_contact_link_replay_and_conflict(self):
  args=link_args(LEAD,org=linked['organization_id'],contact=linked['contact_id'],expected_org=linked['organization_id'],expected_contact=linked['contact_id'])
  first=must(call('crm_link_lead_customer',args));second=must(call('crm_link_lead_customer',args))
  self.assertEqual(first['organization_id'],second['organization_id']);self.assertTrue(second['replayed'])
  self.assertBlocked(call('crm_link_lead_customer',{**args,'p_contact_id':None}),'OP_KEY_REUSED')
  self.assertBlocked(call('crm_link_lead_customer',link_args(LEAD,org=linked['organization_id'])),'LINK_CHANGED')
 def test_04_invalid_y_id_and_foreign_contact(self):
  lead='14000000-0000-4000-8000-000000000007'
  current=must(read('booking_requests',{'id':'eq.'+lead,'select':'organization_id,contact_id'}))[0]
  self.assertBlocked(call('crm_link_lead_customer',link_args(lead,bid='1234567-8',name='INVALID TESTI Oy',expected_org=current['organization_id'],expected_contact=current['contact_id'])),'INVALID_BUSINESS_ID')
  self.assertBlocked(call('crm_link_lead_customer',link_args(LEAD,org=linked['organization_id'],contact='13000000-0000-4000-8000-000000000001',expected_org=linked['organization_id'],expected_contact=linked['contact_id'])),'CONTACT_ORGANIZATION_MISMATCH')
 def test_05_start_end_and_no_default(self):
  first=must(save());self.assertEqual(first['installments'][0]['due_on'],'2026-11-26');self.assertEqual(first['installments'][0]['amount'],2400)
  end=must(save('end'));self.assertEqual(end['installments'][0]['due_on'],'2026-12-10');self.assertFalse(end['installments'][0]['due'])
 def test_06_amount_match(self): self.assertBlocked(save('installments',[{'amount':1000,'due_on':'2026-11-26'},{'amount':1399.99,'due_on':'2026-12-10'}]),'BILLING_TOTAL_MISMATCH')
 def test_07_amount_rules(self):
  for value in [0,-1,0.001]:self.assertBlocked(save('installments',[{'amount':value,'due_on':'2026-11-26'}]),'BILLING_INVALID_AMOUNT')
 def test_08_dates(self):
  self.assertBlocked(save('installments',[{'amount':2400,'due_on':'2026-02-30'}]))
  self.assertBlocked(save('installments',[{'amount':1200,'due_on':'2026-12-10'},{'amount':1200,'due_on':'2026-11-26'}]),'BILLING_INVALID_DATE_ORDER')
  self.assertBlocked(save('start',[{'amount':2400,'due_on':'2026-11-25'}]),'BILLING_AUTOMATIC_DATE')
 def test_09_installments_and_replay(self):
  version=snapshot()['plan']['version'];key=str(uuid.uuid4());rows=[{'amount':600,'due_on':'2026-11-26'},{'amount':1800,'due_on':'2026-12-10'}]
  a=must(save('installments',rows,version,key));b=must(save('installments',rows,version,key));self.assertEqual(a,b);self.assertEqual([r['due'] for r in a['installments']],[True,False])
  self.assertBlocked(save('end',[],version,key),'OP_KEY_REUSED');self.assertBlocked(save('end',[],version),'BILLING_CHANGED')
 def test_10_concurrent_plan(self):
  version=snapshot()['plan']['version']
  with concurrent.futures.ThreadPoolExecutor() as pool: responses=list(pool.map(lambda mode:save(mode,[],version),['start','end']))
  self.assertEqual(sum(r.ok for r in responses),1);self.assertIn('BILLING_CHANGED',next(r.text for r in responses if not r.ok))
 def test_11_direct_writes_denied(self):
  before=snapshot()['plan']['mode']
  r=requests.patch(BASE+'/rest/v1/crm_billing_plans?order_id=eq.'+ORDER,headers={'apikey':KEY,'Authorization':'Bearer '+STAFF['editor']},json={'mode':'start' if before=='end' else 'end'})
  self.assertTrue(not r.ok or r.content==b'')
  self.assertEqual(snapshot()['plan']['mode'],before)
 def test_12_future_payment_guard(self):
  s=must(save('end'));i=s['installments'][0]
  self.assertBlocked(call('crm_set_installment_payment',{'p_installment_id':i['id'],'p_status':'laskutettu','p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}),'BILLING_NOT_DUE')
 def test_13_payment_replay_and_conflict(self):
  s=must(save('start'));i=s['installments'][0];args={'p_installment_id':i['id'],'p_status':'laskutettu','p_expected_version':s['plan']['version'],'p_op_key':str(uuid.uuid4())}
  a=must(call('crm_set_installment_payment',args));b=must(call('crm_set_installment_payment',args));self.assertEqual(a,b)
  self.assertBlocked(save('end'),'BILLING_ALREADY_MARKED')
  self.assertBlocked(call('crm_set_installment_payment',{**args,'p_op_key':str(uuid.uuid4()),'p_status':'maksettu'}),'BILLING_CHANGED')
  must(call('crm_set_installment_payment',{**args,'p_op_key':str(uuid.uuid4()),'p_status':'ei_laskutettu','p_expected_version':snapshot()['plan']['version']}))
 def test_14_personal_case_excluded(self):
  self.assertBlocked(call('crm_link_lead_customer',link_args('14000000-0000-4000-8000-000000000010',org=linked['organization_id'])),'PERSONAL_CASE')
 def test_15_concurrent_y_id_creation(self):
  leads=['14000000-0000-4000-8000-000000000008','14000000-0000-4000-8000-000000000009']
  rows=must(read('crm_organizations',{'business_id':'eq.4567890-7','select':'id'}))
  if rows:
   self.assertEqual(len(rows),1);return
  with concurrent.futures.ThreadPoolExecutor() as pool: responses=list(pool.map(lambda lead:call('crm_link_lead_customer',link_args(lead,bid='4567890-7',name='RACE TESTI Oy')),leads))
  self.assertEqual(sum(r.ok for r in responses),1)
  self.assertIn('ORGANIZATION_EXISTS',next(r.text for r in responses if not r.ok))
  self.assertEqual(len(must(read('crm_organizations',{'business_id':'eq.4567890-7','select':'id'}))),1)
 def test_16_concurrent_same_link(self):
  args=link_args(LEAD,org=linked['organization_id'],contact=linked['contact_id'],expected_org=linked['organization_id'],expected_contact=linked['contact_id'])
  with concurrent.futures.ThreadPoolExecutor() as pool: results=list(pool.map(lambda _:must(call('crm_link_lead_customer',args)),range(2)))
  self.assertEqual(results[0]['contact_id'],results[1]['contact_id']);self.assertEqual(sum(bool(r.get('replayed')) for r in results),1)
 def test_17_concurrent_order_replay(self):
  with concurrent.futures.ThreadPoolExecutor() as pool: results=list(pool.map(lambda _:must(call('crm_confirm_company_order',ORDER_ARGS)),range(4)))
  self.assertEqual(results,[ORDER]*4)
 def test_18_changed_order_fails_closed(self):
  saved=must(save('start'))
  headers={'apikey':SERVICE,'Authorization':'Bearer '+SERVICE}
  requests.patch(BASE+'/rest/v1/crm_orders?id=eq.'+ORDER,headers=headers,json={'total_net':2500}).raise_for_status()
  try:
   changed=snapshot();self.assertTrue(changed['stale']);self.assertFalse(changed['installments'][0]['due'])
   self.assertBlocked(call('crm_set_installment_payment',{'p_installment_id':changed['installments'][0]['id'],'p_status':'laskutettu','p_expected_version':changed['plan']['version'],'p_op_key':str(uuid.uuid4())}),'BILLING_NOT_DUE')
  finally:requests.patch(BASE+'/rest/v1/crm_orders?id=eq.'+ORDER,headers=headers,json={'total_net':2400}).raise_for_status()
 def test_19_missing_plan_and_cancelled_delivery(self):
  lead='14000000-0000-4000-8000-000000000007';offer='15000000-0000-4000-8000-000000000008'
  l=must(read('booking_requests',{'id':'eq.'+lead,'select':'organization_id,contact_id'}))[0]
  if not l['organization_id']:must(call('crm_link_lead_customer',link_args(lead,org=linked['organization_id'],contact=linked['contact_id'])))
  args={**ORDER_ARGS,'p_lead_id':lead,'p_offer_id':offer,'p_idempotency_key':'jatko-missing-plan-order'}
  oid=must(call('crm_confirm_company_order',args));missing=must(call('crm_read_billing_plan',{'p_order_id':oid}))
  self.assertIsNone(missing['plan']);self.assertEqual(missing['installments'],[])
  ui_order=must(read('crm_orders',{'lead_id':'eq.14000000-0000-4000-8000-000000000005','select':'id'}))[0]['id']
  delivery=must(read('prod_deliveries',{'order_id':'eq.'+ui_order,'select':'id,production_status'}))[0]
  headers={'apikey':SERVICE,'Authorization':'Bearer '+SERVICE}
  requests.patch(BASE+'/rest/v1/prod_deliveries?id=eq.'+delivery['id'],headers=headers,json={'production_status':'peruttu'}).raise_for_status()
  try:
   cancelled=must(call('crm_read_billing_plan',{'p_order_id':ui_order}));self.assertTrue(cancelled['cancelled']);self.assertTrue(all(not i['due'] for i in cancelled['installments']))
  finally:requests.patch(BASE+'/rest/v1/prod_deliveries?id=eq.'+delivery['id'],headers=headers,json={'production_status':delivery['production_status']}).raise_for_status()
 def test_20_concurrent_usage_limit(self):
  requests.delete(BASE+'/rest/v1/public_ai_usage?bucket_key=eq.global',headers={'apikey':SERVICE,'Authorization':'Bearer '+SERVICE}).raise_for_status()
  visitor=uuid.uuid4().hex
  with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool: results=list(pool.map(lambda _:must(call('public_ai_consume',{'p_scope':'chat','p_visitor':visitor},'service')),range(20)))
  self.assertEqual(results.count(True),10)
  self.assertFalse(must(call('public_ai_consume',{'p_scope':'invalid','p_visitor':uuid.uuid4().hex},'service')))
 def test_21_global_usage_limit(self):
  # Fresh visitor per request cannot evade the shared 400/hour ceiling.
  with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool: results=list(pool.map(lambda _:must(call('public_ai_consume',{'p_scope':'smart-search','p_visitor':uuid.uuid4().hex},'service')),range(405)))
  self.assertLessEqual(results.count(True),390);self.assertGreater(results.count(True),0)
  self.assertFalse(must(call('public_ai_consume',{'p_scope':'growth-checkup','p_visitor':uuid.uuid4().hex},'service')))
if __name__=='__main__':unittest.main(verbosity=2)
