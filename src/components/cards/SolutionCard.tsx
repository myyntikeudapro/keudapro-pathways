import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SolutionCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  buttonText?: string;
  buttonHref?: string;
  variant?: "default" | "compact";
}

export function SolutionCard({
  title,
  description,
  icon: Icon,
  buttonText = "Lue lisää",
  buttonHref = "#",
  variant = "default",
}: SolutionCardProps) {
  return (
    <div className={`keuda-card flex flex-col h-full ${variant === "compact" ? "p-5" : ""}`}>
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}
      <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
      <Button variant="ghost" className="justify-start p-0 h-auto text-primary hover:text-primary/80" asChild>
        <a href={buttonHref} target="_blank" rel="noopener noreferrer">
          {buttonText}
        </a>
      </Button>
    </div>
  );
}
