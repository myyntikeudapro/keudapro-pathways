import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import entryBg from "@/assets/entry-products-bg.jpg";

const products = [
  {
    title: "Kasvukartoitus",
    duration: "60–90 min",
    desc: "Selkeä tilannekuva, kasvun pullonkaulat ja seuraava askel.",
    cta: "Varaa kartoitus",
    href: "/kasvukartoitus"
  },
  {
    title: "Tekoälykartoitus ja pilotin suunnittelu",
    duration: "2–4 viikkoa",
    desc: "Miten AI otetaan käyttöön oikeasti – ei teoriassa.",
    cta: "Aloita AI-polku",
    href: "/tekoaly"
  },
  {
    title: "Omistajanvaihdoksen osaamissilta",
    duration: "Räätälöity",
    desc: "Jatkuvuus, tiedon siirto ja uusi vaihe hallitusti.",
    cta: "Keskustele siirtymästä",
    href: "/omistajanvaihdos"
  }
];

export function EntryProducts() {
  return (
    <section>
      {/* Hero banner with background image */}
      <div className="relative w-full">
        <div className="absolute inset-0">
          <img
            src={entryBg}
            alt="Pk-yrityksen kehittäminen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 py-20 md:py-28">
          <div className="keuda-container text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Aloita kevyesti – et tarvitse isoa projektia
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              PK-yrityksen kehittäminen alkaa pienestä, mutta oikein kohdistetusta liikkeestä.
            </p>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="keuda-section">
        <div className="keuda-container">
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.title} className="keuda-card-enhanced p-6 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Clock className="w-4 h-4" />
                  {product.duration}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{product.title}</h3>
                <p className="text-muted-foreground text-sm flex-1 mb-4">{product.desc}</p>
                <Button className="w-full" asChild>
                  <a href={product.href}>{product.cta}</a>
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Nopea aloitus. Ei turhaa raportointia. Konkreettinen eteneminen.
          </p>
        </div>
      </div>
    </section>
  );
}
