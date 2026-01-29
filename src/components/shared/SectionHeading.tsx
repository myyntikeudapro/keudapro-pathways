interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, centered = false }: SectionHeadingProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
