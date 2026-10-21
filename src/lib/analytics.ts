import { supabase } from "@/integrations/supabase/client";

type Fbq = (...args: unknown[]) => void;

export type Attribution = {
  session_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer_host: string | null;
};

const ATTR_KEY = "keudapro-attr";

const hasConsent = () => {
  try {
    return localStorage.getItem("keudapro-cookie-consent") === "accepted";
  } catch {
    return false;
  }
};

/** Maps a referrer host to a readable channel name when no utm_source is given. */
export function channelFromReferrer(host: string | null): string | null {
  if (!host) return null;
  if (/facebook|fb\.|messenger/.test(host)) return "facebook";
  if (/instagram/.test(host)) return "instagram";
  if (/linkedin|lnkd/.test(host)) return "linkedin";
  if (/google\./.test(host)) return "google";
  if (/bing\.|duckduckgo|yahoo/.test(host)) return "haku-muu";
  if (/tiktok/.test(host)) return "tiktok";
  if (/youtube/.test(host)) return "youtube";
  if (/keudapro\.fi|lovable/.test(host)) return null;
  return host;
}

/**
 * First-touch attribution for the current browser session only (sessionStorage).
 * Contains no personal data: a random session id plus campaign/referrer info.
 */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(ATTR_KEY);
    if (saved) return JSON.parse(saved) as Attribution;
    const q = new URLSearchParams(window.location.search);
    let refHost: string | null = null;
    try {
      refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : null;
    } catch {
      refHost = null;
    }
    const fromRef = channelFromReferrer(refHost);
    const attr: Attribution = {
      session_id: crypto.randomUUID(),
      utm_source: q.get("utm_source")?.slice(0, 100) || (q.get("fbclid") ? "facebook" : q.get("gclid") ? "google" : fromRef),
      utm_medium: q.get("utm_medium")?.slice(0, 100) || (q.get("gclid") ? "cpc" : q.get("fbclid") ? "social" : fromRef ? "referral" : null),
      utm_campaign: q.get("utm_campaign")?.slice(0, 150) || null,
      referrer_host: refHost && !/keudapro\.fi/.test(refHost) ? refHost.slice(0, 200) : null,
    };
    sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
    return attr;
  } catch {
    return null;
  }
}

/** Attribution fields for lead submissions — only when tracking consent is given. */
export function leadAttribution(): Partial<Attribution> {
  if (!hasConsent()) return {};
  const a = getAttribution();
  return a ? { session_id: a.session_id, utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign } : {};
}

const device = () => (window.innerWidth < 768 ? "mobiili" : window.innerWidth < 1100 ? "tabletti" : "tietokone");

/**
 * Event tracking. No-op without cookie consent. Never send personal data in params.
 * Sends to KeudaPRO's own marketing log, plus Meta Pixel / dataLayer when loaded.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    if (!hasConsent()) return;
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function" && name !== "page_view") {
      fbq("trackCustom", name, params ?? {});
    }
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event: name, ...(params ?? {}) });
    }
    const a = getAttribution();
    if (!a) return;
    void supabase
      .from("marketing_events")
      .insert({
        session_id: a.session_id,
        event: name.slice(0, 64),
        path: window.location.pathname.slice(0, 300),
        utm_source: a.utm_source,
        utm_medium: a.utm_medium,
        utm_campaign: a.utm_campaign,
        referrer_host: a.referrer_host,
        device: device(),
        props: (params ?? {}) as never,
      })
      .then(() => undefined);
  } catch {
    /* tracking must never break the UI */
  }
}
