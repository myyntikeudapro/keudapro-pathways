import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const links = [
  { id: "tekoalypatevyydet", label: "Tekoälypätevyydet" },
  { id: "vertaa-tasoja", label: "Vertaa tasoja" },
  { id: "loyda-oma-tasosi", label: "Löydä oma tasosi" },
  { id: "organisaatioille", label: "Organisaatioille" },
  { id: "referenssit", label: "Asiakaspalaute" },
  { id: "alkavat-koulutukset", label: "Alkavat koulutukset" },
];

export function AlyAnchorNav() {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Seuraa vieritystilaa ja ylivuotoa
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const update = () => {
      setCanScroll(ul.scrollWidth > ul.clientWidth + 4);
      setAtStart(ul.scrollLeft <= 4);
      setAtEnd(ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 4);
    };
    update();
    ul.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      ul.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Hiirirullaus -> vaakavieritys
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    const onWheel = (e: WheelEvent) => {
      if (ul.scrollWidth <= ul.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      ul.scrollLeft += e.deltaY;
    };
    ul.addEventListener("wheel", onWheel, { passive: false });
    return () => ul.removeEventListener("wheel", onWheel);
  }, []);

  // Raahaus hiirellä
  useEffect(() => {
    const ul = listRef.current;
    if (!ul) return;
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startLeft = ul.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) {
        ul.scrollLeft = startLeft - dx;
        ul.style.cursor = "grabbing";
      }
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      ul.style.cursor = "";
      // Estä klikkaus raahauksen jälkeen
      if (moved > 6) {
        const suppress = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        ul.addEventListener("click", suppress, { capture: true, once: true });
      }
    };
    ul.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      ul.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const ul = listRef.current;
    if (!ul) return;
    ul.scrollBy({ left: dir * Math.min(320, ul.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Sivun osiot"
      className="border-b border-border bg-background/95 backdrop-blur sticky top-16 z-30 shadow-sm"
    >
      <div className="keuda-container relative flex items-center">
        {canScroll && (
          <button
            type="button"
            aria-label="Vieritä vasemmalle"
            onClick={() => nudge(-1)}
            disabled={atStart}
            className="hidden md:inline-flex shrink-0 items-center justify-center h-9 w-9 mr-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <ul
          ref={listRef}
          className="flex gap-2 overflow-x-auto py-3 text-sm snap-x snap-mandatory scroll-smooth select-none cursor-grab [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {links.map((l) => (
            <li key={l.id} className="snap-start shrink-0">
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(l.id);
                  if (!el) return;
                  const y = el.getBoundingClientRect().top + window.scrollY - 110;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  window.history.replaceState(null, "", `#${l.id}`);
                }}
                className="inline-flex items-center min-h-11 whitespace-nowrap rounded-full border border-border px-4 py-1.5 font-medium text-foreground hover:border-primary hover:text-primary active:bg-accent transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        {canScroll && (
          <button
            type="button"
            aria-label="Vieritä oikealle"
            onClick={() => nudge(1)}
            disabled={atEnd}
            className="hidden md:inline-flex shrink-0 items-center justify-center h-9 w-9 ml-1 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {/* Vihje vieritettävyydestä mobiilissa */}
        {canScroll && !atEnd && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent md:hidden"
          />
        )}
      </div>
    </nav>
  );
}
