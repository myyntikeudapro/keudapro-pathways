import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type Testimonial = {
  quote: string;
  name: string;
  org: string;
  program: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Hyvä, monipuolinen koulutus, jossa tehtiin käytännön parissa ja päivitettiin agentteja. Näimme kattavasti eri tekoälyratkaisuja – emme olleet pelkästään Copilot-tuubissa.",
    name: "Asiantuntijasuunnittelija",
    org: "Lahden kaupunki",
    program: "Tekoälykoordinaattori-pätevyys",
  },
  {
    quote:
      "Koulutus sopi todella hyvin työskentelyn lomassa tehtäväksi. Keskusteleva ja aktiivisesti osallistava tapa kouluttaa oli aivan uutta – pääsin todella hyvin tekoälyn maailmaan kiinni. Tykkäsin kovasti.",
    name: "Erikoissuunnittelija",
    org: "Lupa- ja valvontavirasto",
    program: "Tekoälykoordinaattori-pätevyys",
  },
  {
    quote:
      "Parhaita koulutuksia, mitä olen ikinä käynyt! Pystyin kääntämään kaiken suoraan omaan tekemiseeni.",
    name: "Toni Mielikäinen, Yrittäjä",
    org: "Porvoon Mittaletku Oy",
    program: "Tekoälykoordinaattori-pätevyys",
  },
  {
    quote:
      "Käytännönläheinen ja ihmisläheinen koulutus. Lähdin ihan kylmiltäni, ja aivan toisenlainen maailma aukesi. Minut laitettiin tekemään asioita suoraan oppituntien aikana.",
    name: "Työnhakija",
    org: "Muutosturvan kautta",
    program: "Tekoälykoordinaattori-pätevyys",
  },
  {
    quote:
      "Etsin koulutusta, jossa tekoälyä käsitellään laajasti ja ammatillisesti eri näkökulmista – ja tämä koulutus vastasi juuri siihen tarpeeseen. Ei pelkkiä luentoja, vaan asioita työstettiin käytännössä koko ajan.",
    name: "Lehtori",
    org: "Ammattikorkeakoulu",
    program: "Tekoälykoordinaattori-pätevyys",
  },
];

export function AlyTestimonials() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      api.scrollNext();
    }, 7000);
    return () => window.clearInterval(id);
  }, [api]);

  return (
    <section
      id="referenssit"
      aria-labelledby="referenssit-title"
      style={{ scrollMarginTop: 110 }}
      className="py-16 md:py-24 bg-foreground text-background"
    >
      <div className="keuda-container">
        <div className="text-center mb-10 md:mb-12">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
            Asiakaspalaute
          </span>
          <h2
            id="referenssit-title"
            className="text-2xl md:text-4xl font-bold text-background mb-3"
          >
            Mitä osallistujat sanovat
          </h2>
          <p className="text-background/70 max-w-2xl mx-auto">
            Palautteita tekoälypätevyyskoulutuksista – asiantuntijoilta, yrittäjiltä ja
            julkisen sektorin kehittäjiltä.
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          className="max-w-5xl mx-auto"
        >
          <CarouselContent>
            {TESTIMONIALS.map((t) => (
              <CarouselItem key={t.quote} className="md:basis-1/2">
                <figure className="group relative h-full flex flex-col rounded-2xl border border-background/15 bg-background/5 p-6 md:p-8 backdrop-blur-sm overflow-hidden">
                  <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/40" aria-hidden="true" />
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80 group-hover:bg-primary transition-colors" aria-hidden="true" />
                  <div className="flex items-center gap-1 mb-4" aria-label="5/5 tähteä">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-primary"
                        fill="currentColor"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <Quote className="h-7 w-7 text-primary mb-3" aria-hidden="true" />
                  <blockquote className="text-base md:text-lg font-medium leading-relaxed text-background flex-1">
                    {t.quote}
                  </blockquote>
                  <div className="mt-6 pt-5 border-t border-background/15">
                    <figcaption>
                      <span className="block font-bold text-background">{t.name}</span>
                      <span className="block text-sm text-background/60">{t.org}</span>
                    </figcaption>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {t.program}
                    </span>
                  </div>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background/10 border-background/20 text-background hover:bg-background hover:text-foreground" />
          <CarouselNext className="hidden md:flex -right-4 bg-background/10 border-background/20 text-background hover:bg-background hover:text-foreground" />
        </Carousel>

        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.quote}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Näytä palaute ${i + 1}`}
              aria-current={current === i}
              className={`h-2 rounded-full transition-all ${
                current === i ? "w-8 bg-primary" : "w-2 bg-background/30 hover:bg-background/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
