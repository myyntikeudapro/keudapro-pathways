# Yrityskoulutuksen käyttöönottoa edeltävä tarkistus

## Rajaus

Työ tehtiin luonnoksessa **Läpivientitesti TESTI Oy**. Luonnoslistaus vahvisti oman testitietokannan, ja psql-yhteys oli paikallinen (127.0.0.1). TESTI 2 Oy:tä ei muutettu. Ei julkaisemista, luonnoksen hyväksyntää, sähköpostilähetyksiä, laskuja, maksuja, Netvisoria tai Paytrailia.

Erillinen **TESTI 3 Oy – käyttöönoton tarkistus** luotiin db/seed.sql:n esimerkkiriveistä. Käyttötesti tehtiin työtilan painikkeilla ja lomakkeilla; tietorajausten kielteiset kokeet tehtiin kirjautuneiden käyttäjien nykyisen Supabase-asiakkaan kautta.

## Toteutunut ketju

1. Heikki: testitarjous 2 400 € hyväksyttiin. Tilaus vahvistettiin päivälle 24.11.2026.
2. Heikki: ohjelma tallennettiin ja hyväksyttiin, vastuukouluttaja sekä Satu nimettiin ja tilaus kytkettiin.
3. Satu: kapasiteetti tallennettiin ja hyväksyttiin kouluttajan puolesta (12 osallistujaa).
4. Satu: määrä muutettiin 13:een. Uusi versio oli hyväksymättä ja hyväksyntä uusittiin. Tapahtumat kirjautuivat Satun käyttäjälle.
5. Heikki: vastuukouluttaja vaihdettiin pois kouluttaja-testiltä. Uusi versio vaati ohjelman ja kapasiteetin hyväksyntää.
6. Kouluttaja: siirrettyä ohjelmaa ei voinut lukea eikä hyväksyä (403). Asiakas-, yhteys-, tilaus- ja tarjoushaut palauttivat nolla riviä.
7. Heikki palautti kouluttajan ja hyväksyi ohjelman. Kouluttaja tallensi ja hyväksyi kapasiteetin itse.
8. Heikki luovutti tuotantoon. Odotus näkyi Tilannekeskuksessa ja sen linkki avasi TESTI 3 Oy:n asiakaskortin. Satu vastaanotti luovutuksen.
9. Satu: automaattinen koko päivän sessio poistettiin. Kaksi sessiota olivat klo 9–12 ja 12–15. Session muokkaus, varauksen peruutus ja saman kouluttajan uudelleenvaraus tarkistettiin.
10. Satu: viimeinen avoin kriittinen tehtävä esti aloitusvalmiuden. Kolmen kriittisen tehtävän kuittauksen jälkeen toteutus oli aloitusvalmis, vaikka valinnaisia tehtäviä jäi avoimeksi.
11. Satu: osallistujat A ja B lisättiin; B poistettiin aktiiviselta listalta säilyttäen historia.
12. Kouluttaja: aamupäivän toteuma kirjattiin puhelinnäkymässä. Laskutusvalmius pysyi epätotena.
13. Satu: iltapäivän toteuma kirjattiin. Laskutusvalmius vaihtui todeksi, säilyi uudelleenlatauksessa ja toteutus näkyi laskutusvalmiiden työjonossa. Maksutila jäi Ei laskutettu.

## Korjatut puutteet

- Helsinki-ajan kentät riippuivat selaimen aikavyöhykkeestä. Nyt ohjelmat, harjoitusvuorot, sessiot ja käsin asetettavat määräajat käyttävät yhteistä Helsinki-muunnosta. Kesäaika huomioidaan; kellonsiirron puuttuvat tai kaksiselitteiset kellonajat hylätään.
- Uuden tavallisen testiasiakkaan lisäys arvioi päivitykselle tarkoitettua omistajatarkistusta. Käyttäjän erillisellä luvalla tallennustarkistus korjattiin luonnoksen migraatiossa 0031. Ohjelmakytkentää ei edelleenkään voi muuttaa suoralla asiakaspäivityksellä (403 COMPANY_RPC_REQUIRED).
- Virtaustaulu piilotti luovutusta tai vastaanottoa odottavan tilauksen, jos toteutus oli jo luotu. Odotusta ei enää ohiteta tällä perusteella.
- Sessioilta puuttuivat muokkaus ja poisto sekä kouluttajavarauksilta peruutus. Toiminnot lisättiin; kirjattujen toteumien sessioita ei muokata tai poisteta näillä painikkeilla.
- Saman kouluttajan uudelleenvaraus peruutuksen jälkeen yritti tehdä kaksoiskappaleen. Nykyinen varaus palautetaan aktiiviseksi.
- Osallistujalistalta puuttui poistotoiminto. Poisto on nyt pehmeä: historia säilyy.
- Valmistelutehtävien määräpäiväkentät katkesivat 320 px puhelinnäkymässä. Kenttä siirrettiin omalle rivilleen.

## Varmennus

- Ohjelman klo 9–15 tallennus UTC-selaimella palautui samoina Helsinki-kellonaikoina. Olemassa olevien ohjelmien kentät olivat samat UTC-, Helsinki- ja New York -selaimissa. Aiemmin tallennettuja vääriä aikoja ei muutettu automaattisesti.
- Punainen tarjous (16 vrk), keltainen tarjous (8 vrk) sekä vihreät tyhjät vaiheet nähtiin taulussa. Tarjous- ja luovutuslinkit avasivat oikean asiakkaan. Luovutuksen punainen raja tarkistettiin laskentatestillä, ei päivämäärää muuttamalla.
- Kouluttajan näkymä näyttää oman yrityksen nimen; yhteys- ja myyntitietoja ei saatu. Kirjautumaton ohjautuu kirjautumissivulle.
- Satun 320/390/987 px ja kouluttajan 390 px näkymät tarkistettiin. Ei sivun vaakaylivuotoa. Fyysistä puhelinta tai sen näppäimistöä ei käytetty.
- 103 kohdennettua testiä läpäisi. Esikatselun uusin rakentumistulos: build OK.

## Laskutusvalmiuden lisäsuojaus – korjattu erillisellä luvalla

Tarkistus löysi mahdollisuuden merkitä keskeneräinen koulutus käsin laskutusvalmiiksi sekä kirjata tulevaisuuden session toteuma. Aiemmassa TESTI Oy:ssä oli jo tulevaisuuden session toteuma. Käyttäjän erillisellä luvalla migraatio 0032 korjasi suojauksen tässä luonnoksessa.

Varmennetut kielteiset ja palautuskokeet TESTI 3 Oy:llä:
- Tulevan session lisäys poistaa laskutusvalmiuden.
- Tulevaisuuden toteuma estyy (PROD_SESSION_NOT_ENDED).
- Käsin liian aikainen laskutusvalmius estyy (PROD_BILLING_ACTUALS_REQUIRED).
- Tulevan session poisto palauttaa oikean valmiuden.
- held=false tai toteuman poisto poistaa laskutusvalmiuden.
- Toteuman korjaus/palautus palauttaa laskutusvalmiuden.
- Näkymä vahvisti takaisinluetun valmis-tilan; maksutila pysyi Ei laskutettu.

Vanhoja virheellisiä testitietoja ei muutettu. Niiden valmis-merkintä ei enää pääse laskutusvalmiiden työjonoon; ristiriita näytetään punaisena taulussa ja toteutuksen laskutusosiossa. TESTI 2 Oy pysyi koskemattomana.

Ennakkomaksullisten tilausten toimintatapa on valmisteltava erikseen: maksuehto tallennetaan tilaukselle, mutta tämä testattu vaihe käsittelee koulutuksen jälkeistä laskutusvalmiutta. Valmiiksi merkitseminen ei lähetä laskua. Fyysisen puhelimen näppäimistö jäi käyttäjän kokeiltavaksi.

TESTI 3 Oy ja liikennevalojen esimerkkitarjoukset jäävät tähän luonnokseen. Luonnoksen data ei siirry sovellukseen hyväksymisessä. Mitään ei julkaistu tai hyväksytty; käyttöönotto vaatii käyttäjän erillisen päätöksen.