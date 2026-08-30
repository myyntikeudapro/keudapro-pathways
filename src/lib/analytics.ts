type Fbq = (...args: unknown[]) => void;

/**
 * Lightweight event tracking. Uses the existing Meta Pixel if it is loaded
 * (and consent has been granted); otherwise it is a no-op.
 * No new third-party analytics services are added.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function") {
      fbq("trackCustom", name, params ?? {});
    }
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event: name, ...(params ?? {}) });
    }
  } catch {
    /* tracking must never break the UI */
  }
}
