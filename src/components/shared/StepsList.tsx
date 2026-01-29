interface StepsListProps {
  steps: string[];
}

export function StepsList({ steps }: StepsListProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">{index + 1}</span>
          </div>
          <p className="text-foreground font-medium pt-2">{step}</p>
        </div>
      ))}
    </div>
  );
}
