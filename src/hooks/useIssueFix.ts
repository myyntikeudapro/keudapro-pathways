import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FIX_FIELDS } from '@/lib/salesCard';

/** Navigation only: reveals and focuses the field named by ?korjaa=. Never clicks or saves anything. */
export function useIssueFix(ready: boolean) {
  const [params] = useSearchParams();
  const field = params.get('korjaa');
  const tab = params.get('kortti');
  const [missing, setMissing] = useState<string | null>(null);
  useEffect(() => {
    setMissing(null);
    if (!field || !ready || !(FIX_FIELDS as readonly string[]).includes(field)) return;
    let done = false;
    const focus = () => {
      const el = document.getElementById(field);
      if (!el || done) return;
      done = true;
      for (let d = el.closest('details'); d; d = d.parentElement?.closest('details') ?? null) d.setAttribute('open', '');
      if (el.tabIndex < 0 && !['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) el.tabIndex = -1;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      el.focus({ preventScroll: true });
    };
    const observer = new MutationObserver(focus);
    observer.observe(document.body, { childList: true, subtree: true });
    const first = window.setTimeout(focus, 50);
    const giveUp = window.setTimeout(() => { if (!done) setMissing(field); observer.disconnect(); }, 5000);
    return () => { done = true; observer.disconnect(); window.clearTimeout(first); window.clearTimeout(giveUp); };
  }, [field, tab, ready]);
  return { field, missing };
}
