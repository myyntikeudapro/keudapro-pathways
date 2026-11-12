import { Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoachPanel } from "@/contexts/CoachPanelContext";
import { PKS_COACH_ID, PKS_COACH_ENABLED } from "@/data/coachRegistry";

export function PksAdviserEntry() {
  const { openChat } = useCoachPanel();
  if (!PKS_COACH_ENABLED) return null;
  return <div className="border-t border-primary/20 pt-7 mt-7 space-y-4">
    <h3 className="flex items-center gap-3 text-xl font-bold text-primary"><Bot aria-hidden="true" /> AiCoach – kysy valmennuksesta</h3>
    <p className="text-foreground">AiCoach auttaa sinua tutustumaan palveluun ja löytämään oikean seuraavan askeleen. Valmennuksessa saat oman valmentajan.</p>
    <Button variant="cta" onClick={() => openChat(PKS_COACH_ID)}><MessageCircle aria-hidden="true" /> Kysy valmennuksesta</Button>
  </div>;
}