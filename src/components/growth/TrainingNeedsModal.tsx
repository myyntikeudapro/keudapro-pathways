import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrainingNeedsModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    toast({ title: "Kiitos! Palaamme asiaan." });
    e.currentTarget.reset();
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Kysy koulutuksista</DialogTitle>
          <DialogDescription>
            Kerro tarpeesi — räätälöimme koulutuksen, valmennuksen, kortin tai muun toteutuksen sopivaan ajankohtaan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="tn-course">Koulutus, valmennus tai kortti</Label>
            <Input
              id="tn-course"
              placeholder="Esim. Hätäensiapu 8 t, työhyvinvointivalmennus, tulityökortti…"
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tn-count">Osallistujamäärä</Label>
              <Input id="tn-count" type="number" min={1} required />
            </div>
            <div>
              <Label htmlFor="tn-when">Toivottu ajankohta</Label>
              <Input id="tn-when" required />
            </div>
          </div>
          <div>
            <Label htmlFor="tn-email">Sähköposti</Label>
            <Input id="tn-email" type="email" required />
          </div>
          <Button type="submit" variant="cta" className="w-full" disabled={submitting}>
            Lähetä toive
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
