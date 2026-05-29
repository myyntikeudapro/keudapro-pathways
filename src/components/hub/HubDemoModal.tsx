import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface HubDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HubDemoModal({ open, onOpenChange }: HubDemoModalProps) {
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ name: "", organization: "", email: "", phone: "", interest: "", message: "" });
      setSent(false);
    }
  }, [open]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`KeudaPRO HUB – Demo-pyyntö: ${form.interest || "yleinen"}`);
    const body = encodeURIComponent(
      `Nimi: ${form.name}\nOrganisaatio: ${form.organization}\nSähköposti: ${form.email}\nPuhelin: ${form.phone}\nKiinnostuksen kohde: ${form.interest}\n\nViesti:\n${form.message}`
    );
    window.location.href = `mailto:heikki.kallunki@keuda.fi?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Varaa demo</DialogTitle>
          <DialogDescription>
            Jätä yhteystietosi ja kerro lyhyesti mikä kehitysprojekti tai oma ajatus kiinnostaa — palaamme asiaan pian.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">Kiitos yhteydenotosta!</p>
            <p className="text-sm text-muted-foreground">Sähköpostiohjelmasi avautui — viimeistele lähetys ja olemme yhteydessä.</p>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Sulje</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="demo-name">Nimi *</Label>
                <Input id="demo-name" required value={form.name} onChange={update("name")} maxLength={100} autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-org">Organisaatio *</Label>
                <Input id="demo-org" required value={form.organization} onChange={update("organization")} maxLength={120} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="demo-email">Sähköposti *</Label>
                <Input id="demo-email" type="email" required value={form.email} onChange={update("email")} maxLength={160} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="demo-phone">Puhelin</Label>
                <Input id="demo-phone" type="tel" value={form.phone} onChange={update("phone")} maxLength={40} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-interest">Kiinnostuksen kohde</Label>
              <Input
                id="demo-interest"
                placeholder="esim. AI-transformaationäkymä, ARPRO 2.0, oma idea…"
                value={form.interest}
                onChange={update("interest")}
                maxLength={160}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-message">Lyhyt kuvaus *</Label>
              <Textarea
                id="demo-message"
                required
                rows={4}
                placeholder="Kerro lyhyesti mikä kehitysprojekti tai oma ajatus kiinnostaa."
                value={form.message}
                onChange={update("message")}
                maxLength={1000}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Peruuta
              </Button>
              <Button type="submit" variant="cta" className="bg-keuda-orange text-[#0B0B0B] hover:bg-keuda-orange/90">
                Lähetä pyyntö →
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
