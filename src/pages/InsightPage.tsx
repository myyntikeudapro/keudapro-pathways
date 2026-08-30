import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { AlyAiHero } from "@/components/aly/AlyAiHero";
import { AlyAnchorNav } from "@/components/aly/AlyAnchorNav";
import { AlyDefinition, AlyLevels, AlyComparison } from "@/components/aly/AlyLevels";
import { AlyAssessment } from "@/components/aly/AlyAssessment";
import {
  AlyOrgArchitecture,
  AlyHowLearning,
  AlyToolsVsQualification,
} from "@/components/aly/AlyOrgArchitecture";
import { AlyLeadershipBridge } from "@/components/aly/AlyLeadershipBridge";
import { AlyCategoryAccordion } from "@/components/aly/AlyCategoryAccordion";
import { AlyFAQ } from "@/components/aly/AlyFAQ";
import { AlyTestimonials } from "@/components/aly/AlyTestimonials";
import { AI_LEVELS } from "@/components/aly/aiLevels";
import { trackEvent } from "@/lib/analytics";

const PROVIDER = {
  "@type": "EducationalOrganization",
  name: "KeudaPRO",
  legalName: "Keuda Koulutuspalvelut Oy",
  url: "https://keudapro.fi",
} as const;

const JSONLD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "KeudaPRO", item: "https://keudapro.fi/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tekoälypätevyydet",
        item: "https://keudapro.fi/aly",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "KeudaPROn tekoälypätevyydet",
    itemListElement: AI_LEVELS.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${l.name} – ${l.fi}`,
      url: l.href,
    })),
  },
  ...AI_LEVELS.map((l) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${l.name} – ${l.fi}`,
    description: l.intro,
    url: l.href,
    inLanguage: "fi",
    provider: PROVIDER,
  })),
];

const InsightPage = () => {
  return (
    <Layout>
      <SEO
        title="Tekoälypätevyydet | AI Coordinator, Manager & Director | KeudaPRO"
        description="KeudaPROn AI Coordinator-, AI Manager- ja AI Director -koulutukset muodostavat työelämän tekoälyosaamisen polun käytännön hyödyntämisestä sen kehittämiseen ja johtamiseen."
        path="/aly"
        jsonLd={JSONLD}
      />

      <AlyAiHero />
      <AlyAnchorNav />

      <AlyDefinition />
      <AlyLevels />
      <AlyComparison />
      <AlyAssessment />
      <AlyOrgArchitecture />
      <AlyHowLearning />
      <AlyToolsVsQualification />
      <AlyTestimonials />



      {/* Alkavat koulutukset – suorat, crawlattavat linkit ohjelmasivuille */}
      <section id="alkavat-koulutukset" style={{ scrollMarginTop: 110 }} className="py-12 md:py-16 bg-muted/40">
        <div className="keuda-container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Alkavat koulutukset
          </h2>
          <p className="text-muted-foreground mb-6">
            Ajankohtaiset aikataulut, sisällöt ja ilmoittautuminen löytyvät kunkin ohjelman omalta
            sivulta.
          </p>
          <ul className="flex flex-col gap-3">
            {AI_LEVELS.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("course_registration_click", { level: l.id })}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
                >
                  <span>
                    <span className="block font-bold text-foreground">
                      {l.name} – {l.fi}
                    </span>
                    <span className="block text-sm text-muted-foreground">{l.promise}</span>
                  </span>
                  <span aria-hidden="true" className="text-primary font-bold">
                    →
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://www.keuda.fi/koulutus/hyper-engineering-program-fi/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
              >
                <span>
                  <span className="block font-bold text-foreground">Hyper Engineering (FI / EN)</span>
                  <span className="block text-sm text-muted-foreground">
                    Syvä tekninen tekoälyosaaminen asiantuntijatehtäviin
                  </span>
                </span>
                <span aria-hidden="true" className="text-primary font-bold">
                  →
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <AlyFAQ />

      {/* Silta johtamisen tarjontaan – nykyinen tarjonta säilyy alla olevassa listauksessa */}
      <AlyLeadershipBridge />
      <AlyCategoryAccordion />

      {/* Sivun loppu */}
      <section className="py-14 md:py-20 bg-primary/5">
        <div className="keuda-container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Millaista tekoälyosaamista sinä tai organisaatiosi tarvitsette?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            Tekoälyn käytöstä on siirrytty vaiheeseen, jossa organisaatioiden pitää ratkaista, kuka
            osaa käyttää tekoälyä, kuka kehittää sen käyttöä ja kuka johtaa kokonaisuutta.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {AI_LEVELS.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-bold text-foreground">{l.name}</h3>
                <p className="text-sm text-muted-foreground">{l.promise}.</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              variant="cta"
              size="lg"
              onClick={() => {
                trackEvent("ai_assessment_start", { source: "footer" });
                const el = document.getElementById("loyda-oma-tasosi");
                if (el)
                  window.scrollTo({
                    top: el.getBoundingClientRect().top + window.scrollY - 110,
                    behavior: "smooth",
                  });
              }}
            >
              Löydä oma tasosi
            </Button>
            <Button variant="outline-primary" size="lg" asChild>
              <Link
                to="/yhteystiedot"
                onClick={() => trackEvent("organization_ai_cta", { source: "footer" })}
              >
                Rakennetaan tekoälyosaaminen organisaatiollesi
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#alkavat-koulutukset">Katso alkavat koulutukset</a>
            </Button>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <h3 className="font-bold text-foreground mb-2">
              Etsitkö laajemmin johtamisen kehittämistä?
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              KeudaPRO tarjoaa tekoälyjohtamisen lisäksi myös muuta johtamisen, esihenkilötyön ja
              organisaatioiden kehittämisen koulutus- ja valmennustarjontaa.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                trackEvent("leadership_crosslink_click", { source: "footer" });
                window.dispatchEvent(
                  new CustomEvent("aly-category-open", { detail: { id: "esihenkilo-johtaminen" } }),
                );
              }}
            >
              Tutustu johtamisen tarjontaan →
            </Button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            KeudaPRO (Keuda Koulutuspalvelut Oy) on Keski-Uudenmaan koulutuskuntayhtymä Keudan
            omistama yhtiö, joka vastaa työelämän koulutus- ja valmennuspalveluista.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default InsightPage;
