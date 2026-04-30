import { useState } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

const faqs = [
  {
    question: "Miten tiedän, mille tasolle kuulun?",
    answer: "Helpoin tapa on tehdä 15 minuutin reittikartoitus – käymme yhdessä läpi yrityksesi liikevaihdon, tilanteen ja tavoitteet. Tason valinta ei ole pysyvä: voit siirtyä tasolta toiselle joustavasti sopimusvuoden aikana.",
    youtubeId: "uW1aXFs0zzE",
  },
  {
    question: "Mitä kasvukartoitus sisältää?",
    answer: "Kasvukartoitus on maksuton 15 minuutin keskustelu jossa tunnistetaan yrityksesi nykytaso, pullonkaulat ja sopivin reitti eteenpäin. Saat selkeän suosituksen – ei yleistä, vaan juuri sinulle.",
    youtubeId: "y1QSgnwlYxU",
  },
  {
    question: "Onko tämä koulutusta vai käytännön tekemistä?",
    answer: "Molempia – mutta paino on käytännössä. Valmennukset, sparraussessiot ja tekoälytyökalut on suunniteltu niin että opit soveltamaan heti omassa arjessasi. Ei luentoja vaan tekemistä.",
    youtubeId: "1_ms7pT36r8",
  },
  {
    question: "Miten tekoälypolku toimii?",
    answer: "Tekoälypolku alkaa yrityksesi nykytason kartoituksesta. Sen jälkeen rakennetaan vaiheittainen suunnitelma – asiakasviestinnästä automaatioon ja BI-integraatioihin. Vauhti ja syvyys määräytyvät tason mukaan.",
    youtubeId: "sNQkNznTxp4",
  },
  {
    question: "Voiko pienyritys osallistua ilman suurta budjettia?",
    answer: "Kyllä. Taso 1 on suunniteltu juuri pienille yrityksille – 290 €/kk kattaa valmennuksen, tekoälytyökalut ja vertaisryhmän. Lisäksi paketteihin voi hakea ELY-tukea tai yritysrahoitusta josta kysytään reittikartoituksessa.",
    youtubeId: "qv48XLRgTLE",
  },
  {
    question: "Miten osaamiskoulutukset liittyvät kasvuun?",
    answer: "Osaaminen on kasvun perusta – ilman sitä prosessit ja työkalut jäävät hyödyntämättä. Osaaminen käytäntöön -polku varmistaa että tiimisi pysyy kasvun vauhdissa mukana.",
    youtubeId: "uW1aXFs0zzE",
  },
];

export function GrowthFAQ() {
  const [openVideo, setOpenVideo] = useState<string | null>(null);

  return (
    <section id="faq" className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Katso vastaukset tekstinä ja videoina
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq) => (
            <div
              key={faq.youtubeId + faq.question}
              className="rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg"
            >
              {/* Text answer */}
              <div className="p-4">
                <p className="font-semibold text-foreground text-sm leading-snug mb-2">
                  {faq.question}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[600px]">
                  {faq.answer}
                </p>
              </div>

              {/* Video thumbnail */}
              <button
                onClick={() => setOpenVideo(faq.youtubeId)}
                className="group w-full focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${faq.youtubeId}/hqdefault.jpg`}
                    alt={faq.question}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 text-left">
                  <span className="text-xs text-primary font-medium">
                    Katso video →
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!openVideo} onOpenChange={() => setOpenVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-none">
          <VisuallyHidden>
            <DialogTitle>Video</DialogTitle>
          </VisuallyHidden>
          {openVideo && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${openVideo}?autoplay=1&rel=0`}
                title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
