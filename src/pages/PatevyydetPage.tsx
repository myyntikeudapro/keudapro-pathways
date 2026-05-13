import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "Turvallisuus", icon: "🦺", title: "Turvallisuus ja pätevyydet", desc: "Työturvallisuuskortti, tulityö, sähköturvallisuus" },
  { id: "Ensiapu", icon: "🩺", title: "Ensiapu", desc: "EA1, EA2, hätäensiapu" },
  { id: "Hygienia", icon: "🍽️", title: "Hygienia ja ravintola", desc: "Hygieniapassi, anniskelupassi" },
  { id: "Työelämätaidot", icon: "💼", title: "Työelämätaidot", desc: "LinkedIn, työnhaku, urasuunnittelu" },
  { id: "AI", icon: "🤖", title: "AI ja tulevaisuustaidot", desc: "Tekoäly työssä, 3T-ohjelma" },
  { id: "Toimialakohtaiset", icon: "🏭", title: "Toimialakohtaiset", desc: "Räätälöidyt pätevyydet" },
];

type Course = {
  name: string;
  category: string;
  date: string;
  taken: number;
  total: number;
  format: "Lähitoteutus" | "Etätoteutus" | "Räätälöity";
  openSeats: boolean;
};

const courses: Course[] = [
  { name: "Työturvallisuuskortti", category: "Turvallisuus", date: "15.6.2025", taken: 6, total: 20, format: "Lähitoteutus", openSeats: true },
  { name: "Hygieniapassi", category: "Hygienia", date: "18.6.2025", taken: 8, total: 16, format: "Lähitoteutus", openSeats: true },
  { name: "EA1 Ensiapu", category: "Ensiapu", date: "20.6.2025", taken: 6, total: 12, format: "Lähitoteutus", openSeats: true },
  { name: "Tulityökortti", category: "Turvallisuus", date: "25.6.2025", taken: 7, total: 10, format: "Lähitoteutus", openSeats: false },
  { name: "Anniskelupassi", category: "Hygienia", date: "10.7.2025", taken: 6, total: 16, format: "Lähitoteutus", openSeats: true },
  { name: "LinkedIn-kortti", category: "Työelämätaidot", date: "2.9.2025", taken: 4, total: 16, format: "Etätoteutus", openSeats: true },
  { name: "3T: Tehoa työnhakuun tekoälyllä", category: "AI", date: "10.9.2025", taken: 8, total: 16, format: "Etätoteutus", openSeats: true },
  { name: "Toimialakohtainen pätevyys", category: "Toimialakohtaiset", date: "Kysy toteutusta", taken: 0, total: 0, format: "Räätälöity", openSeats: false },
];

const partnerCards = [
  { title: "Strategic Partner", desc: "Prioriteettipaikat, ennakkovarausoikeus, kumppanuusalennukset, näkyvyys palvelussa" },
  { title: "Access Partner", desc: "Pääsy avoimiin ryhmiin, Open Seats -paikat, yritysosallistujaedut" },
  { title: "Delivery Partner", desc: "Tarjoa koulutuksiasi KeudaPRO Skills Hubin kautta, hyväksytty palveluntuottaja" },
];

const PatevyydetPage = () => {
  const [active, setActive] = useState<string>("Kaikki");
  const { toast } = useToast();
  const [partnerOpen, setPartnerOpen] = useState(false);

  const filtered = active === "Kaikki" ? courses : courses.filter((c) => c.category === active);

  const handleSubmit = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    toast({ title: msg });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <SEO
        title="Pätevyydet ja osaamiskortit | KeudaPRO"
        description="Tunnustetut osaamiskortit ja pätevyyskoulutukset KUUMA-seudulla — ryhmille, tiimeille ja yksittäisille osallistujille."
        path="/patevyydet"
      />

      <PatevyydetHeroCarousel />

      {/* Intro + CTAs */}
      <section className="py-10 md:py-14">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Nopeat, tunnustetut kortit — ryhmille, tiimeille ja yksittäisille osallistujille. Löydä tarvitsemasi koulutus ja ilmoittaudu suoraan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="cta" size="lg" asChild>
                <a href="#koulutukset">Selaa koulutuksia</a>
              </Button>
              <Button variant="outline-primary" size="lg" asChild>
                <a href="#kumppanit">Hae kumppaniksi</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-16 bg-muted/30">
        <div className="keuda-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActive("Kaikki")}
              className={`keuda-card-enhanced p-6 text-left transition-all ${
                active === "Kaikki" ? "ring-2 ring-primary border-primary" : ""
              }`}
            >
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold text-foreground mb-1">Kaikki</h3>
              <p className="text-sm text-muted-foreground">Näytä kaikki koulutukset</p>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`keuda-card-enhanced p-6 text-left transition-all ${
                  active === cat.id ? "ring-2 ring-primary border-primary" : ""
                }`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{cat.title}</h3>
                <p className="text-sm text-muted-foreground">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="koulutukset" className="py-12 md:py-16">
        <div className="keuda-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            Tulevat koulutukset
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => {
              const free = c.total - c.taken;
              const fillingUp = c.total > 0 && free <= 5 && free > 0;
              return (
                <div key={c.name} className="keuda-card-enhanced p-6 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                      {c.category}
                    </Badge>
                    {c.openSeats && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Avoin osallistujille
                      </Badge>
                    )}
                    {fillingUp && (
                      <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                        Täyttymässä
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{c.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mb-4">
                    <div>Seuraava: {c.date}</div>
                    {c.total > 0 && (
                      <div>{free} / {c.total} paikkaa vapaana</div>
                    )}
                    <div className="flex items-center gap-1.5">
                      {c.format === "Etätoteutus" ? (
                        <Monitor className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {c.format}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button variant="outline-primary" className="w-full">
                      Ilmoittaudu
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="kumppanit" className="py-12 md:py-20 bg-accent/40">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              UNIIKKI-kumppanuus
            </h2>
            <p className="text-lg text-muted-foreground">
              Tarjoa koulutuksiasi KeudaPRO:n kautta tai hyödynnä avoimia ryhmiä oman organisaatiosi tarpeisiin.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {partnerCards.map((p) => (
              <div key={p.title} className="keuda-card-enhanced p-6">
                <h3 className="text-xl font-bold text-foreground mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Dialog open={partnerOpen} onOpenChange={setPartnerOpen}>
              <DialogTrigger asChild>
                <Button variant="cta" size="lg">Hae kumppaniksi</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Hae kumppaniksi</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    handleSubmit(e, "Kiitos! Olemme yhteydessä pian.");
                    setPartnerOpen(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="org">Organisaation nimi</Label>
                    <Input id="org" required />
                  </div>
                  <div>
                    <Label htmlFor="contact">Yhteyshenkilö</Label>
                    <Input id="contact" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Sähköposti</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="ptype">Kumppanuustyyppi</Label>
                    <Select>
                      <SelectTrigger id="ptype">
                        <SelectValue placeholder="Valitse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategic">Strategic Partner</SelectItem>
                        <SelectItem value="access">Access Partner</SelectItem>
                        <SelectItem value="delivery">Delivery Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="msg">Kerro tarpeitanne lyhyesti</Label>
                    <Textarea id="msg" rows={4} />
                  </div>
                  <Button type="submit" variant="cta" className="w-full">Lähetä</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Need form */}
      <section className="py-12 md:py-20">
        <div className="keuda-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Et löydä sopivaa toteutusta?
              </h2>
              <p className="text-lg text-muted-foreground">
                Kerro tarpeesi — räätälöimme toteutuksen tai etsimme sopivan ajankohdan.
              </p>
            </div>
            <form
              onSubmit={(e) => handleSubmit(e, "Kiitos! Palaamme asiaan.")}
              className="keuda-card-enhanced p-6 md:p-8 space-y-4"
            >
              <div>
                <Label htmlFor="course">Koulutus tai kortti</Label>
                <Input id="course" required />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="count">Osallistujamäärä</Label>
                  <Input id="count" type="number" min={1} required />
                </div>
                <div>
                  <Label htmlFor="when">Toivottu ajankohta</Label>
                  <Input id="when" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email2">Sähköposti</Label>
                <Input id="email2" type="email" required />
              </div>
              <Button type="submit" variant="cta" className="w-full">Lähetä toive</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PatevyydetPage;
