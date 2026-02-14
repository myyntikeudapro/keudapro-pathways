import { useState } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import faqThumb1 from "@/assets/faq-thumb-1.jpg";
import faqThumb2 from "@/assets/faq-thumb-2.jpg";
import faqThumb3 from "@/assets/faq-thumb-3.jpg";
import faqThumb4 from "@/assets/faq-thumb-4.jpg";
import faqThumb5 from "@/assets/faq-thumb-5.jpg";

const faqs = [
  {
    question: "Mitä kasvukartoitus sisältää?",
    thumbnail: faqThumb1,
    youtubeId: "uW1aXFs0zzE",
  },
  {
    question: "Paljonko tämä vie aikaa?",
    thumbnail: faqThumb2,
    youtubeId: "y1QSgnwlYxU",
  },
  {
    question: "Onko tämä koulutusta vai käytännön tekemistä?",
    thumbnail: faqThumb3,
    youtubeId: "1_ms7pT36r8",
  },
  {
    question: "Miten tekoälypolku toimii?",
    thumbnail: faqThumb4,
    youtubeId: "sNQkNznTxp4",
  },
  {
    question: "Voiko pienyritys osallistua ilman suurta budjettia?",
    thumbnail: faqThumb5,
    youtubeId: "qv48XLRgTLE",
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
              key={faq.youtubeId}
              onClick={() => setOpenVideo(faq.youtubeId)}
              className="group text-left rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {/* Thumbnail with play overlay */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={faq.thumbnail}
                  alt={faq.question}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Question text */}
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

      {/* Video modal */}
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
