import { SEO } from "@/components/seo/SEO";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hub-arpro-2.jpg";

// Kirjautumispolut nykyiseen ARPRO-palveluun. Päivitetään, kun roolikohtaiset polut ovat valmiit.
const ARPRO_JOBSEEKER_URL = "https://arpro-northstar-vision.lovable.app/demo/1";
const ARPRO_COACH_URL = "https://arpro-northstar-vision.lovable.app/demo/1";
// Tietosuojaselosteen osoite lisätään, kun se toimitetaan.
const PRIVACY_URL: string | null = null;

const steps = [
  { t: "Tunnistamme osaamisesi", d: "Työhistoriasi ja muu osaamisesi jäsennetään selkeäksi osaamisprofiiliksi." },
  { t: "Vertaamme sitä alueen mahdollisuuksiin", d: "Osaamistasi verrataan tehtäviin, työnantajien tarpeisiin ja alueen työmahdollisuuksiin." },
  { t: "Saat seuraavan askeleen", d: "Näet vahvuutesi, mahdolliset osaamisvajeet ja vaihtoehdot etenemiseen." },
];

const orgs = ["Jyväskylän kaupunki", "Gradia", "Jyväskylän yliopisto", "Muuramen kunta"];

function LogoSlot({ label }: { label: string }) {
  return (
    <div className="flex h-14 min-w-[8rem] items-center justify-center rounded-lg border border-dashed border-border px-4 text-xs text-muted-foreground">
      {label}
    </div>
  );
}

function RoleCard({ title, text, cta, href, primary }: { title: string; text: string; cta: string; href: string; primary?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border p-6 sm:p-8 ${primary ? "border-primary/30 bg-card shadow-lg" : "border-border bg-card shadow-sm"}`}>
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
      <p className="mt-3 flex-1 text-lg text-muted-foreground leading-relaxed">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-6 text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 ${
          primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-2 border-primary text-primary hover:bg-primary/5"
        }`}
      >
        {cta} <ArrowRight className="h-5 w-5" aria-hidden />
      </a>
    </div>
  );
}

export default function TyoelamaverkkoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Työelämäverkko – Osaaminen näkyväksi | Jyväskylä ja Muurame"
        description="Työelämäverkko auttaa tunnistamaan osaamisesi ja löytämään työmahdollisuuksia Jyväskylän ja Muuramen alueelta."
        path="/hub/tyoelamaverkko"
      />

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-xl font-bold tracking-tight text-primary">Työelämäverkko</span>
          <span className="hidden text-sm text-muted-foreground sm:block">Jyväskylä · Muurame</span>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 md:pt-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Työelämäverkko</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Osaaminen näkyväksi. Oikeat mahdollisuudet esiin.
              </h1>
              <p className="mt-5 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Työelämäverkko auttaa tunnistamaan osaamisesi ja löytämään työmahdollisuuksia Jyväskylän ja Muuramen alueelta.
              </p>
            </div>
            <img
              src={heroImg}
              alt="Ihmisiä keskustelemassa työelämästä ja osaamisesta"
              className="hidden aspect-[4/3] w-full rounded-2xl object-cover md:block"
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <RoleCard
              primary
              title="Olen työnhakija"
              text="Tunnista osaamisesi ja löydä sinulle sopivia työmahdollisuuksia."
              cta="Aloita palvelu"
              href={ARPRO_JOBSEEKER_URL}
            />
            <RoleCard
              title="Olen valmentaja tai hanketyöntekijä"
              text="Tarkastele asiakkaiden arviointeja ja tue heidän etenemistään."
              cta="Siirry valmentajan palveluun"
              href={ARPRO_COACH_URL}
            />
          </div>
        </section>

        <section className="bg-muted/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold sm:text-4xl">Näin palvelu toimii</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.t}>
                  <span className="text-5xl font-bold text-primary/30">{i + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">Työnhakijat ja työnantajat lähemmäksi toisiaan</h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Työelämäverkossa työnhakijoiden osaaminen, työnantajien tarpeet ja koulutusmahdollisuudet tuodaan lähemmäksi toisiaan. Tavoitteena on löytää oikeat mahdollisuudet nopeammin ja tunnistaa, millaista osaamista alueella tarvitaan.
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            Palvelussa hyödynnetään KeudaPROn ARPRO-menetelmää osaamisen ja työmahdollisuuksien tunnistamiseen.
          </p>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl font-bold">Tietosi ovat sinun</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Palvelussa käsitellään vain palvelun toteuttamisen kannalta tarvittavia tietoja. Ennen tietojen antamista näet tarkemmin, mitä tietoja käsitellään ja mihin niitä käytetään.
            </p>
            {PRIVACY_URL ? (
              <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-medium text-primary underline underline-offset-4">
                Tietosuojaseloste
              </a>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Tietosuojaseloste julkaistaan pian.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-muted/60 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-xl font-bold text-primary">Työelämäverkko</p>
          <p className="mt-1 text-sm text-muted-foreground">Toiminta-aika 1.8.2026–31.7.2028</p>
          <ul className="mt-6 grid gap-1 text-foreground sm:grid-cols-2 md:grid-cols-4">
            {orgs.map((o) => <li key={o}>{o}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3" aria-label="Rahoittajien tunnukset">
            <LogoSlot label="ESR+ -tunnus" />
            <LogoSlot label="EU-tunnus" />
            <LogoSlot label="Rahoittajan tunnus" />
          </div>
          <p className="mt-8 text-xs text-muted-foreground">ARPRO-palvelun toteutus: KeudaPRO</p>
        </div>
      </footer>
    </div>
  );
}
