# Admin-editori koulutuskorttien hallintaan

## Tavoite

Sinä ja Satu voitte lisätä, muokata, järjestää ja piilottaa koulutuskortteja (Pätevyydet / Äly / Kasvu / Noste) ilman koodimuutoksia. Muutokset menevät tietokantaan ja näkyvät sivustolla välittömästi ilman uutta julkaisua.

## Toteutus vaiheittain

Iso työ kannattaa pilkkoa. Ehdotan tätä järjestystä — toteutetaan **vaihe 1 ja 2 nyt**, ja jatketaan loput myöhemmin omina pyyntöinä, kun ensimmäinen on testattu.

### Vaihe 1 — Pohja (nyt)
- **Tietokantataulut:** `card_categories` (sivu + kategoria, esim. "patevyydet/logistiikka") ja `training_cards` (kortit).
- **Käyttäjäroolit:** `app_role` enum (`admin`, `editor`) ja `user_roles`-taulu turvallisesti omana taulunaan (ei profiles-taulussa).
- **RLS:** Kaikki saavat lukea julkaistuja kortteja (`published = true`). Vain admin/editor voi lisätä, muokata, poistaa.
- **Kirjautuminen:** Sähköposti + salasana. Auto-confirm pois → vahvistat sähköpostin ensimmäisellä kerralla. Julkista signup-sivua ei tehdä — käyttäjät luodaan kerran tietokannan kautta.

### Vaihe 2 — Admin-paneeli (nyt)
- Uusi reitti `/admin` (suojattu, vaatii admin- tai editor-roolin).
- Reitti `/admin/login` sähköpostikirjautumiseen.
- Editorinäkymä:
  - Kategoriavalitsin (sivu + kategoria)
  - Korttien lista, drag-ja-pudota -järjestys
  - Lisää uusi kortti -nappi
  - Muokkauslomake per kortti: **nimi**, **ingressi** (max 100 merkkiä, näytetään laskuri), **"Lue lisää" -linkki**, **toiminta-linkki** (radio: *Ilmoittaudu* tai *Kysy lisää*) + sen URL, julkaistu-kytkin.
  - Esikatselu (näyttää kortin samalla tyylillä kuin sivustolla).
- Toast-ilmoitukset tallennuksen onnistumisesta/virheestä.

### Vaihe 3 — Migraatio + sivuston kytkentä (myöhemmin omana pyyntönä)
Tämä vaatii että vaihe 1+2 on käytössä ja testattu. Sitten:
- Migratoidaan nykyiset kovakoodatut kortit Pätevyydet/Äly/Kasvu/Noste-sivuilta tietokantaan (kertasiirto).
- Korvataan ko. sivujen kovakoodattu data tietokantakyselyllä (`useQuery` Supabasen kautta).
- Säilytetään nykyinen kortin visuaalinen ulkoasu täysin ennallaan.

## Tietokantaskeema (vaihe 1)

```text
app_role            enum: admin | editor
user_roles          user_id, role  (RLS + has_role()-funktio)

card_categories     id, page_slug, category_slug, label, sort_order
training_cards      id, category_id, title, ingress (max 100),
                    read_more_url, cta_type (enroll|ask), cta_url,
                    published, sort_order, timestamps
```

## Mitä Satu/sinä teette editorissa

1. Kirjaudu osoitteessa `/admin/login`
2. Valitse sivu (esim. Pätevyydet) ja kategoria (esim. Logistiikka)
3. Klikkaa **Lisää uusi kortti** → täytä nimi, ingressi, linkit → tallenna
4. Vedä kortteja muuttaaksesi järjestystä
5. Julkaise / piilota -kytkin per kortti

## Avoimet kysymykset / oletukset

- **Käyttäjät:** Luodaan sinulle ja Satulle admin-tilit ensimmäisen testin jälkeen suoraan tietokantaan (ei julkista signup-lomaketta — turvallisempaa).
- **Kategoriat:** Aluksi listataan käsin (sama jako kuin nyt sivuilla). Kategorioiden lisäys voidaan tehdä myöhemmin osana editoria.
- **Kuvat ja kuvakkeet:** Ei mukana vaiheessa 1–2 — pidetään nykyiset kategoria-ikonit ennallaan. Jos haluat myös kuvat per kortti, kerro niin lisätään myöhempään vaiheeseen.
- **Versiohistoria:** Ei rakenneta omaa versiohistoriaa — Lovable Cloudin tietokannassa muutokset ovat välittömiä. Suositus: tee suuremmat muutokset harkiten.

## Tekninen huomio

- Auth-vaiheessa otetaan käyttöön **leaked password protection (HIBP)** ja **email-vahvistus**.
- Roolit tarkistetaan palvelinpuolella `has_role()` SECURITY DEFINER -funktiolla — ei koskaan localStoragesta tai client-puolelta.
- Toast-ilmoitukset jo käytössä projektissa (`sonner`), käytetään samaa.

Haluatko että aloitan vaiheilla 1 ja 2?
