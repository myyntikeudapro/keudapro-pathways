# PKS-palveluneuvoja: valmisteltu, ei aktivoitu

Jäsen `tyonhakijan-yksilovalmennus-pks` on yhteisessä rekisterissä. Erillinen käyttöportti on suljettu; nykyistä yleisen tiimin näkyvyyttä ei ole muutettu. Palvelusivun nykyinen UKK ja yhteydenotto-ohje toimivat ilman keskustelua.

## Valmistellut rajat

- Sama keskustelupaneeli, jäsenkohtainen määritys ja tekoälyä esittävä symboli ilman kuvitteellista henkilöä.
- Julkisen palveluneuvojan takaisin-painike sulkee paneelin, ei avaa tiimivalitsinta.
- Ajanvaraus, sähköpostimuistio ja muut valmentajat eivät kuulu tämän jäsenen toimintoihin. Mukaanpääsyohjeessa on hyväksytyt yhteydenottolinkit ja kopioitava viesti.
- Keskustelu elää vain avoimen paneelin muistissa. Jäsenen vaihto ja sulkeminen poistavat paneelin; keskeneräinen pyyntö keskeytetään. Ei palvelimen keskustelutunnisteita, profiileja, keskustelutietokantaa tai aineistovälimuistia.
- Oma palvelinraja hyväksyy vain viestit: 20 viestiä, 2 000 merkkiä/viesti, 48 000 tavua/pyyntö. Rooli, lähde, järjestelmäohje, polku, URL, profiili tai keskustelutunniste eivät ole hyväksyttyjä pyyntökenttiä. Järjestelmärooli hylätään.
- Julkinen aineisto muodostetaan sallittujen kenttien listalla yhteisestä palvelu-JSONista ja työllisyyspalvelujen linkkilistasta. Sisäiset kentät kuten pendingConfirmations eivät sisälly aineistoon. Generointi: `node scripts/generate-pks-adviser-knowledge.mjs`.
- Keskustelutekstiä ei lähetetä markkinointianalytiikkaan. Uusi käsittelijä ei lokita pyyntöjä tai vastauksia. Muiden valmentajien olemassa oleviin lokitus- ja tietosuojakäytäntöihin ei puututtu.

## Seuraava ohjeistus ja aktivointi

AI-ohjeistusta tai mallikutsua ei ole toteutettu, koska ne liitetään seuraavassa vaiheessa. Palvelin palauttaa aina suljetun palvelun vastauksen myös silloin, jos selaimen käyttöporttia muokataan. Funktiota ei ole otettu käyttöön yhteisessä tuotantopalvelussa.

Seuraavassa vaiheessa liitetään hyväksytty ohjeistus ja tarkistetaan generoitu julkinen tietopohja. Mallikutsu tehdään nykyisen Lovable AI -yhteyden kautta SDK:lla; nykyisiä valmentajien mallikutsuja ei muuteta. Julkinen palvelin valitsee jäsenen ja tietopohjan kiinteästä luotetusta määrityksestä, ei pyynnöstä. Mallin ehdottamat toimintotunnisteet tarkistetaan sallittuun listaan; URL-osoitteet muodostetaan sovelluksen linkkilistasta, ei vastauksesta. Käyttöliittymän nykyiset kiinteät toimintolinkit ovat valmisteluvaiheen turvallinen ratkaisu.

Ennen AI-vastausten avaamista varmennetaan palveluntarjoajan lokitus ja säilytys sekä julkaistava tietosuojakuvaus. Ei luvata, ettei tietoja tallenneta. Testataan todellinen malliyhteys, toiminto-ohitukset, palvelukatkojen UKK-varareitti, eristys, pituusrajat ja peruutus. Julkaisua tai yhteisen tuotantopalvelun käyttöönottoa ei tehdä tämän valmistelun yhteydessä.