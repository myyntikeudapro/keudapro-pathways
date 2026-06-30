import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import keudaproLogo from "@/assets/keudapro-logo.png";
import { useCoachPanel } from "@/contexts/CoachPanelContext";

type NavChild = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

const navItems: NavItem[] = [
  { label: "Reitit", href: "/" },
  {
    label: "Osaaminen",
    href: "/osaaminen",
    children: [
      { label: "Osaaminen", href: "/osaaminen" },
      { label: "Muutosturva", href: "/muutosturva" },
    ],
  },
  {
    label: "Operaattori",
    href: "/operaattori",
    children: [
      { label: "Operaattori", href: "/operaattori" },
      { label: "HUB-verkosto", href: "/verkosto" },
    ],
  },
  { label: "Ota yhteyttä", href: "/yhteystiedot" },
  { label: "HUB", href: "/hub" },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openPanel } = useCoachPanel();

  const isActive = (item: NavItem) =>
    location.pathname === item.href ||
    (item.children?.some((c) => location.pathname === c.href.split("#")[0]) ?? false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="keuda-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={keudaproLogo} alt="KeudaPRO" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.href} className="relative group">
                  <Link
                    to={item.href}
                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item)
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full pt-2 min-w-[240px]">
                    <div className="rounded-lg border border-border bg-background shadow-lg py-2">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          to={c.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : item.label === "HUB" ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-1 rounded-md text-sm font-bold tracking-wide leading-none transition-all ${
                    location.pathname === item.href
                      ? "bg-[#0B0B0B] text-[hsl(var(--keuda-orange))] ring-2 ring-[hsl(var(--keuda-orange))]/60"
                      : "bg-[#0B0B0B] text-[hsl(var(--keuda-orange))] hover:ring-2 hover:ring-[hsl(var(--keuda-orange))]/40"
                  }`}
                >
                  HUB
                </Link>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden md:block">
            <Button variant="cta" size="default" onClick={() => openPanel()}>
              Apua? Kysy AI-valmentajalta
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.href
                          ? item.label === "HUB"
                            ? "bg-[#0B0B0B] text-[hsl(var(--keuda-orange))] ring-2 ring-[hsl(var(--keuda-orange))]/60"
                            : "text-primary bg-accent"
                          : item.label === "HUB"
                            ? "bg-[#0B0B0B] text-[hsl(var(--keuda-orange))]"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-3 pl-3 border-l border-border my-1 space-y-1">
                        {item.children
                          .filter((c) => c.href !== item.href)
                          .map((c) => (
                            <Link
                              key={c.href}
                              to={c.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            >
                              {c.label}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="cta" className="w-full" onClick={() => { setMobileMenuOpen(false); openPanel(); }}>
                    Apua? Kysy AI-valmentajalta
                  </Button>
                </div>
              </nav>
            </div>
          )}
      </div>
    </header>
  );
}
