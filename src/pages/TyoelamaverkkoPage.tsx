import { SEO } from "@/components/seo/SEO";
import { ArrowRight } from "lucide-react";
import { arproLoginUrl } from "@/data/arproEntries";
import { projectEntries } from "@/data/projectEntries";

const P = projectEntries.tyoelamaverkko;
const JOBSEEKER_URL = arproLoginUrl(P.project, "jobseeker");
const COACH_URL = arproLoginUrl(P.project, "coach");

const steps = [
  { t: "Tunnistamme osaamisesi", d: "Työhistoriasi ja muu osaamisesi jäsennetään selkeäksi osaamisprofiiliksi." },
  { t: "Vertaamme sitä alueen mahdollisuuksiin", d: "Osaamistasi verrataan tehtäviin, työnantajien tarpeisiin ja alueen työmahdollisuuksiin." },
  { t: "Saat seuraavan askeleen", d: "Näet vahvuutesi, mahdolliset osaamisvajeet ja vaihtoehdot etenemiseen." },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:ring-offset-2";

function RoleCard({ id, label, title, text, cta, href, primary }: { id: string; label: string; title: string; text: string; cta: string; href: string; primary?: boolean }) {
  return (
    <article aria-labelledby={id} className={`flex flex-col rounded-2xl border-2 bg-card p-6 sm:p-8 ${primary ? "border-primary shadow-lg" : "border-border shadow-sm"}`}>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{label}</p>
      <h2 id={id} className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>
      <p className="mt-3 flex-1 text-lg text-muted-foreground leading-relaxed">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-6 inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-6 text-lg font-semibold transition-colors ${focusRing} ${
          primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-2 border-primary bg-background text-primary hover:bg-primary/10"
        }`}
      >
        {cta} <ArrowRight className="h-5 w-5" aria-hidden />
        <span className="sr-only">(avautuu uuteen välilehteen)</span>
      </a>
    </article>
  );
}

export default function TyoelamaverkkoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={P.seoTitle} description={P.seoDescription} path={`/hub/${P.project}`} />

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-xl font-bold tracking-tight text-primary">{P.name}</span>
          <span className="text-sm text-muted-foreground">{P.region}</span>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 md:pt-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-primary">{P.audience}</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">{P.heroTitle}</h1>
              <p className="mt-4 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">{P.heroLead}</p>
              <p className="mt-4 text-base font-medium text-foreground">Valitse alta, kumpi kuvaa sinua.</p>
              <p className="mt-2 text-sm text-muted-foreground">Palveluun tarvitaan tunnukset, jotka saat hankkeen henkilöstöltä.</p>
            </div>
            <img
              src={P.heroImage}
              alt={P.heroImageAlt}
              width={1024}
              height={1024}
              decoding="async"
              className="hidden aspect-[4/3] w-full rounded-2xl object-cover md:block"
            />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <RoleCard
              primary
              id="role-jobseeker"
              label="Työnhakijalle"
              title="Olen työnhakija"
              text="Tunnista osaamisesi ja löydä sinulle sopivia työmahdollisuuksia."
              cta="Aloita palvelu"
              href={JOBSEEKER_URL}
            />
            <RoleCard
              id="role-coach"
              label="Hankkeen henkilöstölle"
              title="Olen valmentaja tai hanketyöntekijä"
              text="Tarkastele asiakkaiden arviointeja ja tue heidän etenemistään."
              cta="Siirry valmentajan palveluun"
              href={COACH_URL}
            />
          </div>
        </section>

        <section aria-labelledby="how-heading" className="bg-muted/50 py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="how-heading" className="text-3xl font-bold sm:text-4xl">Näin palvelu toimii</h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.t} className="flex gap-4 md:block">
                  <span aria-hidden className="text-4xl md:text-5xl font-bold text-primary">{i + 1}</span>
                  <div>
                    <h3 className="md:mt-2 text-xl font-semibold">{s.t}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-3xl text-base text-foreground">
              Arviointi perustuu vain tietoihin, jotka itse annat. Se tukee keskustelua valmentajan kanssa – ei tee päätöksiä puolestasi.
            </p>
          </div>
        </section>

        <section aria-labelledby="why-heading" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
          <h2 id="why-heading" className="text-3xl font-bold sm:text-4xl">Työnhakijat ja työnantajat lähemmäksi toisiaan</h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Työelämäverkossa työnhakijoiden osaaminen, työnantajien tarpeet ja koulutusmahdollisuudet tuodaan lähemmäksi toisiaan. Tavoitteena on löytää oikeat mahdollisuudet nopeammin ja tunnistaa, millaista osaamista alueella tarvitaan.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Palvelussa hyödynnetään KeudaPROn ARPRO-menetelmää osaamisen ja työmahdollisuuksien tunnistamiseen.
          </p>
        </section>

        <section aria-labelledby="privacy-heading" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <h2 id="privacy-heading" className="text-2xl font-bold">Tietosi ovat sinun</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Palvelussa käsitellään vain palvelun toteuttamisen kannalta tarvittavia tietoja. Ennen tietojen antamista näet tarkemmin, mitä tietoja käsitellään ja mihin niitä käytetään.
            </p>
            {P.privacyUrl ? (
              <a href={P.privacyUrl} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-block rounded font-medium text-primary underline underline-offset-4 ${focusRing}`}>
                Tietosuojaseloste<span className="sr-only"> (avautuu uuteen välilehteen)</span>
              </a>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Tietosuojaseloste julkaistaan ennen palvelun käyttöönottoa.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <p className="text-xl font-bold text-primary">{P.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {P.funding}-rahoitteinen hanke · {P.period}
          </p>
          <h2 className="mt-6 text-sm font-semibold text-foreground">Toteuttajat</h2>
          <ul className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-6">
            {P.organizations.map((o) => (
              <li key={o.name}>
                <img src={o.src} alt={o.name} loading="lazy" className="h-9 w-auto max-w-[11rem] object-contain sm:h-10" />
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-sm font-semibold text-foreground">Rahoitus</h2>
          <ul className="mt-4 flex flex-wrap items-center gap-6">
            {P.funderLogos.map((l) => (
              <li key={l.name}>
                <img src={l.src} alt={l.name} loading="lazy" className={l.tall ? "h-20 w-auto" : "h-10 w-auto"} />
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">ARPRO-palvelun toteutus: KeudaPRO</p>
        </div>
      </footer>
    </div>
  );
}
