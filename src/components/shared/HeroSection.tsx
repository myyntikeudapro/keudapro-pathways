import { Button } from "@/components/ui/button";
import { useWizard } from "@/contexts/WizardContext";

interface HeroSectionProps {
  title: string;
  tagline?: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  variant?: "home" | "page";
}

export function HeroSection({
  title,
  tagline,
  description,
  ctaText = "Tee 15 min reittikartoitus",
  onCtaClick,
  variant = "page",
}: HeroSectionProps) {
  const { openWizard } = useWizard();
  return (
    <section className={`${variant === "home" ? "pt-20 pb-10 md:pt-28 md:pb-14" : "py-16 md:py-20"} bg-gradient-to-b from-accent/50 to-background`}>
      <div className="keuda-container">
        <div className="max-w-3xl mx-auto text-center">
          {tagline && (
            <p className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
              {tagline}
            </p>
          )}
          <h1 className={`${variant === "home" ? "text-4xl md:text-5xl lg:text-6xl" : "text-3xl md:text-4xl lg:text-5xl"} font-bold text-foreground mb-6`}>
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {description}
            </p>
          )}
          <Button variant="cta" size="lg" onClick={onCtaClick || openWizard}>
            {ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
