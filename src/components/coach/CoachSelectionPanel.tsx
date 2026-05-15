import { X, MessageCircle, CalendarDays } from "lucide-react";
import { useCoachPanel, CoachType } from "@/contexts/CoachPanelContext";
import { cn } from "@/lib/utils";
import { BOOKING_URL } from "@/lib/booking";

import coachAna from "@/assets/coach-ana.png";
import coachVeli from "@/assets/coach-veli.png";
import coachReitti from "@/assets/coach-reitti.png";

const coaches = [
  {
    id: "ana" as CoachType,
    name: "Ana",
    role: "Työhönvalmentaja",
    description: "Auttaa sinua löytämään suunnan, tunnistamaan osaamisesi ja etenemään kohti työtä.",
    image: coachAna,
    color: "border-pink-400",
    bgColor: "bg-pink-50",
    bookingUrl: "mailto:keudapro@keuda.fi?subject=Varaa%20aika%20–%20Työhönvalmentaja",
  },
  {
    id: "veli" as CoachType,
    name: "Veli",
    role: "Osaamisen kehittämisen valmentaja",
    description: "Sparraa tekoäly- ja digitaalisen osaamisen kehittämisessä ja ohjelmavalinnoissa.",
    image: coachVeli,
    color: "border-amber-400",
    bgColor: "bg-amber-50",
    bookingUrl: "mailto:keudapro@keuda.fi?subject=Varaa%20aika%20–%20Osaamisen%20kehittäminen",
  },
  {
    id: "reitti" as CoachType,
    name: "Reittivalmentaja",
    role: "Ura- ja opinto-ohjaaja",
    description: "Auttaa löytämään oikean koulutus- tai urapolun sinun tilanteestasi käsin.",
    image: coachReitti,
    color: "border-teal-400",
    bgColor: "bg-teal-50",
    bookingUrl: "mailto:keudapro@keuda.fi?subject=Varaa%20aika%20–%20Ura-%20ja%20opinto-ohjaus",
  },
];

export function CoachSelectionPanel() {
  const { isPanelOpen, closePanel, openChat, highlightedCoach } = useCoachPanel();

  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closePanel}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[61] h-full w-full sm:w-[420px] bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Valitse valmentajasi</h2>
            <p className="text-xs text-muted-foreground">Keskustele AI-valmentajan kanssa tai varaa aika ihmiselle</p>
          </div>
          <button onClick={closePanel} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Sulje">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Coach Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {coaches.map((coach) => {
            const isHighlighted = highlightedCoach === coach.id;
            return (
              <div
                key={coach.id}
                className={cn(
                  "rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md",
                  isHighlighted ? "border-teal-500 shadow-md" : coach.color
                )}
              >
                <div className="flex gap-4">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm flex-shrink-0"
                    loading="lazy"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base">{coach.name}</h3>
                    <p className="text-xs font-medium text-primary">{coach.role}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{coach.description}</p>
                  </div>
                </div>

                {isHighlighted && (
                  <p className="text-xs font-medium text-teal-600 mt-3">
                    Suositeltu tilanteesi perusteella
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openChat(coach.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Keskustele AI:n kanssa
                  </button>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => closePanel()}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Varaa aika ihmiselle
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center italic">
            AI-valmentajat – eivät ihmisiä. Eivät tallenna tietojasi.
          </p>
        </div>
      </div>
    </>
  );
}
