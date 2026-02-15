import { Button } from "@/components/ui/button";
import { useWizard } from "@/contexts/WizardContext";

interface CTASectionProps {
  title?: string;
  buttonText?: string;
  onClick?: () => void;
}

export function CTASection({
  title,
  buttonText = "Tee 15 min reittikartoitus",
  onClick,
}: CTASectionProps) {
  const { openWizard } = useWizard();
  return (
    <section className="py-16 md:py-20 bg-accent/50">
      <div className="keuda-container text-center">
        {title && (
          <p className="text-lg text-muted-foreground mb-6">{title}</p>
        )}
        <Button variant="cta" size="lg" onClick={onClick || openWizard}>
          {buttonText}
        </Button>
      </div>
    </section>
  );
}
