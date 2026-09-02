import { useEffect, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBookingRequest } from "@/contexts/BookingRequestContext";
import { Button } from "@/components/ui/button";

type FormatId = "15" | "30" | "60" | "vapaa";

const FORMATS: { id: FormatId; label: string; hint: string; template: (topic?: string) => string }[] = [
  {
    id: "15",
    label: "15 min pikapalaveri (etä)",
    hint: "Nopea suunnan tarkistus",
    template: (topic) =>
      `Hei,\n\nhaluaisin sopia 15 minuutin etäpalaverin${topic ? ` aiheesta: ${topic}` : ""}.\n\nMinulle sopivia aikoja ovat esimerkiksi arkisin klo 9–16. Ehdotathan sopivaa aikaa.\n\nKiitos!`,
  },
  {
    id: "30",
    label: "30 min tapaaminen (etä tai läsnä)",
    hint: "Tilanteen kartoitus",
    template: (topic) =>
      `Hei,\n\nhaluaisin sopia 30 minuutin tapaamisen${topic ? ` aiheesta: ${topic}` : ""}. Tapaaminen käy minulle etänä tai kasvokkain.\n\nKerro sopivat ajankohdat, niin sovitaan aika.\n\nKiitos!`,
  },
  {
    id: "60",
    label: "60 min perusteellinen keskustelu",
    hint: "Kokonaisuuden läpikäynti ja suunnitelma",
    template: (topic) =>
      `Hei,\n\nhaluaisin varata 60 minuutin keskustelun${topic ? ` aiheesta: ${topic}` : ""}. Tavoitteena on käydä tilanne läpi kokonaisuutena ja sopia seuraavista askeleista.\n\nEhdotathan muutamaa sopivaa ajankohtaa.\n\nKiitos!`,
  },
  {
    id: "vapaa",
    label: "Kirjoitan itse",
    hint: "Vapaamuotoinen viesti",
    template: (topic) => (topic ? `Hei,\n\nasiani koskee aihetta: ${topic}.\n\n` : "Hei,\n\n"),
  },
];

const schema = z.object({
  name: z.string().trim().min(2, "Anna nimesi").max(100),
  email: z.string().trim().email("Tarkista sähköpostiosoite").max(255),
  phone: z.string().trim().max(40).optional(),
  organization: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, "Kirjoita viesti").max(3000),
});

export function BookingRequestDialog() {
  const { isOpen, options, closeBookingRequest } = useBookingRequest();

  const [format, setFormat] = useState<FormatId>("30");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const def = FORMATS.find((f) => f.id === "30")!;
    setFormat("30");
    setMessage(def.template(options.topic));
    setSent(false);
    setSending(false);
  }, [isOpen, options.topic]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBookingRequest();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeBookingRequest]);

  const selectFormat = (id: FormatId) => {
    setFormat(id);
    const f = FORMATS.find((x) => x.id === id)!;
    setMessage(f.template(options.topic));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, phone, organization, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Tarkista tiedot");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-booking-request", {
        body: {
          ...parsed.data,
          meetingFormat: FORMATS.find((f) => f.id === format)!.label,
          source: options.source ?? "Varaa aika",
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      setSent(true);
    } catch (err) {
      console.error("Booking request failed:", err);
      toast.error("Viestin lähetys epäonnistui. Yritä uudelleen tai lähetä sähköpostia.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
          onClick={closeBookingRequest}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "fixed top-0 right-0 z-[71] h-full w-full sm:w-[480px] bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-request-heading"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 id="booking-request-heading" className="text-lg font-bold text-foreground">
              Varaa aika
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Valitse valmis viesti, muokkaa halutessasi ja lähetä – vahvistamme ajan sähköpostitse.
            </p>
          </div>
          <button
            onClick={closeBookingRequest}
            className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Sulje"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-6 h-6" />
                <p className="font-semibold">Kiitos! Viestisi on lähetetty.</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Otamme sinuun yhteyttä 1–2 arkipäivän kuluessa ja vahvistamme tapaamisajan.
              </p>
              <Button variant="outline" onClick={closeBookingRequest} className="w-full">
                Sulje
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-foreground mb-2">
                  Valitse valmis viesti
                </legend>
                {FORMATS.map((f) => {
                  const selected = format === f.id;
                  return (
                    <button
                      type="button"
                      key={f.id}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => selectFormat(f.id)}
                      className={cn(
                        "w-full text-left rounded-xl border-2 p-3 transition-all",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">{f.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{f.hint}</span>
                    </button>
                  );
                })}
              </fieldset>

              <div className="space-y-2">
                <label htmlFor="br-message" className="text-sm font-bold text-foreground block">
                  Viesti
                </label>
                <textarea
                  id="br-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="br-name" className="text-sm font-medium text-foreground block">
                    Nimi *
                  </label>
                  <input
                    id="br-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="br-email" className="text-sm font-medium text-foreground block">
                    Sähköposti *
                  </label>
                  <input
                    id="br-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="br-phone" className="text-sm font-medium text-foreground block">
                    Puhelin
                  </label>
                  <input
                    id="br-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="br-org" className="text-sm font-medium text-foreground block">
                    Organisaatio
                  </label>
                  <input
                    id="br-org"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                disabled={sending}
                className="w-full keuda-cta-wrap"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lähetetään…
                  </>
                ) : (
                  "Lähetä viesti"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
