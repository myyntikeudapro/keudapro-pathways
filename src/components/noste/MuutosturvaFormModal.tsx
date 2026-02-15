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
];

const BUDGET_OPTIONS = [
  "alle 2 000 €",
  "2 000–4 000 €",
  "4 000–6 000 €",
  "yli 6 000 €",
  "En tiedä",
];

const GOAL_OPTIONS = [
  "Työllistyä nopeasti",
  "Vaihtaa alaa",
  "Kouluttautua uuteen ammattiin",
  "Yrittäjyys kiinnostaa",
  "En ole vielä varma",
];

const AI_OPTIONS = [
  "En ole käyttänyt tekoälyä lainkaan",
  "Olen kuullut / pohtinut, mutta en ole kokeillut",
  "Olen kokeillut ChatGPT:tä tai vastaavaa satunnaisesti",
  "Käytän tekoälyä säännöllisesti arjessa tai työssä",
  "Hyödynnän tekoälyä monipuolisesti (tekstit, kuvat, analyysit…)",
];

const TIMING_OPTIONS = ["Heti", "1 kk sisällä", "2 kk sisällä", "Myöhemmin"];

interface MuutosturvaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MuutosturvaFormModal({ open, onOpenChange }: MuutosturvaFormModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [over55, setOver55] = useState<string>("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [aiUsage, setAiUsage] = useState<string[]>([]);
  const [timing, setTiming] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [extra, setExtra] = useState("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const effectiveIndustry = industry === "Muu" ? customIndustry : industry;

  const isValid =
    effectiveIndustry.trim() !== "" &&
    over55 !== "" &&
    budget !== "" &&
    goals.length > 0 &&
    timing !== "" &&
    name.trim() !== "" &&
    email.trim() !== "";

  const buildEmailBody = () => {
    const lines = [
      `Ala: ${effectiveIndustry}`,
      `Yli 55-vuotias: ${over55}`,
      `Muutosturvabudjetti: ${budget}`,
      `Toiveet seuraavalta suunnalta: ${goals.join(", ")}`,
      `Tekoälyn käyttö: ${aiUsage.length > 0 ? aiUsage.join(", ") : "–"}`,
      `Koulutuksen aloitus: ${timing}`,
      ``,
      `Nimi: ${name}`,
      `Sähköposti: ${email}`,
      `Puhelin: ${phone || "–"}`,
      ``,
      `Lisätieto: ${extra || "–"}`,
    ];
    return lines.join("\n");
  };

  const handleSubmit = () => {
    const subject = encodeURIComponent(
      "Muutosturvakoulutus – kartoituspyyntö (NOSTE-sivu)"
    );
    const body = encodeURIComponent(buildEmailBody());
    window.location.href = `mailto:heikki.kallunki@keuda.fi?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      // Reset on close
      setSubmitted(false);
      setIndustry("");
      setCustomIndustry("");
      setOver55("");
      setBudget("");
      setGoals([]);
      setAiUsage([]);
      setTiming("");
      setName("");
      setEmail("");
      setPhone("");
      setExtra("");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <CheckCircle className="w-16 h-16 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Kiitos!</h3>
            <p className="text-muted-foreground">
              Tietosi on lähetetty. Olemme sinuun yhteydessä pian.
            </p>
            <Button variant="cta" onClick={() => handleClose(false)}>
              Sulje
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                Haluatko muutosturvakoulutussuunnitelman?
              </DialogTitle>
              <DialogDescription>
                Täytä muutama tieto, niin laadimme sinulle sopivan ehdotuksen ja
                palaamme nopeasti.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5 mt-2">
              {/* 1. Industry */}
              <div className="space-y-2">
                <Label>Miltä alalta olet siirtymässä?</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse ala" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                    <SelectItem value="Muu">Muu (kirjoita itse)</SelectItem>
                  </SelectContent>
                </Select>
                {industry === "Muu" && (
                  <Input
                    placeholder="Kirjoita ala"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                  />
                )}
              </div>

              {/* 2. Over 55 */}
              <div className="space-y-2">
                <Label>Oletko yli 55-vuotias?</Label>
                <div className="flex gap-3">
                  {["Kyllä", "Ei"].map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant={over55 === opt ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOver55(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 3. Budget */}
              <div className="space-y-2">
                <Label>Muutosturvabudjetti (arvio)</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse budjetti" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Goals */}
              <div className="space-y-2">
                <Label>Mitä toivot seuraavalta suunnalta?</Label>
                <div className="flex flex-col gap-2">
                  {GOAL_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={goals.includes(opt)}
                        onCheckedChange={() => toggleItem(goals, setGoals, opt)}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4b. AI usage */}
              <div className="space-y-2">
                <Label>Miten käytät tekoälyä tällä hetkellä?</Label>
                <div className="flex flex-col gap-2">
                  {AI_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={aiUsage.includes(opt)}
                        onCheckedChange={() => toggleItem(aiUsage, setAiUsage, opt)}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Timing */}
              <div className="space-y-2">
                <Label>Milloin koulutuksen tulisi alkaa?</Label>
                <Select value={timing} onValueChange={setTiming}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse ajankohta" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMING_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Contact */}
              <div className="space-y-2">
                <Label>Yhteystiedot</Label>
                <Input
                  placeholder="Nimi *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Sähköposti *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Puhelin"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* 7. Extra */}
              <div className="space-y-2">
                <Label>Lisätieto (valinnainen)</Label>
                <Textarea
                  placeholder="Kerro halutessasi lisää tilanteestasi..."
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  rows={3}
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
                  Lähetä tiedot Heikille
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  asChild
                >
                  <a href="tel:+358401906912">
                    <Phone className="w-4 h-4 mr-2" />
                    Soita suoraan Heikille
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
