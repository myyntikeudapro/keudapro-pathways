import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Navigation only: reveal/focus an existing task, never invoke its submit control. */
export function useFlowTaskFocus() {
  const [params] = useSearchParams();
  const task = params.get('tehtava');
  const offer = params.get('tarjous');
  const handoff = params.get('luovutus');
  const lead = params.get('asiakas');
  useEffect(() => {
    const key = task === 'receive-review' ? `receive-review-${handoff}` : handoff ? `handoff-${handoff}` : task === 'offers' && offer ? `offer-${offer}` : task;
    if (!key || !/^[a-zA-Z0-9-]+$/.test(key)) return;
    let done = false;
    const focus = () => {
      const el = document.querySelector<HTMLElement>(`[data-flow-task="${key}"]`);
      if (!el || done) return;
      done = true;
      el.closest('details')?.setAttribute('open', '');
      el.tabIndex = -1;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      el.focus({ preventScroll: true });
    };
    const observer = new MutationObserver(focus);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(focus, 150);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [task, offer, handoff, lead]);
}