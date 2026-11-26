-- Example data for company-training user tests (invented @example.com accounts only).
INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,email_change,email_change_token_new) VALUES
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000001','authenticated','authenticated','heikki-testi@example.com',extensions.crypt('Testi-Heikki-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:00+00',now(),'{"provider":"email","providers":["email"]}','{}','','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000002','authenticated','authenticated','satu-testi@example.com',extensions.crypt('Testi-Satu-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:01+00',now(),'{"provider":"email","providers":["email"]}','{}','','','',''),
('00000000-0000-0000-0000-000000000000','10000000-0000-4000-8000-000000000003','authenticated','authenticated','kouluttaja-testi@example.com',extensions.crypt('Testi-Kouluttaja-2026',extensions.gen_salt('bf')),now(),'2026-01-01 08:02+00',now(),'{"provider":"email","providers":["email"]}','{}','','','','');
INSERT INTO auth.identities (id,user_id,provider,provider_id,identity_data,created_at,updated_at) VALUES
(gen_random_uuid(),'10000000-0000-4000-8000-000000000001','email','10000000-0000-4000-8000-000000000001','{"sub":"10000000-0000-4000-8000-000000000001","email":"heikki-testi@example.com"}',now(),now()),
(gen_random_uuid(),'10000000-0000-4000-8000-000000000002','email','10000000-0000-4000-8000-000000000002','{"sub":"10000000-0000-4000-8000-000000000002","email":"satu-testi@example.com"}',now(),now()),
(gen_random_uuid(),'10000000-0000-4000-8000-000000000003','email','10000000-0000-4000-8000-000000000003','{"sub":"10000000-0000-4000-8000-000000000003","email":"kouluttaja-testi@example.com"}',now(),now());
INSERT INTO user_roles (user_id,role) VALUES
('10000000-0000-4000-8000-000000000001','editor'),
('10000000-0000-4000-8000-000000000002','editor'),
('10000000-0000-4000-8000-000000000003','trainer');
INSERT INTO exp_experts (id,user_id,name,kind,region) VALUES
('11000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','Kouluttaja Testi','sisäinen','Uusimaa');
INSERT INTO prod_templates (key,name,description) VALUES
('yrityskoulutus_tilaus','Yrityskohtainen tilauskoulutus','Satu hyväksynyt 25.11.2026. Tehtävät 1–3 estävät aloituksen.');
INSERT INTO prod_template_tasks (template_key,scope,code,title,owner_role,anchor,offset_days,blocks_start,sort_order) VALUES
('yrityskoulutus_tilaus','specific','yk_sisalto','Sisältö ja tavoitteet vahvistettu tilaajan kanssa','production','first_session',-14,true,1),
('yrityskoulutus_tilaus','specific','yk_kouluttaja','Kouluttaja nimetty ja vahvistanut ajat','production','first_session',-14,true,2),
('yrityskoulutus_tilaus','specific','yk_paikka','Paikka tai Teams-linkki sovittu','production','first_session',-7,true,3),
('yrityskoulutus_tilaus','specific','yk_osallistujat','Osallistujalista pyydetty tilaajalta','production','first_session',-7,false,4),
('yrityskoulutus_tilaus','specific','yk_materiaalit','Materiaalit valmiina','trainer','first_session',-3,false,5),
('yrityskoulutus_tilaus','specific','yk_kutsu','Kutsu ja käytännön ohje tilaajalle','production','first_session',-5,false,6),
('yrityskoulutus_tilaus','specific','yk_lasnaolot','Läsnäolot kirjattu','trainer','last_session',0,false,7),
('yrityskoulutus_tilaus','specific','yk_palaute','Palaute kerätty','production','last_session',7,false,8),
('yrityskoulutus_tilaus','specific','yk_todistukset','Todistukset ja materiaalit toimitettu','production','last_session',7,false,9);
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000001','TESTI Oy – yrityskohtainen koulutus','10000000-0000-4000-8000-000000000001');
INSERT INTO crm_contacts (id,organization_id,name,email,phone) VALUES
('13000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','Tiina Tilaaja','tiina.tilaaja@example.com','+358 40 000 0000');
INSERT INTO booking_requests (id,name,email,phone,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000001','Tiina Tilaaja','tiina.tilaaja@example.com','+358 40 000 0000','TESTI Oy – yrityskohtainen koulutus','Teams-palaveri','TESTI: yrityskohtainen koulutus läpivientitestiin.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001');
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000002','TESTI 2 Oy – yrityskohtainen koulutus','10000000-0000-4000-8000-000000000001');
INSERT INTO crm_contacts (id,organization_id,name,email,phone) VALUES
('13000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000002','Tero Tilaaja','tero.tilaaja@example.com','+358 40 000 0001');
INSERT INTO booking_requests (id,name,email,phone,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000002','Tero Tilaaja','tero.tilaaja@example.com','+358 40 000 0001','TESTI 2 Oy – yrityskohtainen koulutus','Teams-palaveri','TESTI 2: puhdas yrityskoulutuksen läpivientitesti.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002');

-- Pre-launch checks: separate examples, never modify TESTI 2 Oy.
INSERT INTO crm_organizations (id,name,owner_id) VALUES
('12000000-0000-4000-8000-000000000003','TESTI 3 Oy – käyttöönoton tarkistus','10000000-0000-4000-8000-000000000001'),
('12000000-0000-4000-8000-000000000004','TESTI Virtaus Oy','10000000-0000-4000-8000-000000000001');
INSERT INTO crm_contacts (id,organization_id,name,email) VALUES
('13000000-0000-4000-8000-000000000003','12000000-0000-4000-8000-000000000003','Teppo Testi','teppo.testi@example.com'),
('13000000-0000-4000-8000-000000000004','12000000-0000-4000-8000-000000000004','Viivi Virtaus','viivi.virtaus@example.com');
INSERT INTO booking_requests (id,name,email,organization,meeting_format,message,source,status,service_key,owner_id,organization_id,contact_id) VALUES
('14000000-0000-4000-8000-000000000003','Teppo Testi','teppo.testi@example.com','TESTI 3 Oy – käyttöönoton tarkistus','Teams-palaveri','Erillinen käyttöönoton tarkistus. Ei oikeita lähetyksiä.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000003'),
('14000000-0000-4000-8000-000000000004','Viivi Virtaus','viivi.virtaus@example.com','TESTI Virtaus Oy','Teams-palaveri','Virtaustaulun keltainen ja punainen esimerkki.','testi','uusi','osaaminen','10000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000004');
INSERT INTO crm_offers (id,lead_id,title,amount,probability,expected_close,status,created_by,created_at) VALUES
('15000000-0000-4000-8000-000000000003','14000000-0000-4000-8000-000000000003','Käyttöönoton testikoulutus',2400,70,'2026-11-26','draft','10000000-0000-4000-8000-000000000001',now());
-- Traffic-light examples on the agent's previous test case, not the user's TESTI 2 Oy.
INSERT INTO crm_offers (id,lead_id,title,amount,probability,expected_close,status,created_by,created_at) VALUES
('15000000-0000-4000-8000-000000000004','14000000-0000-4000-8000-000000000001','TESTI keltainen tarjous',1000,50,'2026-12-01','sent','10000000-0000-4000-8000-000000000001','2026-11-18 06:00+00'),
('15000000-0000-4000-8000-000000000005','14000000-0000-4000-8000-000000000001','TESTI punainen tarjous',1000,50,'2026-12-01','sent','10000000-0000-4000-8000-000000000001','2026-11-10 06:00+00');
