import { getPksUi, type PksLanguage } from "@/data/pksContent";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { PKS_COACH_ID, PKS_COACH_ENABLED, coachRegistry } from "@/data/coachRegistry";

export function PksAdviserEntry({ language = "fi" }: { language?: PksLanguage }) {
  const ui = getPksUi(language);
  const { openChat, activeChat, isPanelOpen, bookingCoach } = useCoachPanel();
  const [overlayOpen, setOverlayOpen] = useState(true);
  useEffect(() => {
    const update = () => setOverlayOpen(Boolean(document.querySelector('[aria-label="Evästeasetukset"], [role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]')));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, []);
  if (!PKS_COACH_ENABLED) return null;
  const alisa = coachRegistry[PKS_COACH_ID];
  return <><div className="border-t border-primary/20 pt-7 mt-7 space-y-4">
    <h3 className="flex items-center gap-3 text-xl font-bold text-primary"><img src={alisa.image} alt="" className="h-12 w-12 rounded-full object-cover object-top" /> {ui.alisaTitle}</h3>
    <p className="text-foreground">{ui.alisaIntro}</p>
    <Button variant="cta" onClick={() => openChat(PKS_COACH_ID)}><MessageCircle aria-hidden="true" /> {ui.ask}</Button>
  </div>
    <div hidden={overlayOpen || Boolean(activeChat) || isPanelOpen || Boolean(bookingCoach)} className="fixed bottom-5 right-3 z-30 md:bottom-8 md:right-6">
      <Button variant="outline" aria-label={`${ui.askAlisa} – ${ui.role}`} onClick={() => openChat(PKS_COACH_ID)} className="h-auto gap-3 rounded-lg border-primary/30 bg-background px-3 py-2 text-foreground shadow-lg hover:bg-muted max-w-[calc(100vw-1.5rem)]">
        <img src={alisa.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover object-top md:h-14 md:w-14" />
        <span className="text-left"><span className="block font-bold text-primary">{ui.askAlisa}</span><span className="block text-xs font-normal text-muted-foreground">{ui.aiRole}</span></span>
        <MessageCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      </Button>
    </div>
  </>;
}