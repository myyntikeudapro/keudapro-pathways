# Tilausten ja laskutuksen vakautus – luonnoksen hyväksyntäraportti

27.11.2026. Kohde: **Tilausten ja laskutuksen vakautus**. Työ tehtiin vain luonnoksen erillisessä tietokannassa synteettisillä asiakkailla ja testikäyttäjillä. Pääprojektia ei hyväksytty, sivustoa ei julkaistu eikä oikeita tilauksia kirjattu.

## 1. Toteutetut muutokset

### Tietoinen ALV
- Tilausvahvistuksen ALV alkaa tyhjänä. Hyväksytyn tarjouksen ALV näytetään vain vertailuna.
- Yleinen: täsmälleen 25,5 %. Koulutus veroton ja käännetty: 0 % sekä pakollinen perusteteksti. Muu: nimenomainen 0–100 % kanta ja pakollinen peruste; tyhjä kenttä ei muutu nollaksi.
- Palvelin validoi valinnan, kannan ja perusteen. Vahvistajan tunniste tulee kirjautumisesta, ei selaimen ilmoittamana.
- Synteettisen 900 € nettotarjouksen ALV on 229,50 €, yhteensä 1 129,50 €.

### Hyväksytty tarjous ja tilaus
- Esitäyttö tulee uusimmasta asiakkaan hyväksymästä tarjousversiosta ja sen riveistä, ei pelkästä tarjouksen Hyväksytty-tilasta.
- Vertailussa ovat summa, sisältö, rivit, ALV-käsittely/kanta/peruste, alku- ja loppupäivä, sopimus- ja maksuehdot sekä laskutustapa ja erät.
- Tyhjä ja puuttuva teksti sekä merkityksettömät välilyönti-/rivinvaihtoerot normalisoidaan. Rivit järjestetään rivinumeron mukaan ja numerot käsitellään numeroina.
- Poikkeama vaatii **Asiakas hyväksynyt muutoksen**, hyväksymistavan ja viitteen. Jokainen sopimuskentän muutos tyhjentää poikkeaman hyväksyntävalinnan uudelleen.
- Palvelin laskee erot itse. Identtinen tilaus viittaa alkuperäiseen versioon; poikkeava tilaus saa uuden hyväksytyn version. Alkuperäistä hyväksyttyä versiota tai sen rivejä ei muokata.
- Tilaus säilyttää alkuperäisen version viitteen, palvelimen laskemat erot sekä hyväksymistavan, viitteen, vahvistajan ja ajan. Historia näkyy nykyisen asiakaskortin Tilaukset- ja Historia-osioissa.
- Ostaja ja yhteyshenkilö tulevat nykyisestä vahvistetusta asiakasvalinnasta. Y-tunnus tarkistetaan; nimiä ei käytetä yrityksen perustamiseen. Asiakasvalinnan muutos tai uudempi hyväksytty tarjous estää vanhentuneen vahvistuksen.
- Sama tallennustunnus palauttaa saman tilauksen. Muuttunut pyyntö samalla tunnuksella hylätään. Eri tunnuksilla tehdyt rinnakkaiset vahvistukset eivät luo kahta tilausta samasta tarjouksesta.

### Tilauspohjainen laskutusjono
- Yhteinen `orderBillingQueue` käy läpi tilaukset ja sopimuksen erät. Toteutusta ei vaadita eikä usea toteutus monista erää.
- Sama laskenta käytössä virtaustaulussa, tilannekeskuksen laskutusluvussa ja sen linkissä, Tuotannon Laskutusvalmiit-osiossa sekä asiakaskortin määrässä.
- Ilman toteutusta näkyy **Toteutus ei vielä tuotannossa**. Linkki avaa nykyisen asiakaskortin Tilaukset-osion, tarvittaessa myyntikortin.
- Tilannekeskuksen palvelu-/vastuurajaus ja tarkasteluhetki kulkevat linkitettyyn jonoon. Erääntyminen käyttää Helsingin kalenteripäivää.
- Tuleva, käsin laskutetuksi/maksetuksi merkitty tai peruutettu erä ei tule jonoon. Puuttuva suunnitelma jää vahvistamattomaksi; virheellinen tai muuttunut suunnitelma vaatii tarkistuksen.
- Alkaessa/osissa/päättyessä säilyvät sopimuskohtaisina vaihtoehtoina. Tuotannon toteumat, laatu ja koulutuksen valmistuminen pysyvät erillisinä.

## 2. Tietorakenteen muutokset ja hyväksynnässä siirtyvä sisältö

Luonnoksessa kirjattiin kaksi additiivista muutosta migraatiotyökalulla:

- `0042_order_approval_safety`: tarjousversion ALV-perusteteksti; tilauksen ALV-peruste, alkuperäisen version viite, poikkeamat ja hyväksyntänäyttö, sopimuksen laskutustapa/erät sekä peruutusaika. Ei uutta rinnakkaista asiakas- tai sopimusrekisteriä. Nykyistä vahvistustoimintoa laajennettiin; vanha pyyntö hylätään uudelleenlatausohjeella. Alempi vanha `crm_confirm_order` ei enää ole henkilöstön suoraan kutsuttavissa, jotta ALV-valintaa ei voi ohittaa.
- `0043_order_billing_readiness`: nykyinen laskutussuunnitelman luku huomioi tilauksen peruutuksen ja puutteelliset/virheelliset suunnitelmat myös ilman toteutusta.

Todellinen tietokanta tarkistettiin muutosten jälkeen: kaikki 10 uutta tilauskenttää löytyivät, tarjousversion ALV-peruste löytyi, uusi peruutustarkistus oli palvelintoiminnossa, ja suora alemman vahvistustoiminnon kutsuoikeus oli poistettu. Tilausten ja laskutustaulujen rivikohtaiset suojaukset pysyvät päällä. Generoidut tyypit päivitti migraatiotyökalu; generoitua client-koodia ei muokattu.

**Hyväksyntä tuo sovellukseen koodin ja nämä tietorakenteen/sääntöjen muutokset automaattisesti. Luonnoksen omat asiakkaat, tilaukset ja testitulosten rivit eivät siirry sovelluksen tietoihin.** Esimerkkitiedosto säilyy kehityskoodissa tulevia eristettyjä luonnoksia varten, mutta ei ole tuotantoon ajettava tietomigraatio. Kummassakaan muutoksessa ei ole oikean asiakastiedon päivitystä tai täyttöä.

Uudet arkkitehtuurisäännöt tallennettiin `src/lib/AGENTS.md`:hen; root-ohjeen jo valmiiksi ylittäneen kokobudjetin vuoksi käyttäjän aiempia sääntöjä ei lyhennetty tai siirretty.

## 3. Automaatti-, palvelin- ja selaintestit

### Pysyvät automaattitestit: 209/209 läpi, 20 tiedostoa
- Uusia pieniä sääntötestejä: `orderReview.test.ts` (26) ja `billingQueue.test.ts` (14).
- Mukana ALV:n neljä vaihtoehtoa, 900 € / 25,5 % laskenta, jokainen erillinen poikkeamakenttä, tyhjät tiedot, normalisointi, rivisumma ja sopimuspäivät.
- Laskutus: erääntynyt alkuerä ilman toteutusta → täsmälleen yksi rivi; sama tunniste tuotantojonossa, virtaustaulussa ja sopimuslaskennassa; useita toteutuksia → ei monistusta; tuleva/laskutettu/maksettu/peruttu pois; puuttuva suunnitelma vahvistamatta; omistaja/palvelurajaus.
- Helsinki-talvipäiväraja 22.00 UTC ja kesäpäiväraja 21.00 UTC. Alkaessa, osissa ja päättyessä aiemmat testit läpäisivät.
- Regressiot kattavat Asiakkaat, yhteyshenkilöt, myynti-/tuotantotyönkulun, tuotantotaulun, Gantt-laskennan, päivän työn, sessiot, tilamerkinnät, tilannekeskuksen ja Helsinki-ajat.

### Todelliset palvelinpyynnöt: 27/27 hyväksyntäkoetta läpi
Pysyvä komento: `python3 scripts/test-order-safety.py`. Skripti kieltäytyy muusta kuin eristetystä localhost-tietokannasta; testiaineisto tulee `db/seed.sql`:stä. Viimeinen kokonainen ajo käytti tuoretta synteettistä 400-sarjan aineistoa.

- Admin, editor ja toinen editor vahvistivat sallittuja tilauksia. Kouluttaja ja kirjautumaton estettiin; asiakas-/tarjous-/laskutustietojen luku ei paljastanut rivejä heille.
- Puuttuva ALV, väärät kannat, puuttuvat perusteet ja nimenomainen Muu-kanta testattiin oikeilla vahvistuspyynnöillä.
- Jokainen olennainen poikkeamatyyppi kokeiltiin ilman hyväksyntää ja hyväksynnän kanssa. Myös tyhjä viite estettiin.
- Alkuperäisen hyväksytyn version ja rivien muuttumattomuus verrattiin ennen/jälkeen. Suorat muokkausyritykset estettiin.
- Identtinen tilaus, saman tunnuksen uudelleenlähetys, muuttunut pyyntö, sama/e­ri tallennustunnus rinnakkain, muuttunut asiakasvalinta sekä uudempi hyväksytty tarjous testattiin.
- Erääntynyt alkuerä ilman toteutusta, puuttuva suunnitelma, laskutetuksi/maksetuksi merkintä, tulevan erän merkinnän esto, peruttu tilaus sekä laskutussuunnitelman rinnakkaisuus ja uudelleenlähetys testattiin.

### Kirjautunut selainkoe: läpi
- Synteettinen editor avasi 900 € + 25,5 % / 2 h Teams / päättyessä -tarjouksen. ALV oli tyhjä ja muut tiedot esitäytetty.
- Identtinen tilaus tallennettiin selaimen kautta ja luettiin takaisin.
- Toinen tarjous muutettiin 950 euroon ja laskutukseen alkaessa. Painike pysyi estettynä ennen hyväksyntänäyttöä. Vahvistuksen jälkeen tilaus ja poikkeamahistoria näkyivät asiakaskortilla.
- Laskutusjono ilman tuotantototeutusta avautui ja sen linkki vei asiakaskortin Tilaukset-osioon.
- Lopullisessa vertailussa synteettisen aineiston **80 erää** näkyi samalla määrällä virtaustaulussa, tilannekeskuksen luvussa, linkitetyssä jonossa ja kyseisen asiakkaan kortilla. Aiempi yksittäisen tilauksen sääntötesti varmisti täsmälleen yhden rivin.
- Desktop 1280 px, mobile 390 px ja 320 px tarkistettiin kuvakaappauksista. Poikkeamat asettuvat puhelimella allekkain, 320 px sivulle ei syntynyt vaakasuuntaista ylivuotoa. Tyhjä Muu-verokanta pysyi tyhjänä ja vahvistus estettynä.
- Myynnin kanban, Asiakkaat, tuotannon Gantt ja Päivän työ avautuivat. Ei JavaScript-ajovirheitä eikä asiakas-/myynti-/tuotanto-/palvelinpyyntöjen käyttöoikeusvirheitä.
- Viimeinen koostamisloki: **build OK**. Koostamista tai tyyppitarkistusta ei käynnistetty käsin.

## 4. Turvallisuus ja sivuvaikutusten esto

- Vain synteettiset `example.com`-käyttäjät ja esimerkkiorganisaatiot. Käyttäjän sähköpostia ei lisätty aineistoon. Ei Attendon oikeita kirjauksia.
- Palvelinkokeet käyttävät vain `127.0.0.1:8001`-osoitetta ja varmistavat eristetyn tietokantayhteyden ennen kirjoituksia.
- Ei oikeita sähköposteja, laskuja, maksuja, Netvisor-kutsuja, tuotantoajastuksia tai AI-mallikutsuja. Poikkeaman hyväksyntä ei tule AI:ltä.
- Nykyiset suojatut henkilöstöroolit, vahvistettu ostajavalinta ja käyttäjän palvelinidentiteetti säilyvät. Ei auth-taulujen rakenteen muutoksia.
- Testit käyttävät olemassa olevan esimerkkitiedoston testikäyttäjiä; uuden käyttäjän perustamista oikeaan sovellukseen ei tehty.
- Hyväksyttyjen tarjousversioiden muuttumattomuussuojia ei heikennetty. Uusia julkisia kirjoitusoikeuksia ei lisätty.
- Laajaa turvatarkastusta ei tässä luonnoksessa ajettu; se on käyttöönoton ehto pääprojektissa.

## 5. Rajoitteet ja GO/NO-GO

**GO luonnoksen hyväksynnälle** tämän rajatun toteutuksen ja yllä lueteltujen kokeiden perusteella.

**NO-GO oikeiden tilausten pilotille nyt**, kunnes kohdan 6 käyttöönottoehdot täyttyvät.

Jäljellä olevat rajoitteet:
- Vanha tarjous, jolla on vain Hyväksytty-tilamerkintä mutta ei ihmisen hyväksymää tarjousversiota/rivejä, ei enää kelpaa tilauksen lähteeksi. Tämä on tarkoituksellinen turvaraja; vanhaa aineistoa ei automaattisesti hyväksytty tai muutettu.
- Molemmat sopimuspäivät on vahvistettava. Puuttuvan tiedon täydentäminen näkyy poikkeamana ja tarvitsee hyväksyntänäytön.
- Vanhat tilaukset säilyvät, mutta uusien poikkeamatietojen historiaa ei keksitä niille jälkikäteen. Puuttuva suunnitelma näytetään vahvistamattomana.
- Nykyinen perutun toteutuksen laskutuksen estävä sääntö säilytettiin; myös tilauksen peruutusaika huomioidaan. Erillistä peruutustoimintoa ei lisätty.
- Usean toteutuksen erä deduplikoidaan yksikkötestissä. Paikallisessa esimerkkiaineistossa löytyi myös samaan tilaukseen kytkettyjä toteutusrivejä; niitä ei käytetä erän määrän kertoimena.
- Selainkokeissa aiemmin havaittu **403 koskee vain paikallisen esikatselun kirjasintiedostoja** (`/@fs/persist/node_modules/@fontsource/...`), ei tietojen käyttöoikeuksia. Se on eristetyn esikatselun aiempi ympäristörajoite; sovelluksen käyttöoikeuksia ei laajennettu sen vuoksi.
- Tästä luonnoksesta ei varmennettu julkaistua versiota, oikeiden käyttäjien käyttöä tai varmuuskopioita.
- Esimerkkikokeiden tuoreiden aineistopoolien loppuessa käytetään uutta eristettyä luonnosta; testit eivät tyhjennä tai palauta oikeaa sovellusta.
- Vanha `test-workspace-continuation.py` käyttää vanhaa vahvistuspyyntöä eikä ole tämän uuden tilausrajapinnan hyväksyntäkomento. Tämän erän rajat testataan uudella `test-order-safety.py`:llä ja 209 regressiolla.

## 6. Täsmälliset käyttöönoton ehdot

1. Käyttäjä hyväksyy tämän luonnoksen erikseen. Hyväksyntä tuo myös kaksi kirjattua tietorakenteen/sääntöjen muutosta sovellukseen; esimerkkirivit eivät siirry.
2. Hyväksynnän jälkeen tarkistetaan molempien muutosten toteutuminen todellisesta tietorakenteesta ja uuden tilausvahvistuksen oikeudet. Vanhaa ja uutta vahvistuslomaketta ei käytetä rinnakkain.
3. Pääprojektissa tehdään tuore pikatarkastus ja laaja turvatarkastus; kriittiset havainnot käsitellään ennen käyttöönottoa.
4. Käyttäjä vahvistaa viimeisimmän onnistuneen varmuuskopion **UTC-ajan**, **palautusvastuuhenkilön** sekä sovitun vienti-/palautusvalmiuden. **Nämä ovat edelleen varmentamatta; niitä ei tarkistettu tässä työssä.** Palautuskoe tehdään vain erillisessä ympäristössä.
5. Sivuston julkaisu vaatii erillisen luvan. Sen jälkeen Heikki ja Satu tarkistavat omilla kirjautumisillaan Myynti-, Asiakkaat- ja Tuotanto-näkymät.
6. Aito pilotointi aloitetaan vasta edellisten ehtojen jälkeen erillisellä käyttäjän luvalla. Ihminen tarkistaa hyväksytyn lähdeversion, Y-tunnuksen, yhteyshenkilön, ALV:n, summan, sopimuspäivät, laskutustavan ja kaikki mahdolliset muutoksen hyväksyntäviitteet. Ei automaattisia viestejä, laskuja tai maksuja.

Ei toteutettu: uusia vastuu-/luovutusjonoja, 1C-C:tä, henkilönimen hallittua poikkeuskorjausta tai muita raportin jatko-ominaisuuksia.
