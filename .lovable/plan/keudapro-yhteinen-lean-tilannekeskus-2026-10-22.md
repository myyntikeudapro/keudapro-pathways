# KeudaPRO – yhteinen LEAN-tilannekeskus

## Ensimmäisen vaiheen tavoite

Kirjautumisen jälkeen `/admin` avaa yhteisen tilannekeskuksen: liiketoiminnan yleiskuva, keskeneräiset työt, huomiota vaativat asiat, oma työjono ja työtilavalinnat. Käytetään nykyisiä tietoja; uusia tuotanto-, tilaus- tai taloustoimintoja ei rakenneta tässä vaiheessa.

Julkinen keudapro.fi, kirjautuminen, CRM ja sähköpostitoiminnot säilyvät. Toteutus alkaa vasta tämän suunnitelman hyväksynnän jälkeen. Julkaisu pyydetään erikseen.

## Säilytettävät, siirrettävät ja uudet osat

| Osa | Muutos |
| --- | --- |
| Julkiset sivut ja niiden osoitteet | Ei muutoksia sisältöihin, ulkoasuun tai toimintoihin |
| `/admin/login` | Sama kirjautuminen, kohteena tilannekeskus; nimi päivitetään vastaamaan yhteistä työtilaa |
| Nykyinen sisältöeditori | Siirretään osoitteeseen `/admin/sisallot`, kaikki muokkaustoiminnot säilyvät |
| `/admin/markkinointi` | Säilytetään raportit, asiakaskortit, tehtävät, tarjoukset, tavoitteet, jako ja käyttäjähallinta |
| `/admin/yhteydenotot` | Säilytetään saapuneiden viestien näkymä |
| Uusi `/admin` | Tilannekeskus nykyisen CRM:n tietojen pohjalta |
| Hallinnan navigaatio | Tilannekeskus-, sisältöeditori- ja työtilalinkit yhdenmukaistetaan |
| Suodatetut työjonot | Nykyiseen CRM:ään lisätään osoitteessa säilyvät suodattimet ja tarvittavat listanäkymät |

## Tilannekeskuksen sisältö

### 1. Liiketoiminnan yleiskuva
- Uudet ja avoimet yhteydenotot, avoimet tarjoukset sekä CRM:ään kirjatut toteutuneet kaupat ja niiden arvo.
- Palvelu- ja aikavälivalinnat sekä selkeä yhteinen näkymä ja omien vastuiden näkymä.
- Jokainen laskettu tunnusluku avaa täsmälleen vastaavan listan samoilla rajauksilla. Myös euromäärästä pääsee sen muodostaviin tarjouksiin tai kauppoihin.
- Tilaukset, koulutustuotanto ja laskutusvalmius näytetään tietolähteen puuttuessa tekstillä **“Tietoa ei vielä saatavilla”**, ei nollana eikä toimimattomana painikkeena.
- Hyväksytty tarjous ei ole automaattisesti tilaus, toteutunut myynti tai tuotantoon luovutus.

### 2. LEAN-virtaus
- Nykyisten myyntivaiheiden keskeneräisten töiden määrät ja niitä vastaavat työjonot.
- Avoimen yhteydenoton ikä saapumisesta sekä erääntyneiden tehtävien viive.
- Toteutuneiden kauppojen aika yhteydenoton saapumisesta kirjattuun kauppapäivään, vain riittävillä tiedoilla; näytetään havaintomäärä ja puutteellisten tietojen määrä.
- Vaihekohtaiset odotusajat, koko tuotantopolun läpimenoajat ja mitatut pullonkaulat merkitään puuttuviksi: nykyinen historia ei takaa täydellistä vaihesiirtymien seurantaa. Suuri työmäärä ei yksin todista pullonkaulaa.

### 3. Huomiota vaativat asiat
- Erääntyneet tehtävät, ilman vastuuhenkilöä olevat avoimet yhteydenotot ja asiakkaat ilman seuraavaa tehtävää.
- Nykyiseen 48 tunnin sääntöön perustuvat käsittelemättömät yhteydenotot, yhteydenpitohistoria huomioiden.
- Ohittuneen arvioidun päätöspäivän avoimet tarjoukset ja toteutuneet kaupat, joilta puuttuu arvo.
- Esteille, riskeille ja hyväksyntätehtäville ei vielä ole rakenteista tietolähdettä: ne erotetaan saatavilla olevista hälytyksistä, eikä niitä päätellä vapaasta tekstistä.

### 4. Oma työjono
- Kirjautuneen käyttäjän asiakkaat, avoimet tehtävät ja määräajat; tehtävä avaa oikean asiakaskortin.
- Heikki vastaa uusasiakkuuksista sekä myynnin ja markkinoinnin kokonaisuudesta. Satu vastaa tuotannosta. Kolmas paikka säilyy osoitteella myynti@keudapro.com.
- Tuotantotyöjonoa tai automaattista siirtoa Satulle ei esitetä valmiina ennen tuotantomallin rakentamista. Myynnin vastuita ei muuteta tässä vaiheessa.

### 5. Työtilavalinnat
- **Myynti:** nykyiset asiakaskortit ja tarjoukset.
- **Markkinointi:** nykyinen markkinointinäkymä.
- **Sisältöhallinta:** siirretty sisältöeditori.
- **Tuotanto, osallistujat, verkkokauppa, asiantuntijaverkosto ja talous:** näkyvät tulevina työtiloina ilman avaavaa painiketta, kunnes niillä on todellinen kohde. Julkista Hubia tai Verkosto-sivua ei esitetä operatiivisena työtilana.

## Käyttöoikeudet ja tietojen luotettavuus

- Ensimmäisessä vaiheessa säilytetään nykyiset pääkäyttäjän ja editorin tietokanta- ja palvelinpuoliset oikeudet. Työtehtävä ei itsessään luo uutta käyttöoikeusroolia.
- Pääkäyttäjän asetukset ja käyttäjähallinta pysyvät pääkäyttäjällä. Yhteinen näkymä ja oma työjono toimivat nykyisten oikeuksien sisällä.
- Sähköpostiosoite tai selaimeen tallennettu arvo ei ratkaise käyttöoikeutta. Kirjautumisen ja roolin tarkistuksen valmistumista odotetaan ennen tietojen hakua ja näyttämistä.
- Oma työjono on rajaus, ei väite siitä, ettei editori voisi nähdä tiimin muita asiakkaita. Satun tuotantoroolin mahdollinen erillinen tietojen rajaus toteutetaan myöhemmän tuotantovaiheen yhteydessä myös tietokannassa ja palvelinpuolella.
- Erotetaan lataus, hakuvirhe, puuttuva tietolähde ja oikea nolla. Hakuvirhe ei saa muuttua tyhjäksi onnistuneeksi raportiksi.
- Kaikki mittarin tarvitsemat rivit haetaan sivutettuina; nykyisen viestilistan 200 rivin rajaa ei käytetä koko liiketoiminnan tunnuslukuihin.

## Visuaalinen suunta

KeudaPROn vaalea, ammattilaisen työympäristö: sininen otsikkohierarkia, vihreät selkeät toiminnot, hillityt tilavärit ja tiiviit luettavat työjonot. Sivun osat eivät ole sisäkkäisiä kortteja. Puhelimessa valinnat ja tekstit rivittyvät ilman sivuttaisliikettä. Näppäimistökäyttö, fokus ja kontrastit tarkistetaan.

## Tekniset toteutusosat

- `src/App.tsx`: uusi tilannekeskus `/admin`-reitille, nykyinen `AdminPage` `/admin/sisallot`-reitille. Editorin tiedostoa ei tarvitse nimetä uudelleen.
- Uusi pieni tilannekeskussivu ja erilliset mittarilaskennan sekä työjonosuodattimien apufunktiot; nykyinen `readAll` ja CRM-laskenta hyödynnetään.
- `AdminMarketingPage` ja `CrmWorkspace`: osoiteparametrit omistaja-, tila-, tehtävä-, tarjous- ja huomiojonojen rajauksille. Säilytetään nykyiset `tab`, `palvelu`, `pv` ja `asiakas`-parametrit.
- Editoriksi tarkoitetut `/admin`-linkit päivitetään `/admin/sisallot`-osoitteeseen; tilannekeskuksen linkit pysyvät `/admin`-osoitteessa.
- Ei tietokantamuutoksia, uusia ulkoisia yhteyksiä, ajastusmuutoksia tai automaattisia tuotantosiirtoja tässä vaiheessa.

## Riskit ja tarkistus

| Riski | Hallinta |
| --- | --- |
| Vanha sisältöeditorilinkki avaa uuden etusivun | Kaikki sisäiset viittaukset kartoitetaan ja editorille annetaan selkeä pysyvä linkki |
| Mittari ja klikattu lista eroavat | Yhteinen laskenta ja suodattimet; konkreettiset testit päivämäärille, vastuulle, tilalle ja puuttuville tiedoille |
| Osittainen haku tai historia näyttää väärän luvun | Sivutetut haut, näkyvät virhetilat ja vain todennettavissa olevat mittarit |
| Kirjautumisen roolitarkistus näyttää väärän näkymän | Testataan kirjautumisen alku, roolin lataus, uloskirjautuminen ja oikeudeton käyttäjä |
| Uusi etusivu rikkoo toimivia työtiloja | Kirjautuneet testit: asiakaskortti, omistaja, tehtävä, tarjous, kampanjalinkki ja sisältöeditori; testitiedot poistetaan |

Lisäksi tarkistetaan tärkeät julkiset sivut, lomakkeen avautuminen, ulkoiset linkit ja SSG:n säilyminen sekä hallinnan puhelin- ja tietokonenäkymät. Nykyiset CRM-laskentatestit ajetaan uusien suodatustestien kanssa.

## Myöhempi rakentamisjärjestys – ei tämän hyväksynnän toteutukseen

1. Todellisen koulutustilauksen malli ja tuotannon oikeudet: asiakkuus, tilaus ja toteutus erikseen; Heikin myyntivastuu ja Satun tuotantovastuu rinnakkain.
2. Koulutuksen suunnittelu omaksi vaiheeksi: Claude-linkki ja lähtötietopaketti, suunnitelman versio sekä ihmisen hyväksyntä työtilaan. Kaksisuuntainen yhteys vasta Claude-tilin mahdollisuuksien tarkistuksen jälkeen.
3. Vaihesiirtymien aikaleimat, hyväksynnät, esteet ja riskit; vasta sitten aidot vaihekohtaiset LEAN-mittarit ja hallittu luovutus tuotantoon.
4. Osallistujat, ilmoittautumiset, verkkokauppa ja asiantuntijaverkosto vaiheittain. Netvisor säilyy laskutusjärjestelmänä; verkkomaksut ulkoisen turvallisen maksupalvelun kautta.

**Hyväksyntä koskee ensimmäistä tilannekeskusvaihetta nykyisillä tiedoilla, ei koko ERP:n rakentamista.**
