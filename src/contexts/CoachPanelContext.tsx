import { useState, ReactNode } from "react";
import { canOpenCoach, canBookCoach, type CoachType } from "@/data/coachRegistry";
import { CoachPanelContext } from "./coachPanelStore";
export { useCoachPanel } from "./coachPanelStore";
export type { CoachType } from "@/data/coachRegistry";

export function CoachPanelProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<CoachType | null>(null);
  const [highlightedCoach, setHighlightedCoach] = useState<CoachType | null>(null);
  const [bookingCoach, setBookingCoach] = useState<CoachType | null>(null);

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
          setBookingCoach(null);
          setActiveChat(coach);
          setIsPanelOpen(false);
          setHighlightedCoach(null);
        },
        closeChat: () => setActiveChat(null),
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

