# Yrityskoulutuksen työnkulun siirto remixistä keudapro.fi-projektiin

## Tärkeä huomio ennen hyväksyntää
Tämän projektin esikatselu ja julkinen keudapro.fi käyttävät **samaa tietokantaa**. Tietokantamuutokset tulevat siis voimaan julkisella sivustolla heti, vaikka sivustoa ei julkaistaisi. Näkymät ja sivut tulevat julkisiksi vasta julkaisussa.

Remixin tietokanta on kehittynyt erilleen (55 muutosta vs. tämän projektin 17). Yrityskoulutus ei toimi yksinään, vaan se tarvitsee pohjaksi:
- tilaukset ja tarjousversiot (CRM-tilausmalli)
- kouluttaja-käyttäjäroolin
- tuotannon ytimen (toteutukset, sessiot, tehtävät, resurssit, varaukset)
- asiantuntijarekisterin ja toimeksiannot (kouluttajakapasiteetti)
- Muutosturvan työnkulusta yhden apuoikeustarkistuksen

## Mitä siirretään
1. **Tietokanta** (yksi tarkistettu kokonaisuus, vain rakenne, ei testidataa):
   - CRM-tilausmalli, kouluttajarooli, tuotannon ydin, asiantuntijarekisteri
   - yrityskoulutuksen taulut, toiminnot ja oikeudet (remixin muutokset 0046–0053)
   - Muutosturvan työnkulusta vain se osa, jota yrityskoulutus tarvitsee
2. **Näkymät**: CompanyTrainingSales CRM:ään, kouluttajan kapasiteettinäkymä, /admin/tuotanto, kapasiteettisäännöt ja suomenkieliset tilat, testit.
3. **Kirjautuminen**: /admin/forgot-password ja /admin/reset-password.

## Mitä EI siirretä
- Remixin kehitysajan lukitukset (sähköpostijonon ja markkinointiseurannan esto) — ne pysäyttäisivät tuotannossa vahvistusviestit ja seurannan.
- Kauppa, Paytrail, Netvisor, kurssikatalogi/ilmoittautuminen, tekoälyehdotukset, kohorttien tuonti, laskutus.
- Remixin raportit, evidenssit ja testidata.

## Turvallisuus
- Remixin SQL ajetaan ensin läpi tämän projektin olemassa olevaa rakennetta vasten (esim. jo olemassa oleva tarjoustaulu ja omistajasäännöt), ristiriidat korjataan lisäävin muutoksin, mitään olemassa olevaa ei poisteta.
- Uudet taulut lukittu henkilökunnalle; kouluttaja näkee vain omat ohjelmansa.
- Tietoturvaskannaus ja testit ennen raportointia. Julkaisu vain luvallasi.

## Tekninen
- Riippuvuusketju: 0012, 0013, 0014, 0015, 0016, 0018 (osittain), 0022, 0023, 0044–0053 (karsittuna).
- Remixin migraatiot 0010/0011/0027/0028 jätetään pois.
- Koodi: CompanyTrainingSales, CompanyTrainingProduction, CompanyProgrammeEditor, companyTraining*.ts, expertCapacity.ts, AdminProductionPage, salasanasivut, reitit.
