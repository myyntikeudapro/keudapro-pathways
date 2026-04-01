/**
 * Animated background for the "Näin kehitys tapahtuu" section.
 * Renders rotating gear-like rings and drifting shapes to convey
 * continuous development / cycle motion.
 */
export function DevLogicAnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large gear ring – top-right */}
      <div className="absolute -top-28 -right-28 w-[340px] h-[340px] rounded-full border-[3px] border-dashed border-primary/15 animate-spin-slow" />

      {/* Medium gear ring – bottom-left */}
      <div className="absolute -bottom-20 -left-20 w-[260px] h-[260px] rounded-full border-[3px] border-dashed border-secondary/15 animate-spin-reverse" />

      {/* Small solid ring – center-left */}
      <div className="absolute top-1/2 left-[8%] w-[120px] h-[120px] rounded-full border-2 border-primary/10 animate-spin-slow-2" />

      {/* Pulsing accent circle */}
      <div className="absolute top-[15%] right-[15%] w-20 h-20 rounded-full bg-secondary/5 animate-pulse-ring" />

      {/* Drifting dots */}
      <div className="absolute bottom-[20%] right-[30%] w-3 h-3 rounded-full bg-primary/10 animate-drift" />
      <div className="absolute top-[30%] left-[25%] w-2 h-2 rounded-full bg-secondary/10 animate-drift" style={{ animationDelay: "2s" }} />

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03]" />
    </div>
  );
}
