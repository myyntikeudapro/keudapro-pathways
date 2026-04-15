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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border hover:border-primary/50 transition-colors bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left group"
      >
        <span className="font-semibold text-sm text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>
      {/* Tooltip on hover – desktop only */}
      <div className="hidden group-hover:block" />
      {expanded && (
        <div className="px-4 pb-4 animate-accordion-down">{children}</div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-foreground">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <span>{children}</span>
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

function ContactBlock({ email, phone }: { email: string; phone: string }) {
  return (
    <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-foreground">
      <p className="font-medium mb-1">Kysy lisää:</p>
      <div className="flex flex-col gap-0.5">
        <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-primary hover:underline">
          <Mail className="w-3 h-3" />{email}
        </a>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-primary hover:underline">
          <Phone className="w-3 h-3" />{phone}
        </a>
      </div>
    </div>
  );
}

/* ────────────── Regional step (reused) ────────────── */

function RegionalStep() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-card text-left"
      >
        <span className="font-semibold text-sm text-foreground">Henkilökohtainen valmennus (maksuton)</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", show && "rotate-180")} />
      </button>
      {show && (
        <div className="mt-2 px-2 animate-accordion-down">
          <RegionalServices standalone />
        </div>
      )}
    </div>
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

/* ────────────── PANEL 1 – Aloita valmennus ────────────── */

export function Panel1({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Aloita valmennus – selkeytä suuntasi" ingressi="Valitse sinulle sopivin tapa edetä.">
      <StepCard title="Henkilökohtainen valmennus (maksullinen)" tooltip="Rinnalla kulkeva tuki suunnan löytämiseen.">
        <p className="text-sm text-muted-foreground mb-3">
          Yksilöllistä valmennusta tavoitteidesi mukaan. Valmentaja auttaa sinua hahmottamaan vaihtoehdot ja tekemään seuraavat askeleet.
        </p>
        <CtaLink href="mailto:keudapro@keuda.fi" mailto>Varaa aika →</CtaLink>
      </StepCard>

      <RegionalStep />

    </PathPanel>
  );
}

/* ────────────── PANEL 2 – Kirkasta profiilisi ────────────── */

export function Panel2({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Kirkasta profiilisi – tee osaamisestasi näkyvää" ingressi="Valitse sinulle sopivin tapa edetä.">
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
        <CtaLink href="mailto:keudapro@keuda.fi" mailto>Varaa aika →</CtaLink>
      </StepCard>

      <StepCard title="ARPRO AI-työnhaku" tooltip="Tekoälyavusteinen työnhakuvalmennus.">
        <p className="text-sm text-muted-foreground mb-3">
          Moderni tapa löytää töitä ja rakentaa hakijaprofiili tekoälyn avulla.
        </p>
        <CtaLink href="https://www.lyyti.in/ARPRO_20_pilotti_1172">Ilmoittaudu →</CtaLink>
      </StepCard>

    </PathPanel>
  );
}

/* ────────────── PANEL 3 – Tavoittele työtä nyt ────────────── */

export function Panel3({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Etene nopeasti – konkreettiset väylät työhön" ingressi="Valitse sinulle sopivin tapa edetä.">
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
        <CtaLink href="mailto:keudapro@keuda.fi" mailto>Varaa aika →</CtaLink>
      </StepCard>

      <StepCard title="Työkieli haltuun" tooltip="Vahvista suomen, ruotsin tai englannin taitoa työelämässä.">
        <p className="text-sm text-muted-foreground mb-3">
          Kielitaito avaa ovia työelämässä. Tarjolla suomi, ruotsi ja englanti työkielenä – alkeista sujuvaan ammatilliseen viestintään.
        </p>
        <CtaLink href="mailto:keudapro@keuda.fi?subject=Kiinnostus: Työkieli haltuun" mailto>Ilmoittaudu kiinnostuneeksi →</CtaLink>
      </StepCard>

      <RegionalStep />

    </PathPanel>
  );
}

/* ────────────── PANEL 4 – Rakenna uusi polku ────────────── */

export function Panel4({ open, onClose, onOpenMuutosturva }: { open: boolean; onClose: () => void; onOpenMuutosturva?: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Rakenna uusi polku – tuki muutostilanteeseen" ingressi="Valitse sinulle sopivin tapa edetä.">
      <StepCard title="Muutosturva" tooltip="Oletko muutosturvatilanteessa? Katso oikeutesi.">
        <p className="text-sm text-muted-foreground mb-3">
          Muutosturva on oikeutesi – autamme sinua hyödyntämään sen täysimääräisesti. KeudaPRO:n kautta pääset muutosturvakoulutuksiin.
        </p>
        <Button variant="cta" size="default" className="w-full mt-3" onClick={onOpenMuutosturva}>
          Lue lisää muutosturvasta →
        </Button>
      </StepCard>

      <StepCard title="Henkilökohtainen valmennus (maksullinen)" tooltip="Yksilöllistä tukea muutostilanteessa.">
        <p className="text-sm text-muted-foreground mb-3">
          Valmentaja auttaa sinua rakentamaan uuden suunnan – ei vain löytämään seuraavaa työpaikkaa.
        </p>
        <CtaLink href="mailto:keudapro@keuda.fi" mailto>Varaa aika →</CtaLink>
      </StepCard>

      <StepCard title="Wulff PRO" tooltip="Tukea muutostilanteeseen ja uudelleensijoittumiseen.">
        <p className="text-sm text-muted-foreground mb-3">
          Yksilöllistä valmennusta ja tukea muutostilanteessa oleville.
        </p>
        <CtaLink href="https://wulffpro.fi/henkiloasiakkaille">Tutustu Wulff PRO:hon →</CtaLink>
      </StepCard>

      <RegionalStep />

    </PathPanel>
  );
}

/* ────────────── PANEL 5 – Luo oma profiilisi ────────────── */

export function Panel5({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <PathPanel open={open} onClose={onClose} title="Rakenna oma tapasi tehdä työtä" ingressi="Valitse sinulle sopivin tapa edetä.">
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

    </PathPanel>
  );
}
