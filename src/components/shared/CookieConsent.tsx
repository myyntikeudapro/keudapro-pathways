import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "keudapro-cookie-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {}
    if (typeof window.fbq === "function") {
      window.fbq("consent", "grant");
      window.fbq("track", "PageView");
    }
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {}
    if (typeof window.fbq === "function") {
      window.fbq("consent", "revoke");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Evästeasetukset"
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:p-5"
    >
      <div className="mx-auto max-w-4xl bg-background border border-border shadow-2xl rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 text-sm text-foreground leading-relaxed">
          <p className="font-semibold mb-1">Käytämme evästeitä</p>
          <p className="text-muted-foreground">
            Käytämme välttämättömiä evästeitä sivuston toimintaan ja markkinointi­evästeitä
            (mm. Meta Pixel) mainonnan kohdentamiseen ja tulosten mittaamiseen. Voit hyväksyä
            tai hylätä markkinointievästeet.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Vain välttämättömät
          </Button>
          <Button variant="default" size="sm" onClick={accept}>
            Hyväksy kaikki
          </Button>
        </div>
        <button
          type="button"
          onClick={decline}
          aria-label="Sulje ja hylkää markkinointievästeet"
          className="absolute top-2 right-2 md:hidden text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
