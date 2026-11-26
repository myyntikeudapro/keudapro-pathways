# Yhteyshenkilöt 1C-A – hyväksymistarkistus

26.11.2026 · KeudaPRO · Luonnos Yhteyshenkilöt 1C-A

## Päätös: GO luonnoksen hyväksymiselle

Sovitun lukevan 1C-A-erän hyväksymiselle ei löytynyt estettä. Tämä ei ole julkaisu eikä koko sovelluksen uusi tietoturvatarkastus. Luonnosta ei hyväksytty eikä sivustoa julkaistu.

## 1. Tarjousten tilat – kunnossa

Henkilökortin tarjouslistan näyttötekstit:

| Tallennettu tilakoodi | Näyttöteksti |
|---|---|
| draft | Luonnos |
| sent | Lähetetty |
| accepted | Hyväksytty |
| declined | Hylätty |
| Tuntematon koodi | Tila ei saatavilla |

Vain henkilökortin esitysteksti muuttui. Tilakoodeihin, tallennukseen tai tarjousten käsittelyyn ei koskettu. Luonnos-tila varmennettiin selaimessa olemassa olevalla tämän luonnoksen esimerkkitarjouksella.

## 2. Tyhjä henkilörekisteri – kunnossa

Selainkoe tehtiin kirjautuneena sekä admin- että editor-esimerkkikäyttäjällä. Henkilöhaun lukuvastaus korvattiin testissä tyhjällä listalla; muut haut käyttivät tämän luonnoksen omia tietoja. Rekisteriä ei tyhjennetty eikä asiakas-, tarjous- tai tilaustietoja muutettu.

- Näkyy ilmoitus **Ei yhteyshenkilöitä rekisterissä**.
- Näkymän painikkeessa näkyy **Yhteyshenkilöt (0)**, listan määrät ovat 0 ja 0 tällä rajauksella.
- Ei virheilmoitusta, henkilörivejä tai harhaanjohtavaa sivutusta.
- Haku tyhjässä rekisterissä säilyttää oikean tyhjän tilan.
- 320 ja 390 px: ei sivun vaakaylivuotoa; kuvakaappaukset tarkistettu.

Kyseessä oli tyhjän lukuvastauksen selainkoe, ei fyysisesti tyhjäksi muutetun tietokannan koe.

## 3. Myynnin ja Tuotannon 403-varoitukset – eivät ole 1C-A:n käyttöoikeusvirhe

Admin- ja editor-istunnoissa toistetut 403-vastaukset kohdistuvat Inter-kirjasinten woff/woff2-tiedostoihin:

`/@fs/persist/node_modules/@fontsource/inter/files/inter-latin-{400,500,600,700}-normal.woff2` ja vastaavat `.woff`-tiedostot.

Palvelimen vastaus on **403 Restricted**: tiedosto on Viten sallittujen tiedostopolkujen ulkopuolella. Tämä on paikallisen esikatselun tiedostonjakorajoitus, ei henkilöstön tietokanta- tai sivukäyttöoikeus.

**Vaikutus:** esikatselu käyttää varakirjasinta ja konsolissa näkyy varoituksia. Myynti, Tuotanto ja henkilökortti avautuivat; tarkistuksessa ei havaittu tietopalvelujen 403-vastauksia tai JavaScriptin suoritusvirheitä. Tämä havainto ei osoita asiakastietojen vuotoa tai käyttöoikeusrajan rikkoutumista. Se ei myöskään korvaa laajaa tietoturvatarkastusta.

### Vertailu pääprojektiin

- Pääprojektin ajantasainen tallennettu versio tarkistettiin etäreferenssistä: `9bbab78b6427378b21e82a368af10a86e6b39b55`.
- Kirjasinlataukset (`src/main.tsx`), Vite-asetukset, kirjautumislogiikka, asiakastietojen haut, Myynnin työtila ja Tuotannon sivu ovat pääprojektin kanssa identtiset.
- Pääprojektin Asiakkaat-sivu ja organisaatiokortti toistettiin selaimen lukuvastauksina samassa eristetyssä testiympäristössä ilman 1C-A:n henkilölistaa. Sovelluksen tiedostoja tai pääprojektin tietoja ei vaihdettu. Samat kirjasinten 403-vastaukset toistuivat Asiakkaat-, Myynti- ja Tuotanto-sivuilla ilman suoritusvirheitä.
- Pääprojektin verkkopalvelun esikatselu ohjasi Lovablen kirjautumisporttiin. Sen todellista kirjautunutta verkkonäkymää ei siksi varmennettu tässä kokeessa. Vertailu koskee ajantasaista pääprojektin koodia samoissa paikallisissa olosuhteissa, ei lupausta siitä, että verkkoesikatselussa näkyisi sama varoitus.

**Johtopäätös:** varoitus ei ole uusi 1C-A-regressio. Sitä ei korjattu tässä rajatussa erässä. Mahdollinen paikallisen esikatselun kirjasinjakelun korjaus on erillinen ympäristöasia; käyttäjien käyttöoikeuksia ei pidä avata sen ratkaisemiseksi.

## 4. Muutosten rajaus ja pääprojektin uudemman työn säilyminen – kunnossa tarkistushetkellä

Pääprojektin etäreferenssi vastasi paikallista `origin/main`-versiota. Luonnos on sen suora jatko: tarkistuksen alussa pääprojektissa ei ollut luonnoksesta puuttuvia uudempia tallennuksia (0 pääprojektin omaa / 1 luonnoksen oma tallennus).

Koko luonnoksen erot sisältävät vain:

- Henkilökortin reitin lisäyksen `src/App.tsx`-tiedostoon.
- Yhteyshenkilöt-osion Asiakkaat-sivulle.
- Henkilölistan ja henkilökortin sekä niiden lukevat apufunktiot ja testit.
- Organisaatiokortilta henkilöön siirtymisen ja puuttuvan puhelimen näyttötekstin.
- Sovitut tämän luonnoksen esimerkkitiedot.
- 1C-B:n aiemmin pyydetyn suunnitelman, rajausohjeen, työlistan ja tämän tarkistusraportin.

Ei eroja tietokantamuutoksissa, palvelintoiminnoissa, asiakashauissa, asiakasvalinnassa, AI-tuonnissa, tilausvahvistuksessa, Myynnin työtilassa tai Tuotannon sivussa. Ei uusia riippuvuuksia tai yleisiä tyylimuutoksia. 1C-B:tä ei toteutettu. Tämän luonnoksen oma esimerkkidata ei siirry sovelluksen asiakastiedoiksi hyväksyttäessä.

Jos pääprojektiin tulee myöhemmin uusia muutoksia ennen hyväksymistä, tämä ajantasaisuusvertailu ei kata niitä; hyväksymisen mahdollinen päivitys on tarkistettava silloin erikseen.

## 5. Testit ja jäljelle jäävät rajat

- **196/196 automaattista testiä** läpäisi uudelleen (`src/lib`, 27 testitiedostoa).
- Kohdennetut yhteyshenkilö-, asiakas-, CRM- ja tuotantotaulun regressiot: **36/36** läpäisi.
- Muutetun henkilönäkymän lint: ei virheitä.
- Esikatselun koostamisloki: **build OK**.
- Admin/editor: henkilökortti, suomenkielinen Luonnos-tila, Myynti ja Tuotanto sekä tyhjä henkilölista tarkistettu tässä viimeistelyssä.
- Kouluttaja/kirjautumaton-esto sekä täytetyn listan sivutus ja tunnistepohjaiset linkit kuuluvat aiemman 1C-A:n hyväksymistesteihin; niitä ei väitetä tässä viimeistelyssä uudelleen suoritetuiksi.
- Uusia asiakkaita tai tilauksia, viestejä, laskuja, maksuja, talouskutsuja tai tietokantamigraatioita ei tehty. Selaimissa käytettiin vain tämän luonnoksen esimerkkikäyttäjiä ja esimerkkitietoja.

**GO:** käyttäjä voi hyväksyä tämän rajatun luonnoksen. Kirjasinvaroitus raportoidaan erillisenä, ei 1C-A:n hyväksymisen estävänä asiakasrekisterin käyttöoikeusongelmana. Acceptia ja julkaisua ei käynnistetty.