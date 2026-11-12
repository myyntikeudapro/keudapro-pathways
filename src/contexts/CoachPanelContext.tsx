import { useState, useRef, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { canOpenCoach, canBookCoach, PKS_COACH_ID, type CoachType } from "@/data/coachRegistry";
import { CoachPanelContext } from "./coachPanelStore";
export { useCoachPanel } from "./coachPanelStore";
export type { CoachType } from "@/data/coachRegistry";

export function CoachPanelProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<CoachType | null>(null);
  const [highlightedCoach, setHighlightedCoach] = useState<CoachType | null>(null);
  const [bookingCoach, setBookingCoach] = useState<CoachType | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    // Language changes also end the session so a new greeting uses the selected language.
    setActiveChat(current => current === PKS_COACH_ID ? null : current);
  }, [pathname]);

  return (
    <CoachPanelContext.Provider
      value={{
        isPanelOpen,
        highlightedCoach,
        openPanel: (highlight = null) => {
          setHighlightedCoach(highlight);
          setIsPanelOpen(true);
        },
        closePanel: () => {
          setIsPanelOpen(false);
          setHighlightedCoach(null);
        },
        activeChat,
        openChat: (coach) => {
          if (!canOpenCoach(coach)) return;
          if (coach === PKS_COACH_ID) {
            const cookieChoices = document.querySelector('[aria-label="Evästeasetukset"]');
            if (cookieChoices) {
              cookieChoices.querySelector<HTMLButtonElement>('button')?.focus();
              return;
            }
          }
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          setBookingCoach(null);
          setActiveChat(coach);
          setIsPanelOpen(false);
          setHighlightedCoach(null);
        },
        closeChat: () => {
          setActiveChat(null);
          const target = returnFocus.current;
          requestAnimationFrame(() => { if (target?.isConnected) target.focus(); });
        },
        bookingCoach,
        openBooking: (coach) => {
          if (!canBookCoach(coach)) return;
          setActiveChat(null);
          setIsPanelOpen(false);
          setHighlightedCoach(null);
          setBookingCoach(coach);
        },
        closeBooking: () => setBookingCoach(null),
      }}
    >
      {children}
    </CoachPanelContext.Provider>
  );
}

