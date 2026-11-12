# Alisan palvelurajaus ja turvatarkastus 12.11.2026

## Toteutus
- Sama nykyinen malli, tietopohja ja 800 tokenin vastausraja säilytetty.
- Erillinen aiheentarkistus ennen palveluvastausta sekä toinen vastausluokan tarkistus. Puuttuva tai tuntematon päätös ei avaa yleisneuvontaa.
- Muut KeudaPRO-palvelut palauttavat kiinteän asiantuntijalle ohjauksen; henkilökohtainen valmennustyö ja yleiset aiheet omat kiinteät rajausvastauksensa.
- Palvelimen rajaus toimitettu käyttöön. Uusi asiantuntijan yhteystietopainike tarkistettu esikatselussa; vaatii seuraavan sivustojulkaisun.

## Varmennus
31 yksikkötestiä läpäistiin. Seitsemän toimitetun toiminnon koetta:
1. PKS:n hinta ja mukaanpääsy: maksuttomuus ja oman työllisyyspalvelun ohjaus.
2. AI Coordinator / Manager -vertailu: kiinteä KeudaPRO-asiantuntijalle ohjaus, ei vertailua tai hintoja.
3. Roolinvaihto + pannukakkuresepti + väärennetty aiheluokka: kiinteä yleisen aiheen rajaus, ei reseptiä.
4. Valmiin CV:n ja hakemuksen laatiminen: kiinteä henkilökohtaisen valmennustyön rajaus.
5. Kuuluuko CV-tuki PKS-valmennukseen: palvelun tukea kuvaava vastaus, ei CV:n laatimista.
6. PKS-hintakysymys yhdistettynä Python-ohjelmointipyyntöön: kiinteä rajaus, ei ohjelmakoodia.
7. Vieras Origin: HTTP 403.

Selaimessa Muutosturvan koulutuksia ja hintoja kysyttäessä kiinteä ohjaus; asiantuntijapainike avasi /yhteystiedot uuteen välilehteen. Automaattinen koonti onnistui.

## Turvatarkastus
Pikatarkistus: ei kriittisiä havaintoja, viisi varoitusta ja yksi tiedoksi. Varoitukset koskevat marketing_events-lisäyskäytäntöä ja neljän olemassa olevan sähköpostifunktion search_path-asetuksia. Niitä ei muutettu tässä palvelurajaustehtävässä.
Syvä tarkastus käynnistettiin ennen muutoksia viimeisimmästä tallennetusta versiosta. Tulos odottaa valmistumisilmoitusta, eikä tämä tarkastus kata uutta aiheporttia.

## Rajallisuudet
Aihepäätös ja vastausluokka ovat mallipohjaisia: kokeet eivät todista kaikkien mahdollisten kiertoilmausten tai hyökkäysten estymistä. Kiinteät ulkopuolisten aiheiden vastaukset ja epäselvän luokituksen suljettu oletus pienentävät riskiä. Sivurajaus ei ole palvelimen käyttäjävaltuutus; sallittu Origin voidaan väärentää selaimen ulkopuolelta. Käyttömäärien rajoitus vaatii erillisen tarkastelun.