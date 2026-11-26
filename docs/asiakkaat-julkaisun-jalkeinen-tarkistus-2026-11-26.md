# Asiakkaat 1A + 1B: julkaisun jälkeinen lukutarkistus

Tarkistus 26.11.2026 noin 17.29–17.32 UTC. Ei asiakas-, tarjous- tai tilauskirjoituksia, viestejä, talousintegraatioita, julkaisuja tai tuotannon rakennemuutoksia.

## Kunnossa

- Julkaistu `https://keudapro.fi/admin/asiakkaat` palauttaa sovelluksen ja ohjaa kirjautumattoman `/admin/login`-sivulle. Ei selainpoikkeuksia.
- Julkaistun ohjelmaversion tunniste `/assets/index-B3ywcSBl.js` sisältää Asiakkaat-reitit ja uuden asiakasvalinnan. Tämä julkaistu HTML/ohjelmaversio ajettiin localhostissa Heikin nykyisellä istunnolla, oikeaa Cloud-tietokantaa vasten: organisaatiolista ja kolmen liittämättömän yhteydenoton jono toimivat. Organisaation hakutoiminto onnistui ilman tallentamista. Mobiilissa 390 px ei vaakaylivuotoa.
- 0033 ja 0034: migraatiohistorian tarkistus ilmoitti historian johdonmukaiseksi, molemmat mukana. Todellinen tietokanta sisältää liittämisen idempotenssitaulun, organisaation ja yhteyshenkilön viitteet, aktiiviset kaksi suojatriggeriä sekä asiakasvalinnan palvelintoiminnot. `crm_confirm_order` käyttää 0034:n `array_append`-korjausta.
- Haku, liittäminen ja yritystilauksen vahvistus vaativat palvelimella kirjautuneen admin/editor-roolin. Niillä ei ole anonyymin suoritusoikeutta. Asiakastaulujen rivisuojaukset ovat päällä; kouluttaja ei täytä henkilöstöehtoa.
- Kirjautumattoman oikeat lukupyynnöt eivät palauta organisaatioita, yhteyshenkilöitä, yhteydenottoja tai tarjouksia. Organisaatiohaku estyy.
- Käytössä oleva `crm_confirm_company_order` lukee ostajan ja yhteyshenkilön yhteydenoton vahvistetuista viitteistä, vaatii ne ja hyväksytyn tarjouksen. Se ei luo organisaatiota nimen perusteella. Tallentavaa vahvistusta ei kutsuttu.
- Myyntikortin suora yhteydenottolinkki avautui. Tuotannon vanhat `?nakyma=gantt`, `?omat=1` ja `?jono=laskutusvalmiit` avasivat Koulutustuotanto-näkymän; tyhjässä rekisterissä ei ole toteutuskorttia, jolla tarkistaa yksittäisen toteutuksen syvälinkkiä.
- 21 nykyistä asiakastoimintojen testiä läpäisi. Paikallisen esikatselun viimeisin merkintä `build OK`; julkaistun ohjelmaversion kirjautuneissa tarkistuksissa ei selainpoikkeuksia eikä epäonnistuneita tietokantalukuja.
- Ennen/jälkeen: 3 yhteydenottoa, 2 tarjousta, 0 tilausta, 0 organisaatiota ja 0 yhteyshenkilöä; kaikkien viiden aineiston sisältötiivisteet samat. Ei orpoja organisaatioviitteitä tai ristiriitaisia yhteyshenkilöviitteitä.
- Pikatarkastus ei ilmoittanut uusia käsiteltäviä turvahavaintoja; ajantasainen laaja turvatarkastus käynnistettiin ja sen tulos odottaa valmistumista.

## Havaittu puute / näytön rajaus

- Organisaatiorekisteri on tyhjä. Täytettyä oikeaa organisaatiokorttia, tilauskorttia tai toteutuskorttia ei voi tarkistaa luomatta tietoja, mikä oli kielletty.
- Ennen julkaisua otettua täydellistä aineiston vertailukopiota ei ole tässä tarkistuksessa. Nykyiset yhteydenotot ja tarjoukset ovat olemassa ja säilyivät muuttumattomina tarkistuksen ajan, mutta tämä ei todista joka kentän muuttumattomuutta julkaisua edeltävään aikaan verrattuna.
- Kirjautunut testi käytti täsmälleen julkaistua ohjelmaversiota localhostissa. Istuntoa ei siirretty tuotantoverkkotunnukselle. Varsinainen keudapro.fi-osoite tarkistettiin kirjautumattomana; kirjautunut testi siellä vaatii käyttäjätestin.
- Kaikki tallentavat sovelluspyynnöt estettiin selaintarkistuksen aikana. Myyntisivun `ad-spend`-pyyntö estettiin myös varmuuden vuoksi; mainoskulun lukua ei varmennettu tässä asiakasrekisterin tarkistuksessa.

## Vaatii käyttäjätestin

- Satu avaa `/admin/asiakkaat` omalla editoritunnuksellaan; Heikki tarkistaa saman julkaistussa osoitteessa. Sadun tunnusta ei käytetty eikä rooleja muutettu.
- Kouluttajan kirjautunut esto on vahvistettu nykyisestä palvelinlogiikasta ja rivisuojauksista, ei tämän tuotantotarkistuksen kouluttajaistunnolla. Käytännön rooli- ja tallennustestit tehdään eristetyssä jatkoluonnoksessa.
- Täytetty asiakaskortti, oikea tilausvahvistus ja luovutus tuotantoon tarkistetaan erikseen sovitulla aidolla tapauksella.
- Uusimman varmuuskopion UTC-aika, tallennusmedioiden erillisvarmistus, palautusvastuuhenkilö ja eristetty palautusharjoitus odottavat käyttäjän vahvistusta. Tuotantoa ei palautettu.

## Ensimmäinen aito tapaus: ehdotettu turvallinen läpivienti

1. Heikki ja Satu valitsevat yhden oikean yritysasiakkaan ja yhden olemassa olevan yhteydenoton, jonka käsittelyyn on lupa. Varmistetaan varmuuskopio ja asiakkaan Y-tunnus YTJ:stä.
2. Heikki hakee organisaation ensin Y-tunnuksella; perustaa sen vain, jos se puuttuu ja tiedot ovat tarkistetut. Valitsee oikean yhteyshenkilön ja vahvistaa liittämisen kerran.
3. Molemmat avaavat saman asiakaskortin ja tarkistavat yhteydenoton, tarjoukset, myyntivastuun ja yhteyshenkilön. Keskeytetään ristiriidassa; ei poisteta tai yhdistetä historiaa.
4. Tilauksen vahvistus tehdään vain aidon hyväksytyn tarjouksen, dokumentoidun asiakkaan hyväksynnän sekä tarkistettujen sisältö-, hinta-, ALV-, aikataulu- ja sopimusehtojen perusteella. Laskutustapaa ei oleteta: projektikohtainen laskutus on vasta jatkoluonnoksessa.
5. Satu vastaanottaa luovutuksen tuotantoon ja tarkistaa koulutuksen samalta asiakaskortilta; alkuperäinen myyntivastuu ja myyntitulos jäävät Heikille nykyisen työnkulun mukaisesti.
6. Lopuksi tarkistetaan takaisin lukemalla, että syntyi vain yksi asiakaslinkki ja yksi tarkoitettu tilaus/toteutus. Ei laskun lähetystä, maksuja tai viestejä osana tätä koetta ilman erillistä päätöstä.