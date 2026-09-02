import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface BookingRequestOptions {
  /** Mistä painikkeesta pyyntö avattiin – näkyy sähköpostissa. */
  source?: string;
  /** Valmis aihe, joka lisätään viestin alkuun. */
  topic?: string;
}

interface BookingRequestContextType {
  isOpen: boolean;
  options: BookingRequestOptions;
  openBookingRequest: (options?: BookingRequestOptions) => void;
  closeBookingRequest: () => void;
}

const Ctx = createContext<BookingRequestContextType | undefined>(undefined);

export function BookingRequestProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<BookingRequestOptions>({});

  const openBookingRequest = useCallback((opts: BookingRequestOptions = {}) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeBookingRequest = useCallback(() => setIsOpen(false), []);

  return (
    <Ctx.Provider value={{ isOpen, options, openBookingRequest, closeBookingRequest }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBookingRequest() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useBookingRequest must be used within BookingRequestProvider");
  return ctx;
}
