import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAttribution, trackEvent } from "@/lib/analytics";

/** Logs anonymous page views (consent required) and captures landing campaign info. */
export function PageViewTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    getAttribution();
    const onConsent = () => trackEvent("page_view");
    window.addEventListener("keudapro-consent-accepted", onConsent);
    return () => window.removeEventListener("keudapro-consent-accepted", onConsent);
  }, []);
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    trackEvent("page_view");
  }, [pathname]);
  return null;
}
