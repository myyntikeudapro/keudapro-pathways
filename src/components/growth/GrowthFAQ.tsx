import { useState } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const faqs = [
  {
    question: "Miten tiedän, mille tasolle kuulun?",
    youtubeId: "uW1aXFs0zzE",
  },
  {
    question: "Mitä kasvukartoitus sisältää?",
    youtubeId: "y1QSgnwlYxU",
  },
  {
    question: "Onko tämä koulutusta vai käytännön tekemistä?",
    youtubeId: "1_ms7pT36r8",
  },
  {
    question: "Miten tekoälypolku toimii?",
    youtubeId: "sNQkNznTxp4",
  },
  {
    question: "Voiko pienyritys osallistua ilman suurta budjettia?",
    youtubeId: "qv48XLRgTLE",
  },
  {
    question: "Miten osaamiskoulutukset liittyvät kasvuun?",
    youtubeId: "uW1aXFs0zzE",
  },
];

export function GrowthFAQ() {
  const [openVideo, setOpenVideo] = useState<string | null>(null);

  return (
    <section className="keuda-section">
      <div className="keuda-container">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          Usein kysyttyä
        </h2>
        <p className="text-muted-foreground text-center mb-10">
          Katso vastaukset videoina
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq) => (
            <button
              key={faq.youtubeId + faq.question}
              onClick={() => setOpenVideo(faq.youtubeId)}
              className="group text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${faq.youtubeId}/hqdefault.jpg`}
                  alt={faq.question}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="font-semibold text-foreground text-sm leading-snug mb-1">
                  {faq.question}
                </p>
                <span className="text-xs text-primary font-medium">
                  Katso video →
                </span>
              </div>
            </button>
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
