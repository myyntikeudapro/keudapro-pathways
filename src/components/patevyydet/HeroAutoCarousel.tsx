import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  title: string;
  subtitle: string;
  intervalMs?: number;
};

export function HeroAutoCarousel({ images, title, subtitle, intervalMs = 5000 }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  return (
    <section className="relative w-full h-[200px] md:h-[320px] overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          aria-hidden="true"
          loading={i === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 h-full keuda-container flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{title}</h1>
        <p className="text-base md:text-lg text-white/90 max-w-2xl">{subtitle}</p>
      </div>
    </section>
  );
}
