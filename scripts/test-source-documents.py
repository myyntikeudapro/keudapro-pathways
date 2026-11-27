"""UX-2 source document checks: isolated loopback draft only, synthetic companies and files only."""
import os,unittest,uuid,requests,urllib.parse,random
if urllib.parse.urlparse(os.environ.get('SUPABASE_DB_URL','')).hostname not in ('localhost','127.0.0.1'):
 raise RuntimeError('Isolated draft required')
BASE='http://127.0.0.1:8001';KEY=os.environ['SUPABASE_ANON_KEY'];BUCKET='crm-source-files'
TOKENS={}
for role,email,password in [('editor','heikki-testi@example.com','Testi-Heikki-2026'),('trainer','kouluttaja-testi@example.com','Testi-Kouluttaja-2026')]:
 r=requests.post(BASE+'/auth/v1/token?grant_type=password',headers={'apikey':KEY},json={'email':email,'password':password});r.raise_for_status();TOKENS[role]=r.json()['access_token']
def h(role):return {'apikey':KEY,'Authorization':'Bearer '+TOKENS.get(role,KEY)}
def rpc(args,role='editor'):return requests.post(BASE+'/rest/v1/rpc/crm_import_offer_with_sources',headers=h(role),json=args)
def bid():
 while True:
  b=f'{random.randint(1000000,9999999)}';r=sum(int(c)*w for c,w in zip(b,[7,9,10,5,8,4,2]))%11
  if r!=1:return f'{b}-{0 if r==0 else 11-r}'
PDF=b'%PDF-1.4\n% synteettinen testitiedosto\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'
def upload(path,role='editor'):return requests.post(f'{BASE}/storage/v1/object/{BUCKET}/{path}',headers={**h(role),'Content-Type':'application/pdf'},data=PDF)
def payload(op,email_text='Hei, sopii meille. Hintaan sisältyy tallenne.',path=None):
 p=dict(lead_id=None,organization_name='TESTI Lähde Oy',business_id=bid(),contact_name='Testi Henkilö',contact_role=None,contact_email=f'testi-{op[:8]}@example.com',contact_phone=None,service_title='Synteettinen koulutus',service_key=None,implementations=1,duration='2 h',delivery='Teams',unit_price=900,vat_rate=25.5,billing_mode='end',billing_installments=[],preferred_timing=None,expected_close='2027-01-31',approval_suggested=False,approval_evidence=None,source_text='--- Tarjous (testi.pdf) ---\nPDF-teksti\n\n--- Sähköpostikeskustelu ---\n'+email_text)
 s=[dict(kind='pdf',name='testi.pdf',text='PDF-teksti',storage_path=path),dict(kind='email',name=None,text=email_text,storage_path=None)]
 return dict(p=p,p_op_key=op,p_sources=s)
def docs(op,role='editor'):return requests.get(BASE+'/rest/v1/crm_source_documents',headers=h(role),params={'import_op_key':'eq.'+op,'select':'*','order':'kind'})
class SourceDocuments(unittest.TestCase):
 def test_01_pdf_and_email_saved_separately_and_read_back(self):
  op=str(uuid.uuid4());path=f'{op}/tarjous.pdf';self.assertTrue(upload(path).ok)
  r=rpc(payload(op,path=path));self.assertTrue(r.ok,r.text);res=r.json();self.assertEqual(res['sources_saved'],2)
  d=docs(op).json();self.assertEqual([x['kind'] for x in d],['email','pdf'])
  self.assertEqual(d[1]['original_name'],'testi.pdf');self.assertEqual(d[1]['storage_path'],path);self.assertEqual(d[1]['file_size'],len(PDF))
  self.assertEqual(d[0]['text_content'],'Hei, sopii meille. Hintaan sisältyy tallenne.');self.assertIsNone(d[0]['storage_path'])
  self.assertTrue(all(x['lead_id']==res['lead_id'] and x['offer_id']==res['offer_id'] and x['created_by']=='10000000-0000-4000-8000-000000000001' for x in d))
  f=requests.get(f'{BASE}/storage/v1/object/authenticated/{BUCKET}/{path}',headers=h('editor'));self.assertEqual(f.content,PDF)
  # legacy history copy still written (same transaction timestamp) for backwards compatibility
  hist=requests.get(BASE+'/rest/v1/crm_interactions',headers=h('editor'),params={'lead_id':'eq.'+res['lead_id'],'select':'occurred_at,summary'}).json()
  self.assertTrue(any(x['summary'].startswith('Tuotu alkuperäinen teksti') for x in hist))
 def test_02_replay_does_not_duplicate_and_changed_sources_rejected(self):
  op=str(uuid.uuid4());a=payload(op);self.assertTrue(rpc(a).ok)
  again=rpc(a);self.assertTrue(again.ok,again.text);self.assertTrue(again.json()['replayed']);self.assertEqual(len(docs(op).json()),2)
  changed=dict(a,p_sources=[dict(kind='email',name=None,text='Toinen teksti',storage_path=None)]);r=rpc(changed);self.assertFalse(r.ok);self.assertIn('OP_KEY_REUSED',r.text)
 def test_03_failure_leaves_no_source_rows(self):
  op=str(uuid.uuid4());a=payload(op);a['p']['business_id']='1234567-0';r=rpc(a);self.assertFalse(r.ok);self.assertEqual(docs(op).json(),[])
  op2=str(uuid.uuid4());r=rpc(payload(op2,path=f'{op2}/tarjous.pdf'));self.assertIn('SOURCE_FILE_MISSING',r.text);self.assertEqual(docs(op2).json(),[])
 def test_04_file_must_belong_to_the_import(self):
  other=str(uuid.uuid4());self.assertTrue(upload(f'{other}/tarjous.pdf').ok)
  op=str(uuid.uuid4());r=rpc(payload(op,path=f'{other}/tarjous.pdf'));self.assertIn('SOURCE_FILE_INVALID',r.text)
  self.assertTrue(requests.delete(f'{BASE}/storage/v1/object/{BUCKET}/{other}/tarjous.pdf',headers=h('editor')).ok)
 def test_05_linked_file_cannot_be_removed(self):
  op=str(uuid.uuid4());path=f'{op}/tarjous.pdf';upload(path);self.assertTrue(rpc(payload(op,path=path)).ok)
  requests.delete(f'{BASE}/storage/v1/object/{BUCKET}/{path}',headers=h('editor'))
  self.assertEqual(requests.get(f'{BASE}/storage/v1/object/authenticated/{BUCKET}/{path}',headers=h('editor')).content,PDF)
 def test_06_trainer_and_anonymous_blocked(self):
  op=str(uuid.uuid4());path=f'{op}/tarjous.pdf';upload(path);self.assertTrue(rpc(payload(op,path=path)).ok)
  for role in ['trainer','anon']:
   with self.subTest(role=role):
    self.assertEqual(docs(op,role).json() if docs(op,role).ok else [],[])
    self.assertNotEqual(requests.get(f'{BASE}/storage/v1/object/authenticated/{BUCKET}/{path}',headers=h(role)).content,PDF)
    self.assertNotEqual(requests.get(f'{BASE}/storage/v1/object/public/{BUCKET}/{path}').content,PDF)
    self.assertFalse(upload(f'{uuid.uuid4()}/tarjous.pdf',role).ok)
    self.assertFalse(rpc(payload(str(uuid.uuid4())),role).ok)
 def test_07_no_direct_writes(self):
  r=requests.post(BASE+'/rest/v1/crm_source_documents',headers=h('editor'),json=dict(lead_id=str(uuid.uuid4()),import_op_key='x'*10,kind='email',text_content='x'));self.assertFalse(r.ok)
if __name__=='__main__':unittest.main(verbosity=2)
