# Yhteyshenkilöt 1C-B – rajattu toteutussuunnitelma (26.11.2026)

Lähtökohta: 1C-A on toteutettu luonnoksessa (lukeva Yhteyshenkilöt-osio ja henkilökortti nykyisen `crm_contacts`-rekisterin päällä). 1C-B lisää hallitut henkilötiedot **ilman** monen organisaation henkilöhistoriaa ja **muuttamatta** tilausvahvistuksen tietomallia (`crm_orders.contact_id`, `crm_offer_versions.contact_id` säilyvät ennallaan).

## Sisältö

| Tieto | Toteutus | Huomio |
|---|---|---|
| Tehtävänimike | `crm_contacts.job_title text null` | Vapaa teksti, max 120 merkkiä; tyhjä = "Ei tallennettu". |
| Organisaatiokohtaiset roolit | Uusi taulu `crm_contact_roles(contact_id, role, created_by, created_at)`, rooli suljetusta listasta: päätöksentekijä, tilaaja, laskutusyhteyshenkilö, HR/koulutusvastaava, muu | Koska henkilö kuuluu yhteen organisaatioon, rooli on organisaatiokohtainen `contact_id`:n kautta. Ei vaikuta tarjous- tai tilauskohtaisiin rooleihin. |
| Avainhenkilömerkintä | `crm_contacts.is_key_person boolean not null default false` | Näkyy listassa merkkinä ja suodattimena. |
| Ammatilliset kiinnostusalueet | `crm_contact_interests(contact_id, service_key, source, created_by, created_at)`; `service_key` CRM_SERVICES-listasta, `source` = "henkilöstön kirjaus" | **Ei** markkinointilupa; ei käytetä listoihin tai lähetyksiin. |
| Yhteystietojen tarkistuspäivä | `crm_contacts.contact_verified_at timestamptz null` + `contact_verified_by uuid null` | Asetetaan vain erillisellä "Vahvistin yhteystiedot" -toiminnolla, ei koskaan muokkauksen sivuvaikutuksena. `updated_at` ei ole tarkistuspäivä. |
| Hallittu muokkaaminen | SECURITY DEFINER -funktio `crm_update_contact(contact_id, patch jsonb, expected_updated_at)` | Vain editor/admin (`is_editor_or_admin(auth.uid())`); optimistinen lukitus `expected_updated_at`; muutokset audit-historiaan; `organization_id` **ei** muokattavissa. |

## Voiko toteuttaa nykyisen yhden organisaation mallin päälle?

**Kyllä, kaikki kuusi kohtaa.** Perustelut:
- `crm_contacts.organization_id` on pakollinen ja yksiselitteinen, joten organisaatiokohtainen rooli = henkilökohtainen rooli tässä mallissa.
- Uudet kentät ovat valinnaisia (null/false), joten olemassa olevat rivit, asiakasvalinta (`crm_link_lead_customer`), tilausvahvistus (`crm_confirm_company_order`) ja tarjoustuonti (`crm_import_offer`) eivät muutu.
- Rajoitus: jos henkilö vaihtaa työnantajaa, hänelle perustetaan uusi yhteyshenkilörivi uuteen organisaatioon (vanha säilyy historian vuoksi). Rooleja ei siirretä. Monen organisaation henkilöhistoria jätetään myöhempään erään (1D), jolloin `crm_contact_roles` voidaan laajentaa `organization_id`-sarakkeella ilman tietojen menetystä.

## Rajaukset
- Ei markkinointilähetyksiä, osoitevientiä tai automaattista listalle liittämistä. Markkinointikelpoisuus näkyy edelleen "Ei varmennettu peruste".
- Ei tekoälyn automaattisia henkilö- tai rooliehdotusten tallennuksia.
- Koulutuksen osallistujat eivät kuulu yhteyshenkilörekisteriin.
- Kouluttajilla ei pääsyä; RLS kuten nykyisillä CRM-tauluilla.

## Toteutusjärjestys
1. Migraatio: uudet kentät + kaksi taulua + RLS + grantit; audit-trigger.
2. `crm_update_contact`- ja `crm_verify_contact`-funktiot (roolitarkistus, lukitus, organization_id lukittu).
3. Yksikkötestit (src/lib) ja eristetyt palvelinkokeet: editor/admin sallittu, kouluttaja/anon estetty, rinnakkainen muokkaus hylätään, tarkistuspäivä ei muutu tavallisessa muokkauksessa.
4. Henkilökortille muokkausdialogi ja "Vahvistin yhteystiedot" -painike; listaan avainhenkilö- ja roolisuodatin.
5. Selaintestit (320/390 px, admin/editor, kouluttaja estetty) ja regressio: Asiakkaat, Myynti, Tuotanto, tarjoustuonti, tilausvahvistus.
6. Turvatarkastus ennen hyväksyntää.
