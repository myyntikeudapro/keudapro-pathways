import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Clock, Euro, Globe, Users, Calendar, Mail, Phone } from "lucide-react";

type ServiceKey = "rtk" | "wulff" | "arpro" | "linkedin" | "3t" | "varaa";

const serviceLabels: Record<ServiceKey, string> = {
  rtk: "RTK Henkilöstöpalvelut",
  wulff: "Wulff PRO",
  arpro: "ARPRO – AI-työnhaku",
  linkedin: "LinkedIn-kortti",
  "3t": "3T-kortti",
  varaa: "Varaa aika valmentajalle",
};

/* ────────────────────────── public component ────────────────────────── */

export function ServiceButtons({ heading, standalone = false }: { heading?: string; standalone?: boolean }) {
  const [open, setOpen] = useState<ServiceKey | null>(null);

  return (
    <>
      {!standalone && <div className="mt-5 mb-2">
        <h4 className="text-sm font-bold text-foreground">{heading || "Muut palvelut"}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Valitse palvelu – näet tiedot ja pääset suoraan eteenpäin.
        </p>
      </div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {(Object.keys(serviceLabels) as ServiceKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setOpen(k)}
            className="px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {serviceLabels[k]}
          </button>
        ))}
      </div>

      <RTKModal open={open === "rtk"} onClose={() => setOpen(null)} />
      <WulffModal open={open === "wulff"} onClose={() => setOpen(null)} />
      <ArproModal open={open === "arpro"} onClose={() => setOpen(null)} />
      <LinkedInModal open={open === "linkedin"} onClose={() => setOpen(null)} />
      <TTTModal open={open === "3t"} onClose={() => setOpen(null)} />
      <VaraaModal open={open === "varaa"} onClose={() => setOpen(null)} />
    </>
  );
}

/* ────────────────────────── shared pieces ────────────────────────── */

function ModalShell({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
        {children}
      </DialogContent>
    </Dialog>
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

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="cta" size="lg" asChild className="w-full">
      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    </Button>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline-primary" size="lg" asChild className="w-full mt-2">
      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    </Button>
  );
}

function HowToApply({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h4 className="font-bold text-foreground mb-1 text-sm">Miten haet?</h4>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function ContactInfo({ name, email, phone }: { name: string; email: string; phone: string }) {
  return (
    <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-foreground">
      <p className="font-medium mb-1">Kysy lisää: {name}</p>
      <div className="flex flex-col gap-1">
        <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-primary hover:underline">
          <Mail className="w-3.5 h-3.5" />{email}
        </a>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-primary hover:underline">
          <Phone className="w-3.5 h-3.5" />{phone}
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────── MODAL 1 – RTK ────────────────────────── */

function RTKModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">RTK Henkilöstöpalvelut – työllistymisväylät</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            RTK Henkilöstöpalvelut yhdistää työnhakijat ja työnantajat nopeasti – avoimilta paikoilta henkilöstövuokraukseen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työnhakijoille jotka haluavat työllistyä nopeasti – suora rekrytointi, henkilöstövuokraus tai määräaikainen työ.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Pääsy avoimiin työpaikkoihin</Dot>
              <Dot>Henkilöstövuokrausmahdollisuudet</Dot>
              <Dot>Tuki työnhakuprosessissa</Dot>
              <Dot>Yhteydet työnantajiin eri toimialoilla</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={Euro}>Maksuton työnhakijalle</Info>
          <Info icon={Globe}>Valtakunnallinen verkosto</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://rtkhenkilostopalvelu.fi">Tutustu RTK:n palveluihin →</CtaButton>
        </div>
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── MODAL 2 – WULFF PRO ────────────────────────── */

function WulffModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">Wulff PRO – työllistymiseen tähtäävät valmennukset</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            Wulff PRO on työllistymiseen tähtääviin valmennuksiin erikoistunut yhtiö – kohtaamisia jotka muuttavat elämäsi suunnan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työnhakijoille ja muutostilanteessa oleville jotka tarvitsevat yksilöllistä tukea työllistymiseen tai uudelleensijoittumiseen.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Yksilöllistä työnhakuvalmennusta</Dot>
              <Dot>Tukea muutostilanteeseen</Dot>
              <Dot>Pääsy Wulffin työnantajaverkostoon</Dot>
              <Dot>Valtakunnalliset palvelut lähitoimipisteiden kautta</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={MapPin}>Valtakunnallinen, paikalliset toimipisteet</Info>
          <Info icon={Globe}>Myös etäpalveluna</Info>
          <Info icon={Euro}>Maksuton työnhakijalle</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://wulffpro.fi/henkiloasiakkaille">Tutustu Wulff PRO:n palveluihin →</CtaButton>
        </div>
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── MODAL 3 – ARPRO ────────────────────────── */

function ArproModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">ARPRO – tekoälyavusteinen työnhaun valmennus</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            ARPRO on tekoälyavusteinen työnhaun palvelu – moderni tapa löytää töitä ja erottua hakijoiden joukosta.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työnhakijoille jotka haluavat ottaa tekoälyn käyttöön työnhaussaan ja rakentaa modernin hakijaprofiilin.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Tekoälyavusteinen profiilin rakentaminen</Dot>
              <Dot>Tuki CV:n ja hakemusten optimointiin AI:n avulla</Dot>
              <Dot>Modernit työnhakustrategiat</Dot>
              <Dot>Pilottiryhmän tuki ja verkosto</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={Globe}>Verkossa toteutettava</Info>
          <Info icon={Users}>Rajoitettu osallistujamäärä</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://www.lyyti.in/ARPRO_20_pilotti_1172">Ilmoittaudu ARPRO-pilottiin →</CtaButton>
        </div>
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── MODAL 4 – LINKEDIN ────────────────────────── */

function LinkedInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">LinkedIn-kortti – työnhaun supervoimasi</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            LinkedIn on digitaalinen käyntikorttisi ja työnhaun tärkein työkalu. Opi käyttämään sen täysi potentiaali.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työnhakijoille jotka haluavat optimoida profiilinsa, asiantuntijoille jotka haluavat vahvistaa ammatillista brändiään.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Työnhakijan näkökulma: profiili, verkostoituminen, piilotyöpaikat</Dot>
              <Dot>Asiantuntijan näkökulma: osaamisen näyttämö ja brändi</Dot>
              <Dot>Valmentajana LinkedIn-asiantuntija Oona Kankkunen</Dot>
              <Dot>Sertifioitu osaamistodistus</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={Globe}>Verkko-opiskelu, 2 tuntia</Info>
          <Info icon={Calendar}>Jatkuva haku</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://www.lyyti.in/LinkedIn_Tyonhakukorttilanding_page_5313">Ilmoittaudu LinkedIn-kortille →</CtaButton>
          <SecondaryLink href="https://www.keuda.fi/koulutus/linkedin-tyonhakukortti/">Lue lisää koulutuksesta</SecondaryLink>
        </div>
        <ContactInfo name="Satu Vainio" email="satu.vainio@keuda.fi" phone="+358 40 120 9723" />
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── MODAL 5 – 3T ────────────────────────── */

function TTTModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">3T-kortti – Tehoa Työnhakuun Tekoälyllä</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            3T-kortti on sertifioitu osaamistodistus joka osoittaa, että osaat hyödyntää tekoälyä työnhaun eri vaiheissa – CV:stä haastatteluihin ja automaatioon.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työnhakijoille jotka haluavat modernisoida työnhakuprosessinsa, opiskelijoille jotka haluavat kilpailuetua, asiantuntijoille jotka haluavat erottautua tekoälyosaamisella.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Tekoäly työnhaussa: piilotyöpaikat ja hakustrategia</Dot>
              <Dot>CV:n ja hakemusten optimointi AI:lla</Dot>
              <Dot>Haastatteluharjoittelu tekoälyllä</Dot>
              <Dot>Automaatio työnhakuprosessissa</Dot>
              <Dot>Vastuullinen tekoälyn käyttö</Dot>
              <Dot>Sertifikaatti suorituksesta</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={Globe}>Verkko-opiskelu, 2 tuntia</Info>
          <Info icon={Calendar}>Jatkuva haku</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://www.lyyti.in/3Tkorttilanding_page_0746">Ilmoittaudu 3T-kortille →</CtaButton>
          <SecondaryLink href="https://www.keuda.fi/koulutus/3t-kortti/">Lue lisää koulutuksesta</SecondaryLink>
        </div>
        <ContactInfo name="Satu Vainio" email="satu.vainio@keuda.fi" phone="+358 40 120 9723" />
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── MODAL 6 – VARAA AIKA ────────────────────────── */

function VaraaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold">Varaa aika valmentajalle – CV:n ja hakemuksen pikapäivitys</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            30 minuuttia joka muuttaa hakemuksesi. Varaa aika ja päivitetään CV:si ja hakemuksesi yhdessä – nopeasti ja käytännössä.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Sinulle joka haluat nopean, konkreettisen avun CV:n tai hakemuksen päivittämiseen ilman pitkää prosessia.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>30 minuutin yksilöllinen sparraussessio</Dot>
              <Dot>CV:n rakenne ja sisältö kuntoon</Dot>
              <Dot>Hakemuksen kohdentaminen oikealle työnantajalle</Dot>
              <Dot>Käytännön vinkit heti käyttöön</Dot>
            </ul>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          <Info icon={Clock}>30 minuuttia</Info>
          <Info icon={MapPin}>Etänä tai lähitapaamisena</Info>
        </ul>
        <div className="mt-6">
          <CtaButton href="https://calendar.google.com/calendar/embed?src=myynti%40keudapro.com&ctz=Europe%2FHelsinki">Varaa aika →</CtaButton>
        </div>
      </div>
    </ModalShell>
  );
}
