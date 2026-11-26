# Työtilan jatko 1–4 – luonnoksen toteutus ja hyväksymisnäyttö

26.11.2026. Vain luonnos **Työtilan jatko 1–4**. Ei hyväksyntää, julkaisua, palvelintoimintojen tuotantoon toimitusta tai oikeita lähetyksiä.

## Eristys ennen ensimmäistä kirjoitusta
- Luonnoksella on oma paikallinen tietokanta. Yhteyden palvelinosoite tarkistettiin: loopback 127.0.0.1.
- Alkuperäiset kolme käyttäjää ja neljä yhteydenottoa olivat kaikki @example.com-esimerkkejä. Ajastuksia 0, ulkoisten HTTP-kutsujen jono 0.
- Lisättiin erillinen @example.com-pääkäyttäjä sekä synteettiset rajatesti- ja samanaikaisuusesimerkit. Lähettäjän oikeaa sähköpostia ei lisätty.
- Selainkokeissa kaikki ulkoiset verkkopyynnöt estettiin. Sallitut palvelinpyynnöt kohdistuivat luonnoksen paikalliseen palveluun. Oikeita sähköposteja, maksuja, Netvisoria tai mainospalveluja ei kutsuttu.

## 1. Asiakkaat 1A/1B – todennettu läpivienti
- Editorin käyttöliittymässä: liittämätön yhteydenotto → uuden organisaation nimi/Y-tunnus → uusi yhteyshenkilö → vahvistus → organisaation asiakaskortti → hyväksytty tarjous → tilausvahvistuksen ostaja/yhteyshenkilö → tallennus → takaisinluku.
- Pääkäyttäjä: asiakaskortin kuusi välilehteä, haku Y-tunnuksella, olemassa olevan organisaation ja yhteyshenkilön valinta sekä liittäminen.
- Kouluttaja: asiakaskortti estetty, ei laskutuspaneelia. Kirjautumaton ohjataan kirjautumaan. Suorat haku/liittämis/tilaus/laskutuspyynnöt ja rekisterien lukupyynnöt tarkistettu myös palvelimella.
- Sama liittämis- tai tilauspyyntö palauttaa saman tuloksen; muuttunut sisältö samalla tunnuksella hylätään. Kilpaileva asiakaslinkki ei ylikirjoita toista valintaa. Samanaikainen saman Y-tunnuksen perustaminen tuotti yhden organisaation.
- Henkilökohtainen muutosturvatapaus, väärä Y-tunnus ja toisen organisaation yhteyshenkilö estyvät.
- Löydetyt viat korjattu: organisaatiotriggerin sisäinen roolitarkistus ei toiminut tavallisella käyttäjällä; tilausvahvistus saattoi palauttaa aiemman tilauksen samalla tunnuksella mutta eri sisällöllä. Suojattu roolitarkistus ja sisältöön sidottu uudelleenlähetys korjattu.
- Vanha 1A:n eristetyn läpiviennin este suljettu todellisen näytön perusteella, ei synteettisten lukuvastausten perusteella.

## 2. Projektikohtainen sopimuslaskutus
- Nykyiseen vahvistettuun tilaukseen sidottu suunnitelma: alkaessa, osissa tai päättyessä. Ei rinnakkaista CRM:ää.
- Vanhoille tilauksille ei luoda oletusta. Puuttuva suunnitelma näkyy **Laskutustapa vahvistamatta** eikä tuota laskutusvalmiita eriä.
- Alkaessa/päättyessä erä käyttää tilauksen alv 0 % kokonaisarvoa ja sopimuksen alku-/loppupäivää. Erääntyminen lasketaan Europe/Helsinki-kalenteripäivästä, ei selaimen aikavyöhykkeestä.
- Osissa: 1–100 positiivista senttitarkkaa erää, kelvolliset laskutuspäivät aikajärjestyksessä, täsmälleen sama yhteissumma kuin tilauksen alv 0 % arvo. Sopimus voi määrätä erän ennen koulutusta tai sen jälkeen; ylimääräistä aikarajausta ei oleteta.
- Palvelin lukitsee tilauksen, tarkistaa version ja pyyntötunnuksen, päivät, summat sekä käyttäjän admin/editor-roolin. Suorat asiakaskirjoitukset suunnitelmiin/eriin eivät muuta tietoja.
- Muuttunut tilausarvo tai sopimuspäivät sulkevat valmiuden, kunnes suunnitelma vahvistetaan uudelleen. Peruttu toteutus ei ole laskutusvalmis.
- Käsin laskutetuksi/maksetuksi merkitty erä poistuu avoimesta jonosta. Tulevaa erää ei saa merkitä laskutetuksi; suunnitelmaa ei voi korvata, kun siinä on käsin tehtyjä merkintöjä. Merkintä ei lähetä laskua.
- Asiakas-, myynnin tilaus- ja tuotantokortti käyttävät samaa paneelia/laskentaa; Laskutusvalmiit ja linkitetyt jonot käyttävät samoja eräsääntöjä. Nykyinen jono näyttää toteutuksiin liitetyt tilaukset; ilman toteutusta olevan tilauksen suunnitelma näkyy asiakas-/tilauskortilla.
- Toteumien tarkistus ja laatupoikkeamat säilyvät erillään: ennakkolaskutus ei päätä tai piilota keskeneräistä koulutusta.

## 3. Julkisen AI-käytön suojaus ja palautusvalmius
- growth-checkup, smart-search, veli-coach-chat ja chat suojattu yhteisellä palvelinrajalla ennen nykyistä AI-kutsua.
- POST, tunnistetut alkuperät, todellisten tavujen raja (4 096 / 24 000 / 48 000), rajattu syöterakenne, 1–20 keskusteluviestiä, 2 000 merkkiä/viesti; virheellistä viestiä ei enää hiljaisesti poisteta.
- Nykyisen PKS:n tietokantapohjaisen ad-hoc-ratkaisun malli: 10 hyväksyttyä pyyntöä/kävijä/tunti, 400 pyyntöä/tunti yhteensä näille neljälle. PKS:n kapasiteetti on erillinen. Vain palvelin saa kuluttaa rajaa. Puuttuva avain, epäonnistunut rajatarkistus, false tai virhe eivät käynnistä mallikutsua.
- Raakaa IP:tä tai keskustelua ei tallenneta. Päivittäin vaihtuva hajautettu kävijätunniste on pseudonyymi, ei vahva anonymisointi. Välityspalvelimen IP-otsakkeen luotettavuus on varmistettava käyttöönotossa; yhteinen 400/h-raja on kiertämisen kova takaraja.
- Smart-search käyttää palvelimella generoituja julkisia sivustokohteita: asiakkaan lähettämä indeksiteksti tai URL ei määrää mallin tietopohjaa tai tuloslinkkiä. Julkisen hakemiston generointi lisätty rakennuksen alkuun.
- Chatin turha staff-portti poistettu vain tästä julkisesta avustajasta; muut henkilöstötoiminnot säilyvät suojattuina. Julkiset sivut eivät tarvitse henkilöstön kirjautumista näihin neljään toimintoon.
- Nykyiset mallit, maksimitokenit, promptit ja JSON/SSE-siirtotapa säilytetty. SDK-ohje oli luettu; mallikutsujen toteutusta ei vaihdettu. Kulurajatesti käytti test doubles -vastauksia, ei maksullista mallikutsua.
- Sekä pika- että syvätarkastusta yritettiin: kumpikin työkalu ilmoitti, ettei luonnosten tarkastus ole tuettu. Tuoretta automaattista turvaluokitusta ei siis ole eikä vanhoja varoituksia merkitty ratkaistuiksi. Paikallinen lähdekoodin tarkistus ja rajatestit tehty.

### Palautuksen neljä erillistä kohdetta
| Kohde | Menettely ja todennettava näyttö | Tässä tehty |
|---|---|---|
| Lähdekoodi | Säilytä tarkistettu commit; palauta aiempi yhteensopiva koodiversio erilliseen testikohteeseen, varmista kirjautuminen ja julkiset sivut ennen tuotannon hyväksyntää | Paikallinen historia/tarkistettava muutos; ei tuotannon palautusta |
| Tietorakenne | Säilytä migration-journal ja siihen kuuluvat tiedostot; tässä lisäykset ovat additive. Vanha koodi voi olla yhteensopiva, mutta turvallisuustoimintoja ei saa palauttaa sokkona vanhoiksi | Kolme kirjattua muutosta luonnoksessa, rakenne tarkistettu |
| Tiedot | Uusimman onnistuneen varmistuksen UTC-aika, palautuspiste ja vastuuhenkilö; palautuksen testi vain erillisessä hyväksytyssä palautuskohteessa, eheys ja palautusaika mitataan | Tuotantovarmistusta/listaa ei nähty, ei vientiä tai palautusta |
| Tallennusmediat | Erillinen alkuperäisten tiedostojen varmistus, osoittimet ja käyttöoikeudet; palautuksen jälkeen vertaa tiedostomäärä, eheys ja julkisten kuvien/latausten toiminta | Ei tuotannon tiedostovientiä tai palautusta |

Pääprojekti pyytää käyttäjältä uusimman onnistuneen backupin **UTC-aikaleiman** ja **palautusvastuuhenkilön**. Näiden saaminen ei yksin todista palautettavuutta; harjoitus ja tallennusmedioiden erillinen näyttö tarvitaan.

## 4. Maksutilojen totuudenmukaisuus
- productionBoard ei enää väitä **Laskutettu Netvisorissa**. Käsin merkinnät ovat **Merkitty laskutetuksi (käsin)** / **Merkitty maksetuksi (käsin)**.
- Tuotannon etenemisen viimeinen tarkistus tarkoittaa **Toteumat tarkistettu**, ei sopimuslaskutusta. Valmis-toteumavaiheen nimi on **Toteumat kirjattu**, ei väite koko koulutuksen laadullisesta valmistumisesta.
- Maksumerkintä ei ylikirjoita aikatauluttamatta/käynnissä/toteumia puuttuu -tilaa. Avoimet laatupoikkeamat pysyvät näkyvissä myös maksumerkinnän jälkeen.
- Puhelimella löytynyt seuraavan vaiheen tekstin ahtaus korjattu, 320/390 px tarkistettu uudelleen.

## Tietorakenteen muutokset ja siirtoriskit
1. `0035_contract_billing_plans`: crm_billing_plans, crm_billing_installments, crm_billing_ops; luku/tallennus/käsinmerkintä-RPC:t ja tuotannon billing_ready-kentän merkityskommentti.
2. `0036_customer_order_replay_guard`: crm_order_command_ops, organisaatiotriggerin turvallinen sisäinen roolitarkistus ja sisältöön sidottu tilausvahvistus.
3. `0037_public_ai_usage_boundary`: public_ai_usage ja vain service-rolelle sallittu kulutusfunktio; ei uusia ajastuksia.

Kaikkien uusien julkisten taulujen GRANT + RLS kirjattu. Taloustiedot näkyvät vain admin/editor-rooleille; op-lokit ja AI-kulutus vain palvelimelle. Kirjoitukset kulkevat palvelinfunktioiden kautta.

Hyväksyminen tuo rakenteen muutokset sovellukseen automaattisesti; luonnoksen asiakas-/testiaineisto ei siirry sovelluksen tietoihin. db/seed.sql on tulevien luonnosten esimerkkiaineisto, ei tuotannon alustus. Ei hyväksytty tässä.

Ennen tuotantoon siirtoa: varmista backup/palautusvastuu, arvioi vanhojen tilausten sopimuspäivät ja alv 0 % senttitarkkuus, vahvista laskutustapa ihmisellä. Toimintojen toimituksen järjestys on rakenne → palvelinrajat → käyttöliittymä; puuttuva limiter epäonnistuu suljetusti. Julkisen JWT-portin asetukset ja IP-välitys varmistetaan käyttöönotossa. Turvan syvätarkastus pääprojektissa; tätä luonnosta ei saa kuvata automaattisesti turvatarkastetuksi.

## Todelliset testitulokset
- 124 kohdennettua regressiotestiä läpäisi (16 tiedostoa). Lisäksi yrityskoulutuksen 66 testiä läpäisi (companyOrder 4, workflow 27, rules 26, readiness 9): yhteensä 190 erillistä testiä.
- 21 eristettyä palvelin-/RLS-/samanaikaisuustestiä läpäisi. Käyttöraja: 20 samanaikaista saman kävijän pyyntöä → 10 hyväksyttyä; vaihtuvat kävijät eivät ylittäneet 400/h yhteistä rajaa.
- 33 AI-raja/handler-testiä sisältyy regressioihin: neljän todellisen endpointin handlerit suoritettiin VM:ssä maksuttomilla testivastauksilla. False/virhe rajalla → 0 gateway-kutsua. Kelvollinen julkinen pyyntö → yksi test-double-kutsu. Oikeaa AI-kulutusta tai tuotantotoimitusta ei testattu.
- Kirjautuneet UI-polut admin/editor-rooleilla, trainer/anonymous-estot, kaikki asiakaskortin välilehdet, suunnitelman ja käsinmerkinnän takaisinluku, 1280/390/320 px, 0 sivun suoritusaikaista virhettä ja 0 loppuun suoritettua ulkoista kutsua.
- Kohdennettu lint läpäisi; esikatselun viimeisin tarkistus oli build OK. Koko projektin testikokonaisuutta ei ajettu eikä väitetä puhtaaksi.

## Jäljellä olevat estot
- Turvatyökalut eivät tarkasta luonnosta: ajantasainen syvätarkastus tarvitaan pääprojektissa.
- Tuotannon varmistuksen UTC-aika, palautusvastuuhenkilö ja tallennusmedioiden palautusnäyttö puuttuvat.
- Oikean julkaistun julkisen AI-endpointin käyttöönotto/JWT/IP-otsakevarmennus odottaa hyväksyttyä siirtoa; ei tehdä tästä luonnoksesta.
