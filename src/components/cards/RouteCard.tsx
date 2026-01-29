import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface RouteCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  href: string;
  buttonText?: string;
}

export function RouteCard({
  title,
  subtitle,
  icon: Icon,
  href,
  buttonText = "Siirry reitille",
}: RouteCardProps) {
  return (
    <div className="keuda-card flex flex-col h-full">
      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent mb-6">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-1">{subtitle}</p>
      <Button variant="outline-primary" asChild className="w-full">
        <Link to={href}>{buttonText}</Link>
      </Button>
    </div>
  );
}
