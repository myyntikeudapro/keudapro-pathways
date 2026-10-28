import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiTalentShell } from "@/components/hub/AiTalentShell";
import { useAiTalentMembership } from "@/hooks/useAiTalentMembership";
import NotFound from "@/pages/NotFound";
import { isAiTalentVisible } from "@/data/aiTalent";
import heroImg from "@/assets/hero-ai-coaches.jpg";

const TITLE = "AI Talent – nuorten AI-osaamis- ja työllistymisohjelma";
const CONTACT = "heikki.kallunki@keuda.fi";

const KeyFacts = () => (
  <dl className="grid grid-cols-3 gap-3">
    {[["Käynnistys", "10.11.2026"], ["Kesto", "n. 4–5 kk"], ["Paikkoja", "3–6"]].map(([k, v]) => (
      <div key={k} className="rounded-xl border border-border bg-card p-3">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
        <dd className="mt-1 font-bold text-[hsl(var(--keuda-blue))]">{v}</dd>
      </div>
    ))}
  </dl>
);

function LoginGate({ signedInEmail, onSignOut }: { signedInEmail?: string | null; onSignOut: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const passwordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMsg({ kind: "err", text: "Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana tai käytä kirjautumislinkkiä." });
  };
  const magicLink = async () => {
    if (!email.trim()) { setMsg({ kind: "err", text: "Kirjoita ensin sähköpostiosoitteesi." }); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/hub/ai-talent` } });
    setBusy(false);
    setMsg(error ? { kind: "err", text: "Linkin lähetys epäonnistui. Yritä hetken kuluttua uudelleen." } : { kind: "ok", text: "Kirjautumislinkki lähetettiin. Avaa se sähköpostistasi." });
  };

  return (
    <section className="bg-muted/40 py-12 md:py-20">
      <div className="keuda-container grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-keuda-orange mb-3">KeudaPRO Hub · Projekti</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[hsl(var(--keuda-blue))] leading-tight mb-5 hyphens-auto">{TITLE}</h1>
          <p className="text-lg text-muted-foreground mb-4">AI-koulutus, oikea kehitysprojekti ja näyttö työnantajille – tavoitteena työpaikka tai omat AI-toimeksiannot.</p>
          <p className="mb-8 text-foreground">Ohjelma on tarkoitettu alle 30-vuotiaille työnhakijoille sekä nuorille yrittäjille, jotka haluavat kehittää omaa liiketoimintaansa tekoälyn avulla.</p>
          <KeyFacts />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          {signedInEmail ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Ei käyttöoikeutta</h2>
              <p className="text-sm text-muted-foreground">Olet kirjautunut osoitteella <strong className="text-foreground break-all">{signedInEmail}</strong>, mutta sitä ei ole lisätty ohjelman jäseniin.</p>
              <AccessNote />
              <Button variant="outline" onClick={onSignOut}>Kirjaudu ulos</Button>
            </div>
          ) : (
            <form onSubmit={passwordLogin} className="space-y-4" noValidate>
              <h2 className="text-xl font-bold">Kirjaudu projektisivulle</h2>
              <div className="space-y-1.5">
                <Label htmlFor="ait-email">Sähköposti</Label>
                <Input id="ait-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ait-password">Salasana</Label>
                <Input id="ait-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" variant="cta" className="w-full" disabled={busy || !email || !password}>Kirjaudu</Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />tai<span className="h-px flex-1 bg-border" /></div>
              <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={magicLink}>Lähetä kirjautumislinkki sähköpostiin</Button>
              {msg && <p role="status" className={msg.kind === "ok" ? "text-sm text-[hsl(var(--keuda-blue))]" : "text-sm text-destructive"}>{msg.text}</p>}
              <AccessNote />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const AccessNote = () => (
  <p className="text-sm text-muted-foreground border-t border-border pt-4">
    Tämä projektisivu on tarkoitettu ohjelman osallistujille, Helsingin työllisyyspalveluille ja kumppaniyrityksille. Jos sinulla ei ole tunnusta, ota yhteyttä:{" "}
    <a className="text-[hsl(var(--keuda-blue))] underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.
  </p>
);

const Eyebrow = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`text-xs font-semibold uppercase tracking-[0.18em] mb-3 ${light ? "text-background/60" : "text-primary"}`}>{children}</p>
);

const STEPS = [
  { k: "OPI", t: "AI-Coordinator-koulutus", items: ["8 lähipäivää ja 3 workshopia", "Tekoälyn toiminnallisuusajattelu, tekoälyapurit ja -agentit", "Vastuulliset AI-käytännöt ja uuden osaamisen jalkauttaminen", "ChatGPT- ja Lovable-lisenssit sisältyvät"] },
  { k: "RAKENNA", t: "Oikea kehitysprojekti", items: ["Rajattu AI-projekti KeudaPROlle, Helsingin työllisyyspalveluille tai kumppaniyritykselle", "Yrittäjänä rakennat ratkaisun omaan yritykseesi", "Sinä rakennat, KeudaPRO valmentaa"] },
  { k: "NÄYTÄ", t: "AI Work Portfolio", items: ["Demo, mitatut tulokset ja projektinomistajan palaute", "Oma osaamisprofiili", "Osaaminen näkyväksi myös LinkedInissä"] },
  { k: "TYÖLLISTY", t: "Rekrytointipolku tai omat toimeksiannot", items: ["Työnhakijana rekrytointikeskustelut käynnistyvät jo ohjelman aikana – työnantaja näkee osaamisesi käytännössä ennen päätöstä", "Yrittäjänä kumppaniyritykset voivat tilata sinulta toimeksiantoja, kun näyttö on olemassa"] },
];

const PATHS = [
  { t: "AI + myynti ja kaupallinen työ", d: ["Yritysten taustatutkimus ja prospektointi", "Myyntisisällöt ja tarjousten valmistelu", "CRM-tiedon rikastaminen, AI-avusteiset myyntityökalut"] },
  { t: "AI + markkinointi ja sisältö", d: ["Sisällöt, LinkedIn, verkkosivut, kampanjat", "Video- ja kuvatuotanto, sisältöautomaatio", "Analytiikka ja AI-avusteiset markkinointiprosessit"] },
  { t: "AI + asiakaspalvelu ja asiakkuudet", d: ["Asiakasviestintä, tietopankit ja asiakaspalveluavustajat", "Asiakastiedon käsittely", "Palveluprosessien kehittäminen"] },
  { t: "AI Operations / AI Project", d: ["AI-agentit ja GPT-ratkaisut olemassa olevan prosessin sisään", "Sisäisten prosessien kehittäminen ja automaatiot", "Testaus, dokumentointi, prototypointi"] },
  { t: "AI + liiketoiminnan uudistaminen ja ratkaisurakentaminen", d: ["Rakennat yhdellä kokonaisratkaisulla (esim. Lovable + AI) uuden tavan tehdä se, mikä nyt tehdään useassa paikassa tai käsin", "Projektin omistaja on oma yritys, kumppaniyritys tai muu KeudaPROn kumppani", "Lopputulos on toimiva prototyyppi, jonka vaikutus mitataan"] },
];

const TIMELINE = [
  { d: "2.–6.11.2026", t: "Haku ja valinta", x: "Lyhyt hakulomake ja haastattelu yhdessä Helsingin työllisyyspalvelujen kanssa. Ratkaisee motivaatio, oppimiskyky ja kyky tehdä valmiiksi – ei CV." },
  { d: "10.11.–22.12.2026", t: "Koulutus ja orientaatio", x: "8 lähipäivää klo 13–17 (Tekoälykeskus, Berggren, Tekoälykonsultit). Rinnalla KeudaPROn viikoittainen valmennus, polun valinta ja kehitysprojektin rajaus." },
  { d: "Tammi–helmikuu 2027", t: "Projektityö ja portfolio", x: "3 workshopia, projektin rakentaminen ja portfolio. Rekrytointikeskustelut käynnistyvät." },
  { d: "Maaliskuu 2027", t: "Näyttö, työllistyminen ja toimeksiannot", x: "Projektien esittely, tekoälykoordinaattorin pätevyys, loppuarviointi, työllistymispolut ja yrittäjille ensimmäiset toimeksiannot." },
];

const List = ({ items, light }: { items: string[]; light?: boolean }) => (
  <ul className="space-y-2">
    {items.map((i) => (
      <li key={i} className={`flex gap-2 text-sm leading-relaxed ${light ? "text-white/80" : "text-muted-foreground"}`}>
        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-keuda-orange" />{i}
      </li>
    ))}
  </ul>
);

function ProgramContent() {
  return (
    <>
      <section className="relative overflow-hidden bg-foreground text-background">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 md:opacity-100" style={{ objectPosition: "center 25%" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/85 to-foreground md:bg-gradient-to-r md:from-foreground/95 md:via-foreground/80 md:to-foreground/45" />
        <div className="keuda-container relative py-10 sm:py-14 md:py-24">
          <Eyebrow light>AI Talent · Pilotti 2026–2027 · Helsingin työllisyyspalvelut × KeudaPRO</Eyebrow>
          <h1 className="text-[34px] md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mb-6 text-background">
            Opi. Rakenna. Näytä. <span style={{ color: "hsl(var(--keuda-orange))" }}>Työllisty – tai työllistä itsesi.</span>
          </h1>
          <div className="max-w-3xl space-y-3 text-base md:text-xl text-background/80 mb-10">
            <p>Sinulta ei odoteta valmista työuraa. Odotamme, että haluat rakentaa sellaisen. AI Talentissa saat AI-koulutuksen, oikean kehitysprojektin ja mahdollisuuden näyttää työnantajille, mihin pystyt.</p>
            <p>Tavoitteena ei ole vain suorittaa koulutusta. Tavoitteena on päästä töihin – tai yrittäjänä saada omalle yritykselle ensimmäiset AI-toimeksiannot.</p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Kenelle", "Alle 30-vuotiaat työnhakijat ja nuoret yrittäjät"], ["Startti", "ti 10.11.2026"], ["Lähipäivät", "klo 13–17"], ["Pätevyys", "Tekoälykoordinaattori (AI-Coordinator)"]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-background/15 bg-background/5 p-4 backdrop-blur-sm">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-background/50">{k}</dt>
                <dd className="mt-1 font-bold text-background">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="dark bg-background text-foreground py-14 md:py-20 border-y border-border/60" aria-labelledby="ait-steps">
        <div className="keuda-container">
          <Eyebrow>Näin ohjelma etenee</Eyebrow>
          <h2 id="ait-steps" className="text-2xl md:text-4xl font-bold text-foreground mb-10">Neljä vaihetta koulutuksesta työhön</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              return (
                <article key={s.k} className={`relative overflow-hidden rounded-xl border-2 bg-card p-6 shadow-[var(--shadow-card)] ${last ? "border-primary/60" : "border-border"}`}>
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-keuda-orange" />
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-keuda-orange text-lg font-extrabold text-foreground shadow-[0_0_18px_hsl(var(--keuda-orange)/0.45)]">{i + 1}</span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.k}</p>
                  <h3 className="mt-1 mb-4 text-xl font-bold text-foreground">{s.t}</h3>
                  <List items={s.items} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-accent/60 border-b border-border/60" aria-labelledby="ait-paths">
        <div className="keuda-container">
          <Eyebrow>Viisi polkua</Eyebrow>
          <h2 id="ait-paths" className="text-2xl md:text-4xl font-bold text-foreground mb-10 max-w-3xl">Perusosaaminen ja sen päällä poikkeuksellinen kyky käyttää tekoälyä</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PATHS.map((p, i) => (
              <article key={p.t} className="group rounded-xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-keuda-orange font-extrabold text-foreground">{i + 1}</span>
                <h3 className="mt-4 mb-3 text-lg font-bold text-foreground">{p.t}</h3>
                <List items={p.d} />
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-muted-foreground">Polku sovitetaan valittujen vahvuuksien ja kehitysprojektien mukaan – ei päätetä etukäteen. Yrittäjä voi valita minkä tahansa polun; projektin omistaja on silloin oma yritys.</p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-background" aria-labelledby="ait-time">
        <div className="keuda-container">
          <Eyebrow>Aikataulu</Eyebrow>
          <h2 id="ait-time" className="text-2xl md:text-4xl font-bold text-foreground mb-10">Haku marraskuussa, näyttö maaliskuussa</h2>
          <ol className="relative max-w-3xl border-l-2 border-keuda-orange pl-6 space-y-8">
            {TIMELINE.map((s) => (
              <li key={s.t} className="relative">
                <span aria-hidden className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-background bg-keuda-orange" />
                <p className="text-sm font-bold text-[hsl(var(--keuda-blue))]">{s.d}</p>
                <h3 className="text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-muted-foreground">{s.x}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-primary/5 border-y border-border/60" aria-labelledby="ait-fit">
        <div className="keuda-container">
          <h2 id="ait-fit" className="sr-only">Mitä sinulta odotetaan ja mitä saat</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-bold text-[hsl(var(--keuda-blue))] mb-4">Mitä sinulta odotetaan</h3>
              <List items={["Olet alle 30-vuotias työnhakija Helsingissä tai nuori yrittäjä, jolla on oma yritys tai yritysidea", "Haluat töihin tai haluat kehittää omaa liiketoimintaasi tekoälyn avulla, ja olet valmis tekemään asioita valmiiksi", "Kiinnostus tekoälyyn riittää – aiempaa AI-osaamista ei vaadita", "Pystyt osallistumaan lähipäiviin klo 13–17 ja projektityöhön niiden välillä"]} />
            </article>
            <article className="rounded-xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-bold text-[hsl(var(--keuda-blue))] mb-4">Mitä saat</h3>
              <List items={["Tekoälykoordinaattorin pätevyys (AI-Coordinator)", "Henkilökohtainen valmennus (Heikki Kallunki ja Satu Vainio, KeudaPRO)", "ChatGPT- ja Lovable-lisenssit ohjelman ajaksi", "Oikea projekti, portfolio ja suora yhteys työnantajiin ja toimeksiantajiin"]} />
            </article>
          </div>
          <figure className="mt-8 max-w-3xl border-l-4 border-keuda-orange pl-5">
            <blockquote className="text-xl md:text-2xl font-semibold leading-snug">"Olen suorittanut AI-pätevyyden. Olen rakentanut yritykselle oikean AI-ratkaisun. Tässä on portfolio, tässä on demo, tässä ovat tulokset."</blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">Näin valmistuva AI Talent esittelee itsensä työnantajalle tai toimeksiantajalle.</figcaption>
          </figure>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-background" aria-labelledby="ait-contact">
        <div className="keuda-container">
          <Eyebrow>Yhteystiedot</Eyebrow>
          <h2 id="ait-contact" className="text-2xl md:text-3xl font-bold text-foreground mb-8">Kysy lisää</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold text-lg">Heikki Kallunki</h3>
              <p className="text-muted-foreground">Toimitusjohtaja, KeudaPRO · ohjelman vastuuhenkilö</p>
              <a href={`mailto:${CONTACT}`} className="mt-2 inline-block text-[hsl(var(--keuda-blue))] underline">{CONTACT}</a>
            </div>
            <div className="rounded-xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <h3 className="font-bold text-lg">Helsingin työllisyyspalvelut</h3>
              <p className="text-muted-foreground">Osallistujien tunnistus ja valinta yhdessä KeudaPROn kanssa.</p>
              <p className="mt-2 font-semibold">Oma omavalmentajasi kertoo lisää.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const AiTalentPage = () => {
  const { user, role, loading, signOut } = useAiTalentMembership();
  if (!isAiTalentVisible()) return <NotFound />;
  return (
    <AiTalentShell email={user?.email} onSignOut={signOut}>
      {loading ? (
        <p className="keuda-container py-24 text-muted-foreground" role="status">Ladataan…</p>
      ) : role ? (
        <>
          <div className="bg-muted border-b border-border">
            <div className="keuda-container flex flex-wrap gap-x-6 gap-y-1 py-2 text-sm">
              <Link to="/hub/ai-talent/projektit" className="font-semibold text-[hsl(var(--keuda-blue))] underline">{role === "participant" ? "Oma projektini →" : "Projektit ja aihiopankki →"}</Link>
              {role === "admin" && <Link to="/hub/ai-talent/admin" className="font-semibold text-[hsl(var(--keuda-blue))] underline">Hallitse jäseniä →</Link>}
            </div>
          </div>
          <ProgramContent />
        </>
      ) : (
        <LoginGate signedInEmail={user?.email} onSignOut={signOut} />
      )}
    </AiTalentShell>
  );
};

export default AiTalentPage;
