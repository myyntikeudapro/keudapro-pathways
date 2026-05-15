import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Euro, Globe, Users, Calendar, Mail, Phone, Check } from "lucide-react";

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Info({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

interface SharedServicesModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  {
    id: "rtk",
    label: "RTK Henkilöstöpalvelut",
    title: "RTK Henkilöstöpalvelut – työllistymisväylät",
    ingressi: "RTK yhdistää työnhakijat ja työnantajat nopeasti.",
    kenelle: "Työnhakijoille jotka haluavat työllistyä nopeasti – suora rekrytointi, henkilöstövuokraus tai määräaikainen työ.",
    saat: [
      "Pääsy avoimiin työpaikkoihin",
      "Henkilöstövuokrausmahdollisuudet",
      "Tuki työnhakuprosessissa",
      "Yhteydet työnantajiin eri toimialoilla",
    ],
    info: [
      { icon: Euro, text: "Maksuton työnhakijalle" },
      { icon: Globe, text: "Valtakunnallinen verkosto" },
    ],
    cta: { label: "Tutustu RTK:n palveluihin →", href: "https://rtkhenkilostopalvelu.fi" },
  },
  {
    id: "wulff",
    label: "Wulff PRO",
    title: "Wulff PRO – työllistymiseen tähtäävät valmennukset",
    ingressi: "Kohtaamisia jotka muuttavat elämäsi suunnan.",
    kenelle: "Työnhakijoille ja muutostilanteessa oleville jotka tarvitsevat yksilöllistä tukea.",
    saat: [
      "Yksilöllistä työnhakuvalmennusta",
      "Tukea muutostilanteeseen",
      "Pääsy työnantajaverkostoon",
      "Valtakunnalliset palvelut",
    ],
    info: [
      { icon: MapPin, text: "Valtakunnallinen" },
      { icon: Globe, text: "Myös etäpalveluna" },
      { icon: Euro, text: "Maksuton työnhakijalle" },
    ],
    cta: { label: "Tutustu Wulff PRO:hon →", href: "https://wulffpro.fi/henkiloasiakkaille" },
  },
  {
    id: "arpro",
    label: "ARPRO – AI-työnhaku",
    title: "ARPRO – tekoälyavusteinen työnhaun valmennus",
    ingressi: "Moderni tapa löytää töitä ja erottua hakijoiden joukosta.",
    kenelle: "Työnhakijoille jotka haluavat ottaa tekoälyn käyttöön työnhaussaan.",
    saat: [
      "Tekoälyavusteinen profiilin rakentaminen",
      "CV:n ja hakemusten optimointi AI:lla",
      "Modernit työnhakustrategiat",
      "Pilottiryhmän tuki ja verkosto",
    ],
    info: [
      { icon: Globe, text: "Verkossa toteutettava" },
      { icon: Users, text: "Rajoitettu osallistujamäärä" },
    ],
    cta: { label: "Ilmoittaudu ARPRO-pilottiin →", href: "https://www.lyyti.in/ARPRO_20_pilotti_1172" },
  },
  {
    id: "linkedin",
    label: "LinkedIn-kortti",
    title: "LinkedIn-kortti – työnhaun supervoimasi",
    ingressi: "Opi käyttämään LinkedInin täysi potentiaali työnhaussa ja ammatillisessa brändissä.",
    kenelle: "Työnhakijoille ja asiantuntijoille jotka haluavat erottua LinkedInissä.",
    saat: [
      "Profiili, verkostoituminen, piilotyöpaikat",
      "Asiantuntijabrändin rakentaminen",
      "Valmentajana Oona Kankkunen",
      "Sertifioitu osaamistodistus",
    ],
    info: [
      { icon: Globe, text: "Verkko-opiskelu, 2 tuntia" },
      { icon: Calendar, text: "Jatkuva haku" },
    ],
    cta: { label: "Ilmoittaudu →", href: "https://www.lyyti.in/LinkedIn_Tyonhakukorttilanding_page_5313" },
    secondary: { label: "Lue lisää", href: "https://www.keuda.fi/koulutus/linkedin-tyonhakukortti/" },
    contact: { email: "satu.vainio@keuda.fi", phone: "+358 40 120 9723" },
  },
  {
    id: "3t",
    label: "3T-kortti",
    title: "3T-kortti – Tehoa Työnhakuun Tekoälyllä",
    ingressi: "Sertifioitu osaamistodistus tekoälyn hyödyntämisestä työnhaussa.",
    kenelle: "Työnhakijoille, opiskelijoille ja asiantuntijoille jotka haluavat kilpailuetua tekoälyosaamisella.",
    saat: [
      "Tekoäly työnhaussa ja hakustrategiassa",
      "CV:n ja hakemusten optimointi AI:lla",
      "Haastatteluharjoittelu tekoälyllä",
      "Automaatio työnhakuprosessissa",
      "Sertifikaatti suorituksesta",
    ],
    info: [
      { icon: Globe, text: "Verkko-opiskelu, 2 tuntia" },
      { icon: Calendar, text: "Jatkuva haku" },
    ],
    cta: { label: "Ilmoittaudu →", href: "https://www.lyyti.in/3Tkorttilanding_page_0746" },
    secondary: { label: "Lue lisää", href: "https://www.keuda.fi/koulutus/3t-kortti/" },
    contact: { email: "satu.vainio@keuda.fi", phone: "+358 40 120 9723" },
  },
  {
    id: "varaa",
    label: "Varaa aika valmentajalle",
    title: "Varaa aika valmentajalle – CV:n pikapäivitys",
    ingressi: "30 minuuttia joka muuttaa hakemuksesi.",
    kenelle: "Sinulle joka haluat nopean konkreettisen avun CV:n tai hakemuksen päivittämiseen.",
    saat: [
      "30 min yksilöllinen sparraussessio",
      "CV:n rakenne ja sisältö kuntoon",
      "Hakemuksen kohdentaminen",
      "Käytännön vinkit heti käyttöön",
    ],
    info: [
      { icon: Clock, text: "30 minuuttia" },
      { icon: MapPin, text: "Etänä tai lähitapaamisena" },
    ],
    cta: { label: "Varaa aika →", href: "https://calendar.app.google/iY2TDLg3b8RpyKjK7" },
  },
];

/* ── Language skills interest form ── */

const languageOptions = [
  {
    id: "suomi",
    title: "Suomi työkielenä",
    text: "Tasot 0–C1 – alkeista sujuvaan työelämän suomeen. Sopii maahanmuuttajille ja kansainvälisille osaajille jotka haluavat vahvistaa asemaansa suomalaisilla työmarkkinoilla.",
  },
  {
    id: "ruotsi",
    title: "Ruotsi työkielenä",
    text: "Aktivoi tai kehitä ruotsin kielen osaamistasi työelämän tarpeisiin. Sopii eri tasoisille oppijoille – oli kyse sitten ruotsin kertaamisesta tai sujuvuuden vahvistamisesta ammatillisessa viestinnässä.",
  },
  {
    id: "englanti",
    title: "Englanti työkielenä",
    text: "Vahvista englannin kielen taitoa työnhakuun, työhaastatteluihin ja kansainväliseen työelämään. Käytännönläheinen koulutus joka näkyy suoraan arjen työviestinnässä.",
  },
];

function LanguageInterestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || selected.length === 0) return;
    setSending(true);

    const languages = selected
      .map((id) => languageOptions.find((l) => l.id === id)?.title)
      .join(", ");

    const subject = encodeURIComponent("Kiinnostus: Kieliosaaminen työelämässä");
    const body = encodeURIComponent(
      `Nimi: ${name}\nSähköposti: ${email}\nKiinnostuksen kohteet: ${languages}`
    );
    window.open(`mailto:keudapro@keuda.fi?subject=${subject}&body=${body}`, "_blank");

    setSubmitted(true);
    setSending(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Kiitos! Olemme yhteydessä kun seuraava ohjelma aikataulutetaan.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Nimesi"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="text-sm"
      />
      <Input
        type="email"
        placeholder="Sähköpostiosoitteesi"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="text-sm"
      />
      <div className="space-y-2">
        {languageOptions.map((lang) => (
          <label
            key={lang.id}
            className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(lang.id)}
              onCheckedChange={() => toggle(lang.id)}
            />
            {lang.title}
          </label>
        ))}
      </div>
      <Button
        type="submit"
        variant="cta"
        size="default"
        className="w-full"
        disabled={sending || !name.trim() || !email.trim() || selected.length === 0}
      >
        Ilmoittaudu kiinnostuneeksi →
      </Button>
    </form>
  );
}

/* ── Language skills card content (custom layout) ── */

function LanguageServiceContent() {
  return (
    <div className="px-3 pb-2">
      <p className="italic text-muted-foreground text-sm mb-4">
        Kielitaito avaa ovia työelämässä. Ilmoittaudu kiinnostuneeksi – olemme yhteydessä kun seuraava ohjelma aikataulutetaan.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-bold text-foreground text-sm mb-1">Kenelle?</h4>
          <p className="text-xs text-muted-foreground mb-1">Sinulle jos:</p>
          <ul className="space-y-1">
            <Dot>suomi ei ole äidinkielesi ja haluat vahvistaa työelämän kielitaitoa</Dot>
            <Dot>haluat aktivoida tai kehittää ruotsin kielen osaamista</Dot>
            <Dot>tarvitset englantia työnhaussa tai työssä</Dot>
            <Dot>haluat erottua kielitaidolla hakijoiden joukosta</Dot>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm mb-1">Mitä on tarjolla?</h4>
          <div className="flex flex-col gap-2">
            {languageOptions.map((lang) => (
              <div
                key={lang.id}
                className="rounded-lg border-2 border-primary/30 p-3"
              >
                <h5 className="text-xs font-bold text-foreground mb-1">{lang.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{lang.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ilmoittautumisosio */}
      <div className="border-t border-border/60 pt-4 mt-4">
        <h4 className="font-bold text-foreground text-sm mb-1">Ei avoinna olevia ryhmiä juuri nyt</h4>
        <p className="text-xs text-muted-foreground italic mb-4">
          Uusia ohjelmia aikataulutetaan lähiaikajaksoille. Jätä kiinnostuksesi – olemme yhteydessä heti kun seuraava ohjelma avautuu.
        </p>

        <LanguageInterestForm />

        <p className="text-xs text-muted-foreground mt-3">
          Tai ota yhteyttä suoraan:{" "}
          <a
            href="mailto:keudapro@keuda.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            keudapro@keuda.fi
          </a>
        </p>
      </div>
    </div>
  );
}

export function SharedServicesModal({ open, onClose }: SharedServicesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
        <div className="p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">Yhteiset työkalut ja palvelut</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Nämä palvelut ovat käytettävissäsi alueesta riippumatta – valitse itsellesi sopivin reitti.
            </DialogDescription>
          </DialogHeader>

          <Accordion type="single" collapsible className="w-full">
            {services.map((s) => (
              <AccordionItem key={s.id} value={s.id} className="border-border/60">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline px-3 py-3 rounded-lg hover:bg-accent/50">
                  {s.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-3 pb-2">
                    <p className="italic text-muted-foreground text-sm mb-4">{s.ingressi}</p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">Kenelle?</h4>
                        <p className="text-xs text-muted-foreground">{s.kenelle}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm mb-1">Mitä saat?</h4>
                        <ul className="space-y-1">
                          {s.saat.map((item, i) => <Dot key={i}>{item}</Dot>)}
                        </ul>
                      </div>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {s.info.map((inf, i) => (
                        <Info key={i} icon={inf.icon}>{inf.text}</Info>
                      ))}
                    </ul>

                    <Button variant="cta" size="default" asChild className="w-full">
                      <a href={s.cta.href} target="_blank" rel="noopener noreferrer">{s.cta.label}</a>
                    </Button>

                    {"secondary" in s && s.secondary && (
                      <Button variant="outline-primary" size="default" asChild className="w-full mt-2">
                        <a href={(s as any).secondary.href} target="_blank" rel="noopener noreferrer">{(s as any).secondary.label}</a>
                      </Button>
                    )}

                    {"contact" in s && s.contact && (
                      <div className="mt-3 p-2.5 rounded-lg bg-muted/50 text-xs text-foreground">
                        <p className="font-medium mb-1">Kysy lisää:</p>
                        <div className="flex flex-col gap-0.5">
                          <a href={`mailto:${(s as any).contact.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                            <Mail className="w-3 h-3" />{(s as any).contact.email}
                          </a>
                          <a href={`tel:${(s as any).contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-primary hover:underline">
                            <Phone className="w-3 h-3" />{(s as any).contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}

            {/* Kieliosaaminen – custom card */}
            <AccordionItem value="kieliosaaminen" className="border-border/60">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline px-3 py-3 rounded-lg hover:bg-accent/50">
                Kieliosaaminen työelämässä
              </AccordionTrigger>
              <AccordionContent>
                <LanguageServiceContent />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}