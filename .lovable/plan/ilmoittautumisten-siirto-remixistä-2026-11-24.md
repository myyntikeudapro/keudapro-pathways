# Ilmoittautumisten siirto Remixistä

## Mitä tulee käyttöön
- **Ilmoittautuminen kurssin sivulla** (keudapro.fi/kurssit/<nimi>): osallistujan ja laskutuksen tiedot, maksaja (itse / työnantaja), ehtojen ja tietosuojan kuittaus. Paikat varataan, täyden kurssin jälkeen jonotuslista.
- **AI-ohjelmien lomake** (AI Coordinator, Manager, Director): Remixin Lyyti-mallin mukaiset kysymykset (toimiala, maksajavaihtoehdot).
- **Hallinta**: ilmoittautumislista toteutuskerroittain, vahvistus, paikan vapautus, jonosta nosto, osallistujan lisäys.
- **Ryhmän toteutuminen**: ryhmän toteutuspäätös (go / no-go), toteutuksen ja osallistujien siirto tuotantoon, aikataulu ja läsnäolokirjaus.

## Mitä ei tule mukaan
- Verkkomaksu, Paytrail ja Netvisor-laskut (seuraava vaihe). Ilmoittautuja saa vahvistuksen, laskutus hoidetaan toistaiseksi kuten nyt.
- Remixin testiaineisto ja kehitysaikaiset estot.

## Turvarajat
- Lomake näkyy vain kursseilla, joille ilmoittautuminen on erikseen avattu. Oletuksena kaikki kurssit pysyvät yhteydenottopainikkeella.
- M1 jatkaa Lyytissä, ei päällekkäistä ilmoittautumista.
- Ehdot ja tietosuojateksti merkitään "hyväksyntä odottaa", kunnes vahvistat lopulliset tekstit. Ilman sitä lomaketta ei avata julkisesti.
- Ei automaattisia asiakasviestejä ennen hyväksyntääsi.

## Tekninen osuus
- Remixin migraatiot 0017 (registrations/seats/waitlist/parties), 0029–0031, 0034–0036 sovitetaan nykyiseen kaavaan, shop_*-viittaukset poistetaan. Jokaiselle taululle GRANT + RLS; kirjoitukset vain SECURITY DEFINER -funktioilla.
- Komponentit: ProgramRegistrationForm, ProgramRegistrationsPanel, CohortSchedulePanel, AttendancePanel, lib/programForm, cohortSchedule.
- Remixin testit siirretään (ilman live-testejä); läpikäynti kirjautuneena ja kirjautumatta, testirivit poistetaan.
- Tietokantamuutos vaikuttaa heti myös julkaistuun sivustoon (yhteinen tietokanta), mutta ei nykyisiin lomakkeisiin.
