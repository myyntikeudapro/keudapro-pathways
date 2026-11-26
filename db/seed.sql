-- Example data for company-training user tests (invented @example.com accounts only).
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change,email_change_token_new) VALUES
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000001','authenticated','authenticated','heikki-testi@example.com',extensions.crypt('Testi-Heikki-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:00+00',now(),'{"provider":"email","providers":["email"]}','{}','','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000002','authenticated','authenticated','satu-testi@example.com',extensions.crypt('Testi-Satu-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:01+00',now(),'{"provider":"email","providers":["email"]}','{}','','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000003','authenticated','authenticated','kouluttaja-testi@example.com',extensions.crypt('Testi-Kouluttaja-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:02+00',now(),'{"provider":"email","providers":["email"]}','{}','','','','') ON CONFLICT DO NOTHING;
INSERT INTO auth.identities (id,user_id,provider,provider_id,identity_data,created_at,updated_at) VALUES
(gen_random_uuid(),'10000000-0000-4000-8000-000000000001','email','10000000-0000-4000-8000-000000000001','{"sub":"10000000-0000-4000-8000-000000000001","email":"heikki-testi@example.com"}',now(),now()),
(gen_random_uuid(),'10000000-0000-4000-8000-000000000002','email','10000000-0000-4000-8000-000000000002','{"sub":"10000000-0000-4000-8000-000000000002","email":"satu-testi@example.com"}',now(),now()),
(gen_random_uuid(),'10000000-0000-4000-8000-000000000003','email','10000000-0000-4000-8000-000000000003','{"sub":"10000000-0000-4000-8000-000000000003","email":"kouluttaja-testi@example.com"}',now(),now()) ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id,role) VALUES
('10000000-0000-4000-8000-000000000001','editor'),
('10000000-0000-4000-8000-000000000002','editor'),
('10000000-0000-4000-8000-000000000003','trainer') ON CONFLICT DO NOTHING;
INSERT INTO exp_experts (id,user_id,name,kind,region) VALUES
('11000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Kouluttaja Testi','sisäinen','Uusimaa') ON CONFLICT DO NOTHING;
INSERT INTO prod_templates (key,name,description) VALUES
('yrityskoulutus_tilaus','Yrityskohtainen tilauskoulutus','Satu hyväksynyt 25.11.2026. Tehtävät 1–3 estävät aloituksen.') ON CONFLICT DO NOTHING;
INSERT INTO prod_template_tasks (template_key,scope,code,title,owner_role,anchor,offset_days,blocks_start,sort_order) VALUES
('yrityskoulutus_tilaus','specific','yk_sisalto','Sisältö ja tavoitteet vahvistettu tilaajan kanssa','production','first_session',-14,true,1),
('yrityskoulutus_tilaus','specific','yk_kouluttaja','Kouluttaja nimetty ja vahvistanut ajat','production','first_session',-14,true,2),
('yrityskoulutus_tilaus','specific','yk_paikka','Paikka tai Teams-linkki sovittu','production','first_session',-7,true,3),
('yrityskoulutus_tilaus','specific','yk_osallistujat','Osallistujalista pyydetty tilaajalta','production','first_session',-7,false,4),
('yrityskoulutus_tilaus','specific','yk_materiaalit','Materiaalit valmiina','trainer','first_session',-3,false,5),
('yrityskoulutus_tilaus','specific','yk_kutsu','Kutsu ja käytännön ohje tilaajalle','production','first_session',-5,false,6),
('yrityskoulutus_tilaus','specific','yk_lasnaolot','Läsnäolot kirjattu','trainer','last_session',0,false,7),
('yrityskoulutus_tilaus','specific','yk_palaute','Palaute kerätty','production','last_session',7,false,8),
('yrityskoulutus_tilaus','specific','yk_todistukset','Todistukset ja materiaalit toimitettu','production','last_session',7,false,9) ON CONFLICT DO NOTHING;
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000001','TESTI Oy – yrityskohtainen koulutus','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_contacts (id,organization_id,name,email,phone) VALUES
('13000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','Tiina Tilaaja','tiina.tilaaja@example.com','+358 40 000 0000') ON CONFLICT DO NOTHING;
INSERT INTO booking_requests (id,name,email,phone,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000001','Tiina Tilaaja','tiina.tilaaja@example.com','+358 40 000 0000','TESTI Oy – yrityskohtainen koulutus','Teams-palaveri','TESTI: yrityskohtainen koulutus läpivientitestiin.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000002','TESTI 2 Oy – yrityskohtainen koulutus','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_contacts (id,organization_id,name,email,phone) VALUES
('13000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000002','Tero Tilaaja','tero.tilaaja@example.com','+358 40 000 0001') ON CONFLICT DO NOTHING;
INSERT INTO booking_requests (id,name,email,phone,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000002','Tero Tilaaja','tero.tilaaja@example.com','+358 40 000 0001','TESTI 2 Oy – yrityskohtainen koulutus','Teams-palaveri','TESTI 2: puhdas yrityskoulutuksen läpivientitesti.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002') ON CONFLICT DO NOTHING;

-- Pre-launch checks: separate examples, never modify TESTI 2 Oy.
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000003','TESTI 3 Oy – käyttöönoton tarkistus','10000000-0000-4000-8000-000000000001'),
('12000000-0000-4000-8000-000000000004','TESTI Virtaus Oy','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_contacts (id,organization_id,name,email) VALUES
('13000000-0000-4000-8000-000000000003','12000000-0000-4000-8000-000000000003','Teppo Testi','teppo.testi@example.com'),
('13000000-0000-4000-8000-000000000004','12000000-0000-4000-8000-000000000004','Viivi Virtaus','viivi.virtaus@example.com') ON CONFLICT DO NOTHING;
INSERT INTO booking_requests (id,name,email,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000003','Teppo Testi','teppo.testi@example.com','TESTI 3 Oy – käyttöönoton tarkistus','Teams-palaveri','Erillinen käyttöönoton tarkistus. Ei oikeita lähetyksiä.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003'),
('14000000-0000-4000-8000-000000000004','Viivi Virtaus','viivi.virtaus@example.com','TESTI Virtaus Oy','Teams-palaveri','Virtaustaulun keltainen ja punainen esimerkki.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000004') ON CONFLICT DO NOTHING;
INSERT INTO crm_offers (id,lead_id,title,amount,probability,expected_close,status,created_by,created_at) VALUES
('15000000-0000-4000-8000-000000000003','14000000-0000-4000-8000-000000000003','Käyttöönoton testikoulutus',2400,70,'2026-11-26','draft','10000000-0000-4000-8000-000000000001',now()) ON CONFLICT DO NOTHING;
-- Traffic-light examples on the agent's previous test case, not the user's TESTI 2 Oy.
INSERT INTO crm_offers (id,lead_id,title,amount,probability,expected_close,status,created_by,created_at) VALUES
('15000000-0000-4000-8000-000000000004','14000000-0000-4000-8000-000000000001','TESTI keltainen tarjous',1000,50,'2026-12-01','sent','10000000-0000-4000-8000-000000000001','2026-11-18 06:00+00'),
('15000000-0000-4000-8000-000000000005','14000000-0000-4000-8000-000000000001','TESTI punainen tarjous',1000,50,'2026-12-01','sent','10000000-0000-4000-8000-000000000001','2026-11-10 06:00+00') ON CONFLICT DO NOTHING;

-- Isolated synthetic continuation checks; no sender or production account.
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change,email_change_token_new) VALUES
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000004','authenticated','authenticated','admin-testi@example.com',extensions.crypt('Testi-Admin-2026',extensions.gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','','','') ON CONFLICT DO NOTHING;
INSERT INTO user_roles(user_id,role) VALUES('10000000-0000-4000-8000-000000000004','admin') ON CONFLICT DO NOTHING;
INSERT INTO booking_requests(id,name,email,organization,meeting_format,message,source,status,service_key,owner_id) VALUES
('14000000-0000-4000-8000-000000000005','Aino Esimerkki','aino@example.com','Jatko TESTI Oy','Teams-palaveri','Synteettinen asiakasliittämisen ja sopimuslaskutuksen UI-koe.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001'),
('14000000-0000-4000-8000-000000000006','Eero Esimerkki','eero@example.com','Rajakoe TESTI Oy','Teams-palaveri','Synteettinen palvelimen rajasääntökoe.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001'),
('14000000-0000-4000-8000-000000000007','Iida Esimerkki','iida@example.com','Kilpailu TESTI Oy','Teams-palaveri','Synteettinen samanaikaisuuskoe.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_offers(id,lead_id,title,amount,probability,expected_close,status,created_by) VALUES
('15000000-0000-4000-8000-000000000006','14000000-0000-4000-8000-000000000005','Jatkon esimerkkikoulutus',2400,100,'2026-11-26','accepted','10000000-0000-4000-8000-000000000001'),
('15000000-0000-4000-8000-000000000007','14000000-0000-4000-8000-000000000006','Rajasääntöjen esimerkkikoulutus',2400,100,'2026-11-26','accepted','10000000-0000-4000-8000-000000000001'),
('15000000-0000-4000-8000-000000000008','14000000-0000-4000-8000-000000000007','Kilpailun esimerkkikoulutus',2400,100,'2026-11-26','accepted','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
-- Independent same-Y-ID race examples and excluded personal case.
INSERT INTO booking_requests(id,name,email,organization,meeting_format,message,source,status,service_key,owner_id,mt_personal) VALUES
('14000000-0000-4000-8000-000000000008','Rina Kilpailu','rina@example.com','RACE TESTI Oy','Teams-palaveri','Synteettinen samanaikaisuus A.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001',false),
('14000000-0000-4000-8000-000000000009','Roni Kilpailu','roni@example.com','RACE TESTI Oy','Teams-palaveri','Synteettinen samanaikaisuus B.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001',false),
('14000000-0000-4000-8000-000000000010','Hanna Henkilö','hanna@example.com',NULL,'Teams-palaveri','Synteettinen henkilökohtainen rajaus.','testi','uusi','muutosturva','10000000-0000-4000-8000-000000000001',true) ON CONFLICT DO NOTHING;

-- Yhteyshenkilöt 1C-A: several contacts per organization, same-named people, pagination and explicit offer/order links.
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000020','TESTI Yhteyshenkilöt Oy','10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO crm_contacts (id,organization_id,name,email,phone)
SELECT ('13000000-0000-4000-8000-0000000002' || lpad(g::text,2,'0'))::uuid,'12000000-0000-4000-8000-000000000020','Testihenkilö ' || lpad(g::text,2,'0'),'henkilo' || g || '@example.com', CASE WHEN g % 2 = 0 THEN '040 000 00' || lpad(g::text,2,'0') END
FROM generate_series(1,27) g ON CONFLICT DO NOTHING;
INSERT INTO crm_contacts (id,organization_id,name,email) VALUES
('13000000-0000-4000-8000-000000000299','12000000-0000-4000-8000-000000000003','Teppo Testi','teppo.toinen@example.com') ON CONFLICT DO NOTHING;
INSERT INTO crm_offer_versions (id,offer_id,version_no,organization_id,contact_id,service_key,starts_on,payment_terms,vat_rate,vat_basis,terms) VALUES
('16000000-0000-4000-8000-000000000020','15000000-0000-4000-8000-000000000003',1,'12000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003','osaaminen','2027-01-20','14 pv netto',25.5,'yleinen','TESTI-ehdot') ON CONFLICT DO NOTHING;
INSERT INTO crm_orders (id,lead_id,offer_version_id,idempotency_key,organization_id,contact_id,owner_id,service_key,vat_rate,vat_basis,starts_on,terms,payment_terms,total_net,confirmed_by) VALUES
('17000000-0000-4000-8000-000000000020','14000000-0000-4000-8000-000000000003','16000000-0000-4000-8000-000000000020','seed-1ca-order','12000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','osaaminen',25.5,'yleinen','2027-01-20','TESTI-ehdot','14 pv netto',2400,'10000000-0000-4000-8000-000000000001') ON CONFLICT DO NOTHING;

-- Yhteyshenkilöt 1C-B: titles, organisation-scoped roles, key person and interests for a few synthetic contacts; others stay without details.
UPDATE crm_contacts SET interests = '{ai,safety}', contact_verified_at = now() - interval '30 days', contact_verified_by = '10000000-0000-4000-8000-000000000001' WHERE id = '13000000-0000-4000-8000-000000000205';
UPDATE crm_contacts SET interests = '{leadership}', contact_verified_at = now() - interval '400 days', contact_verified_by = '10000000-0000-4000-8000-000000000002' WHERE id = '13000000-0000-4000-8000-000000000206';
INSERT INTO crm_contact_affiliations (contact_id,organization_id,job_title,roles,is_key_person) VALUES
('13000000-0000-4000-8000-000000000205','12000000-0000-4000-8000-000000000020','Henkilöstöjohtaja','{decision_maker,hr}',true),
('13000000-0000-4000-8000-000000000206','12000000-0000-4000-8000-000000000020','Koulutussuunnittelija','{training_coordinator}',false) ON CONFLICT DO NOTHING;
