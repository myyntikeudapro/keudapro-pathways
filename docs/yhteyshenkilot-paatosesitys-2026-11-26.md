# KeudaPRO – yhteyshenkilö- ja avainhenkilörekisterin päätösesitys

26.11.2026 • Vain analyysi ja toteutussuunnitelma • Ei toteutus- tai julkaisuhyväksyntä

## Päätös lyhyesti

**Suositus:** laajennetaan nykyistä Asiakkaat-toimintoa ja `crm_contacts`-rekisteriä. Henkilöllä säilyy yksi yhteinen tunniste, ja yritys-, tarjous- ja projektikohtaiset suhteet erotetaan hänen perustiedoistaan. Ei rinnakkaista CRM:ää, osallistujarekisterin yhdistämistä eikä markkinointilähetyksiä.

**Ensimmäinen erä:** lukeva Yhteyshenkilöt-näkymä, henkilökortti ja nykyisten tunnisteiden kautta löytyvät yhteydet. Nykyinen henkilön perustaminen säilyy asiakasvalinnan yhteydessä. Monen organisaation historia ja kirjoittavat roolivalinnat toteutetaan vasta erillisessä seuraavassa erässä, jotta nykyisiä tilausvahvistuksia ei rikota.

**Ennen laajennuksen käyttöönottoa:** tarkistetaan eristetyssä ympäristössä henkilön uudelleenkäyttö, historia ja kaikki nykyiset tilausvahvistuksen polut. Aito Attendo-tapaus odottaa edelleen erillistä varmuuskopion vahvistusta.

## Tarkistuksen laajuus ja rajat

Tarkistin nykyisen pääprojektin lähdekoodin sekä Lovable Cloudin todelliset sarakkeet, viiteavaimet, indeksit, käyttöoikeuspolitiikat, keskeiset palvelintoiminnot ja historiatriggerit vain lukevilla kyselyillä. Henkilöiden nimiä tai sähköpostiosoitteita ei viety raporttiin tietokannasta.

Tarkistushetken määrät: 0 organisaatiota, 0 yhteyshenkilöä, 3 muuta kuin henkilökohtaista yhteydenottoa, 0 henkilötunnisteeseen liitettyä yhteydenottoa, 0 tarjousversiota, 0 tilausta, 0 kurssiluettelon osapuolta ja 0 sähköpostikieltoriviä. Tyhjä kieltotaulu **ei** osoita markkinointikelpoisuutta. Näiden tyhjien kokonaisuuksien käytännön toimivuutta ei voitu todentaa oikealla täytetyllä asiakastapauksella; kirjoittavia kokeita ei tehty.

Ei muutoksia sovelluskoodiin, tietokantaan, asiakkaisiin, tilauksiin, käyttöoikeuksiin tai julkaisuun. Ei viestejä, mallikutsuja, laskuja, maksuja eikä osoitevientiä. Tämä raportti ei ole julkaistun käyttöliittymän päästä päähän -hyväksyntätesti eikä uusi turvatarkastus.

## 1. Nykyisten yhteyshenkilötietojen kartoitus

### 1.1 Yhteinen asiakas ja henkilö

| Kokonaisuus | Nykyinen rakenne | Merkitys ja puute |
|---|---|---|
| `crm_organizations` | nimi, Y-tunnus, asiakkuusvastaava, luonti- ja muokkausajat | Yhteinen yritystunniste; toimialakenttää ei ole. |
| `crm_contacts` | `organization_id` pakollinen, nimi ja sähköposti pakollisia, puhelin, aikaleimat | Henkilö kuuluu suoraan yhteen organisaatioon. Tehtävänimike, avainhenkilö, kiinnostusalueet, roolit ja tarkistusaika puuttuvat. |
| Päällekkäisyyksien esto | yksilöllinen `(organization_id, lower(email))` | Estää saman osoitteen toiston yhden yrityksen sisällä, ei samaa henkilöä eri yrityksissä. Ei ratkaise yhteisiä sähköpostilaatikoita. |
| Historia | `crm_audit` tallentaa muutoksen tekijän sekä vanhat/uudet tiedot | Hyvä perusta jäljitettävyydelle; henkilötietoja jää myös historiaan. |

**Ratkaiseva havainto:** `crm_contacts.organization_id` ei tällä hetkellä ole vain näyttökenttä. Asiakasvalinta ja tilausvahvistus tarkistavat sen avulla, että henkilö kuuluu ostajaan. Sitä ei voi vaihtaa uuden suhderakenteen tieltä ilman kaikkien näiden polkujen hallittua siirtymää.

### 1.2 Yhteydenotot, tarjoukset ja tilaukset

- `booking_requests` sisältää nimen, sähköpostin, puhelimen ja yritysnimen tekstinä sekä erilliset `organization_id`- ja `contact_id`-viitteet. Alkuperäisen yhteydenoton tiedot eivät poistu asiakasliitoksessa. Osa toistosta on tarpeellista alkuperäisaineistoa, ei uutta henkilörekisteriä.
- `crm_offers` liittyy yhteydenottoon. `crm_offer_versions` sisältää organisaatio- ja henkilötunnisteen; henkilö voi vielä puuttua luonnoksesta. Jokaiselle versiolle on vain yksi suora henkilöviite.
- `crm_orders` sisältää pakolliset organisaatio- ja henkilötunnisteet sekä tarjousversion. Vahvistuksessa kopioidaan sopimus- ja hintatiedot, mutta rakenteessa ei ole erillistä henkilön nimen/sähköpostin/tehtävän vahvistushetken tietokopiota.
- Hyväksytyn tarjousversion muuttaminen ja poistaminen estetään palvelimen triggerillä. Tämä suojaa tarjousriviä, **ei kaikkia viitatun henkilön myöhempiä muutoksia**.
- `crm_link_lead_customer` käyttää vahvistettua yritysvalintaa, tarkistaa henkilön organisaation, estää ristiriitaiset valinnat ja kirjaa liitoksen historiaan. Uusi henkilö perustetaan vasta vahvistuksessa. Organisaatio ei synny pelkän nimen perusteella.

**Historiapäätös:** yhteisiä henkilötietoja saa päivittää, mutta hyväksytyssä tarjouksessa ja tilauksessa pitää voida näyttää silloin sovitut yhteystiedot erillään nykyisistä tiedoista. Vanhoja puuttuvia tietokopioita ei saa jälkikäteen väittää alkuperäisiksi.

### 1.3 Tuotanto ja osallistujat

- `prod_deliveries` liittyy tilaukseen (`order_id`) tai koulutusohjelmaan; sillä ei ole asiakkaan henkilön omaa viiteavainta.
- `prod_programme_versions` liittyy yhteydenottoon ja sisältää ohjelma-, kapasiteetti- ja resurssitietoja. Sen henkilöstövastuut ovat KeudaPROn myynti-, tuotanto- ja kouluttajavastuita, eivät asiakkaan yhteyshenkilöitä.
- Yrityskoulutuksen myyntinäkymä hakee yhteyshenkilön nykyisen `booking_requests.contact_id`-tunnisteen kautta.
- Koulutusohjelman hyväksynnällä on oma `snapshot`, mutta se ei ole yleinen asiakkaan henkilö- ja organisaatiohistorian ratkaisu.
- `prod_participants`, kurssipaikkojen osallistujat sekä ohjelmien ilmoittautumisvastaukset ovat osallistujatietoa. Niitä ei siirretä automaattisesti asiakkaan yhteyshenkilöiksi.

**Puute:** asiakkaan projektikohtaisia henkilörooleja ei voi hallita yhteisestä henkilörekisteristä. Tilaajan yhteyshenkilö ei välttämättä ole koulutuksen käytännön yhteyshenkilö.

### 1.4 Kurssiluettelon tilaaja, maksaja ja laskutus

`cat_registrations` viittaa erikseen `buyer_party_id`, `billing_party_id` ja `payer_party_id`-osapuoliin. `cat_parties` sisältää osapuolen lajin, yritysnimen ja Y-tunnuksen, yhteyshenkilön nimen, sähköpostin, puhelimen sekä laskutustietoja. Suoraa viitettä `crm_contacts`-rekisteriin ei ole.

`cat_register` perustaa tilaaja- ja laskutusosapuolet erillisinä kirjauksina. Maksaja voi olla sama laskutusosapuoli tai erikseen kirjattu. Näin sama yhteystieto voi toistua saman ilmoittautumisen eri osapuolissa ja eri ilmoittautumisissa.

**Suositus:** säilytetään ilmoittautumisen osapuolitiedot sen ajan todisteina. Mahdollinen myöhempi henkilöstön vahvistama CRM-linkki on täydentävä, ei tietojen korvaaminen. Julkinen ilmoittautuminen ei saa hakea tai paljastaa yhteistä henkilörekisteriä. Y-tunnuksettomat ja yksityiset osapuolet pysyvät asianmukaisesti erillään yritysrekisteristä.

### 1.5 Markkinointisuostumukset ja kiellot

- `cat_registrations.marketing_consent` on oletusarvoltaan `false`; ilmoittautumiseen tallentuvat myös ehtojen hyväksymishetki ja tietosuojaselosteen versio. Nykyinen tavallinen kurssilomake lähettää markkinointisuostumukseksi aina `false`.
- Suostumus ei ole yhteisen henkilön, sähköpostiosoitteen ja käyttötarkoituksen ajallinen tapahtumahistoria. Erillistä suostumuksen tekstiä/versiota tai myöntämis- ja perumishetkeä ei ole tässä mallissa.
- Evästevalinta ohjaa sivuston seurantaa (`trackEvent`). Se **ei ole sähköpostimarkkinointisuostumus**.
- `suppressed_emails` sisältää sähköpostin, syyn (`unsubscribe`, `bounce`, `complaint`), lisätiedot ja luontiajan. Osoite on yksilöllinen. Ei suoraa henkilötunnistetta eikä käyttötarkoituksen erottelua.
- `email_unsubscribe_tokens` sisältää osoitteen, tokenin, luonti- ja käyttöajan. Token ei itsessään ole suostumustodiste.
- Kielto- ja token-tietojen käyttöoikeuspolitiikat ovat palveluroolille rajatut, eivät henkilöstön yhteyshenkilökortin tietolähteitä sellaisinaan.
- Viesteillä on kaksi erillistä polkua: Lovable Cloudin sähköpostijono ja suorat Gmail-lähetykset (vastaanottokuittaukset ja henkilöstöilmoitukset). Tarkistettu Gmail-apuri ei tarkista `suppressed_emails`-taulua. Jononkäsittelijä välittää käyttötarkoituksen ja perumistokenin sähköpostipalvelulle, mutta siinä ei näy paikallista kieltotaulun tarkistusta.

**Johtopäätös:** koko järjestelmän yhdenmukaista markkinointikiellon noudattamista ei voi nykyisen koodin perusteella varmentaa. Nykyiset palveluviestit eivät ole automaattisesti markkinointia; niitä ei pidä pysäyttää tai muuttaa tässä kartoituksessa. Ennen tulevaa markkinointia tarvitaan oma keskitetty kelpoisuustarkistus myös lähetyshetkellä. Sähköpostipalvelun mahdollisia omia lisäestoja ei testattu.

### 1.6 Tekoälyavusteinen tarjoustuonti

Nykyinen poiminta ehdottaa **yhden** asiakkaan yhteyshenkilön nimeä, roolia, sähköpostia ja puhelinta. Jokaisella kentällä on lainaus ja varmuus. Henkilöstö tarkistaa tiedot ennen `crm_import_offer`-vahvistusta. AI-palvelintoiminto ei omassa koodissaan tallenna syötettä tai tulosta; mallipalvelun käsittely ja mahdollinen lokitus/säilytys ovat erikseen tarkistettava asia, eivät lupaus siitä, etteivät tiedot koskaan poistu sovelluksesta.

Vahvistettaessa:

1. Yritys tunnistetaan Y-tunnuksella.
2. Henkilö etsitään saman yrityksen sähköpostilla.
3. Löydetty henkilö käytetään uudelleen; käyttäjän kenttämuutokset eivät tässä polussa päivitä löytyneen henkilön perustietoja.
4. Uusi henkilö perustetaan asiakasvalinnan palvelintoiminnolla.
5. Rooli tallentuu tarjousversion sisältötekstiin, ei henkilön tehtävänimikkeeksi tai rakenteiseksi rooliksi.
6. Alkuperäinen keskustelu/PDF:stä luettu teksti tallentuu vahvistuksessa `crm_interactions`-historiaan paloina. **PDF-tiedostoa ei tallenneta, mutta sen teksti tallentuu.** Alkuperäinen aineisto voi sisältää myös tarpeettomia vastaanottajia ja kolmansien henkilöiden tietoja.

**Rajaus:** uuden yhteydenoton `meeting_format`-kenttä vastaa tietokannan kenttää; kenttänimivirhettä ei todettu. Tallennusta ei kokeiltu tässä lukukartoituksessa. Nykyinen AI-ohje erottaa asiakkaan KeudaPROn myyjästä, mutta vastaanottajakentästä perustamisen nimenomaista kieltoa ja monen henkilön rakenteista valintaa ei vielä ole. Näitä tarvitaan laajennuksessa.

## 2. Ehdotus Yhteyshenkilöt-näkymästä

Asiakkaat-näkymään kolme selkeää osaa: **Organisaatiot**, **Yhteyshenkilöt** ja **Liittämättömät yhteydenotot**. Ei uutta päävalikon rinnakkaisrekisteriä. Ehdotettu osoite `/admin/asiakkaat/yhteyshenkilot`; tarkka reitti tulee erottaa nykyisestä organisaatiotunnisteen reitistä.

### Henkilölista

- Haku nimellä, yrityksellä, sähköpostilla ja myöhemmässä erässä tehtävänimikkeellä.
- Sarakkeet: nimi, yritys/yritykset, tehtävänimike, asiakkuusroolit, avainhenkilö, sähköposti, tietojen tarkistus ja markkinointikelpoisuus.
- Suodattimet: yritys, nykyinen/päättynyt yritysyhteys, avainhenkilö, kiinnostusalue ja tarkistusta tarvitsevat tiedot. Markkinointirajaukset vasta kelpoisuusmallin toteuduttua.
- Ensimmäisessä lukevassa erässä näytetään vain olemassa olevat kentät; puuttuvia rooleja tai ajantasaisuutta ei päätellä.
- Yhteinen sähköposti ei yksin tee kahdesta nimeltään eri henkilöstä samaa henkilöä. Vastaavasti sähköpostin vaihtuminen ei itsessään luo uutta henkilöä.

### Henkilökortti

1. **Tiedot:** nimi, nykyiset yhteyskanavat ja myöhemmin vahvistettu tarkistushetki sekä tarkistaja.
2. **Organisaatiot ja roolit:** yritysyhteydet alkamis- ja päättymisajoilla; tehtävänimike yritysyhteyden yhteydessä. Avainhenkilömerkintä on asiakkuuskohtainen, ei yleinen arvio ihmisestä.
3. **Tarjoukset ja tilaukset:** yhteydet vain tallennettujen tunnisteiden kautta, tapahtumakohtaiset roolit ja hyväksymishetken yhteystiedot.
4. **Koulutusprojektit:** asiakkaan käytännön roolit erillään KeudaPROn henkilöstövastuista.
5. **Kiinnostus ja markkinointiperusteet:** ammatilliset palvelukiinnostukset, lähde ja markkinointikäytön erillinen tila.
6. **Historia:** henkilön ja suhteiden muutokset; ei perusteetonta yhdistämistä samannimisten tai samansähköpostisten välillä.

`updated_at` näytetään **viimeksi muokattuna**, ei tietojen tarkistushetkenä. Tarkistus on erillinen henkilöstön vahvistama toiminto. Ammatillisiin kiinnostuksiin käytetään rajattuja palveluaiheita, ei arkaluonteisia henkilöluokituksia tai vapaata profilointia.

## 3. Yhteyshenkilön valinta tarjoukseen ja projektiin

**Valitse yhteyshenkilöt** avaa ensin asiakkaan nykyiset henkilöt; tarvittaessa haetaan yhteisestä rekisteristä. Valinta sisältää henkilön, organisaatioyhteyden ja yhden tai useamman roolin. Toisen yrityksen henkilön valinta edellyttää yritysyhteyden erillistä vahvistusta; pelkkä hakuosuma ei muodosta sitä.

Asiakkuusrooleja voivat olla esimerkiksi HR-yhteyshenkilö ja avainhenkilö. Tapahtumarooleja ovat tarjouksen vastaanottaja, päätöksentekijä, tilaaja, koulutuksen käytännön yhteyshenkilö ja laskutusyhteyshenkilö. Sama henkilö voi saada useita rooleja, mutta yksi rooli ei automaattisesti anna toista.

### Attendon havainnollistava esimerkki – ei kirjauksia

- Emilian sähköpostin allekirjoitus tukee nimeä **Emilia Pesonen** ja tehtävänimikettä **rekrytointikoordinaattori**. Tarkka ostajaorganisaatio ja sen Y-tunnus sekä yhteysosoite tarkistetaan aineistosta ja käyttäjältä ennen tallennusta.
- Tuonti voi ehdottaa häntä asiakkaan yhteyshenkilöksi. Vastauksesta voi ehdottaa ajankohdan sopimisen yhteyshenkilöä; **päätöksentekijää, tilaajaa tai laskutusvastuuta ei päätellä automaattisesti**.
- Heikki tarkistaa henkilön ja yritysyhteyden sekä valitsee tarjouksen roolit. Sama henkilötunniste käytetään koulutusprojektissa, jos Satu vahvistaa Emilian käytännön yhteyshenkilöksi.
- Käyttäjä on aiemmin vahvistanut tarjouksen hyväksytyksi; tämä ei tee AI:n henkilörooliehdotuksista vahvistettuja eikä ohita varsinaista tilausvahvistusta.
- Tarkka koulutuspäivä ja vuosi eivät ole vahvistettuja. Laskuja, maksuja tai viestejä ei käynnistetä esimerkissä.

### AI-tuonnin laajennus

Ehdotetaan usean henkilön listaa, jossa kunkin nimen, yrityksen, nimikkeen ja roolin rinnalla on lähde ja epävarmuus. Näytetään vastaavuudet rekisteriin: **käytä nykyistä**, **perusta vahvistettu uusi** tai **jätä pois**. Muuttuneet tiedot näytetään eroina, eikä vanhaa henkilöä päivitetä huomaamatta. To/Cc-kenttä on vain lähdetietoa: se ei riitä automaattiseen perustamiseen, rooliin tai markkinointiperusteeseen.

Käyttäjä tarkistaa tallennettavan lähdetekstin ja poistaa tarpeettomat allekirjoitukset, vastaanottajalistat sekä kolmansien henkilöiden tiedot ennen poimintaa ja kirjausta. Tallennettava todiste ja rekisteriin tuleva henkilötieto erotetaan toisistaan. AI ei hyväksy tarjousta, voita kauppaa tai vahvista tilausta.

## 4. Markkinointiin sallittujen kontaktien hallinta

**Kohderyhmään sopiminen ja lähetysoikeus ovat kaksi eri päätöstä.** Yritys, nimike, palvelukiinnostus ja aiemmat ostot voivat rajata kohderyhmää, mutta eivät luo suostumusta.

Ehdotetut näkyvät tilat: **Peruste vahvistettu tähän tarkoitukseen**, **Ei vahvistettua perustetta**, **Kielletty** ja **Tarkistettava**. Tilaa ei päätellä sähköpostin yritysverkkotunnuksesta.

- Luonnolliselle henkilölle suunnattu sähköpostimarkkinointi ja organisaatiolle suunnattu B2B-viestintä arvioidaan erikseen. Nimetty työosoite ei yksin ratkaise lainmukaisuutta; tehtävään liittyvän B2B-markkinoinnin soveltuvuus ja tietosuojaperuste dokumentoidaan ennen käyttöä.
- Rekisterinpitäjän tietosuojavastuullinen vahvistaa käytettävät perusteet ja viestityyppien rajaukset. Tämä on tekninen päätösesitys, ei yksittäisen lähetyksen oikeudellinen hyväksyntä.
- Perusteesta kirjataan käyttötarkoitus, kanava, lähde, ajankohta, tietosuojatekstin/suostumuksen versio, kirjaaja ja mahdollinen peruminen. Puuttuva näyttö tarkoittaa ettei kontaktia oteta sallittujen vastaanottajien joukkoon.
- Lähetyskielto ja tekninen toimitusesto tarkistetaan osoitteelle myös lähetyshetkellä; osoitteen vaihto ei saa nollata henkilön markkinointikieltoa. Tekninen palautusesto vanhalle osoitteelle ja henkilön yleinen vastustus ovat eri asioita.
- Kieltojen täytyy koskea kaikkia tulevia markkinoinnin lähetyspolkuja. Soveltuvan perusteen tarkistus ja toimituseston tarkistus ovat erilliset.
- Työtilassa näytetään rajattu kelpoisuustulos ja perusteen lähde, ei perumistokeneita tai koko palveluroolille rajattua kieltotaulua.

### Säilytys ja poistopyynnöt

Nykyisestä rakenteesta ei löytynyt yhteyshenkilön käyttötarkoituskohtaista säilytysaikaa tai poistopyyntöjen hallintaa. Julkiset tietosuojalinkit eivät yksin todista sitä. Säilytysajat ja vastuuhenkilö ovat vahvistettavia ennen markkinoinnin käyttöönottoa; tähän ei ehdoteta keksittyä vuosimäärää.

Poistopyyntö käsitellään henkilön perustietojen, yrityssuhteiden, alkuperäisten yhteydenottojen, tuontitekstien, audit-historian ja sopimuskopioiden osalta. Lakisääteisesti tai perustellusti säilytettävä sopimushistoria erotetaan poistettavista yhteystiedoista; ristiriidat ratkaistaan rekisterinpitäjän päätöksellä. Tarpeellinen vähimmäiskieltotieto säilytetään asianmukaisesti, jotta poistaminen ei vahingossa avaa lähetyksiä uudelleen.

Ei massalähetyksiä, osoitevientiä tai automaattista markkinointilistalle liittämistä tässä tai ensimmäisessä erässä.

## 5. Ehdotettu tietomalli ja käyttöoikeudet

### Tavoitemalli – tekninen osio, ei vielä tietokantamuutoksia

| Tieto | Sijoitus | Peruste |
|---|---|---|
| Yhteinen henkilö | nykyinen `crm_contacts` | Säilytetään henkilötunniste ja nykyiset viitteet; ei rinnakkaista henkilöpohjaa. |
| Henkilön tarkistus | tarkistushetki ja tarkistaja henkilöllä | Muokkaus ja oikeellisuuden vahvistaminen ovat eri asioita. |
| Henkilö–organisaatio | ehdotettu `crm_contact_organizations` | Monta yritysyhteyttä, nimike, voimassaolo ja asiakkuuskohtainen avainhenkilö. |
| Asiakkuusroolit | yritysyhteyden roolisuhteet | Monta roolia samalle henkilölle samassa asiakkuudessa; ei yhtä ylikirjoittuvaa roolikenttää. |
| Ammatilliset kiinnostukset | henkilön rajattu kiinnostusluettelo, lähde/ajankohta | Eivät ole markkinointisuostumuksia. |
| Henkilö–tarjous | tarjousversioon sidotut henkilöroolisuhteet | Versiohistoria ja monta henkilöä/roolia. |
| Henkilö–tilaus | vahvistuksessa kopioitavat henkilöroolit ja sovitut yhteystiedot | Tilaus säilyttää hyväksymishetken tiedot myöhemmistä henkilötietomuutoksista riippumatta. |
| Henkilö–projekti | erikseen toteutukseen tai ohjelmaan sidotut roolisuhteet | Toteutus ja ohjelma ovat eri kohteita; kohteen olemassaolo valvotaan. |
| Markkinoinnin perusteet | erilliset käyttötarkoitus- ja kanavakohtaiset tapahtumat | Suostumuksen/perusteen historia ja kieltojen eri käyttöoikeudet. |
| Lähetysestot | nykyinen `suppressed_emails` + hallittu kelpoisuustarkistus | Nykyistä estolistaa ei ohiteta eikä korvata CRM:n valintaruudulla. |

Yleistä vapaamuotoista `entity_type/entity_id`-suhdetta vältetään, jos se estää tietokannan viiteavaimilla valvotut yhteydet. Tarjousversio, tilaus, toteutus ja ohjelma ovat eri kohteita; erilliset suhteet säilyttävät kohdekohtaiset oikeudet.

### Turvallinen siirtymä

1. Lisätään rakenteet oletusarvoilla tai sallien puuttuvat tiedot; ei poisteta, nimetä uudelleen tai muuteta nykyisten viitteiden merkitystä ensimmäisessä erässä.
2. Muodostetaan nykyisestä henkilön organisaatiosta suhde. Historiallista alkamispäivää ei keksitä `created_at`-ajasta; lähteeksi merkitään siirtymässä havaittu nykyinen yhteys.
3. Muutetaan yhdessä asiakasvalinta, AI-tuonti, molemmat tilausvahvistuksen polut, asiakaskortin kokoaminen ja projektin henkilövalinta tarkistamaan suhdetta. Nykyiset henkilötunnisteet jäävät ensisijaisiksi viitteiksi rinnalle yhteensopivuuden ajaksi.
4. `crm_contacts.organization_id` jätetään aluksi yhteensopivuuskentäksi. Monen organisaation muokkausta ei avata ennen kuin kaikki siihen sidotut tarkistukset käyttävät suhdetta. Vanhaa kenttää ei myöhemmin tulkita koko organisaatiohistoriaksi.
5. Sähköpostia ei tehdä globaalisti yksilölliseksi henkilön tunnisteeksi. Päällekkäisyysehdotukset ovat henkilöstön tarkistettavia; yhdistäminen vaatii erillisen hyväksytyn menettelyn, viitteiden säilymisen ja auditoinnin.
6. Hyväksytyt tarjousroolit jäädytetään; tulevat muutokset tehdään uusina versioina tai projektin operatiivisina muutoksina. Jo olemassa olevia sopimuksia ei muuteta hiljaisesti.

### Oikeudet

Nykyinen `crm_contacts`-politiikka sallii henkilöstölle (`admin`/`editor`) lukemisen ja hallinnan; kirjautumaton ja kouluttaja eivät saa rekisteriin yleistä pääsyä. Nykyinen suora henkilöstömuokkaus on huomioitava: uusi turvallinen valintaikkuna ei yksin estä kiertämistä.

Ehdotus: henkilöstölle rajattu luku; perustaminen, suhde- ja roolimuutokset roolivalvottujen palvelintoimintojen kautta, jotka tarkistavat yritysyhteyden, version tilan ja samanaikaiset muutokset. Kouluttajalle mahdollinen myöhempi projektin tarpeellinen yhteyshenkilö näkyy vain oman vahvistetun tehtävän kautta, ei hakukelpoisena henkilöhakemistona. Julkiset kurssilomakkeet eivät saa CRM-hakua.

Jokaiselle uudelle taululle tarvitaan samassa muutoksessa nimenomaiset oikeusmyönnöt, rivikohtaiset säännöt sekä viite- ja käyttöoikeushakujen indeksit. Kaikki henkilö-, suhde- ja roolimuutokset auditoidaan; perumistokeneita ei palauteta asiakkaalle. Palvelintoiminnoissa käytetään odotettua versiota ja yksittäisen tallennuksen tunnistetta, jotta samanaikaiset muutokset ja uudelleenlähetys eivät tee kaksoiskirjauksia.

## 6. Rajattu ensimmäinen toteutuserä

### 1C-A: lukeva Yhteyshenkilöt (suositeltu ensimmäinen hyväksyntä)

**Sisältyy:**

1. Yhteyshenkilöt Asiakkaat-näkymän yhteyteen.
2. Sivutettu haku nykyisillä nimillä, yrityksillä ja sähköposteilla; yritysrajaus.
3. Henkilökortti nykyisille perustiedoille sekä tunnisteilla linkitetyille yhteydenotoille, tarjousversioille, tilauksille ja koulutuksille.
4. Organisaatiokortin henkilölistasta samaan henkilökorttiin siirtyminen ja takaisinpaluu säilyttäen haku.
5. Viimeksi muokattu -tieto, puuttuvat tiedot ja markkinointiperusteen **ei arvioitu** -tila. Ei virheellistä Ajantasainen- tai Sallittu-merkintää.
6. Tyhjät tilat, pienet näytöt, henkilöstöraja ja nykyisten Myynti/Tuotanto-linkkien säilyttäminen.

**Ei sisälly:** uusi henkilön muokkaus, nimikehaku ilman nimiketietoa, avainhenkilöiden/kiinnostusten tallennus, monen organisaation muokkaus, uudet tarjous- ja projektihenkilöroolit, AI:n monihenkilöpoiminta, markkinoinnin segmentointi, vienti tai lähetys. Nykyinen asiakasvalinta ja tuonti säilyvät ennallaan. Tämä ensimmäinen erä ei siis vielä toteuta koko tavoitetilaa.

### Seuraavat erät, erillinen hyväksyntä

- **1C-B:** organisaatiosuhteet, nimikkeet, asiakkuusroolit, avainhenkilöt, kiinnostukset ja tarkistusajat sekä kaikkien nykyisten ostajatarkistusten yhtenäinen siirtymä.
- **1C-C:** Valitse yhteyshenkilöt tarjouksiin/projekteihin, hyväksymishetken tietokopiot ja AI:n monihenkilöehdotukset.
- **1C-D:** markkinointiperusteiden, kieltojen ja säilytys-/poistokäytäntöjen hyväksytty malli; aluksi vain kelpoisuuden ja kohderyhmien tarkastelu, ei lähetyksiä tai vientiä.

Kaikki kirjoittavat erät kehitetään erillisellä tietokannalla ja synteettisillä henkilöillä. Luonnoksen hyväksyntä, pääprojektin oikeuksien tarkistus ja julkaisu ovat erillisiä vaiheita. Nykyisen koostamisvirheen selvitys ja varmuuskopio-/palautusvalmius ovat erillisiä aiempia käyttöönoton tehtäviä; niitä ei ole ratkaistu tämän raportin avulla.

## 7. Riskit ja hyväksymistestit

| Riski | Vaadittava koe eristetyssä ympäristössä |
|---|---|
| Samat tiedot kahdesti | Kaksi käyttäjää perustaa saman yrityksen saman osoitteen yhtä aikaa: ei kahta henkilöä; toiselle selkeä uudelleenhakupyyntö. |
| Sama nimi tai jaettu osoite | Eri henkilöt samalla nimellä tai yhteisosoitteella eivät yhdisty automaattisesti. |
| Työnantajan vaihto | Vanha suhde päätetään, uusi lisätään; vanha tarjous ja tilaus näyttävät edelleen oikean ostajan ja silloin sovitun henkilön. |
| Useita yrityksiä | Henkilö voi kuulua kahteen yritykseen; tarjousvalinta edellyttää oikeaa suhdetta. Väärän yrityksen henkilö hylätään palvelimella. |
| Roolien sekoittuminen | HR-rooli ei tee tilaajaa; yksi henkilö voi saada kaksi projektin roolia ilman kahden henkilörivin syntymistä. |
| Hyväksytyn historian muuttuminen | Hyväksyttyjä tarjousrooleja ja sopimuskopioita ei voi muuttaa; henkilön nykyisen sähköpostin päivitys ei muuta niitä. |
| Vanhat tilauspolut rikkoutuvat | `crm_confirm_order` ja `crm_confirm_company_order`, asiakasliitos ja AI-tuonti toimivat uuden suhteen kanssa; vanhojen viitteiden sisältö ei vaihdu. |
| AI valitsee väärän henkilön | To/Cc-lista, KeudaPROn myyjä, ristiriitainen nimike ja tekstin ohjehyökkäys eivät luo henkilöä tai roolia ilman vahvistusta. |
| Vahvistusikkuna vain näennäinen | Ennen vahvistusta ei liiketoimintakirjauksia; nykyisen henkilön muuttuneet tiedot näkyvät eroina, peruminen ei tallenna. |
| Uudelleenlähetys | Sama tallennustunniste palauttaa saman tuloksen; eri sisältö samalla tunnisteella estyy. Osittainen epäonnistuminen ei jätä irrallisia henkilöitä. |
| Markkinointikielto ohitetaan | Ostaja ilman perustetta ei ole sallittu; kielto voittaa perusteen, peruuntuminen huomioidaan lähetyshetkellä, osoitteen vaihto ei nollaa henkilön kieltoa. |
| B2B sekoittuu henkilösuostumukseen | Yritysverkkotunnus tai nimike ei automaattisesti oikeuta lähetykseen; käyttötarkoitus ja lähde vaaditaan. |
| Rooliraja tai piilodata vuotaa | Admin/editor sallittu; kouluttaja ja kirjautumaton estetty sekä käyttöliittymässä että suorissa tietopyynnöissä, myös arvaamalla tunniste. |
| Osallistujat muuttuvat markkinointikontakteiksi | Kurssipaikan osallistuja pysyy osallistujana; tilaaja/maksaja/laskutus säilyvät erillisinä eikä julkinen lomake hae CRM:ää. |
| Ajantasaisuus harhaanjohtava | Muokkaus ei muuta tarkistushetkeä; tuntematon tarkistusaika näkyy tuntemattomana. |
| Poistopyyntö jää vajaaksi | Perustiedot, tuontiteksti ja audit-kopiot käsitellään määritellyn käytännön mukaan; säilytettävä sopimushistoria ja vähimmäiskielto eivät katoa vahingossa. |
| Nykyiset näkymät rikkoutuvat | Asiakkaat, liittämättömien jono, Myynti-linkit, tuotannon toteutuslinkit ja pienet näytöt toimivat; suuret listat sivutetaan ilman puuttuvia rivejä. |

Lukevan ensimmäisen erän testeissä seurataan, ettei se tuota kirjoituspyyntöjä. Kirjoittavissa erissä käytetään todellista eristettyä testitietokantaa, ei pelkkiä näytön esimerkkivastauksia. Tarkistetaan ennen/jälkeen sisältövertailu, ei vain rivimääriä. Viestit, talouskutsut, ajastukset ja oikeat vastaanottajat estetään testissä.

### Hyväksyttävä päätös

Suosittelen hyväksyttäväksi ensin **1C-A:n lukevan näkymän**. Organisaatiohistorian ja kirjoittavien henkilöroolien laajennus hyväksytään vasta yhtenäisen siirtymäsuunnitelman kanssa. Markkinoinnin perusteet, säilytysajat ja poistopyyntövastuu tarvitsevat rekisterinpitäjän vahvistuksen ennen 1C-D:tä; niitä ei tarvitse ratkaista lukevan näkymän rakentamiseksi.

### Kartoituksen keskeiset lähteet

Tietokannan todelliset sarakkeet, viiteavaimet, `pg_policies`, `pg_indexes`, triggerit sekä `pg_get_functiondef` keskeisille asiakas-, tilaus-, tuonti- ja kurssitoiminnoille; henkilötietosisältöjen sijaan koontimäärät.

Lähdekoodi: `src/lib/customerRegister.ts`, `src/components/admin/CustomerCard.tsx`, `CustomerLinkDialog.tsx`, `CompanyTrainingSales.tsx`, `OfferImportDialog.tsx`, `src/lib/offerImport.ts`, `src/components/catalog/CourseRegistrationForm.tsx`, `src/lib/analytics.ts`, `supabase/functions/offer-import-extract/index.ts`, `process-email-queue/index.ts`, `_shared/gmail.ts` sekä asiakasrekisterin ja tarjoustuonnin nykyiset muutostiedostot. Historiallisia muutostiedostoja ei tulkittu yksin todisteeksi nykyisestä tietokantatilasta.
