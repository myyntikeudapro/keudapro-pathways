import { createContext, useContext, useState, ReactNode } from "react";

export type CoachType = "ana" | "veli" | "reitti";

interface CoachPanelContextType {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  activeChat: CoachType | null;
  openChat: (coach: CoachType) => void;
  closeChat: () => void;
}

const CoachPanelContext = createContext<CoachPanelContextType | undefined>(undefined);

export function CoachPanelProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<CoachType | null>(null);

  return (
    <CoachPanelContext.Provider
      value={{
        isPanelOpen,
        openPanel: () => setIsPanelOpen(true),
        closePanel: () => setIsPanelOpen(false),
        activeChat,
        openChat: (coach) => {
          setActiveChat(coach);
          setIsPanelOpen(false);
        },
        closeChat: () => setActiveChat(null),
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
