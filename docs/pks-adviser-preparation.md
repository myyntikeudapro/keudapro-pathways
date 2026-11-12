# PKS-palveluneuvoja: valmistelu ja esikatselun aktivointi

Jäsen `tyonhakijan-yksilovalmennus-pks` on yhteisessä rekisterissä. Käyttöportti sallii vain esikatselun alkuperät, ei tuotantodomaineja; nykyistä yleisen tiimin näkyvyyttä ei ole muutettu. Palvelusivun nykyinen UKK ja yhteydenotto-ohje toimivat myös ilman keskustelua.

## Valmistellut rajat

- Sama keskustelupaneeli, jäsenkohtainen määritys ja tekoälyä esittävä symboli ilman kuvitteellista henkilöä.
- Julkisen palveluneuvojan takaisin-painike sulkee paneelin, ei avaa tiimivalitsinta.
- Ajanvaraus, sähköpostimuistio ja muut valmentajat eivät kuulu tämän jäsenen toimintoihin. Mukaanpääsyohjeessa on hyväksytyt yhteydenottolinkit ja kopioitava viesti.
- Keskustelu elää vain avoimen paneelin muistissa. Jäsenen vaihto ja sulkeminen poistavat paneelin; keskeneräinen pyyntö keskeytetään. Ei palvelimen keskustelutunnisteita, profiileja, keskustelutietokantaa tai aineistovälimuistia.
- Oma palvelinraja hyväksyy vain viestit: 20 viestiä, 2 000 merkkiä/viesti, 48 000 tavua/pyyntö. Rooli, lähde, järjestelmäohje, polku, URL, profiili tai keskustelutunniste eivät ole hyväksyttyjä pyyntökenttiä. Järjestelmärooli hylätään.
- Julkinen aineisto muodostetaan sallittujen kenttien listalla yhteisestä palvelu-JSONista ja työllisyyspalvelujen linkkilistasta. Sisäiset kentät kuten pendingConfirmations eivät sisälly aineistoon. Generointi: `node scripts/generate-pks-adviser-knowledge.mjs`.
- Keskustelutekstiä ei lähetetä markkinointianalytiikkaan. Uusi käsittelijä ei lokita pyyntöjä tai vastauksia. Muiden valmentajien olemassa oleviin lokitus- ja tietosuojakäytäntöihin ei puututtu.

## Ohjeistus ja esikatselun aktivointi 12.11.2026

Käyttäjän toimittama jäsenkohtainen järjestelmäohje on liitetty erilliseen system-instruction.ts-tiedostoon. SDK-mallikutsu käyttää nykyistä Gemini 3 Flash Preview -mallia ilman muiden valmentajien muutoksia. Endpoint on otettu käyttöön yhteisessä palvelussa, mutta hyväksyy vain esikatselun Origin-arvot. Tuotantodomainin pyyntö estetään palvelimella HTTP 403:lla.

Julkinen palvelin valitsee jäsenen ja tietopohjan kiinteästä luotetusta määrityksestä, ei pyynnöstä. Mallin ehdottamat toimintotunnisteet tarkistetaan sallittuun listaan; URL-osoitteet muodostetaan sovelluksen linkkilistasta, ei vastauksesta. Chat näyttää mukaanpääsytoiminnolle saman haarakohtaisen yhteydenotto-ohjeen kuin palvelusivu. Mallin URL-osoitteet ja yhteystiedot poistetaan vastauksesta. JSON-vastaus renderöidään tekstinä, ei HTML:nä tai mallin linkkeinä.

41 testiä ja todellinen selaimen mallivastaus, Helsingin yhteydenottolinkit, viestin kopiointi, sulkemisen jälkeinen tyhjä keskustelu sekä palvelukatkon UKK-varareitti varmennettu. Julkinen domain estetty ja selaimen coach-ohitus hylätty. Käyttöliittymä ei lupaa, ettei tietoja tallenneta; koko AI-käsittelyketjun lokisäilytys jää erikseen vahvistettavaksi. UKK-luonnoksen 42 tietuetta ovat erillään mallin kahdeksasta hyväksytystä UKK-vastauksesta. Tuontiraportti: docs/pks-adviser/faq-import-review.md. Sivustoa ei julkaistu.