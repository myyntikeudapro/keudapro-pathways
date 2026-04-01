import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RouteCardProps {
  title: string;
  subtitle: string;
  clarification?: string;
  image: string;
  href: string;
  buttonText?: string;
}

export function RouteCard({
  title,
  subtitle,
  image,
  href,
  buttonText = "Siirry reitille",
}: RouteCardProps) {
  return (
    <div className="keuda-card-enhanced flex flex-col h-full overflow-hidden">
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-6 flex-1">{subtitle}</p>
      <Button variant="outline-primary" asChild className="w-full">
        <Link to={href}>{buttonText}</Link>
      </Button>
    </div>
  );
}
