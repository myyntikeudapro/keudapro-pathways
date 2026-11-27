# Myynnin asiakaskortti – UX-1: erilliset ehdotukset (ei toteutettu)

Päivitetty 27.11.2026. Tämä on kirjallinen ehdotus. Mitään alla olevaa ei ole toteutettu, eikä se saa kiertää
ALV-valintaa, tarjouksen ja tilauksen vastaavuustarkistusta tai tilauspohjaista laskutusvalmiutta.

## A) Alustava valmistelupyyntö tuotannolle ilman vahvistettua tilausta

**Tarve:** myyjä haluaa varata kouluttajan ja ajankohdan, kun asiakas on hyväksynyt tarjouksen mutta tilaus on vielä vahvistamatta.

**Ehdotus**
- Myyntikortin Tuotanto-välilehdelle toiminto **Pyydä alustava valmistelu** (vain admin/editor).
- Tallentuu omaksi pyynnökseen (esim. `crm_prep_requests`: lead, tarjousversio, toivottu ajankohta, viesti, tila *pyydetty / tuotanto kuittasi / peruttu*), ei luovutukseksi.
- Tuotannon Luovutukset-välilehdellä erillinen rivi **Alustavat pyynnöt**, selvästi merkittynä "Ei tilausta – ei sitova".
- Pyyntö **ei** luo toteutusta, sessioita, laskutuseriä eikä muuta tarjouksen tai lead-tilan arvoja. Kouluttajan alustava varaus näkyy kuormituksessa harmaana.
- Kun tilaus vahvistetaan, pyyntö linkitetään luovutukseen; jos tarjous hylätään, pyyntö peruuntuu.

**Rajat:** ALV valitaan vasta tilauslomakkeella; laskutusjono ei näe pyyntöä; tuotanto ei voi vastaanottaa pyyntöä toteutukseksi.
**Vaatii:** yhden uuden taulun + roolitarkistetun palvelinfunktion (DB-muutos), erillinen hyväksyntä.

## B) Dokumentoidun tilauksen vahvistus ja tuotantoon luovutus yhdellä hyväksynnällä

**Tarve:** kun asiakkaan hyväksyntä on dokumentoitu (sähköposti/PDF) ja ohjelma on valmis, myyjä tekee nyt kaksi erillistä vaihetta.

**Ehdotus**
- Yksi vahvistusikkuna, joka näyttää rinnakkain: tarjousversio, tilauksen kentät (ALV **tietoisesti valittu**, peruste pakollinen verottomalle), poikkeamat ja niiden asiakashyväksyntä, laskutustapa ja erät, ohjelma, vastuukouluttaja ja tuotantovastaava.
- Painike **Vahvista tilaus ja luovuta tuotantoon** kutsuu yhtä palvelinfunktiota, joka ajaa **samassa transaktiossa** nykyiset tarkistukset järjestyksessä: tilauksen vahvistus (sama vastaavuus- ja ALV-logiikka kuin nyt) → tilauksen kytkentä ohjelmaan → luovutus. Jos jokin vaihe epäonnistuu, mitään ei tallennu.
- Tuotannon vastaanotto säilyy erillisenä ihmisen hyväksyntänä.
- Muutoshistoriaan yksi tapahtuma, joka viittaa kaikkiin syntyneisiin riveihin.

**Rajat:** ei uusia oikopolkuja; ei automaattista ALV:tä; poikkeavat tiedot vaativat edelleen asiakkaan hyväksynnän viitteen; laskutusvalmius lasketaan vasta tilauksesta.
**Vaatii:** uuden palvelinfunktion, joka kutsuu nykyisiä funktioita; ei uusia tauluja. Erillinen hyväksyntä ja testit.

## Lähdeaineiston yhdistäminen (DB-ehdotus)

Tuodut tekstit tallentuvat nyt yhteydenpitohistoriaan enintään 1 800 merkin osina. Kortti yhdistää osat ja erottaa PDF:n ja sähköpostin
merkintöjen perusteella pelkästään näytössä. Pysyvä ratkaisu: oma `crm_source_documents`-taulu (tyyppi pdf/sähköposti, tiedostonimi, teksti, tuontitunniste),
johon uudet tuonnit tallentuvat; vanhoja ei muunneta massana.
