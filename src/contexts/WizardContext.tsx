import { createContext, useContext, useState, ReactNode } from "react";

interface WizardContextType {
  isOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WizardContext.Provider
      value={{
        isOpen,
        openWizard: () => setIsOpen(true),
        closeWizard: () => setIsOpen(false),
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
