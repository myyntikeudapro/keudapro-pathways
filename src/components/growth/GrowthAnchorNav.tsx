import { cn } from "@/lib/utils";

const anchors = [
  { label: "Kasvuvaiheesi", href: "#kasvureitit" },
  { label: "Kasvupolut", href: "#kasvupolut" },
  { label: "Toimialakartta", href: "#toimialakartta" },
  { label: "Paketit ja hinnat", href: "#paketit" },
  { label: "FAQ", href: "#faq" },
  { label: "Aloita", href: "#aloita" },
];

export function GrowthAnchorNav() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="sticky top-[64px] z-40 bg-foreground/95 backdrop-blur-sm border-b border-primary/10">
      <div className="keuda-container">
        <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide">
          {anchors.map((a) => (
            <a
              key={a.href}
              href={a.href}
              onClick={(e) => handleClick(e, a.href)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                "bg-transparent text-background/80 border-primary/30",
                "hover:bg-primary hover:text-primary-foreground hover:border-primary"
              )}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
