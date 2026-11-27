# Työtilan LEAN-etenemisohjaus – toteutus ja testit

## Päätös

**GO tämän luonnoksen käyttöliittymän katselmointiin. NO-GO hyväksynnälle ja julkaisulle vielä:** yhteensopivuus on tarkistettava Tilausten ja laskutuksen vakautus -luonnoksen hyväksynnän jälkeen. Sen ALV-, tarjouspoikkeama- ja laskutusjonokorjaukset eivät sisälly tämän luonnoksen pohjaan. Yhdistettyä käyttäjäpolkua ei ole varmennettu.

## Toteutus

- Asiakas-/organisaatiokortilla Seuraava vaihe näkyy kaikkien välilehtien yläpuolella. Yksittäisen tilauksen yhteydessä on myös tilauskohtainen ohjaus.
- Tarjouksen tuonti säilyttää palvelimen palauttamat organisaatio-, yhteydenotto- ja tarjoustunnisteet osoitteessa. Yhteyshenkilöt-välilehdeltäkin pääsee juuri tuodun tarjouksen tarkistukseen.
- Myyntikortin näkyvä ohjaus pysyy kortin yläosassa myös vieritettäessä. Tehtävälinkki kohdistaa ja fokusoi olemassa olevan tarjouksen, tilauslomakkeen, ohjelman, kapasiteetin, kytkennän tai luovutuksen.
- Myyntikortin valinta on osoitteessa; suora linkki, reload ja takaisin toimivat. Asiakaskortin paluuosoite kulkee mukana.
- Henkilökortin tapausvalinta perustuu vain tallennettuihin henkilö-/tarjous-/tilauslinkkeihin. Nimi tai sähköposti ei muodosta linkkiä.
- Luovutuslinkki avaa yksittäisen luovutuksen. Toisen henkilön vastaanotto näkyy odotuksena; nykyinen nimetty tuotantovastaava on edelleen ainoa, jolla vastaanottopainike näkyy.
- Koulutuskortin seuraava tehtävä johdetaan nykyisestä productionBoard-laskennasta ja avaa oikean välilehden. Ohjaus on ennen suuria tietokokonaisuuksia, myös mobiilissa.
- Kouluttajan oma kapasiteettinäkymä käyttää vain olemassa olevaa rajattua ohjelmaprojektiota. Markkinoinnin ja ylläpidon valikossa on tarkoituksenmukaiset työjonolinkit.
- Jos tarjouksia, tilauksia tai tapauksia on useita, käyttäjä valitsee kohteen. Satunnaista ensimmäistä kohdetta ei valita. Usean toimituksen tapauksessa ohjaus pyytää avaamaan oikean tilauksen/koulutuksen.
- Sopimuslaskutus on erillinen linkki. Se ei tarkoita toteutusvalmiutta tai suoritettua koulutusta.

## Päätös- ja roolirajat

Uudet painikkeet ovat navigointilinkkejä: ne eivät hyväksy tarjousta, voita kauppaa, vahvista tilausta, vastaanota luovutusta, lähetä viestejä tai käynnistä maksuja/laskuja. Kaikki päätökset tehdään olemassa olevissa toiminnoissa. Puuttuva vastuuhenkilö tai epäonnistunut haku ei tulkinnu hyväksynnäksi tai valmiiksi.

Tietokantamigraatioita, palvelinfunktioita, käyttöoikeuksia tai liiketoimintasääntöjä ei muutettu. db/seed.sql pysyi muuttumattomana. Tämän luonnoksen omassa tietokannassa tehtiin olemassa olevilla käyttöliittymän toiminnoilla yksi täysin synteettinen tarjous-/tilaus-/luovutuskoe. Ei oikeita Attendo/Emilia-tietoja, ei käyttäjän sähköpostia, ei oikeita asiakaskirjauksia. Esimerkkirivit eivät siirry sovellukseen hyväksynnässä.

## Testit

- 27 uutta pysyvää sääntö-/kohdetestiä: tuotu luonnos, lähetetty/hylätty/tuntematon tarjous, hyväksytty tarjous ilman tilausta, tilaus ilman ohjelmaa, ohjelma-/kapasiteettihyväksyntä, kytkentä, vastaanotto, palautus ja vanha revisio, puuttuvat vastuut, useat kohteet, vieraat tunnisteet, henkilökohtaisen tapauksen rajaus ja erillinen laskutus. Ei ulkoasu- tai kopiotestejä.
- Kohdennetut regressiot: companyFlow, customerRegister, contactRegister, productionBoard, productionCenter, contractBilling ja offerImport. Viimeinen ajo yhteensä **93 testiä**.
- Kirjautunut synteettinen selainpolku: tuonti (AI-poiminta estetty, tiedot täytetty käsin) → organisaatiokortti → juuri tuotu tarjous → ihmisen Hyväksytty-valinta → Vahvista tilaus -lomakkeen avaaminen ja täyttö → ohjelman tallennus ja hyväksyntä → nimetty tuotantovastaava tallentaa/hyväksyy kapasiteetin → myyjä kytkee tilauksen ja luovuttaa → myyjä avaa vastaanoton ilman vastaanottopainiketta → nimetty tuotantovastaava vastaanottaa → koulutuksen aikataulu/kouluttajat avautuvat.
- Kaksi editori-testikäyttäjää (myynti/tuotanto), admin ja kouluttaja. Kouluttajan asiakasrekisteripääsy estyy ja vastaanottopainiketta ei ole; oman ohjelman kapasiteetti avautuu ilman asiakas-/myyntilinkkejä.
- 1280×1800, 390×844 ja 320×740: seuraava tehtävä ensimmäisessä näkymässä, ei sivun vaakaylivuotoa; välilehden vaihto, suorat linkit, reload ja browser back tarkistettu.
- Hallittu asiakastietojen hakuhäiriö näyttää virheen, ei seuraavaa valmis-tehtävää. Vieraan tarjouksen order-linkki ei avaa toisen tarjouksen tilauslomaketta.
- Ei JavaScript-runtimevirheitä. Esikatselun ennestään havaitut Inter-kirjasinten HTTP 403 -vastaukset toistuivat; ne eivät olleet asiakastietojen tai roolien käyttöoikeusvirheitä. Kirjasinpalvelun korjaus ei kuulu tähän käyttöliittymäerään.
- Uusien ohjaustiedostojen lint ja git diff --check läpäisivät. Automaattisen koostamisen viimeisin loki: build OK.

## Mitä ei väitetä varmennetuksi

- Todellista AI-poimintaa ei kutsuttu: tähän navigointikokeeseen käytettiin olemassa olevan tuonnin käsintäyttöä hallitun poimintavirheen jälkeen. Varsinainen tuontitallennus ja sen palauttamat tunnisteet olivat todellisia tämän luonnoksen toimintoja.
- Palautetun/vanhan luovutuksen, monen myyntimahdollisuuden ja perutun/valmiin koulutuksen ohjaus testattiin puhtaissa testeissä; kaikkia ei tallennettu erillisiksi selaimen elinkaarikokeiksi.
- Varsinaista koulutuksen toteutusta tai maksu-/laskutusmerkintää ei tehty. Testattu loppupiste on tuotannon valmistelun avaaminen.
- Pääprojektin oikeita käyttäjiä ja asiakastietoja ei testattu. Varmuuskopion tila ei kuulu tämän luonnoksen varmennukseen.
- Vakautusluonnoksen kanssa pitää yhdistämisen jälkeen uusia tarjoustarkistus, tilauslomakkeen kohdistus, poikkeamien ihmishyväksyntä ja laskutuslinkit/jonot. Erityisesti CompanyTrainingSales.tsx muuttuu molemmissa luonnoksissa ja vaatii katselmoinnin.

## Muuttuneet tiedostot

Uudet: src/lib/workspaceNextStep.ts, src/lib/workspaceNextStep.test.ts, src/hooks/useFlowTaskFocus.ts, src/components/admin/NextStep.tsx, src/components/admin/CaseNextStep.tsx.

Päivitetyt: CustomerCard.tsx, ContactRegister.tsx, CrmWorkspace.tsx, SalesOperations.tsx, OfferImportDialog.tsx, CompanyTrainingSales.tsx, CompanyTrainingProduction.tsx, FlowStepper.tsx, WorkspaceNav.tsx, AdminProductionPage.tsx, src/components/admin/AGENTS.md ja roadmap.md sekä tämä raportti.

Ei hyväksyntää eikä julkaisua.