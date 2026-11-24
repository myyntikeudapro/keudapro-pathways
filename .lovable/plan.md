# Vaihe 1: Kurssiluettelo Remixistä

## Mitä saat käyttöön
- **Hallinnan kurssiluettelo** (uusi sivu Tilannekeskuksen Työtiloihin): koulutustuotteet, hintaversiot (vanha hinta lukittuu, kun se on käytössä), toteutuskerrat päivämäärineen ja paikkamäärineen sekä julkaisutila (luonnos / julkaistu / arkistoitu).
- **Julkinen koulutussivu** jokaiselle julkaistulle tuotteelle: kuvaus, hinta ja tulevat toteutuskerrat vapaine paikkoineen. Painike ohjaa tarjouspyyntöön tai yhteydenottoon.
- Esikatselulinkki luonnostuotteille, jotta henkilökunta näkee sivun ennen julkaisua.

## Mitä ei vielä tule (seuraavat vaiheet)
- Verkossa ilmoittautuminen, paikkavaraukset, jonotus ja osallistujien nimeäminen tulevat vaiheessa 2 (ryhmien ilmoittautumiset).
- Maksut, verkkokauppa ja Netvisor tulevat vaiheessa 3.
- Remixin kehitysaikaiset sähköpostien estot eivät tule koskaan.
- Asiakkaille ei lähde mitään viestejä tässä vaiheessa.

## Nykyiset sivut säilyvät
- M1-, aseptiikka- ja muut nykyiset koulutussivut sekä Lyyti-ilmoittautuminen pysyvät ennallaan. Luettelon sivut saavat oman osoitteen (esim. /kurssit/<nimi>), jotta ne eivät mene nykyisten osoitteiden kanssa päällekkäin.
- Luettelo on tyhjä, kunnes lisäät ensimmäisen tuotteen. Testidataa ei lisätä.

## Tärkeää
Tietokantamuutos tulee voimaan heti myös julkaistulle sivulle, koska tietokanta on yhteinen. Se ei vaikuta nykyisiin lomakkeisiin tai sähköposteihin. Sivuston näkyvät muutokset tulevat julki vasta, kun julkaiset ne.

## Tekninen toteutus
- Siirrän Remixin catalog-rakenteesta vain tuote-, hintaversio- ja toteutuskertataulut sekä niiden suojaustriggerit ja julkisen lukufunktion (cat_public_catalog, rajattuna published-tilaan). Ilmoittautumis-, paikka-, jono-, osapuoli-, viestipohja- ja lähetysjonotaulut jäävät vaiheeseen 2. Kaikki taulut saavat GRANTit ennen RLS-käytäntöjä: henkilökunnalla on kirjoitusoikeus (is_editor_or_admin), anon lukee vain lukufunktion kautta.
- Koodi: lib/catalog.ts, karsittu AdminCatalogPage (ilman ilmoittautumisosioita) reitille /admin/kurssiluettelo, karsittu CatalogProductPage (ilman cat_register-lomaketta) reitille /kurssit/:slug, SSG-esirenderöinti julkaistuille tuotteille, linkki Tilannekeskukseen.
- Testit: hintaversion lukitus, julkaisemattomat tuotteet eivät näy julkisesti, anon ei pysty kirjoittamaan.
