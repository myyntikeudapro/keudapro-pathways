import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Send, CheckCircle } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "IT ja teknologia",
  "Kauppa ja palvelut",
  "Teollisuus ja valmistus",
  "Rakentaminen",
  "Sosiaali- ja terveysala",
  "Hallinto ja toimistotyö",
  "Logistiikka ja kuljetus",
  "Media ja viestintä",
  "Rahoitus ja vakuutus",
  "Koulutus ja tutkimus",
  "Julkishallinto",
];

const COMPANY_SIZE_OPTIONS = [
  "alle 10",
  "10–29",
  "30–99",
  "100–249",
  "250–999",
  "yli 1 000",
];

const AFFECTED_COUNT_OPTIONS = [
  "1–5",
  "6–10",
  "11–25",
  "26–50",
  "51–100",
  "yli 100",
];

const YT_STAGE_OPTIONS = [
  "Suunnitteilla / harkitsemme",
  "YT-neuvottelut käynnissä",
  "YT-neuvottelut päättyneet",
  "Irtisanomiset toteutettu",
];

const BUDGET_PER_PERSON_OPTIONS = [
  "Lakisääteinen muutosturvabudjetti (n. 1 kk bruttopalkka)",
  "Laajennettu muutosturva (yli 55-v., n. 2 kk bruttopalkka)",
  "Räätälöity / sovittava erikseen",
  "En tiedä — kaipaan apua arvioon",
];

const TIMING_OPTIONS = [
  "Heti",
  "1 kk sisällä",
  "2–3 kk sisällä",
  "Myöhemmin tänä vuonna",
];

const CONTENT_INTEREST_OPTIONS = [
  "Tekoälyn ammattiosaaja – Tekoälykoordinaattori",
  "Tekoälyn ammattiosaaja – Tekoälypäällikkö",
  "Tekoälyn ammattiosaaja – Tekoälyjohtaja",
  "Digitaidot (M365, Teams, tietoturva)",
  "Työnhakuvalmennus ja CV/LinkedIn",
  "Outplacement / uravalmennus",
  "Uudelleenkouluttautuminen uudelle alalle",
  "Laajennettu muutosturva yli 55-vuotiaille",
];

const ROLE_OPTIONS = [
  "HR / henkilöstöpäällikkö",
  "Toimitusjohtaja / johto",
  "Esihenkilö",
  "Talous / hallinto",
  "Muu",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployerMuutosturvaFormModal({ open, onOpenChange }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const [company, setCompany] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [affectedCount, setAffectedCount] = useState("");
  const [hasOver55, setHasOver55] = useState("");
  const [ytStage, setYtStage] = useState("");
  const [budgetPerPerson, setBudgetPerPerson] = useState("");
  const [timing, setTiming] = useState("");
  const [contentInterests, setContentInterests] = useState<string[]>([]);

  const [contactName, setContactName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [extra, setExtra] = useState("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const effectiveIndustry = industry === "Muu" ? customIndustry : industry;
  const effectiveRole = role === "Muu" ? customRole : role;

  const isValid =
    company.trim() !== "" &&
    effectiveIndustry.trim() !== "" &&
    companySize !== "" &&
    affectedCount !== "" &&
    ytStage !== "" &&
    timing !== "" &&
    contactName.trim() !== "" &&
    effectiveRole.trim() !== "" &&
    email.trim() !== "";

  const buildEmailBody = () => {
    const lines = [
      `— Yrityksen tiedot —`,
      `Yritys: ${company}`,
      `Y-tunnus: ${businessId || "–"}`,
      `Toimiala: ${effectiveIndustry}`,
      `Yrityksen koko: ${companySize}`,
      ``,
      `— Muutostilanne —`,
      `Irtisanottavien/koulutettavien määrä: ${affectedCount}`,
      `Mukana yli 55-vuotiaita: ${hasOver55 || "–"}`,
      `YT-vaihe: ${ytStage}`,
      `Koulutusbudjetti / henkilö: ${budgetPerPerson || "–"}`,
      `Koulutuksen toivottu aloitus: ${timing}`,
      ``,
      `— Kiinnostavat sisällöt —`,
      contentInterests.length > 0 ? contentInterests.map((c) => `• ${c}`).join("\n") : "–",
      ``,
      `— Yhteyshenkilö —`,
      `Nimi: ${contactName}`,
      `Rooli: ${effectiveRole}`,
      `Sähköposti: ${email}`,
      `Puhelin: ${phone || "–"}`,
      ``,
      `Lisätieto: ${extra || "–"}`,
    ];
    return lines.join("\n");
  };

  const handleSubmit = () => {
    const subject = encodeURIComponent(
      `Muutosturva – tarjouspyyntö (${company})`
    );
    const body = encodeURIComponent(buildEmailBody());
    window.location.href = `mailto:heikki.kallunki@keuda.fi?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSubmitted(false);
      setCompany("");
      setBusinessId("");
      setIndustry("");
      setCustomIndustry("");
      setCompanySize("");
      setAffectedCount("");
      setHasOver55("");
      setYtStage("");
      setBudgetPerPerson("");
      setTiming("");
      setContentInterests([]);
      setContactName("");
      setRole("");
      setCustomRole("");
      setEmail("");
      setPhone("");
      setExtra("");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-5 gap-3">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <CheckCircle className="w-12 h-12 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Kiitos tarjouspyynnöstä!</h3>
            <p className="text-sm text-muted-foreground">
              Otamme yhteyttä 1–2 arkipäivän kuluessa ja palaamme räätälöidyllä ehdotuksella.
            </p>
            <Button variant="cta" onClick={() => handleClose(false)}>
              Sulje
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-base leading-snug">
                Pyydä tarjous muutosturvasta
              </DialogTitle>
              <DialogDescription className="text-xs">
                Lomake on tarkoitettu työnantajan edustajalle (HR, johto, esihenkilö). Vastaamme yleensä saman päivän aikana.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-1">
              {/* Company */}
              <div className="space-y-1">
                <Label className="text-xs">Yrityksen nimi *</Label>
                <Input
                  className="h-8 text-sm"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Esim. Esimerkki Oy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Y-tunnus</Label>
                  <Input
                    className="h-8 text-sm"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    placeholder="1234567-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Yrityksen koko (hlö) *</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Valitse" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1">
                <Label className="text-xs">Toimiala *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Valitse toimiala" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                    <SelectItem value="Muu">Muu (kirjoita itse)</SelectItem>
                  </SelectContent>
                </Select>
                {industry === "Muu" && (
                  <Input
                    placeholder="Kirjoita toimiala"
                    className="h-8 text-sm"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                  />
                )}
              </div>

              {/* Affected count + over 55 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Koulutettavien / irtisanottavien määrä *</Label>
                  <Select value={affectedCount} onValueChange={setAffectedCount}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Valitse" />
                    </SelectTrigger>
                    <SelectContent>
                      {AFFECTED_COUNT_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mukana yli 55-vuotiaita?</Label>
                  <div className="flex gap-2">
                    {["Kyllä", "Ei", "En tiedä"].map((o) => (
                      <Button
                        key={o}
                        type="button"
                        variant={hasOver55 === o ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs px-3"
                        onClick={() => setHasOver55(o)}
                      >
                        {o}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* YT stage */}
              <div className="space-y-1">
                <Label className="text-xs">YT-prosessin vaihe *</Label>
                <Select value={ytStage} onValueChange={setYtStage}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Valitse vaihe" />
                  </SelectTrigger>
                  <SelectContent>
                    {YT_STAGE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Budget */}
              <div className="space-y-1">
                <Label className="text-xs">Koulutusbudjetti / henkilö</Label>
                <Select value={budgetPerPerson} onValueChange={setBudgetPerPerson}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Valitse" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_PER_PERSON_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timing */}
              <div className="space-y-1">
                <Label className="text-xs">Milloin koulutuksen tulisi alkaa? *</Label>
                <Select value={timing} onValueChange={setTiming}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Valitse ajankohta" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMING_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content interests */}
              <div className="space-y-1">
                <Label className="text-xs">Kiinnostavat sisällöt (valitse yksi tai useampi)</Label>
                <div className="flex flex-col gap-1">
                  {CONTENT_INTEREST_OPTIONS.map((o) => (
                    <label key={o} className="flex items-start gap-2 cursor-pointer">
                      <Checkbox
                        className="h-3.5 w-3.5 mt-0.5"
                        checked={contentInterests.includes(o)}
                        onCheckedChange={() => toggleItem(contentInterests, setContentInterests, o)}
                      />
                      <span className="text-xs break-words">{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">Yhteyshenkilö</Label>
                <Input
                  placeholder="Nimi *"
                  className="h-8 text-sm"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Rooli yrityksessä *" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {role === "Muu" && (
                  <Input
                    placeholder="Kirjoita rooli"
                    className="h-8 text-sm"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                )}
                <Input
                  type="email"
                  placeholder="Sähköposti (työ) *"
                  className="h-8 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Puhelin"
                  className="h-8 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Extra */}
              <div className="space-y-1">
                <Label className="text-xs">Lisätieto (esim. erityistarpeet, aikataulu, paikkakunta)</Label>
                <Textarea
                  placeholder="Kerro vapaasti tilanteestanne..."
                  className="text-sm"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="cta"
                  size="lg"
                  className="flex-1"
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Lähetä tarjouspyyntö
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  asChild
                >
                  <a href="tel:+358401906912">
                    <Phone className="w-4 h-4 mr-2" />
                    Soita Heikki Kallungille
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
