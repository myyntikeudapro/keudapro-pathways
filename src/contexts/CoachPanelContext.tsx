import { createContext, useContext, useState, ReactNode } from "react";

export type CoachType = "ana" | "veli" | "reitti";

interface CoachPanelContextType {
  isPanelOpen: boolean;
  openPanel: (highlight?: CoachType | null) => void;
  closePanel: () => void;
  highlightedCoach: CoachType | null;
  activeChat: CoachType | null;
  openChat: (coach: CoachType) => void;
  closeChat: () => void;
  bookingCoach: CoachType | null;
  openBooking: (coach: CoachType) => void;
  closeBooking: () => void;
}

const CoachPanelContext = createContext<CoachPanelContextType | undefined>(undefined);

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
          setActiveChat(coach);
          setIsPanelOpen(false);
          setHighlightedCoach(null);
        },
        closeChat: () => setActiveChat(null),
        bookingCoach,
        openBooking: (coach) => {
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

export function useCoachPanel() {
  const ctx = useContext(CoachPanelContext);
  if (!ctx) throw new Error("useCoachPanel must be used within CoachPanelProvider");
  return ctx;
}
