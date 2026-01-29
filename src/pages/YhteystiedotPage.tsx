import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Sähköposti",
    value: "info@keudapro.fi",
    href: "mailto:info@keudapro.fi",
  },
  {
    icon: Phone,
    label: "Puhelin",
    value: "+358 (0)9 123 4567",
    href: "tel:+358912345567",
  },
  {
    icon: MapPin,
    label: "Osoite",
    value: "Sibeliuksenkatu 55, 04400 Järvenpää",
    href: "https://maps.google.com",
  },
];

const YhteystiedotPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-accent/50 to-background">
        <div className="keuda-container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ota yhteyttä
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Haluatko kuulla lisää palveluistamme tai aloittaa yhteistyön? 
              Ota rohkeasti yhteyttä – autamme mielellämme.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="keuda-section">
        <div className="keuda-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Yhteystiedot
              </h2>
              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.icon === MapPin ? "_blank" : undefined}
                    rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 p-6 rounded-xl bg-accent/50">
                <h3 className="font-semibold text-foreground mb-2">
                  Tee 15 minuutin reittikartoitus
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selvitä nopeasti, mikä reitti sopii sinulle tai organisaatiollesi parhaiten.
                </p>
                <Button variant="cta" asChild>
                  <a
                    href="https://example.com/kartoitus"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Aloita kartoitus
                  </a>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Lähetä viesti
              </h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nimi *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Etunimi Sukunimi"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Sähköposti *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="nimi@esimerkki.fi"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                    Organisaatio
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Yritys tai organisaatio"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Aihe *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Valitse aihe</option>
                    <option value="insight">Insight+ - Osaaminen ja rooli</option>
                    <option value="work">Work+ - Työ ja siirtymät</option>
                    <option value="growth">Growth+ - Yrityksen kehittäminen</option>
                    <option value="partnership">Kumppanuus</option>
                    <option value="other">Muu asia</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Viesti *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Kerro, miten voimme auttaa..."
                  />
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full">
                  Lähetä viesti
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default YhteystiedotPage;
