# PKS-palvelun kieliversiot

- Suomenkielinen osoite säilyy /tyohonvalmennus-pks; englanti /tyohonvalmennus-pks/en ja ruotsi /tyohonvalmennus-pks/sv.
- Kielivalinta koskee palvelusisältöä ja Alisaa. Sivuston yhteinen ylä- ja alapalkki, KeudaPRO-yhteystietosivu ja ulkoiset viranomaispalvelut eivät ole tässä tehtävässä käännettyjä.
- Alisan aloitus seuraa sivun kieltä. Palvelin tunnistaa asiakkaan keskustelukielen viesteistä ilman asiakkaan toimittamaa kielivalitsinta. Myös kiinteät aiherajaukset ovat kolmella kielellä. Suomenkielinen hyväksytty tietopohja määrää ehdot; käännökset eivät laajenna niitä.
- 74 testiä läpäistiin. Selaimessa englannin ja ruotsin kielivalinta, uudelleenlataus, asiakkuusvalinta, kopiointipainike ja oikea AI-vastaus tarkistettu. Näyttöleveydet 320/390/919/1280 px: ei vaakavieritystä tai havaittuja suoritusvirheitä.
- Toimitetun palvelintoiminnon englannin ja ruotsin palveluvastaukset sekä englannin muu-koulutusohjaus ja ruotsin ohitusyrityksen rajaus testattu.
- Staattinen esirenderöintiskripti tarkistettu erillisellä testikuorella: jokaisen kielen title, canonical, html-lang, neljä hreflang-linkkiä ja kahdeksan FAQPage-vastausta. Kokonaista tuotantojulkaisua ei ajettu.
- Uudet sivutekstit ovat toteutuksessa tehdyt käännökset hyväksytystä suomalaisesta sisällöstä; erillistä ammattikääntäjän tarkistusta ei tehty.

## Turvatarkastus
Valmistunut syvä tarkastus sisältää **viisi kriittistä ja 12 varoitusta**, lisäksi pikatarkastuksen viisi varoitusta ja yhden tiedoksi. Kriittiset koskevat salasanasuojatun pilottisisällön asiakaspuolista suojausta, kolmen avoimen maksullisia AI-vastauksia tuottavan toiminnon käyttöä sekä viestijonojen mahdollista paljastumista. Alisan avoimen AI-käytön kuluriski on varoitus. Havainnot eivät ole tässä kielitehtävässä korjattuja, eivätkä skannerin väitteet ole erikseen toistettuja hyökkäyksiä. Aiempi chat-maininta kuudesta kriittisestä oli laskentavirhe; oikea määrä on viisi.
Tarkastus kattoi ennen Alisan aiheportin ja kieliversioiden muutoksia tallennetun version. Julkinen sivurajaus ja sallittu Origin eivät korvaa käyttömääriä rajoittavaa palvelinsuojausta.