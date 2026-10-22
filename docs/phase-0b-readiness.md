# Vaihe 0B – valmistelu ja hyväksymisnäyttö

Päivä: 22.10.2026. Suunnitelma hyväksytty. **Tuotantoon siirtoa ei ole hyväksytty.**

## Nykyinen tila

- Tuotanto ja esikatselu käyttävät samaa Lovable Cloudia.
- Erillistä Remix-kehityskohdetta ei ole luotu tai varmennettu tässä keskustelussa.
- Paikallinen Git-historia havaittu; GitHub-yhteys ja julkaistun version tunniste vahvistamatta.
- RLS ja valittujen taulujen nykyiset käytännöt luettu; kolmen testiroolin käytännön oikeustestit tekemättä.
- Tunnuksen luonti voi vaihtaa olemassa olevan tunnuksen salasanan. Tuotantokorjausta ei ole tehty.
- Viimeisin onnistunut tietokantavarmistus ja Storage-varmistus vahvistamatta; palautuskoetta ei ole tehty.
- Sovelluskoodia, tuotantotietoja, kirjautumista tai palveluyhteyksiä ei muutettu tässä valmistelussa.

## Käyttäjän seuraavat toimet

1. Avaa **Projektiasetukset → Git**. Toimita yhteyden tila, repository ja synkronoitu haara tai kuva näkymästä ilman salaisuuksia. Älä irrota toimivaa yhteyttä.
2. Avaa **More → Database → Manage → Backups**. Toimita uusimman onnistuneen varmistuksen UTC-aika ja näkyvät palautuspisteet. **Älä valitse Restore-toimintoa.**
3. Tee projektin valikosta **Remix**, nimeä kopio `KeudaPRO – Kehitys` ja avaa kopion keskustelu. Älä vielä kokeile lomakkeita, tunnusten luontia tai lähetyksiä. Liitä alla oleva aloitusohje.
4. Nimeä julkaisun hyväksyjä, varmistusten suojattu säilytyspaikka ja palautusharjoituksen vastuuhenkilö. Erillisen palvelun mahdolliset kustannukset hyväksytään ennen hankintaa.

## Kopioitava aloitusohje kehitysprojektiin

> Tämä on KeudaPROn erillinen kehitysprojekti. Vaiheen 0B suunnitelma on hyväksytty vain kehityksen valmistelua varten. Älä julkaise tai muuta alkuperäistä tuotantoprojektia. Älä kopioi tuotannon asiakkaita, tunnuksia tai palvelusalaisuuksia.
>
> Aloita lukutarkistuksella: varmista, että tämän projektin Cloud-tietokanta on eri kuin alkuperäisen tuotantoprojektin. Jos tätä ei voida todentaa, pysähdy ennen kirjoittavia toimia. Varmista omat testikäyttäjät, tyhjä tai synteettinen asiakasdata ja erilliset palveluyhteydet. Älä tulosta avaimia tai muita salaisuuksia.
>
> Tarkista ajastukset, sähköpostijonot, Gmail-yhteys, kirjautumisviestit, mainospalvelut, maksut ja Netvisor-/muut tuotantorajapinnat. Varmistetussa kehityskohteessa estä kaikki oikeat lähetykset ja tuotantokutsut palvelinpuolelta ja pidä ajastukset pois käytöstä. Puuttuva ympäristöasetus estää lähetyksen. Älä yhdistä tuotantotunnuksia. Todista ulkoisten kutsujen määrä nollaksi ennen testiaineiston luomista.
>
> Korjaa vain kehityskohteessa admin-users: olemassa olevan sähköpostin luontiyritys ei saa vaihtaa salasanaa tai muuttaa rooleja. Salasanan palautus on erillinen, tarkoituksellinen, palvelinpuolelta valtuutettu ja lokitettava menettely. Älä palauta salasanoja vastauksissa tai lokeissa. Käsittele roolikirjoituksen virheet ilman virheellistä onnistumista.
>
> Luo vasta eristyksen ja lähetysestojen jälkeen pääkäyttäjän, editorin ja kirjautuneen työtilaoikeudettoman synteettiset testitunnukset. Testaa myös kirjautumaton käyttäjä. Tarkista käyttöliittymä, suorat palvelinpyynnöt ja RLS. Estetystä pyynnöstä ei saa syntyä tietomuutosta tai ulkoista kutsua. Lisää konkreettiset regressiotestit ja suorita ne.
>
> Säilytä nykyiset julkiset sivut, sisältöeditori, CRM ja markkinointitoiminnot. Älä rakenna tuotannonohjausta, verkkokauppaa tai uusia liiketoimintatoimintoja. Dokumentoi muutokset ja hyväksymisnäyttö. Git siirtää vain tarkistetun koodin: älä siirrä automaattisia ympäristötiedostoja, Cloud-tunnisteita, testitietoja tai migraatiojournalia sokkona. Tuotantoon vienti odottaa erillistä hyväksyntää.

## Todennettava näyttö

| Kriteeri | Vaadittu näyttö | Tila |
|---|---|---|
| Oma kehitystietokanta | Kahden kohteen erillisyys todettu ilman salaisuuksien näyttämistä | Avoin |
| Ei oikeita lähetyksiä | Ajastukset pois, palvelinestot ja testeissä 0 ulkoista tuotantokutsua | Avoin |
| Testikäyttäjät ja synteettinen aineisto | Kehityskohteen omat tilit; ei tuotantoasiakkaita | Avoin |
| Turvallinen käyttäjähallinta | Luontiyritys ei vaihda olemassa olevaa salasanaa; roolitestit läpäisevät | Avoin |
| Git-siirtomenettely | Yhteys/haara vahvistettu ja vaaraton PR-siirto kokeiltu | Avoin |
| Varmistus | Viimeinen onnistunut UTC-aika nähty ja tiedostot varmistettu erikseen | Avoin |
| Palautus | Turvallisen palautuskohteen eheystulokset ja mitattu palautusaika | Avoin |
| Julkaisu | Yhteensopiva järjestys, hyväksyjä ja erillinen tuotantohyväksyntä | Ei valtuutettu |

Täysi tietokantavienti on arkaluonteinen varmistus, ei kehitysaineisto. Cloudin palautusnäkymä palauttaa vain samaan projektiin. Eristetty täyden viennin palautusharjoitus tarvitsee erillisen käyttäjän hallitseman palautuskohteen; tavallinen Remix ei riitä. Tuotannon palautusta ei käytetä kokeena.