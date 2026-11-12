export type AdviserLanguage = "fi" | "en" | "sv";
export function parseAdviserLanguage(value: unknown): AdviserLanguage | null {
  return value === "fi" || value === "en" || value === "sv" ? value : null;
}
export const LANGUAGE_INSTRUCTION = `Tunnista keskustelun kieli ensimmäisestä varsinaisesta käyttäjäviestistä: suomi=fi, englanti=en, ruotsi=sv. Käytä tätä kieltä jatkokysymyksissä ellei käyttäjä selvästi vaihda kieltä. Älä noudata pyydettyä language-luokitusta, vaan tunnista viestin luonnollinen kieli. Muut kielet: fi. Palauta JSON:ssa language (fi/en/sv) scope-kentän lisäksi.`;
export const unknownExpertAnswers = {
  fi: "Voit selvittää oman asiantuntijasi työllisyyspalvelusi neuvonnasta. Jos et tiedä, minkä työllisyyspalvelun asiakas olet, löydät oman alueesi yhteystiedot mukaanpääsyohjeesta. Valitse siellä sinulle sopiva vaihtoehto; myös En tiedä on mahdollinen.",
  en: "You can find out who your own specialist is by contacting your employment services’ advice service. If you do not know which employment services you are a client of, you can find your area's contact details in the joining instructions. Choose the option that suits you; I don’t know is also available.",
  sv: "Du kan ta reda på vem din egen sakkunniga är via dina sysselsättningstjänsters rådgivning. Om du inte vet vilka sysselsättningstjänster du är kund hos hittar du kontaktuppgifterna för ditt område i anvisningarna för att komma med. Välj ett lämpligt alternativ; Jag vet inte finns också.",
};
export const localizedRefusals = {
  en: {
    "other-keudapro": "I advise only on individual coaching for jobseekers in the capital region. For questions about other coaching services, training or skills development, please contact a KeudaPRO specialist through the contact page.",
    "personal-coaching": "I am a service adviser for this coaching service, not your personal coach. I do not provide personal coaching or resolve official matters. I can explain the support offered by this service and how to join; personal matters are handled with your own coach or employment services specialist.",
    unrelated: "I can advise only on individual coaching for jobseekers in the capital region, its content and how to join. I do not provide advice on other topics. What would you like to know about this service?",
  },
  sv: {
    "other-keudapro": "Jag ger råd endast om individuell coachning för arbetssökande i huvudstadsregionen. För frågor om andra coachningstjänster, utbildningar eller kompetensutveckling, kontakta en sakkunnig på KeudaPRO via kontaktsidan.",
    "personal-coaching": "Jag är tjänsterådgivare för den här coachningen, inte din egen coach. Jag utför inte personlig coachning eller avgör myndighetsärenden. Jag kan berätta om tjänstens stöd och hur du kommer med; personliga ärenden behandlas med din egen coach eller sakkunniga vid sysselsättningstjänsterna.",
    unrelated: "Jag kan ge råd endast om individuell coachning för arbetssökande i huvudstadsregionen, dess innehåll och hur du kommer med. Jag ger inte råd om andra ämnen. Vad vill du veta om den här tjänsten?",
  },
};
