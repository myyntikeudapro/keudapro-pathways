import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowLeft, X, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegionalServices } from "@/components/noste/RegionalServices";

/* ────────────── shared helpers ────────────── */

function StepCard({
  title,
  tooltip,
  children,
}: {
  title: string;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-background overflow-hidden flex flex-col p-5 hover:border-primary/50 transition-colors"
      title={tooltip}
    >
      <h4 className="text-base font-bold text-foreground mb-2 leading-snug">{title}</h4>
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}

function CtaLink({ href, children, mailto }: { href: string; children: React.ReactNode; mailto?: boolean }) {
  return (
    <Button variant="cta" size="default" asChild className="w-full mt-3">
      <a
        href={href}
        {...(!mailto ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    </Button>
  );
}

function SecondaryCtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline-primary" size="default" asChild className="w-full mt-2">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  );
}

/* ────────────── Reusable coaching steps ────────────── */

function AlueellinenValmennusStep() {
  const [show, setShow] = useState(false);
  return (
    <div title="Maksuton palvelu työttömille työnhakijoille Helsinki, Vantaa, Keski-Uusimaa ja Kerava–Sipoo -alueilla.">
      <button
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card text-left"
      >
        <span className="font-semibold text-sm text-foreground">Työhönvalmennus alueellasi</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", show && "rotate-180")} />
      </button>
      {show && (
        <div className="mt-2 px-2 animate-accordion-down">
          <RegionalServices standalone />
          <p className="text-xs italic text-muted-foreground mt-2 px-2">
            Palvelu on maksuton työttömille työnhakijoille jotka ovat alueensa työvoimaviranomaisen asiakkaita.
          </p>
        </div>
      )}
    </div>
  );
}

function MaksullinenValmennusStep() {
  return (
    <StepCard
      title="Henkilökohtainen valmennus – koko Suomi"
      tooltip="Sopii sinulle jos olet muualta Suomesta tai et ole oikeutettu maksuttomaan alueelliseen palveluun."
    >
      <p className="text-sm text-muted-foreground mb-2">
        Yksilöllistä valmennusta työnhakuun ja suunnan löytämiseen – riippumatta siitä missä päin Suomea olet. Valmentaja auttaa sinua hahmottamaan vaihtoehdot ja tekemään seuraavat askeleet.
      </p>
      <p className="text-xs italic text-muted-foreground mb-3">
        Maksullinen palvelu – kysy hinnasta yhteydenotolla.
      </p>
      <CtaLink href="https://calendar.app.google/KEf8whD71iKruG979">Varaa aika →</CtaLink>
    </StepCard>
  );
}

/* ────────────── Panel Shell ────────────── */

interface PanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  ingressi?: string;
  children: React.ReactNode;
}

export function PathPanel({ open, onClose, title, ingressi, children }: PanelProps) {
  if (!open) return null;

  return (
    <div className="animate-accordion-down border-t border-border/60 mt-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Takaisin
        </button>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
      {ingressi && <p className="italic text-muted-foreground text-sm mb-6">{ingressi}</p>}

      <h4 className="text-sm font-bold text-foreground mb-4 border-b border-border/60 pb-2">Seuraavat askeleet</h4>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {children}
      </div>

      <div className="border-t border-border/60 pt-4">
        <h4 className="text-sm font-bold text-foreground mb-3">Tai ota suora yhteys</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <Button variant="outline-primary" asChild className="w-full">
            <a href="mailto:keudapro@keuda.fi">Lähetä viesti</a>
          </Button>
          <Button variant="cta" asChild className="w-full">
            <a href="#reittikartoitus">Tee reittikartoitus</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────── PANEL 1 – En tiedä suuntaani ────────────── */

export function Panel1({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Aloita valmennus – selkeytä suuntasi" ingressi="Valitse sinulle sopivin tapa edetä.">
      <AlueellinenValmennusStep />
      <MaksullinenValmennusStep />

      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>
    </PathPanel>
  );
}

/* ────────────── PANEL 2 – Haluan erottua ────────────── */

export function Panel2({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Kirkasta profiilisi – tee osaamisestasi näkyvää" ingressi="Valitse sinulle sopivin tapa edetä.">
      <AlueellinenValmennusStep />
      <MaksullinenValmennusStep />

      <StepCard title="LinkedIn-kortti" tooltip="2h verkkokoulutus – optimoi profiilisi ja työnhakusi LinkedInissä.">
        <p className="text-sm text-muted-foreground mb-2">
          LinkedIn on digitaalinen käyntikorttisi. Tässä koulutuksessa opit käyttämään sen täyden potentiaalin – työnhakijana tai asiantuntijana.
        </p>
        <p className="text-xs text-muted-foreground mb-3">Valmentaja: Oona Kankkunen · 2 tuntia · verkossa</p>
        <CtaLink href="https://www.lyyti.in/LinkedIn_Tyonhakukorttilanding_page_5313">Ilmoittaudu →</CtaLink>
        <SecondaryCtaLink href="https://www.keuda.fi/koulutus/linkedin-tyonhakukortti/">Lue lisää →</SecondaryCtaLink>
      </StepCard>

      <StepCard title="CV:n pikapäivitys" tooltip="30 minuutin sessio – CV kuntoon nopeasti.">
        <p className="text-sm text-muted-foreground mb-3">
          Varaa aika ja päivitetään CV:si yhdessä – käytännössä ja nopeasti.
        </p>
        <CtaLink href="https://calendar.app.google/KEf8whD71iKruG979">Varaa aika →</CtaLink>
      </StepCard>

      <StepCard title="ARPRO AI-työnhaku" tooltip="Tekoälyavusteinen työnhakuvalmennus.">
        <p className="text-sm text-muted-foreground mb-3">
          Moderni tapa löytää töitä ja rakentaa hakijaprofiili tekoälyn avulla.
        </p>
        <CtaLink href="https://www.lyyti.in/ARPRO_20_pilotti_1172">Ilmoittaudu →</CtaLink>
      </StepCard>

      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>
    </PathPanel>
  );
}

/* ────────────── PANEL 3 – Haluan töihin nopeasti ────────────── */

export function Panel3({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Etene nopeasti – konkreettiset väylät työhön" ingressi="Valitse sinulle sopivin tapa edetä.">
      <AlueellinenValmennusStep />
      <MaksullinenValmennusStep />

      <StepCard title="RTK Henkilöstöpalvelut" tooltip="Suora yhteys työnantajiin ja avoimiin paikkoihin.">
        <p className="text-sm text-muted-foreground mb-3">
          RTK yhdistää työnhakijat ja työnantajat nopeasti – rekrytointi ja henkilöstövuokraus.
        </p>
        <CtaLink href="https://rtkhenkilostopalvelu.fi">Tutustu RTK:hon →</CtaLink>
      </StepCard>

      <StepCard title="Wulff PRO" tooltip="Työllistymiseen tähtäävä yksilöllinen valmennus.">
        <p className="text-sm text-muted-foreground mb-3">
          Kohtaamisia jotka muuttavat elämäsi suunnan. Yksilöllistä tukea työllistymiseen.
        </p>
        <CtaLink href="https://wulffpro.fi/henkiloasiakkaille">Tutustu Wulff PRO:hon →</CtaLink>
      </StepCard>

      <StepCard title="3T-kortti" tooltip="Tekoäly työnhaun tukena – sertifioitu osaamistodistus.">
        <p className="text-sm text-muted-foreground mb-3">
          Opi hyödyntämään tekoälyä työnhaun eri vaiheissa – CV:stä haastatteluihin.
        </p>
        <CtaLink href="https://www.lyyti.in/3Tkorttilanding_page_0746">Ilmoittaudu →</CtaLink>
        <SecondaryCtaLink href="https://www.keuda.fi/koulutus/3t-kortti/">Lue lisää →</SecondaryCtaLink>
      </StepCard>

      <StepCard title="CV:n pikapäivitys" tooltip="30 min – CV kuntoon.">
        <p className="text-sm text-muted-foreground mb-3">
          Nopea ja käytännöllinen sessio CV:si päivittämiseen.
        </p>
        <CtaLink href="https://calendar.app.google/KEf8whD71iKruG979">Varaa aika →</CtaLink>
      </StepCard>

      <StepCard title="Työkieli haltuun" tooltip="Vahvista suomen, ruotsin tai englannin taitoa työelämässä.">
        <p className="text-sm text-muted-foreground mb-3">
          Kielitaito avaa ovia työelämässä. Tarjolla suomi, ruotsi ja englanti työkielenä – alkeista sujuvaan ammatilliseen viestintään.
        </p>
        <CtaLink href="mailto:keudapro@keuda.fi?subject=Kiinnostus: Työkieli haltuun" mailto>Ilmoittaudu kiinnostuneeksi →</CtaLink>
      </StepCard>

      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>
    </PathPanel>
  );
}

/* ────────────── PANEL 4 – Tilanteeni muuttuu ────────────── */

export function Panel4({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Rakenna uusi polku – tuki muutostilanteeseen" ingressi="Valitse sinulle sopivin tapa edetä.">
      <AlueellinenValmennusStep />
      <MaksullinenValmennusStep />

      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>

      <StepCard title="Wulff PRO" tooltip="Tukea muutostilanteeseen ja uudelleensijoittumiseen.">
        <p className="text-sm text-muted-foreground mb-3">
          Yksilöllistä valmennusta ja tukea muutostilanteessa oleville.
        </p>
        <CtaLink href="https://wulffpro.fi/henkiloasiakkaille">Tutustu Wulff PRO:hon →</CtaLink>
      </StepCard>
    </PathPanel>
  );
}

/* ────────────── PANEL 5 – Haluan luoda oman työn ────────────── */

export function Panel5({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Rakenna oma tapasi tehdä työtä" ingressi="Valitse sinulle sopivin tapa edetä.">
      <AlueellinenValmennusStep />
      <MaksullinenValmennusStep />

      <StepCard title="Rakenna profiilisi" tooltip="Sanoita osaamisesi ja tee itsestäsi näkyvä mahdollisuuksien tekijänä.">
        <p className="text-sm text-muted-foreground mb-3">
          Tässä et rakenna CV:tä. Rakennat profiilin mahdollisuuksien tekijänä – sanoitat mitä osaat, kerrot millaisiin mahdollisuuksiin haluat tarttua ja tuot esiin mitä mahdollisuuksia itse näet.
        </p>
        <CtaLink href="mailto:keudapro@keuda.fi" mailto>Aloita profiilin rakentaminen →</CtaLink>
      </StepCard>

      <StepCard title="LinkedIn-kortti" tooltip="Tee osaamisestasi näkyvää LinkedInissä.">
        <p className="text-sm text-muted-foreground mb-2">
          LinkedIn on digitaalinen käyntikorttisi. Tässä koulutuksessa opit käyttämään sen täyden potentiaalin – työnhakijana tai asiantuntijana.
        </p>
        <p className="text-xs text-muted-foreground mb-3">Valmentaja: Oona Kankkunen · 2 tuntia · verkossa</p>
        <CtaLink href="https://www.lyyti.in/LinkedIn_Tyonhakukorttilanding_page_5313">Ilmoittaudu →</CtaLink>
      </StepCard>

      <StepCard title="ARPRO AI-työnhaku" tooltip="Rakenna moderni työnhakuprofiili tekoälyllä.">
        <p className="text-sm text-muted-foreground mb-3">
          Moderni tapa löytää töitä ja rakentaa hakijaprofiili tekoälyn avulla.
        </p>
        <CtaLink href="https://www.lyyti.in/ARPRO_20_pilotti_1172">Ilmoittaudu →</CtaLink>
      </StepCard>

      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>
    </PathPanel>
  );
}
