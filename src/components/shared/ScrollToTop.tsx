import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Varmistaa, että reitin vaihtuessa sivu avautuu ylhäältä.
 * Hash-linkit (esim. /aly#tekoalypatevyydet) jätetään rauhaan.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
