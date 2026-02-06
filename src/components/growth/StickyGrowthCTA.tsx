import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StickyGrowthCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-3 transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="keuda-container flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground hidden sm:block">
          Haluatko aloittaa kasvukartoituksen?
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button size="sm" className="flex-1 sm:flex-none" asChild>
            <a href="/kasvukartoitus">Varaa kartoitus</a>
          </Button>
          <Button size="sm" variant="outline" className="flex-1 sm:flex-none" asChild>
            <a href="/yhteystiedot">Ota yhteyttä</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
