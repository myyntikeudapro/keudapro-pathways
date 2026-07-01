import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "keudapro-cookie-consent";
export const OPEN_COOKIE_CONSENT_EVENT = "keudapro:open-cookie-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
      else setMarketing(stored === "accepted");
    } catch {
      setVisible(true);
    }

    const openHandler = () => {
      setShowSettings(false);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, openHandler);
    return () => window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, openHandler);
  }, []);

  const applyConsent = (accepted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
    } catch {}
    if (typeof window.fbq === "function") {
      if (accepted) {
        window.fbq("consent", "grant");
        window.fbq("track", "PageView");
      } else {
        window.fbq("consent", "revoke");
      }
    }
    setVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => applyConsent(true);
  const rejectMarketing = () => applyConsent(false);
  const saveSettings = () => applyConsent(marketing);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Evästeasetukset"
      className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:p-5"
    >
      <div className="relative mx-auto max-w-4xl bg-background border border-border shadow-2xl rounded-xl p-4 md:p-5 flex flex-col gap-4">
        <button
          type="button"
          onClick={rejectMarketing}
          aria-label="Sulje ja hylkää markkinointievästeet"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 text-sm text-foreground leading-relaxed pr-8">
          <p className="font-semibold mb-1">Käytämme evästeitä</p>
          <p className="text-muted-foreground">
            Käytämme välttämättömiä evästeitä sivuston toimintaan ja markkinointievästeitä
            mainonnan kohdentamiseen ja tulosten mittaamiseen. Voit hyväksyä tai hylätä
            markkinointievästeet ja muuttaa valintaasi milloin tahansa. Lue lisää{" "}
            <a
              href="https://www.keuda.fi/tietosuojaseloste/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:text-primary/80"
            >
              tietosuojaselosteesta
            </a>
            .
          </p>
        </div>

        {showSettings && (
          <div className="border border-border rounded-lg p-3 md:p-4 bg-muted/30 text-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium">Välttämättömät evästeet</p>
                <p className="text-muted-foreground text-xs">
                  Tarvitaan sivuston toimintaan. Aina käytössä.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">Aina päällä</span>
            </div>
            <label className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-medium">Markkinointievästeet</p>
                <p className="text-muted-foreground text-xs">
                  Mm. Meta Pixel. Käytetään mainonnan kohdentamiseen ja tulosten mittaamiseen.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
                aria-label="Markkinointievästeet"
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="default" size="sm" onClick={acceptAll}>
            Hyväksy kaikki
          </Button>
          <Button variant="default" size="sm" onClick={rejectMarketing}>
            Hylkää markkinointievästeet
          </Button>
          {showSettings ? (
            <Button variant="default" size="sm" onClick={saveSettings}>
              Tallenna asetukset
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => setShowSettings(true)}>
              Asetukset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function openCookieConsent() {
  window.dispatchEvent(new Event(OPEN_COOKIE_CONSENT_EVENT));
}
