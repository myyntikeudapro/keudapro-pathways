Vaihdetaan Osaaminen-sivulla (`/osaaminen`) kahden kortin kuvat käyttäjän lataamiin valokuviin.

## Muutokset

1. Korvataan `src/assets/course-hygienia.jpg` tiedostolla `user-uploads://keittiöhenkilö_siivoamassa.png`
2. Korvataan `src/assets/course-anniskelu.jpg` tiedostolla `user-uploads://Anniskelupassi.png`

## Tekninen huomio

`src/pages/PatevyydetPage.tsx` importoi nämä tiedostot nimellä (`courseHygienia`, `courseAnniskelu`) ja mappaa ne kortteihin `courseImageMap`-objektissa. Kun pidetään tiedostonimet ja -polut samana, koodimuutoksia ei tarvita — Vite hakee uudet kuvat automaattisesti.

## Vaikutus

- Hygieniapassi-kortti: keittiöhenkilö puhdistamassa työtasoa
- Anniskelupassi-kortti: baarimikko kaatamassa drinkkiä lasiin
- Ei muita visuaalisia tai toiminnallisia muutoksia muualla sivustolla.