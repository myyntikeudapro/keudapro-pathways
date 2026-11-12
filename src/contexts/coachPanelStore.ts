import { createContext, useContext } from "react";
import type { CoachType } from "@/data/coachRegistry";

export interface CoachPanelContextType {
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

// Keep context identity outside the hot-reloaded provider component module.
export const CoachPanelContext = createContext<CoachPanelContextType | undefined>(undefined);

export function useCoachPanel() {
  const ctx = useContext(CoachPanelContext);
  if (!ctx) throw new Error("useCoachPanel must be used within CoachPanelProvider");
  return ctx;
}