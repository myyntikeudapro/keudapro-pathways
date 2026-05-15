import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCoachPanel, CoachType } from "@/contexts/CoachPanelContext";
import { cn } from "@/lib/utils";

const COACH_LABELS: Record<CoachType, string> = {
  ana: "Ana",
  veli: "Veli",
  reitti: "Reittivalmentaja",
};

type FormatId = "ai" | "short" | "deep";

const FORMATS: {
  id: FormatId;
  title: string;
  description: string;
  hint?: string;
  emailLabel: string;
}[] = [
  {
    id: "ai",
    title: "Pikakeskustelu AI-valmentajan kanssa",
    description:
      "Nopea suunnan tarkistus tai yksittäinen kysymys — 15 minuuttia, heti käytettävissä.",
    hint: "Ohjataan AI-valmentajalle",
    emailLabel: "Pikakeskustelu AI-valmentajan kanssa 15 min",
  },
  {
    id: "short",
    title: "Lyhyt tapaaminen",
    description:
      "Kartoitetaan tilannettasi ja löydetään oikea suunta — 30 minuuttia.",
    emailLabel: "Lyhyt tapaaminen 30 min",
  },
  {
    id: "deep",
    title: "Perusteellinen keskustelu",
    description:
      "Käydään läpi tarpeesi kokonaisvaltaisesti ja rakennetaan suunnitelma — 60 minuuttia.",
    emailLabel: "Perusteellinen keskustelu 60 min",
  },
];

export function BookingPanel() {
  const { bookingCoach, closeBooking, openChat } = useCoachPanel();
  const isOpen = bookingCoach !== null;
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [format, setFormat] = useState<FormatId | null>(null);
  const [need, setNeed] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormat(null);
      setNeed("");
      setName("");
      setEmail("");
      setOrganization("");
      setSubmitted(false);
      setErrors({});
      setTimeout(() => headingRef.current?.focus(), 100);
    }
  }, [isOpen, bookingCoach]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeBooking]);

  const isAi = format === "ai";
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isAi
    ? true
    : format !== null && need.trim().length >= 10 && name.trim().length > 0 && emailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAi) {
      if (bookingCoach) {
        const coach = bookingCoach;
        closeBooking();
        openChat(coach);
      }
      return;
    }
    const newErrors: Record<string, string> = {};
    if (!format) newErrors.format = "Valitse tapaamisen muoto";
    if (need.trim().length < 10) newErrors.need = "Kirjoita vähintään 10 merkkiä";
    if (name.trim().length === 0) newErrors.name = "Nimi on pakollinen";
    if (!emailValid) newErrors.email = "Anna kelvollinen sähköpostiosoite";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const fmt = FORMATS.find((f) => f.id === format)!;
    const coachLabel = bookingCoach ? COACH_LABELS[bookingCoach] : "";
    const subject = `Ajanvaraus — ${fmt.emailLabel} — ${name.trim()}`;
    const body = [
      `Valittu valmentaja: ${coachLabel}`,
      `Tapaamisen muoto: ${fmt.emailLabel}`,
      "",
      `Nimi: ${name.trim()}`,
      `Sähköposti: ${email.trim()}`,
      `Organisaatio: ${organization.trim() || "ei ilmoitettu"}`,
      "",
      "Tarve:",
      need.trim(),
    ].join("\n");

    const mailto = `mailto:keudapro@keuda.fi?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeBooking}
        />
      )}
      <div
        className={cn(
          "fixed top-0 right-0 z-[61] h-full w-full sm:w-[480px] bg-background shadow-2xl transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-panel-heading"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2
              id="booking-panel-heading"
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-bold text-foreground outline-none"
            >
              Varaa aika ihmiselle
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Valitse sopiva muoto ja kerro lyhyesti tarpeesi — valmentaja ottaa yhteyttä ja vahvistaa ajan.
            </p>
          </div>
          <button
            onClick={closeBooking}
            className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Sulje"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {submitted ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground">
                Kiitos — yhteydenottopyyntösi on lähetetty. Valmentaja ottaa sinuun yhteyttä 1–2 arkipäivän kuluessa vahvistaakseen ajan.
              </p>
              <p className="text-xs text-muted-foreground">
                Sähköposti lähetetty osoitteeseen keudapro@keuda.fi
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Format */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-bold text-foreground mb-2">
                  Mitä haluat käsitellä?
                </legend>
                <div className="space-y-2" role="radiogroup" aria-required="true">
                  {FORMATS.map((f) => {
                    const selected = format === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          "w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-sm",
                          selected
                            ? "border-teal-500 bg-teal-50/40"
                            : "border-border bg-background"
                        )}
                      >
                        <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {f.description}
                        </p>
                        {f.hint && (
                          <p className="text-xs font-medium text-teal-600 mt-2">{f.hint}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.format && (
                  <p className="text-xs text-destructive">{errors.format}</p>
                )}
              </fieldset>

              {!isAi && (
                <>
                  {/* Section 2: Need */}
                  <div className="space-y-2">
                    <label htmlFor="booking-need" className="text-sm font-bold text-foreground block">
                      Mitä haluat käsitellä? <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="booking-need"
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      aria-required="true"
                      aria-invalid={!!errors.need}
                      placeholder="Esim. Haen uutta suuntaa uralleni, tai: Tarvitsemme tiimikoulutuksen turvallisuudesta..."
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ei tarvitse olla täydellinen — lyhyt kuvaus riittää. Ei mitään salaista tai yksityistä tässä vaiheessa.
                    </p>
                    {errors.need && (
                      <p className="text-xs text-destructive">{errors.need}</p>
                    )}
                  </div>

                  {/* Section 3: Contact */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="booking-name" className="text-sm font-medium text-foreground block">
                          Nimi <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          placeholder="Etunimi Sukunimi"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.name && (
                          <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="booking-email" className="text-sm font-medium text-foreground block">
                          Sähköposti <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="booking-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          placeholder="etunimi@organisaatio.fi"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="booking-org" className="text-sm font-medium text-foreground block">
                        Organisaatio
                      </label>
                      <input
                        id="booking-org"
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Yritys tai organisaatio — tai jätä tyhjäksi"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-11 rounded-lg text-sm font-semibold transition-colors",
                  canSubmit
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isAi ? "Siirry AI-valmentajalle" : "Lähetä yhteydenottopyyntö"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
