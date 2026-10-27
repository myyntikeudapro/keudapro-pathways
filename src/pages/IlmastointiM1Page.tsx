import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { leadAttribution, trackEvent } from "@/lib/analytics";
import NotFound from "./NotFound";
import heroImg from "@/assets/course-ilmastointi-m1.jpg";
import { CalendarDays, Euro, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  ILMASTOINTI_M1 as P, ILMASTOINTI_M1_PUBLISHED, STATUS_LABEL, formatFiDate, isIlmastointiVisible, isSessionOpen, prefillDate,
} from "@/data/ilmastointiM1";

const Todo = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded border border-dashed border-accent bg-accent/10 px-1.5 py-0.5 text-sm text-accent-foreground">[täydennä: {children}]</span>
);

const Section = ({ id, title, children, muted }: { id?: string; title: string; children: React.ReactNode; muted?: boolean }) => (
  <section id={id} className={muted ? "bg-muted/40 py-14 md:py-20" : "py-14 md:py-20"} style={{ scrollMarginTop: 80 }}>
    <div className="container max-w-5xl">
      <h2 className="mb-6 text-2xl font-bold text-primary md:text-3xl">{title}</h2>
      {children}
    </div>
  </section>
);

const themes = [
  "Ajoneuvojen ilmastointijärjestelmien rakenne ja toiminta",
  "Kylmäaineet, niiden ominaisuudet ja ympäristövaikutukset",
  "Kylmäaineen talteenotto, täyttö ja tiiviyden varmistaminen",
  "Huolto- ja korjaustyöt turvallisesti ja määräysten mukaisesti",
  "Pätevyysvaatimukset ja viranomaismenettely",
  "Valmistautuminen M1-pätevyyskokeeseen",
];

const faqs: [string, string][] = [
  ["Saanko koulutuksesta suoraan M1-pätevyyden?", "Et suoraan. Koulutus ja hyväksytty pätevyyskoe ovat edellytys pätevyyden hakemiselle. Pätevyys haetaan Tukesilta viranomaismenettelyn mukaisesti."],
  ["Minulla on vanha ilmastointipätevyys. Pitääkö minun käydä koko koulutus?", "Vanhan pätevyyden haltija voi päivittää pätevyytensä siirtymäajan kertauskoulutuksella ja pätevyysmenettelyllä. Kerro aiempi pätevyytesi lomakkeella, niin varmistamme sinulle sopivan polun."],
  ["Mikä on M1:n ja M1 A:n ero?", "Tukes erottaa vastuuhenkilön M1-pätevyyden ja asentajan M1 A -pätevyyden. Kumpaa haet, riippuu työtehtävistäsi ja koulutustaustastasi."],
  ["Tarvitsenko SFS 6002 -koulutuksen?", "Voimassa oleva SFS 6002 -sähkötyöturvallisuuskoulutus voi olla pätevyyden edellytys. Jos sinulla ei ole sitä, kerro siitä lomakkeella."],
  ["Mitä jos koulutuspäivä ei toteudu?", "Tarjoamme paikan seuraavasta toteutuksesta tai palautamme maksun kokonaan."],
  ["Voiko koulutuksen järjestää meidän korjaamollamme?", "Kyllä, soveltuvin osin. Pyydä yrityskoulutustarjous."],
];

type Values = Record<string, string>;
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) && s.length <= 255;

export default function IlmastointiM1Page() {
  const [params] = useSearchParams();
  const [v, setV] = useState<Values>(() => ({ date: prefillDate(params.get("pvm")), count: "1" }));
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Values>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");
  const [corp, setCorp] = useState<Values>({});
  const [corpState, setCorpState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const openSessions = useMemo(() => P.sessions.filter((s) => isSessionOpen(s)), []);

  if (!isIlmastointiVisible()) return <NotFound />;
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  const pick = (date: string) => {
    set("date", date);
    trackEvent("cta_clicked", { cta: "m1_select_date" });
    document.getElementById("ilmoittaudu")?.scrollIntoView({ behavior: "smooth" });
  };

  const validate = () => {
    const e: Values = {};
    if (!v.date) e.date = "Valitse koulutuspäivä.";
    if ((v.name ?? "").trim().length < 2) e.name = "Kirjoita nimesi.";
    if (!emailOk(v.email ?? "")) e.email = "Tarkista sähköpostiosoite.";
    if ((v.phone ?? "").trim().length < 5) e.phone = "Kirjoita puhelinnumero.";
    if ((v.company ?? "").trim() && !(v.ytunnus ?? "").trim()) e.ytunnus = "Y-tunnus tarvitaan, kun yritys on täytetty.";
    if ((v.billing ?? "").trim().length < 3) e.billing = "Kirjoita laskutus- tai verkkolaskuosoite.";
    const n = Number(v.count);
    if (!Number.isInteger(n) || n < 1 || n > P.maxParticipants) e.count = `Osallistujia 1–${P.maxParticipants}.`;
    if (!v.previous) e.previous = "Valitse aiempi pätevyys.";
    if (v.previous === "vanha" && !/^\d{4}$/.test(v.previousYear ?? "")) e.previousYear = "Kirjoita vanhan pätevyyden vuosi.";
    if (!v.payment) e.payment = "Valitse maksutapa.";
    if (!v.sfs) e.sfs = "Valitse SFS 6002 -tilanne.";
    if (!privacy) e.privacy = "Tietosuojaselosteen hyväksyntä on pakollinen.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFailure("");
    if (!validate()) return;
    setBusy(true);
    const lines = [
      `Koulutuspäivä: ${formatFiDate(v.date)}`,
      `Yritys: ${v.company || "–"}`,
      `Y-tunnus: ${v.ytunnus || "–"}`,
      `Laskutusosoite: ${v.billing}`,
      `Osallistujia: ${v.count}`,
      `Aiempi ilmastointipätevyys: ${v.previous === "vanha" ? `vanha pätevyys (${v.previousYear})` : "ei"}`,
      `SFS 6002 voimassa: ${v.sfs}`,
      `Maksutapa: ${v.payment === "lasku" ? "lasku työnantajalle (työnantajan suostumus vahvistettu)" : "verkkomaksu"}`,
      `Ajoneuvoalan koulutustausta: ${v.background || "–"}`,
      `Lisätiedot: ${v.extra || "–"}`,
      `Markkinointilupa: ${marketing ? "kyllä" : "ei"}`,
    ];
    try {
      const { data, error } = await supabase.functions.invoke("send-booking-request", {
        body: {
          name: v.name, email: v.email, phone: v.phone, organization: v.company || null,
          message: lines.join("\n").slice(0, 3000), source: "ilmastointi-m1", service_key: "osaaminen",
          meetingFormat: `M1-ilmoittautuminen ${formatFiDate(v.date)}`, training_date: v.date, ...leadAttribution(),
        },
      });
      if (error || !data?.ok) throw new Error();
      setSent(true);
      trackEvent("lead_submitted", { source: "ilmastointi-m1" });
    } catch {
      setFailure("Lähetys ei onnistunut. Tietosi säilyvät lomakkeessa – yritä hetken kuluttua uudelleen.");
    } finally {
      setBusy(false);
    }
  };

  const submitCorp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if ((corp.name ?? "").trim().length < 2 || !emailOk(corp.email ?? "") || (corp.company ?? "").trim().length < 2) {
      setCorpState("error");
      return;
    }
    setCorpState("busy");
    const { data, error } = await supabase.functions.invoke("send-booking-request", {
      body: {
        name: corp.name, email: corp.email, phone: corp.phone || null, organization: corp.company,
        message: `Yrityskoulutustarjouspyyntö (ilmastointipätevyys M1).\nOsallistujia arviolta: ${corp.count || "–"}\nLisätiedot: ${corp.extra || "–"}`,
        source: "ilmastointi-m1-yritys", service_key: "osaaminen", meetingFormat: "Yrityskoulutustarjous", ...leadAttribution(),
      },
    });
    if (error || !data?.ok) return setCorpState("error");
    setCorpState("sent");
    trackEvent("lead_submitted", { source: "ilmastointi-m1-yritys" });
  };

  const err = (k: string) => errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>;
  const radio = (name: string, opts: [string, string][]) => (
    <div className="flex flex-wrap gap-4">
      {opts.map(([val, label]) => (
        <label key={val} className="flex items-center gap-2 text-sm">
          <input type="radio" name={name} value={val} checked={v[name] === val} onChange={() => set(name, val)} className="h-4 w-4 accent-primary" />
          {label}
        </label>
      ))}
    </div>
  );

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Course", name: P.name, description: P.seoDescription,
    provider: { "@type": "EducationalOrganization", name: "KeudaPRO", url: "https://keudapro.fi" },
    hasCourseInstance: P.sessions.map((s) => ({ "@type": "CourseInstance", courseMode: "onsite", startDate: s.date, location: { "@type": "Place", name: P.place } })),
    offers: { "@type": "Offer", price: 320, priceCurrency: "EUR", category: "Paid" },
  };

  return (
    <Layout>
      <SEO title={P.seoTitle} description={P.seoDescription} path={P.path} jsonLd={jsonLd} />
      {!ILMASTOINTI_M1_PUBLISHED && <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>}

      {!ILMASTOINTI_M1_PUBLISHED && (
        <div className="bg-accent/15 py-2 text-center text-sm text-foreground">Esikatselu – sivu ei ole julkinen ennen hyväksyntää.</div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/60 to-background py-12 md:py-20">
        <div className="container grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">{P.category}</p>
            <h1 lang="fi" className="mb-5 hyphens-auto break-words text-3xl font-bold leading-tight text-primary md:text-5xl">{P.name}</h1>
            <p className="mb-6 text-lg text-muted-foreground">
              Yhden päivän koulutus, joka valmentaa ajoneuvojen ilmastointijärjestelmien huolto- ja korjaustöiden M1-pätevyyskokeeseen. Valitse sopiva päivä ja varmista pätevyytesi ennen siirtymäajan päättymistä.
            </p>
            <ul className="mb-7 grid gap-3 sm:grid-cols-3">
              {[[CalendarDays, "1 päivä, klo 8.00–16.00"], [Euro, P.priceText], [MapPin, "Keuda Mäntsälä"]].map(([Icon, t]) => {
                const I = Icon as typeof CalendarDays;
                return (
                  <li key={t as string} className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm font-medium">
                    <I className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />{t as string}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><a href="#ajankohdat">Ilmoittaudu koulutukseen</a></Button>
              <Button asChild size="lg" variant="outline"><a href="#yrityksellesi">Pyydä tarjous yrityksellesi</a></Button>
            </div>
          </div>
          <img src={heroImg} alt="Asentaja huoltaa auton ilmastointijärjestelmää talteenottolaitteella" width={1280} height={832} className="aspect-[16/11] w-full rounded-2xl object-cover shadow-lg" />
        </div>
      </section>

      <Section title="Pätevyysvaatimukset ovat muuttuneet – päivitä osaamisesi ajoissa">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4 text-muted-foreground">
            <p>Ajoneuvojen ilmastointijärjestelmien henkilöpätevyydet on uudistettu. Uudet M1–M4-pätevyysluokat määrittelevät, millaisia huolto-, korjaus- ja talteenottotöitä henkilö saa tehdä. Vanhan järjestelmän mukaiset pätevyydet ovat voimassa 12.3.2029 saakka.</p>
            <p>Vanhan pätevyyden haltija voi päivittää pätevyytensä siirtymäajan menettelyllä. Kertauskoulutukseen perustuvaa uutta pätevyyttä on haettava viimeistään 12.12.2028.</p>
            <p>Muutos koskee henkilöauto- ja hyötyajoneuvokorjaamoita, ilmastointihuoltoja ja muita yrityksiä, joissa työskennellään ajoneuvojen kylmäainejärjestelmien parissa. Koulutuspaikkojen kysyntä kasvaa siirtymäajan lopulla, joten pätevyyttä ei kannata jättää viimeiseen hetkeen.</p>
          </div>
          <div className="space-y-3">
            {[["12.12.2028", "viimeinen päivä hakea kertauskoulutukseen perustuvaa uutta pätevyyttä"], ["12.3.2029", "vanhan järjestelmän mukaisten pätevyyksien voimassaolo päättyy"]].map(([d, t]) => (
              <div key={d} className="rounded-xl border-l-4 border-accent bg-card p-4 shadow-sm">
                <p className="text-2xl font-bold text-primary">{d}</p>
                <p className="text-sm text-muted-foreground">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Kenelle koulutus sopii" muted>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Korjaamon asentajat", "Teet ilmastointijärjestelmien huoltoja ja korjauksia, joissa kylmäainepiiri avataan. M1 on työsi perustason pätevyys."],
            ["Vanhan pätevyyden haltijat", "Sinulla on vanhan järjestelmän mukainen ilmastointipätevyys ja haluat päivittää sen uuden järjestelmän mukaiseksi siirtymäaikana."],
            ["Korjaamoyritykset", "Useamman työntekijän pätevyydet pitää saattaa ajan tasalle. Ilmoita koko ryhmä samaan toteutukseen tai pyydä yrityskohtainen koulutus."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-foreground">{t}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tietoa koulutuksesta">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4 text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">Sisältö ja tavoite</h3>
            <p>Koulutus antaa valmiudet ajoneuvojen ilmastointijärjestelmien turvalliseen ja määräysten mukaiseen huoltoon ja korjaukseen. Päivän aikana kerrataan kylmäaineiden käsittely, talteenotto ja järjestelmän huolto- ja korjaustoimenpiteet sekä pätevyysvaatimusten edellyttämä osaaminen.</p>
            <p>Koulutus valmentaa M1-pätevyyskokeeseen. Koulutus ei sisällä pätevyyskoetta, vaan antaa osaamisen ja valmiudet kokeen suorittamiseen. Koe suoritetaan erikseen.</p>
            <p>Tukes erottaa vastuuhenkilön M1-pätevyyden ja asentajan M1 A -pätevyyden. Hyväksytty koe ja riittävä koulutustausta mahdollistavat soveltuvan pätevyyden hakemisen Tukesilta.</p>
            <h3 className="pt-2 text-lg font-semibold text-foreground">Päivän kulku</h3>
            <p>Klo 8.00–16.00 Keudan ajoneuvoalan koulutustiloissa Mäntsälässä. Päivä sisältää teoriaosuuden ja käytännön harjoituksia Keudan opetuskalustolla. Koulutukseen sisältyvät aamukahvit (kahvi ja sämpylä).</p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Koulutuspäivän teemat</h3>
            <ul className="space-y-3">
              {themes.map((t) => (
                <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden /><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Osallistumisen edellytykset" muted>
        <p className="mb-4 text-muted-foreground">Sopiva koulutuspolku riippuu aiemmasta pätevyydestäsi, koulutustaustastasi ja työtehtävistäsi. Pätevyyden hakemiseen voidaan edellyttää:</p>
        <ul className="mb-5 list-disc space-y-2 pl-6">
          <li>aiempaa ajoneuvojen ilmastointipätevyyttä tai riittävää ajoneuvoalan koulutustaustaa</li>
          <li>voimassa olevaa SFS 6002 -sähkötyöturvallisuuskoulutusta</li>
          <li>tarvittaessa tutkinnon osaa Lämmönhallintajärjestelmän korjaustyöt, 15 osp.</li>
        </ul>
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Jos et ole varma, riittääkö taustasi, kerro tilanteestasi ilmoittautumislomakkeella. Autamme selvittämään sinulle sopivan polun ennen koulutusta.</p>
      </Section>

      <Section id="ajankohdat" title="Valitse koulutuspäivä">
        <p className="mb-6 text-muted-foreground">Koulutukset järjestetään Keudan toimipisteessä Mäntsälässä klo 8.00–16.00.</p>
        <div className="grid gap-3">
          {P.sessions.map((s) => {
            const open = isSessionOpen(s);
            const label = !open && s.status === "avoinna" ? "Ilmoittautuminen päättynyt" : STATUS_LABEL[s.status];
            return (
              <div key={s.id} className={`grid items-center gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[auto_1fr_1fr_auto] ${v.date === s.date ? "ring-2 ring-primary" : ""}`}>
                <span className="text-sm text-muted-foreground">Toteutus {s.id}</span>
                <span className="text-lg font-semibold">{formatFiDate(s.date)} <span className="text-sm font-normal text-muted-foreground">{s.weekday}</span></span>
                <span className={`text-sm font-medium ${open ? "text-secondary" : "text-muted-foreground"}`}>{label}</span>
                <Button variant={v.date === s.date ? "default" : "outline"} disabled={!open} onClick={() => pick(s.date)} aria-label={`Valitse ${formatFiDate(s.date)}`}>
                  {v.date === s.date ? "Valittu" : "Valitse tämä päivä"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Ilmoittautuminen päättyy 14 vuorokautta ennen koulutuspäivää. Koulutuksen toteutuminen vahvistetaan ilmoittautumisajan päätyttyä, kun osallistujia on vähintään viisi. Ryhmään mahtuu enintään 12 osallistujaa.</p>
      </Section>

      <Section title="Hinta ja ehdot" muted>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <p className="text-3xl font-bold text-primary">320 € <span className="text-base font-normal text-muted-foreground">+ alv / osallistuja</span></p>
            <p className="mt-4 text-muted-foreground"><strong className="text-foreground">Hintaan sisältyy:</strong> koulutuspäivä, koulutusmateriaali, käytännön harjoitukset Keudan kalustolla ja osallistumistodistus. Tukesin pätevyyshakemuksen mahdollinen käsittelymaksu ei sisälly hintaan.</p>
            <p className="mt-3 text-muted-foreground"><strong className="text-foreground">Ryhmäkoko:</strong> vähintään 5, enintään 12 osallistujaa.</p>
            <p className="mt-3 text-muted-foreground"><strong className="text-foreground">Maksaminen:</strong> Koulutuksen osallistumismaksu maksetaan verkkomaksuna ilmoittautumisen yhteydessä tai työnantajan maksaessa laskulla.</p>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">Peruutusehdot</h3>
            <p>Ilmoittautuminen on sitova. Peruutukset tulee tehdä viimeistään seitsemän vuorokautta ennen koulutuksen alkua osoitteeseen <a href="mailto:satu.vainio@keuda.fi" className="text-primary underline">satu.vainio@keuda.fi</a>. Jos olet maksanut verkkomaksuna, lähetä myös tilinumerosi maksun palautusta varten.</p>
            <p>Myöhemmin tehdystä peruutuksesta veloitamme 50 % koulutuksen hinnasta. Peruuttamatta jätetystä koulutuksesta perimme koko hinnan. Osallistujan voi vaihtaa toiseen henkilöön ilman lisäkuluja.</p>
            <p>Sairastapauksessa palautamme maksun kokonaan, kun sairauslomatodistus toimitetaan viikon kuluessa koulutuspäivästä luottamuksellisesti osoitteessa <a href="https://turvaposti.keuda.fi/" target="_blank" rel="noopener noreferrer" className="text-primary underline">turvaposti.keuda.fi</a>.</p>
            <p>Jos työnantaja maksaa koulutuksen laskulla, ilmoittautuja vahvistaa, että hänellä on työnantajan suostumus. Jos työnantaja ei maksa laskua, maksu siirtyy osallistujan maksettavaksi.</p>
            <p>Koko ehdot: <a href="https://www.keuda.fi/lyhytkoulutuksen-peruutusehdot/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Keudan lyhytkoulutuksen peruutusehdot</a>.</p>
            <p>Jos koulutus ei toteudu vähimmäisosallistujamäärän jäädessä täyttymättä, tarjoamme paikan seuraavasta toteutuksesta tai palautamme maksun kokonaisuudessaan.</p>
          </div>
        </div>
      </Section>

      <Section id="ilmoittaudu" title="Ilmoittaudu koulutukseen">
        {sent ? (
          <div role="status" className="rounded-xl border border-secondary bg-card p-6">
            <CheckCircle2 className="mb-3 h-8 w-8 text-secondary" aria-hidden />
            <p className="text-lg">Kiitos ilmoittautumisestasi. Lähetimme vahvistuksen sähköpostiisi. Vahvistamme koulutuksen toteutumisen viimeistään 14 vuorokautta ennen koulutuspäivää.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-5 rounded-xl border bg-card p-5 md:grid-cols-2 md:p-8">
            <div className="md:col-span-2">
              <Label htmlFor="m1-date">Koulutuspäivä *</Label>
              <select id="m1-date" value={v.date ?? ""} onChange={(e) => set("date", e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Valitse päivä</option>
                {openSessions.map((s) => <option key={s.id} value={s.date}>{formatFiDate(s.date)} ({s.weekday})</option>)}
              </select>
              {err("date")}
            </div>
            {[["name", "Osallistujan nimi *", "text", 100], ["email", "Sähköposti *", "email", 255], ["phone", "Puhelin *", "tel", 30], ["company", "Yritys", "text", 150], ["ytunnus", "Y-tunnus", "text", 20], ["billing", "Laskutusosoite tai verkkolaskuosoite *", "text", 300]].map(([k, l, t, max]) => (
              <div key={k as string}>
                <Label htmlFor={`m1-${k}`}>{l}</Label>
                <Input id={`m1-${k}`} type={t as string} maxLength={max as number} value={v[k as string] ?? ""} onChange={(e) => set(k as string, e.target.value)} className="mt-1" />
                {err(k as string)}
              </div>
            ))}
            <div>
              <Label htmlFor="m1-count">Osallistujien määrä *</Label>
              <Input id="m1-count" type="number" min={1} max={12} value={v.count ?? ""} onChange={(e) => set("count", e.target.value)} className="mt-1" />
              {Number(v.count) > 1 && <p className="mt-1 text-sm text-muted-foreground">Kirjoita muiden osallistujien nimet lisätietoihin.</p>}
              {err("count")}
            </div>
            <div>
              <Label htmlFor="m1-background">Ajoneuvoalan koulutustausta</Label>
              <Input id="m1-background" maxLength={200} value={v.background ?? ""} onChange={(e) => set("background", e.target.value)} className="mt-1" />
            </div>
            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-sm font-medium">Aiempi ilmastointipätevyys *</legend>
              {radio("previous", [["ei", "Ei"], ["vanha", "Vanha pätevyys"]])}
              {v.previous === "vanha" && (
                <Input aria-label="Vanhan pätevyyden vuosi" placeholder="Vuosi, esim. 2015" inputMode="numeric" maxLength={4} value={v.previousYear ?? ""} onChange={(e) => set("previousYear", e.target.value)} className="mt-3 max-w-[200px]" />
              )}
              {err("previous")}{err("previousYear")}
            </fieldset>
            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-sm font-medium">Maksutapa *</legend>
              {radio("payment", [["verkkomaksu", "Verkkomaksu"], ["lasku", "Lasku työnantajalle"]])}
              {v.payment === "lasku" && <p className="mt-2 text-sm text-muted-foreground">Vahvistat, että sinulla on työnantajan suostumus osallistua koulutukseen työnantajan kustannuksella.</p>}
              {err("payment")}
            </fieldset>
            <fieldset className="md:col-span-2">
              <legend className="mb-2 text-sm font-medium">SFS 6002 voimassa *</legend>
              {radio("sfs", [["kyllä", "Kyllä"], ["ei", "Ei"], ["en tiedä", "En tiedä"]])}
              {err("sfs")}
            </fieldset>
            <div className="md:col-span-2">
              <Label htmlFor="m1-extra">Lisätiedot</Label>
              <Textarea id="m1-extra" maxLength={1500} value={v.extra ?? ""} onChange={(e) => set("extra", e.target.value)} className="mt-1" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={privacy} onCheckedChange={(c) => setPrivacy(c === true)} aria-label="Tietosuojaseloste luettu" />
                <span>Olen lukenut <a href="https://www.keuda.fi/tietosuojaseloste/" target="_blank" rel="noopener noreferrer" className="text-primary underline">tietosuojaselosteen</a> *</span>
              </label>
              {err("privacy")}
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={marketing} onCheckedChange={(c) => setMarketing(c === true)} aria-label="Markkinointilupa" />
                <span>KeudaPRO saa lähettää minulle tietoa koulutuksista</span>
              </label>
            </div>
            {failure && <p role="alert" className="flex gap-2 text-sm text-destructive md:col-span-2"><AlertTriangle className="h-4 w-4" />{failure}</p>}
            <div className="md:col-span-2">
              <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">{busy ? "Lähetetään…" : "Lähetä ilmoittautuminen"}</Button>
            </div>
          </form>
        )}
      </Section>

      <Section id="yrityksellesi" title="Koulutus suoraan yrityksellesi" muted>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-muted-foreground">
            <p>Onko korjaamollasi useita työntekijöitä, joiden ilmastointipätevyydet pitää päivittää? Järjestämme M1-koulutuksen myös yrityskohtaisena toteutuksena Keudan koulutustiloissa tai soveltuvin osin yrityksesi omissa tiloissa.</p>
            <p className="font-medium text-foreground">Yrityskohtaisessa toteutuksessa</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>koulutat koko ryhmän samalla kertaa</li>
              <li>sisältö kohdennetaan yrityksesi todellisiin työtehtäviin</li>
              <li>ajankohta sovitaan yrityksesi tuotannon mukaan.</li>
            </ul>
            <p>Yrityskohtaiset toteutukset hinnoitellaan erikseen. Kysy myös M2-, M3- ja M1+M3-koulutuksista.</p>
          </div>
          {corpState === "sent" ? (
            <div role="status" className="rounded-xl border border-secondary bg-card p-6">Kiitos! Otamme yhteyttä tarjouksen tiimoilta.</div>
          ) : (
            <form onSubmit={submitCorp} noValidate className="grid gap-4 rounded-xl border bg-card p-5">
              {[["company", "Yritys *"], ["name", "Yhteyshenkilö *"], ["email", "Sähköposti *"], ["phone", "Puhelin"], ["count", "Osallistujia arviolta"]].map(([k, l]) => (
                <div key={k}>
                  <Label htmlFor={`corp-${k}`}>{l}</Label>
                  <Input id={`corp-${k}`} maxLength={200} value={corp[k] ?? ""} onChange={(e) => setCorp((p) => ({ ...p, [k]: e.target.value }))} className="mt-1" />
                </div>
              ))}
              <div>
                <Label htmlFor="corp-extra">Lisätiedot</Label>
                <Textarea id="corp-extra" maxLength={1500} value={corp.extra ?? ""} onChange={(e) => setCorp((p) => ({ ...p, extra: e.target.value }))} className="mt-1" />
              </div>
              {corpState === "error" && <p role="alert" className="text-sm text-destructive">Tarkista yritys, nimi ja sähköposti – tai yritä hetken kuluttua uudelleen.</p>}
              <Button type="submit" disabled={corpState === "busy"}>{corpState === "busy" ? "Lähetetään…" : "Pyydä yrityskoulutustarjous"}</Button>
            </form>
          )}
        </div>
      </Section>

      <Section title="Miksi kouluttautua Keudassa">
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            ["Käytännönläheinen koulutus.", "Teoria ja käytännön harjoitukset Keudan ajoneuvoalan opetuskalustolla samana päivänä."],
            ["Kokeneet kouluttajat.", "Koulutuksesta vastaavat ajoneuvoalan opetuksen ja korjaamotyön tuntevat ammattilaiset."],
            ["Valitse itse päivä.", "Kuusi toteutusta joulukuusta toukokuuhun – ilmoittaudu silloin, kun korjaamon arki sen sallii."],
            ["Luotettava kumppani.", "Keuda on vakiintunut ammatillisen koulutuksen järjestäjä. KeudaPRO vastaa yrityskoulutusten myynnistä, asiakaspalvelusta ja toteutusten koordinoinnista."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border bg-card p-5"><p className="font-semibold text-foreground">{t}</p><p className="mt-1 text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section title="Usein kysytyt kysymykset" muted>
        <Accordion type="single" collapsible className="rounded-xl border bg-card px-5">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`q${i}`}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <div className="border-t py-6">
        <p className="container max-w-5xl text-xs text-muted-foreground">
          Koulutus ei sisällä pätevyyskoetta eikä yksin merkitse viranomaispätevyyden myöntämistä. Tarvittava pätevyys haetaan Turvallisuus- ja kemikaalivirasto Tukesin menettelyn mukaisesti. Koulutuksen järjestäjä: Keuda. Myynti ja asiakaspalvelu: KeudaPRO, Keuda Koulutuspalvelut Oy.
        </p>
      </div>
    </Layout>
  );
}
