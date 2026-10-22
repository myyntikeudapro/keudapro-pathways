# KeudaPRO – Vaihe 0B: turvallinen kehittäminen ja julkaisu

## Päätös ja tämän vaiheen rajaus

Suositus: nykyinen KeudaPRO jää tuotantoprojektiksi. Kehitys tehdään erillisessä Remix-projektissa, jonka oma Lovable Cloud, testikäyttäjät ja palvelutunnukset varmennetaan ennen testien aloittamista. Pelkkä esikatselu, Git-haara tai luonnos ei ole todiste tietokannan eristyksestä.

Tämä suunnitelma ei valtuuta tuotannon migraatioita, kirjautumisen muutoksia, palveluyhteyksien vaihtamista, julkaisua tai uusia liiketoimintatoimintoja. Hyväksyntä käynnistää vain eristetyn kehitysympäristön valmistelun ja siellä tehtävät kokeet. Tuotantoon siirto hyväksytään erikseen.

## Varmennettu nykytila 22.10.2026

| Asia | Havainto ja raja |
|---|---|
| Palveluntarjoaja | Sovellus käyttää Lovable Cloudia. Nykyinen esikatselu ja julkaistu sivusto käyttävät samaa tietokantaa. Cloud vastasi tarkistuksessa normaalisti. |
| Erilliset luonnokset | Projektin luonnosluettelo on tyhjä. Erillistä testitietokantaa ei tässä tarkistuksessa todennettu. |
| Muutoshistoria | Paikallinen Git-historia on olemassa; tarkistettu viimeinen tunniste on `748826e`. Tämä ei osoita GitHub-yhteyden tilaa eikä nykyisen julkaistun version tunnistetta. |
| Tietokannan suojaus | Kaikissa 20 public-taulussa RLS on päällä. Tarkistetuissa käytännöissä yhteydenottoja lukevat ja päivittävät editorit/pääkäyttäjät; tavoitteita muuttavat pääkäyttäjät. Käyttäjä näkee oman roolinsa, pääkäyttäjä hallitsee rooleja. |
| Oikeuksien rajaus | Tarkistetuilla tauluilla myös anon-roolilla on laajoja tauluoikeuksia. RLS rajaa rivien käsittelyä, joten tämä ei yksin osoita tietovuotoa. Vähimmän oikeuden mukainen kavennus suunnitellaan ja testataan erikseen. |
| Ajastukset | Aktiivinen `crm-email-daily-dispatch`, aikataulu `0 6,7 * * *`. Nykyinen ajastus säilytetään tuotannossa; sitä ei saa käynnistää testikopiossa. |
| Tiedostot | `card-images` on julkinen tiedostosäilö. Sen sisältöä tai tiedostovarmistusta ei ole tässä tarkistuksessa kopioitu tai palautettu. |
| Käyttäjähallinnan riski | `admin-users`-toiminnon luontivirhe voi johtaa olemassa olevan sähköpostin tunnuksen salasanan vaihtoon. Toiminto vaatii pääkäyttäjän, mutta luonti ja salasanan vaihto on silti erotettava. |
| Varmistukset | Viimeisintä onnistunutta varmistusta, varmistusten määrää ja palautettavuutta ei ole todennettu. Näihin ei ole käytettävissä varmistusluettelon lukutyökalua. |

## A. Suositeltu arkkitehtuuri

- **Tuotanto:** nykyinen projekti ja keudapro.fi, nykyiset asiakkaat, kirjautuminen ja palveluyhteydet. Ei muutoksia valmisteluvaiheessa.
- **Kehitys:** erillinen Remix-projekti ja oma Cloud. Ei tuotantoverkkotunnusta, asiakastietoja, käyttäjätilejä eikä tuotannon lähetys-, mainos- tai maksutunnuksia.
- **Versionhallinta:** tuotanto ja kehitys omiin GitHub-repositoryihin; suojattu tuotannon synkronoitu haara. Kehityksen muutokset tuodaan tuotantorepositoryyn tarkistettavana pull requestina, ei koko kopion korvaamisena.
- **Testiaineisto:** keksityt asiakkaat ja erilliset pääkäyttäjä-, editori- ja työtilaoikeudeton testitunnus. Tunnusten sähköpostiosoitteet vain testikäyttöön hallittuja; ulospäin lähetys estetty.

Remix kopioi dokumentaation mukaan taulurakenteet ja Edge Function -koodin ilman tietokantadataa. Tämä ei todista kaikkien tunnusten, ajastusten, asetusten tai yhteyksien turvallisuutta: kohde tarkastetaan ennen ensimmäistä kirjoittavaa testiä. Luonnosten eristyksestä on ympäristökohtaisia eroja; niitä ei valita turvallisuuden perustaksi ilman erillistä todistetta. Test/Live-ominaisuuden saatavuutta ei oleteta tässä projektissa.

## B. Valmistelu ja tekniset rajoitukset

1. Käyttäjä avaa **Projektiasetukset → Git** ja vahvistaa palvelun, repositoryn, synkronoidun haaran ja synkronoinnin tilan. Agentti ei voi lukea Git-yhteyden tilaa tai yhdistää repositorya. Tarvittaessa käyttäjä yhdistää GitHubin; yhteys luo uuden repositoryn, ei liitä olemassa olevaan.
2. Kirjataan nykyinen tuotantokoodi ja julkaistu versio erikseen. Repositoryn ylläpitäjä suojaa synkronoidun haaran: PR-tarkistus, testien läpäisy ja ei suoria/force push -muutoksia. Tarkistetaan, miten suojaus vaikuttaa Lovablen synkronointiin; hylätty suora kirjoitus voi päätyä `lovable-sync`-haaraan.
3. Käyttäjä tekee Remix-kopion ja avaa sen keskustelun. Ennen sovelluksen toimintojen kokeilua tarkistetaan kohteen oma Cloud, käyttäjäluettelo, tietokantadata, tallennus, ajastukset ja palveluyhteydet. Agentti ei voi olettaa voivansa muuttaa erillistä projektia tämän keskustelun kautta.
4. Kehityskohteessa estetään kaikki sähköpostikanavat, myös tunnusten vahvistus/palautus ja jonolähetys. Gmail- ja mainosyhteyksiä ei yhdistetä. Ajastukset pidetään pois käytöstä. Maksut/Netvisor ja muut ulkoiset kirjoittavat kutsut korvataan testivastauksilla. Estot tehdään palvelinpuolelle, eivät vain näkymän piilotuksella.
5. Testifunktiot sallivat vain testikohteet; tuotantotunnuksia ei kopioida. Puuttuva tai tuntematon ympäristöasetus estää lähetyksen. Testeissä todetaan ulkoisten kutsujen määrä nollaksi. Testikäyttöliittymälle merkitään erillinen testiympäristö.
6. Tietokantaan luodaan synteettinen aineisto vasta eristyksen ja lähetysestojen tarkistamisen jälkeen. Tuotantovarmistusta ei palauteta tavalliseen kehityskantaan.

Git siirtää koodia, ei tietokantadataa, käyttäjätilejä, salaisuuksia tai palveluyhteyksiä. Kahden Remix-projektin välillä ei oleteta automaattista synkronointia. Auto-generoituja ympäristötiedostoja tai Cloud-yhteystietoja ei siirretä kehityksestä tuotantoon.

## C. Varmuuskopiointi ja palautus

**Dokumentoitu palvelu, ei tämän projektin varmistusnäyttö:** Cloud ottaa yhden tietokantavarmistuksen päivässä ja säilyttää noin 14 päivän varmistuksia. Ne sisältävät tietokannan rakenteen ja tiedot, eivät tiedostosäilön tiedostoja. Palautus koskee samaa projektia, korvaa tietokannan ja aiheuttaa muutaman minuutin käyttökatkon; mielivaltaiseen kellonaikaan palautusta ei ole.

**Ennen hyväksyttyä toteutusta käyttäjän toimittama näyttö:** avaa **More → Database → Manage → Backups** ja kirjaa viimeisin onnistunut UTC-aika sekä näkyvät palautuspisteet. Jos näkyy ympäristövalinta, ilmoita mikä ympäristö on tarkistettu. Kuvassa ei saa olla salaisuuksia tai asiakastietoja.

**Nykytilan säilyttäminen:** **More → Database → Manage → Settings → Export data**, Database → Export → Start export. Rajat: tietokanta enintään 15 GB, vientitiedosto enintään 5 GB, yksi vienti 24 tunnissa; taustapalvelun on oltava käynnissä. Vienti sisältää käyttäjätilit ja salasanatiivisteet mutta ei tiedostoja, funktiokoodia, salaisuuksia tai kirjautumispalvelujen asetuksia. Vienti on arkaluonteinen varmistus, ei testiaineisto. Storage-tiedostot ladataan erikseen **More → Storage** ja säilytetään suojatusti.

| Palautuksen osa | Menettely |
|---|---|
| Koodi | Hyväksytyn Git-tunnisteen palautus tarkistetulla revert-PR:llä, testaus ja erillinen julkaisu. Koodin palautus ei peruuta tietokantamuutoksia. |
| Rakenne | Ensisijaisesti yhteensopiva korjaava migraatio: vanhat kentät säilyvät, uudet ovat aluksi vapaaehtoisia. Ei tuhoavia down-migraatioita. |
| Tiedot | Poikkeustilanteessa aiempi päivittäinen varmistus samassa projektissa tai koko vienti erilliseen palautuskohteeseen. Palautuksessa kaikki palautuspisteen jälkeiset muutokset menetetään ja myös rakenne palautuu. Nykytilan vienti otetaan ennen palautusta. |
| Tiedostot | Erillinen tiedostovarmistus ja kohteen tiedostojen, polkujen, näkyvyyden sekä käyttöoikeuksien tarkistus. Tietokantapalautus ei palauta tiedostoja. |

Palautusharjoitus tehdään vain erillisessä, käyttöoikeusrajatussa palautusympäristössä. Cloudin Backups-näkymä ei palauta varmistusta toiseen Cloud-projektiin. Täyden viennin erillinen palautuskokeilu tarvitsee käyttäjän omistaman palautuspalvelun ja tarvittaessa asiantuntijan. Jos aidon varmistuksen käyttöä ei hyväksytä, synteettinen koe todentaa vain menettelyn, ei tuotantovarmistuksen palautettavuutta. Palautuskohteen sähköpostit ja ajastukset estetään ennen käyttöä; oikeita käyttäjiä ei kirjata sisään. Kirjataan rakenteen, rivimäärien ja tiedostojen eheys sekä mitattu palautusaika. Hyväksyttäviä tietohävikki- ja toipumisaikoja ei luvata ennen päätöstä ja harjoitusta.

## D. Käyttäjähallinnan korjaus ja oikeustestit

Korjaus toteutetaan ensin kehityksessä:
- Tavallinen tunnuksen luonti ei koskaan vaihda olemassa olevan tunnuksen salasanaa. Olemassa oleva sähköposti palauttaa selkeän ristiriitavirheen ilman käyttäjä- tai roolimuutoksia. Muut luontivirheet eivät käynnistä palautusta.
- Salasanan palautus on erillinen, tarkoituksellinen ja lokitettava toiminto: käyttäjän oma varmennettu palautuspolku tai palvelinpuolelta pääkäyttäjäksi vahvistetun henkilön käynnistämä palautus. Ei salasanojen palauttamista vastauksessa, näyttämistä lokissa tai lähettämistä tavallisena viestinä.
- Roolikirjoituksen virheet käsitellään; osittain luotu tunnus ei tuota onnistumisviestiä tai ylimääräisiä oikeuksia. Roolit säilyvät suojatussa erillisessä taulussa. Palvelin vahvistaa istunnon ja oikeudet jokaisella hallintapyynnöllä.

Testimatriisi kehityksen omilla tunnuksilla:
- **Pääkäyttäjä:** käyttäjähallinta, tavoitteet ja jakosäännöt toimivat; luontiyritys olemassa olevalle tunnukselle ei vaihda sen salasanaa.
- **Editori:** sallittu CRM-käsittely ja tiimihakemisto toimivat; käyttäjäluonti, roolimuutokset, tavoitteiden/jakosääntöjen muutokset estyvät.
- **Kirjautunut ilman työtilaoikeutta:** työtila sekä suorat CRM-luku- ja kirjoituspyynnöt estyvät.
- **Kirjautumaton/virheellinen istunto:** suojatut pyynnöt estyvät. Roolikyselyn virhe ja vanhan käyttäjän viivästynyt vastaus eivät anna oikeuksia.

Kokeillaan sekä näkymää että suoraa palvelin- ja tietokantapyyntöä. Jokaisella estetyllä polulla varmistetaan myös, ettei käyttäjää, salasanaa tai tietoa muuteta eikä ulkoista kutsua tehdä. Pelkkä RLS-asetuksen lukeminen ei ole hyväksytty oikeustesti.

## E. Muutosten testaus ja tuotantoon vienti

1. Kehityksen PR sisältää rajatun koodimuutoksen, migraatiot, testit ja palautusohjeen; ei testiasiakkaita tai ympäristötunnuksia.
2. Sovitaan yhteinen tuotantolähtöversio. Ylläpitäjä siirtää vain hyväksytyt muutokset kehitysrepositorysta tuotantorepositoryn työhaaraan ja avaa PR:n suojattuun synkronoituun haaraan. Tarkistetaan myös ympäristötiedostojen poissulku ja migraatiohistorian jatkuvuus; ei kahden migraatiojournalin sokkoyhdistämistä.
3. Eristetyssä kannassa harjoitellaan tuotannon nykyisestä rakenteesta alkava täsmälleen sama migraatiojärjestys. Testataan vanhan julkisen sovelluksen yhteensopivuus, CRM, roolit, sähköposti-estot, laskennat ja SSG/syvälinkit. Julkaisun hyväksyjä tarkistaa tulokset.
4. Ennen tuotannon muutoksia saadaan erillinen hyväksyntä, ajantasainen varmistusnäyttö ja palautussuunnitelma. Additiiviset migraatiot suoritetaan hyväksytyssä järjestyksessä Cloud-työkalulla; Git-synkronointi ei sovella niitä. Funktiot julkaistaan erikseen: Cloudissa Git-synkronointi ei julkaise niitä.
5. PR yhdistetään synkronoituun haaraan hallitussa julkaisuikkunassa. Sivuston näkyvät muutokset viedään verkkoon vasta Publish → Update -toiminnolla. Tietokanta- ja funktiomuutokset tulevat voimaan heti soveltamisen/julkaisun yhteydessä, joten järjestyksen on oltava taaksepäin yhteensopiva.
6. Tarkistetaan julkaistu sivusto, kirjautuminen ja tiedon takaisinluku sovitulla tavalla ilman oikeille asiakkaille lähteviä testiviestejä. Virhetilanteessa keskeytetään eteneminen ja käytetään yllä olevaa erillistä koodi-/tietopalautussuunnitelmaa.

Nykyiset sisältö-, kirjautumis-, CRM-, tarjous-, tavoite-, markkinointi- ja sähköpostikokonaisuudet säilytetään. Nykydata riittää yhteydenottoihin, omistajiin, tehtäviin, tarjouksiin, kirjattuihin myynteihin, tavoitteisiin ja suostumukseen perustuviin markkinointimittareihin. Tuotannon toteutukset, Claude-suunnitelmaversiot ja hyväksynnät, osallistujat sekä laskutus-/Netvisor-tilat ovat myöhempää rakentamista; niitä ei esitetä nyt mitattuina nollina.

## F–G. Päätökset, esteet ja hyväksymiskriteerit

Ennen toteutusta tarvitaan suunnitelman hyväksyntä ja Git-yhteyden tilan sekä varmistusluettelon käyttäjänäkymän vahvistus. Lisäksi käyttäjä nimeää julkaisun hyväksyjän, varmistusten säilytyspaikan ja palautusharjoituksen vastuuhenkilön; mahdolliset erillisen palvelun kustannukset hyväksytään ennen hankintaa.

- [ ] Kehityskohteen eri tietokanta, omat käyttäjät ja tunnukset on todennettu; tuotantoasiakkaita ei ole kehitysaineistossa.
- [ ] Testeissä sähköposti-, maksu- ja tuotantorajapintakutsuja on 0; tuotannon ajastukset eivät käy kehityksessä.
- [ ] Git-yhteys, suojattu haara ja kahden repositoryn PR-siirtomenettely on kokeiltu vaarattomalla muutoksella.
- [ ] Pääkäyttäjä/editori/oikeudeton/anon-testit läpäisevät palvelin- ja RLS-tasolla; luonti ei muuta olemassa olevaa salasanaa.
- [ ] Viimeisin onnistunut varmistus on nähty, tiedostovarmistus erillinen, palautuskoe raportoitu turvallisessa kohteessa.
- [ ] Koodi, migraatiot ja funktiot voidaan viedä järjestyksessä; vanha julkinen versio pysyy toimivana välivaiheissa.
- [ ] Erillinen tuotantohyväksyntä on annettu ennen mitään tuotantomuutosta.

Tällä hetkellä yllä olevat toteutus- ja palautuskriteerit ovat avoimia: suunnitelman hyväksyntä ei tarkoita niiden olevan testattuja.