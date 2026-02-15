import kuumaLogo from "@/assets/logo-kuuma.svg";
import { Instagram, Linkedin, Youtube, Facebook } from "lucide-react";

// TikTok icon as custom SVG since it's not in Lucide
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    width="20" 
    height="20"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/keudapro/", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/search/results/all/?keywords=keudapro&origin=RICH_QUERY_SUGGESTION&heroEntityKey=urn%3Ali%3Aorganization%3A86385419&position=0", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/@KeudaPRO", label: "YouTube" },
  { icon: "tiktok", href: "https://www.tiktok.com/search?q=keudapro&t=1770211535723", label: "TikTok" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61571861071287", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#333]">
      {/* KUUMA-seutu Section */}
      <div className="bg-[#0B0B0B] py-6">
        <div className="keuda-container">
          <a 
            href="https://www.kuuma.fi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={kuumaLogo} 
              alt="KUUMA-seutu" 
              className="h-12 md:h-14 invert brightness-0 invert"
            />
            <p className="text-xs text-gray-400 text-center">
              Hyvinkää, Järvenpää, Kerava, Kirkkonummi, Mäntsälä, Nurmijärvi, Pornainen, Sipoo, Tuusula ja Vihti
            </p>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#444]" />

      {/* Social Media Section */}
      <div className="bg-[#0B0B0B] py-5">
        <div className="keuda-container">
          <div className="flex items-center justify-center gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[hsl(var(--cta))] transition-colors"
                aria-label={social.label}
              >
                {social.icon === "tiktok" ? (
                  <TikTokIcon className="w-5 h-5" />
                ) : (
                  <social.icon className="w-5 h-5" />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#444]" />

      {/* Main Footer */}
      <div className="bg-[#0B0B0B] py-6">
        <div className="keuda-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white">
              <span className="font-bold">KeudaPRO</span> – osaamisen ja siirtymien operaattori.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} KeudaPRO. Kaikki oikeudet pidätetään.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}