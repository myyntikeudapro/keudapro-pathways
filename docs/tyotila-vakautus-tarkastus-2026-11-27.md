# KeudaPRO Työtila – nykytilan varmistus ja vakautusvaiheen suunnitelma (27.11.2026)

Tarkastus tehtiin lukemalla koodia ja tietokantaa. Tuotantotietoja ei muutettu, viestejä ei lähetetty eikä integraatioita otettu käyttöön.

## A. Julkaisun nykytila

| Taso | Tila 27.11.2026 klo 11.56 UTC |
|---|---|
| Julkaistu tuotantoversio | Julkaisu pyydettiin 11.54 UTC käyttäjän luvalla. Mukana pääprojektin versio, jossa on 1C-B (commit 71db24b ja sitä uudemmat). Julkaisun valmistumista ei tarkistettu erikseen. |
| Pääprojektin hyväksytty koodi | Asiakkaat 1A–1B, Työtilan jatko 1–4, Tarjouksen tuonti tekoälyllä, Yhteyshenkilöt 1C-A ja 1C-B. |
| Tuotannon tietokanta | 42 toteutunutta tietokantamuutosta. Kansiossa on 42 tiedostoa (0000–0041), joten **0033–0041 ovat kaikki toteutuneet**. |

Johtopäätös: koska julkaistu ohjelma ja tietokanta ovat nyt samassa versiossa, julkaistua ohjelmaa rikkovaa eroa ei ole. Ennen julkaisua muutokset 0040–0041 lisäsivät vain sarakkeita ja suojauksia. Ne eivät poistaneet mitään, joten vanha versio toimi niiden kanssa.

**Varmuuskopio ja palautus: EI VARMENNETTU.** Varmuuskopioluetteloa ei voi lukea työkaluilla. Käyttäjä vastasi 26.11. "En tiedä". Lovable Cloud ottaa tietokannasta yhden varmuuskopion päivässä ja säilyttää niitä noin 14 päivää. Tiettyyn hetkeen ei voi palauttaa, ja tallennetut tiedostot eivät kuulu varmuuskopioon. Varmennettava itse: **More → Database → Manage → Backups**, uusimman rivin UTC-aika. Lisäksi nimetään palautusvastuuhenkilö ja otetaan yksi vienti (Export data).

## B. Kolme tärkeintä korjausta – havainnot

### 1. ALV-valinta (VAHVISTETTU PUUTE)
- `CompanyTrainingSales.tsx` aloittaa valinnasta `koulutus_veroton` ("Koulutus, veroton"), joten verottomuus on oletuksena.
- Palvelin (`crm_confirm_company_order`) päättelee verokannan: `koulutus_veroton` → 0, muuten 25,5. Vaihtoehtoja on vain kaksi, vaikka tietokanta tuntee myös `kaannetty` ja `muu`.
- Attendon tarjous on **alv 25,5 %**. Nykyisellä oletuksella se olisi ollut helppo kirjata virheellisesti verottomaksi.

### 2. Hyväksytty tarjous vs. vahvistettu tilaus (VAHVISTETTU PUUTE)
- `crm_confirm_company_order` tarkistaa, että tarjous on hyväksytty. Sen jälkeen se kuitenkin **luo uuden tarjousversion käyttäjän lomakkeelle syöttämistä tiedoista** (sisältö, summa, ALV, päivät, ehdot) ja **merkitsee sen heti hyväksytyksi**.
- Tilaus voi siis poiketa asiakkaan hyväksymästä hinnasta, sisällöstä tai ehdoista ilman erillistä hyväksyntää, eikä poikkeama näy missään.

### 3. Laskutusvalmiuden kattavuus (VAHVISTETTU PUUTE)
- `productionCenter.ts` (`billingReady`) käy läpi **tuotantototeutukset** (`live.flatMap(delivery => …)`) ja hakee niiden tilauksen.
- Jos vahvistetulla tilauksella on erääntyvä erä mutta tuotantototeutusta ei ole, erä **ei näy jonossa**. Tämä koskee juuri ennakkolaskutusta ("koko summa alkaessa").

## C. Muut käytön kannalta olennaiset asiat

| Asia | Tila |
|---|---|
| Asiakkuusvastaava | Näkyy listalla. Puuttuva vastuu ei muodosta työjonoa → lisätään työjono "Ilman asiakkuusvastaavaa". |
| Yhteyshenkilön nimen/sähköpostin muutos | 1C-B lisäsi suojan (0041): kun henkilö on tarjous- tai tilaushistoriassa, muutos estetään ja ohjataan uuden henkilön luontiin. Toimii suunnitellusti, mutta oikea kirjoitusvirheen korjaus tarvitsee hallitun poikkeuksen. |
| Myynti vs. vahvistetut tilaukset | Tilannekeskus näyttää "Kirjattu myynti · alv 0 %". Myyntimittari perustuu sulkemispäivään ja arvoon, tilaukset omaan tauluunsa. Ero on selitettävä mittarin ohjetekstissä. |
| Tilaukset ↔ luovutukset | Tilaus ilman luovutusta ei nouse tuotannolle työjonoksi → lisätään "Vahvistettu tilaus, luovutus puuttuu". |
| Laskutettu/maksettu käsin | Tekstit korjattu ("merkitty käsin"). Merkinnän tekijä ja aika näkyvät. |
| AI-tarjoustuonti | Ehdotuksia ei tallenneta eikä kirjata lokiin. Tallennus vain ihmisen tarkistuksen jälkeen. Raja 20/h/käyttäjä ja 200/pv. Tietosuojaseloste tarkistettava: henkilötietoja lähetetään Lovable AI -palveluun. |
| Roolit oikeilla palvelinpyynnöillä | Testattu luonnoksissa (admin/editor/trainer/kirjautumaton). **Tuotannossa ei testattu** Heikin ja Sadun tunnuksilla. |

## D. Kehitysrekisteri

Tasot: L = toteutettu luonnoksessa · P = hyväksytty pääprojektiin · J = julkaistu · T = testattu tuotannossa · K = henkilöstön käytössä

| Toiminto | L | P | J | T | K |
|---|---|---|---|---|---|
| Myynnin kanban ja lista | ✓ | ✓ | ✓ | – | osittain (ei varmennettu) |
| Tuotanto: Gantt, Päivän työ, 5 välilehteä | ✓ | ✓ | ✓ | – | – |
| Asiakkaat 1A (lista, kortti, liittämättömät) | ✓ | ✓ | ✓ | lukutarkistus | – |
| Asiakkaat 1B (asiakasvalinta, tilausostaja) | ✓ | ✓ | ✓ | – | – |
| Projektikohtainen laskutustapa ja erät | ✓ | ✓ | ✓ | – | – |
| Julkisten AI-toimintojen käyttörajat | ✓ | ✓ | ✓ | – | – |
| Tarjouksen tuonti tekoälyllä | ✓ | ✓ | ✓ (27.11.) | – | – |
| Yhteyshenkilöt 1C-A | ✓ | ✓ | ✓ | – | – |
| Yhteyshenkilöt 1C-B | ✓ | ✓ | ✓ (27.11.) | – | – |
| Varmuuskopion varmennus ja palautuskoe | – | – | – | – | – |
| ALV-valinnan korjaus | – | – | – | – | – |
| Tilauksen poikkeamien hyväksyntä | – | – | – | – | – |
| Tilauspohjainen laskutusjono | – | – | – | – | – |
| 1C-C (henkilöroolit tarjouksessa/projektissa) | – | – | – | – | – |

Mitään ei ole merkitty "testattu tuotannossa" tai "henkilöstön käytössä" ilman Heikin ja Sadun omaa käyttöä.

## E. Päätös

### 1. GO/NO-GO
- **Julkaisu: GO, ja se on jo tehty.** Teknistä estettä ei ole.
- **Aitojen tilausten kirjaaminen: NO-GO**, kunnes korjaukset 1–3 on tehty ja varmuuskopio varmennettu.

### 2. Todelliset esteet (aidoille tilauksille, ei julkaisulle)
1. ALV-oletus on veroton.
2. Tilaus voi poiketa hyväksytystä tarjouksesta huomaamatta.
3. Ennakkolaskutettava erä voi pudota laskutusjonosta.
4. Varmuuskopion UTC-aika ja palautusvastuu varmentamatta.

### 3. Toteutussuunnitelma (yksi luonnos, oma testitietokanta)

**Korjaus 1 – tietoinen ALV**
- Lomake: ALV-käsittely alkaa tyhjänä ("Valitse"). Vaihtoehdot: Yleinen 25,5 % · Koulutus, veroton (peruste kirjoitettava) · Käännetty verovelvollisuus · Muu (peruste ja kanta kirjoitettava). Jos tarjouksella on ALV-tieto, se näytetään vertailuna, mutta valintaa ei tehdä käyttäjän puolesta.
- Palvelin: uusi versio tilausfunktiosta. Se hylkää puuttuvan ALV-valinnan, ei päättele kantaa perusteesta ja tallentaa kannan, perusteen sekä vahvistajan.
- Hyväksymisehto: tilausta ei voi vahvistaa ilman valintaa. Veroton vaatii perustetekstin. Palvelinkoe ilman valintaa → virhe.

**Korjaus 2 – tilaus = hyväksytty tarjous, poikkeamat näkyviin**
- Lomake esitäytetään hyväksytyn tarjousversion tiedoilla. Jos summaa, sisältöä, päiviä, ehtoja tai ALV:tä muutetaan, näytetään vertailu "Tarjouksessa → Tilauksessa".
- Poikkeava tilaus vaatii valinnan "Asiakas hyväksynyt muutoksen" sekä tavan ja viitteen (esim. sähköposti ja päiväys). Ilman niitä palvelin hylkää.
- Hyväksyttyä tarjousversiota ei muuteta. Poikkeama tallentuu uutena versiona, johon kirjataan viittaus alkuperäiseen ja muutoksen hyväksyntä.
- Hyväksymisehto: identtinen tilaus menee läpi suoraan. Poikkeava ilman hyväksyntää → virhe. Poikkeama näkyy asiakaskortin historiassa.

**Korjaus 3 – laskutusvalmius tilauksesta**
- Laskutusjono rakennetaan **vahvistetuista tilauksista ja niiden eristä**. Tuotantototeutus on lisätieto (linkki), ei edellytys.
- Erät, joilla ei ole toteutusta, merkitään "Toteutus ei vielä tuotannossa".
- Sama laskenta tilannekeskuksessa, tuotannossa ja asiakaskortilla.
- Hyväksymisehto: testi, jossa vahvistetulla tilauksella on erääntynyt alkuerä eikä toteutusta → erä näkyy jonossa. Netvisor- tai maksuintegraatioita ei käynnistetä.

### 4. Pilotti, kaksi aitoa asiakasta
1. **Attendo Oy** (tarjous 2.11., 900 € + alv 25,5 %, laskutus päätyttyä). Heikki liittää yhteydenoton → vahvistaa organaation → vahvistaa tilauksen tarjouksen tiedoilla (ALV 25,5 % valittu itse) → laskutustapa "päättyessä" → Satu vastaanottaa luovutuksen ja sopii päivän (tammikuu, klo 13–15).
2. **Toinen asiakas**, jolla on laskutus "alkaessa" tai "osissa", jotta laskutusjono testautuu. Asiakkaan valitsee Heikki.
- Ehdot: varmuuskopio varmennettu edellisenä päivänä, ei viestejä, laskuja tai maksuja, jokainen vaihe tarkistetaan asiakaskortilta ja kirjataan pöytäkirjaan.

### 5. Työlista 2–6 viikkoa

| Vko | Tehtävä | Lopputulos | Hyväksymisehto |
|---|---|---|---|
| 1 | Varmuuskopion varmennus | UTC-aika, vastuuhenkilö, yksi vienti tallessa | Kuvakaappaus Backups-näkymästä, vienti ladattu |
| 1 | Korjaukset 1–3 luonnoksessa | Kolme korjausta + testit | Palvelinkokeet ja testit läpi, GO-raportti |
| 1 | Heikin ja Sadun kirjautumistesti tuotannossa | Roolit toimivat | Molemmat näkevät Asiakkaat, Myynnin ja Tuotannon |
| 2 | Korjausten hyväksyntä ja julkaisu | Korjaukset tuotannossa | Uusi turvatarkastus ilman kriittisiä |
| 2 | Pilotti 1: Attendo | Aito tilaus ja luovutus | Asiakaskortti oikein, ALV 25,5 %, Satu vastaanottanut |
| 3 | Pilotti 2 | Ennakko- tai osalaskutus | Erä näkyy laskutusjonossa oikeana päivänä |
| 3 | Puuttuvien vastuiden ja luovutusten työjonot | Kaksi uutta jonoa tilannekeskukseen | Synteettisellä aineistolla oikeat rivit |
| 4 | Yhteyshenkilön hallittu korjaus | Kirjoitusvirheen korjaus, historia säilyy | Admin voi korjata perustellusti, muutos historiassa |
| 4 | Mittariohjeet | Myynti vs. tilaukset selitetty | Tekstit tarkistettu Heikin kanssa |
| 5 | 1C-C | Henkilöroolit tarjoukseen ja projektiin | Valinnat historiassa, hyväksyttyä versiota ei muuteta |
| 5–6 | Käyttöönotto | Kaikki uudet tilaukset työtilassa | 2 viikkoa ilman rinnakkaista Excel-kirjausta |
| 6 | Palautuskoe | Vienti palautettu erilliseen ympäristöön | Kirjautuminen ja tilaus luettavissa |
