import { Button } from "@/components/ui/button";

interface CTASectionProps {
  title?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTASection({
  title,
  buttonText = "Tee 15 min reittikartoitus",
  buttonHref = "https://example.com/kartoitus",
}: CTASectionProps) {
  return (
    <section className="py-16 md:py-20 bg-accent/50">
      <div className="keuda-container text-center">
        {title && (
          <p className="text-lg text-muted-foreground mb-6">{title}</p>
        )}
        <Button variant="cta" size="lg" asChild>
          <a href={buttonHref} target="_blank" rel="noopener noreferrer">
            {buttonText}
          </a>
        </Button>
      </div>
    </section>
  );
}
