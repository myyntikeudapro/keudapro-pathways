import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const projectUrls: Record<string, string> = {
  "ai-transform": "#",
  "ai-manager": "#",
  "ai-director": "#",
  "arpro-3-raahe": "https://lovable.dev/projects/5cdbafbb-0b40-4382-9a1c-4dbac2202c36",
};

interface HubLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  projectName: string;
  onContactClick: () => void;
}

export function HubLoginModal({ open, onOpenChange, projectId, projectName, onContactClick }: HubLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = projectId ? projectUrls[projectId] : "#";
    if (url && url !== "#") {
      window.location.href = url;
      return;
    }
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{projectName || "Kirjaudu sisään"}</DialogTitle>
          <DialogDescription>Syötä organisaatiosi tunnukset päästäksesi projektiisi.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="hub-email">Sähköposti</Label>
            <Input id="hub-email" type="email" placeholder="nimi@organisaatio.fi" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hub-password">Salasana</Label>
            <Input id="hub-password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onContactClick();
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Ei tunnuksia? Ota yhteyttä →
          </button>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Peruuta
            </Button>
            <Button type="submit" variant="cta" disabled={loading}>
              {loading ? "Yhdistetään..." : "Kirjaudu →"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
