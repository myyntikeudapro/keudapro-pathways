import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Clock, Euro, Globe, Phone, User } from "lucide-react";

type Region = "helsinki" | "keski-uusimaa" | "vantaa" | "kerava-sipoo";

/* ────────────────────────── data ────────────────────────── */

const regionLabels: Record<Region, string> = {
  helsinki: "Helsinki",
  "keski-uusimaa": "Keski-Uusimaa",
  vantaa: "Vantaa",
  "kerava-sipoo": "Kerava & Sipoo",
};

/* ────────────────────────── component ────────────────────────── */

export function RegionalServices({ standalone = false }: { standalone?: boolean }) {
  const [open, setOpen] = useState<Region | null>(null);

  return (
    <>
      {/* Section heading */}
      {!standalone && <div className="mt-5 mb-2">
        <h4 className="text-sm font-bold text-foreground">Työhönvalmennus alueellasi</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Valitse alueesi – näet palvelun tiedot ja ohjautumisen.
        </p>
      </div>}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(Object.keys(regionLabels) as Region[]).map((r) => (
          <button
            key={r}
            onClick={() => setOpen(r)}
            className="px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium border border-primary/40 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {regionLabels[r]}
          </button>
        ))}
      </div>

      {/* Modals */}
      <HelsinkiModal open={open === "helsinki"} onClose={() => setOpen(null)} />
      <KeskiUusimaaModal open={open === "keski-uusimaa"} onClose={() => setOpen(null)} />
      <VantaaModal open={open === "vantaa"} onClose={() => setOpen(null)} />
      <KeravaSipooModal open={open === "kerava-sipoo"} onClose={() => setOpen(null)} />
    </>
  );
}

/* ────────────────────────── shared pieces ────────────────────────── */

function ModalShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl rounded-xl">
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
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Button>
  );
}

function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline-primary" size="lg" asChild className="w-full mt-2">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
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

/* ────────────────────────── HELSINKI ────────────────────────── */

function HelsinkiModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="pl-5 pr-7 py-5 sm:p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">Työhönvalmennus – Helsinki</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            Yksilöllistä tukea työnhakuun ja urasuunnitteluun – valmentaja kulkee rinnallasi koko prosessin ajan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työllistymisvaiheessa oleville jotka kaipaavat tukea työnhaussa, urasuunnittelussa, yrittäjyyden aloittamisessa tai työsuhteen alkuvaiheen haasteissa.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Henkilökohtainen valmennussuunnitelma</Dot>
              <Dot>Osaamisen kartoitus</Dot>
              <Dot>Tuki CV:n laadintaan ja työhaastatteluihin</Dot>
              <Dot>Mahdollisuus yrityskäynteihin ja korttikoulutuksiin (työturvallisuuskortti, hygieniapassi)</Dot>
              <Dot>Tuki työnhakuprosessissa ja työsuhteen alussa</Dot>
            </ul>
          </div>
        </div>

        <ul className="space-y-1.5 mb-4">
          <Info icon={MapPin}>Lähitapaamisina, etänä tai hybridinä</Info>
          <Info icon={Clock}>Enintään 6 kuukautta, vähintään 2 h/kk</Info>
          <Info icon={Euro}>Maksuton</Info>
        </ul>

        <HowToApply>
          Jätä yhteydenottopyyntö Työmarkkinatorin asiointipalvelussa.
        </HowToApply>

        <div className="mt-6">
          <CtaButton href="https://tyomarkkinatori.fi/henkiloasiakkaat">
            Siirry Työmarkkinatorille →
          </CtaButton>
          <SecondaryLink href="https://www.keuda.fi/wp-content/uploads/2025/10/ESITE_Tyohonvalmennus-Helsinki.pdf">
            Lataa esite (PDF)
          </SecondaryLink>
        </div>
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── KESKI-UUSIMAA ────────────────────────── */

function KeskiUusimaaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="pl-5 pr-7 py-5 sm:p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">Työhönvalmennus – Keski-Uusimaa</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            Yksilöllistä tukea työnhakuun ja urasuunnitteluun kolmella paikkakunnalla – Hyvinkäällä, Keravalla ja Järvenpäässä.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Työllistymisvaiheessa oleville jotka kaipaavat tukea työnhaussa, urasuunnittelussa, yrittäjyyden aloittamisessa tai työsuhteen alkuvaiheen haasteissa.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Henkilökohtainen valmennussuunnitelma</Dot>
              <Dot>Osaamisen kartoitus</Dot>
              <Dot>Tuki CV:n laadintaan ja työhaastatteluihin</Dot>
              <Dot>Mahdollisuus yrityskäynteihin ja korttikoulutuksiin</Dot>
              <Dot>Tuki työnhakuprosessissa ja työsuhteen alussa</Dot>
            </ul>
          </div>
        </div>

        <ul className="space-y-1.5 mb-4">
          <Info icon={MapPin}>Sähkökatu 23, Hyvinkää</Info>
          <Info icon={MapPin}>Keskikatu 3, Kerava</Info>
          <Info icon={MapPin}>Sibeliuksenväylä 55 A, Järvenpää</Info>
          <Info icon={MapPin}>Myös etä- ja hybriditoteutus</Info>
          <Info icon={Clock}>Enintään 6 kuukautta, vähintään 2 h/kk</Info>
          <Info icon={Euro}>Maksuton</Info>
        </ul>

        <HowToApply>
          Ilmoittautuminen Keski-Uudenmaan TE-palveluiden oman asiantuntijan kautta.
        </HowToApply>

        <div className="mt-6">
          <CtaButton href="https://www.keuda.fi">
            Ota yhteyttä TE-palveluihin →
          </CtaButton>
          <SecondaryLink href="https://www.keuda.fi/wp-content/uploads/2025/11/ESITE_Tyohonvalmennus-Keski-Uusimaa.pdf">
            Lataa esite (PDF)
          </SecondaryLink>
        </div>
      </div>
    </ModalShell>
  );
}

/* ────────────────────────── VANTAA (tabbed) ────────────────────────── */

type VantaaTab = "aikuiset" | "nuoret" | "kansainvaliset";

function VantaaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<VantaaTab>("aikuiset");

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="pl-5 pr-7 py-5 sm:p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">Työhönvalmennus – Vantaa</DialogTitle>
          <DialogDescription className="sr-only">Vantaan alueelliset palvelut</DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto mb-6 -mx-1 px-1">
          {([
            { id: "aikuiset" as const, label: "Aikuiset" },
            { id: "nuoret" as const, label: "Alle 25-vuotiaat" },
            { id: "kansainvaliset" as const, label: "Kansainväliset asiakkaat", shortLabel: "Kansainväliset" },
          ] as { id: VantaaTab; label: string; shortLabel?: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-accent"
              }`}
            >
              <span className="sm:hidden">{t.shortLabel ?? t.label}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="transition-opacity duration-150">
          {tab === "aikuiset" && <VantaaAikuiset />}
          {tab === "nuoret" && <VantaaNuoret />}
          {tab === "kansainvaliset" && <VantaaKansainvaliset />}
        </div>
      </div>
    </ModalShell>
  );
}

function VantaaAikuiset() {
  return (
    <>
      <p className="italic text-muted-foreground mb-4 text-sm">
        Yksilöllistä tukea työnhakuun ja urasuunnitteluun – tapaamisia Vantaalla ja Keravalla.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
          <p className="text-sm text-muted-foreground">
            Työllistymisvaiheessa oleville jotka kaipaavat tukea työnhaussa, urasuunnittelussa, yrittäjyyden aloittamisessa tai työsuhteen alkuvaiheen haasteissa.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
          <ul className="space-y-1.5">
            <Dot>Henkilökohtainen valmennussuunnitelma</Dot>
            <Dot>Osaamisen kartoitus</Dot>
            <Dot>Tuki CV:n laadintaan ja työhaastatteluihin</Dot>
            <Dot>Mahdollisuus yrityskäynteihin ja korttikoulutuksiin</Dot>
            <Dot>Tuki työnhakuprosessissa ja työsuhteen alussa</Dot>
          </ul>
        </div>
      </div>
      <ul className="space-y-1.5 mb-4">
        <Info icon={MapPin}>Sanomatie 3, Vantaa</Info>
        <Info icon={MapPin}>Keskikatu 3, Kerava</Info>
        <Info icon={MapPin}>Myös etä- ja hybriditoteutus</Info>
        <Info icon={Clock}>Enintään 6 kuukautta, vähintään 2 h/kk</Info>
        <Info icon={Euro}>Maksuton</Info>
      </ul>
      <HowToApply>
        Ilmoittautuminen oman työllisyysalueesi työvoimaviranomaisen kautta.
      </HowToApply>
      <div className="mt-6">
        <CtaButton href="https://www.keuda.fi">
          Ota yhteyttä työvoimaviranomaiseen →
        </CtaButton>
        <SecondaryLink href="https://www.keuda.fi/wp-content/uploads/2025/02/ESITE_Tyohonvalmennus-Vantaa.pdf">
          Lataa esite (PDF)
        </SecondaryLink>
      </div>
    </>
  );
}

function VantaaNuoret() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Nuorten työhönvalmennus – Vantaa (alle 25-vuotiaat)
      </h3>
      <p className="italic text-muted-foreground mb-4 text-sm">
        Oletko alle 25-vuotias ja etsit suuntaa työelämään? Tämä palvelu on suunniteltu juuri sinulle – yksilöllistä tukea työnhakuun ja ensimmäisiin askeleisiin työelämässä.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
          <p className="text-sm text-muted-foreground">
            Alle 25-vuotiaille vantaalaisille työnhakijoille jotka tarvitsevat tukea työllistymiseen tai suunnan löytämiseen.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
          <ul className="space-y-1.5">
            <Dot>Henkilökohtainen valmentaja tukenasi</Dot>
            <Dot>Apua CV:n ja hakemuksen rakentamiseen</Dot>
            <Dot>Tukea työhaastatteluihin valmistautumisessa</Dot>
            <Dot>Osaamisen tunnistaminen ja sanoittaminen</Dot>
            <Dot>Verkostoja ja yhteyksiä työnantajiin</Dot>
          </ul>
        </div>
      </div>
      <ul className="space-y-1.5 mb-4">
        <Info icon={User}>Kohderyhmä: alle 25-vuotiaat työnhakijat, Vantaa</Info>
        <Info icon={Euro}>Maksuton</Info>
      </ul>
      <HowToApply>
        Ota yhteyttä oman alueesi työllisyysasiantuntijaan – he ohjaavat sinut palveluun.
      </HowToApply>
      <div className="mt-6">
        <CtaButton href="https://www.keuda.fi">
          Ota yhteyttä työllisyysasiantuntijaan →
        </CtaButton>
      </div>
    </>
  );
}

function VantaaKansainvaliset() {
  return (
    <>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Kansainvälisten asiakkaiden työnhaun palvelu – Vantaa
      </h3>
      <p className="italic text-muted-foreground mb-4 text-sm">
        Oletko muuttanut Suomeen ja etsit töitä? Autamme sinua löytämään oikean suunnan suomalaisilla työmarkkinoilla – oman työllisyysasiantuntijasi kautta.
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
          <p className="text-sm text-muted-foreground">
            Kansainvälisille työnhakijoille Vantaan alueella – henkilöille joiden äidinkieli ei ole suomi tai ruotsi ja jotka tarvitsevat tukea suomalaiseen työelämään siirtymisessä.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
          <ul className="space-y-1.5">
            <Dot>Tuki suomalaiseen työelämään ja työnhakuun sopeutumisessa</Dot>
            <Dot>Apua CV:n rakentamiseen suomalaisille työmarkkinoille</Dot>
            <Dot>Ohjaus oikeisiin palveluihin ja verkostoihin</Dot>
            <Dot>Henkilökohtainen työllisyysasiantuntija tukenasi</Dot>
          </ul>
        </div>
      </div>
      <ul className="space-y-1.5 mb-4">
        <Info icon={MapPin}>Alue: Vantaa</Info>
        <Info icon={Euro}>Maksuton</Info>
        <Info icon={User}>Ohjautuminen oman työllisyysasiantuntijan kautta</Info>
      </ul>
      <HowToApply>
        Palveluun ohjaudutaan oman työllisyysasiantuntijan kautta. Ota yhteyttä Vantaan työllisyyspalveluihin – kerro tilanteestasi ja he ohjaavat sinut oikeaan palveluun.
      </HowToApply>
      <div className="mt-6">
        <CtaButton href="https://www.keuda.fi">
          Ota yhteyttä työllisyyspalveluihin →
        </CtaButton>
      </div>
    </>
  );
}

/* ────────────────────────── KERAVA & SIPOO ────────────────────────── */

function KeravaSipooModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="pl-5 pr-7 py-5 sm:p-6 md:p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">Työhönvalmennus – Kerava &amp; Sipoo</DialogTitle>
          <DialogDescription className="italic text-muted-foreground">
            Yksilöllistä valmennusta työnhakuun ja työllistymiseen Keravan ja Sipoon työllisyysalueen asiakkaille.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-foreground mb-2">Kenelle?</h4>
            <p className="text-sm text-muted-foreground">
              Sinulle jos olet ilmoittautunut työnhakijaksi ja työvoimaviranomainen arvioi työhönvalmennuksen parhaaksi tueksi työllistymisellesi.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-2">Mitä saat?</h4>
            <ul className="space-y-1.5">
              <Dot>Tuki työpaikan tai oppisopimuspaikan etsimiseen</Dot>
              <Dot>Apua työsopimuksen tekemisessä</Dot>
              <Dot>Tuki työsuhteen vakiinnuttamisessa</Dot>
              <Dot>Ryhmämuotoinen aloituspäivä (enintään 4 h)</Dot>
              <Dot>Yksilötapaamiset valmentajan kanssa</Dot>
            </ul>
          </div>
        </div>

        <ul className="space-y-1.5 mb-4">
          <Info icon={MapPin}>Kerava ja Sipoo</Info>
          <Info icon={Clock}>Enintään 16 tuntia, 4 kuukauden aikana</Info>
          <Info icon={Euro}>Maksuton</Info>
          <Info icon={Globe}>Kieli: suomi tai ruotsi</Info>
        </ul>

        <HowToApply>
          Ota yhteys alueesi työvoimaviranomaiseen ja kysy mahdollisuudesta työhönvalmennukseen. Voit täyttää ilmoittautumislomakkeen yhdessä asiantuntijan kanssa.
        </HowToApply>

        <div className="mt-6">
          <CtaButton href="https://www.suomi.fi/palvelut/tyohonvalmennus-keravan-ja-sipoon-tyollisyysalueen-asiakkaille-keravan-kaupunki/4298f1f8-524c-4a31-a855-be21f3eaacdc">
            Siirry Suomi.fi-palveluun →
          </CtaButton>
          <div className="mt-3 flex items-center gap-2 justify-center">
            <Phone className="w-4 h-4 text-primary" />
            <a href="tel:0929492203" className="text-sm font-medium text-primary hover:underline">
              Soita: 0929 492 203
            </a>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
