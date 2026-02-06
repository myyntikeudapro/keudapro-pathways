import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import keudaproLogo from "@/assets/keudapro-logo.jpg";

const navItems = [
  { label: "Reitit", href: "/" },
  { label: "Operaattori", href: "/operaattori" },
  { label: "Toimijaverkosto", href: "/kumppanit" },
  { label: "Ota yhteyttä", href: "/yhteystiedot" },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="keuda-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={keudaproLogo} alt="KeudaPRO" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
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
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="cta" size="default" asChild>
              <a
                href="https://example.com/kartoitus"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tee 15 min reittikartoitus
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
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
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2">
                <Button variant="cta" className="w-full" asChild>
                  <a
                    href="https://example.com/kartoitus"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tee 15 min reittikartoitus
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
