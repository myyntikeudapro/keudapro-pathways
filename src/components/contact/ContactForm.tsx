import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── CATEGORY DATA ─── */
const MUU = "Muu";

const subcategories: Record<string, string[]> = {
  "Yrityksen kasvu ja uudistuminen": [
    "Myynti ja asiakashankinta",
    "Digiloikka",
    "Tekoäly käytäntöön",
    "Omistajanvaihdos",
    "Uudistuminen",
    MUU,
  ],
  "Johtaminen ja tekoäly": [
    "AI-Director / AI-Manager",
    "Tekoälyn käyttöönotto",
    "Prosessikehitys",
    "Osaamisen johtaminen",
    "Turvallisuusjohtaminen",
    "Räätälöity kehittämisohjelma",
    MUU,
  ],
  "Työllistyminen ja muutosturva": [
    "Työhönvalmennus",
    "ARPRO 2.0",
    "Muutosturvakoulutus",
    "Uraohjaus",
    MUU,
  ],
  "Turvallisuus ja pätevyyskoulutukset": [
    "Työturvallisuuskortti",
    "Tulityökortti",
    "Ensiapu",
    "Anniskelupassi",
    "Ajoneuvoalan akkuturvallisuus",
    "Turvallisuuspäällikkökoulutus",
    MUU,
  ],
  "Kieli- ja viestintäpalvelut": [
    "Suomi työkielenä",
    "Työpaikkasuomi",
    "Työnjohdon englanti",
    "Organisaation kielivalmennus",
    MUU,
  ],
  "Toimialakohtaiset koulutukset": [
    "Logistiikka",
    "Rakentaminen",
    "Teollisuus",
    "Sote",
    "ICT",
    "Ruoka-ala",
    MUU,
  ],
  "Yhteistyö / kumppanuus": [],
  [MUU]: [],
};

const categories = Object.keys(subcategories);

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

const ContactForm = () => {
  const [category, setCategory] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [sub, setSub] = useState("");
  const [subOther, setSubOther] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const subs = category ? subcategories[category] ?? [] : [];
  const showCategoryOther = category === MUU;
  const showSubSelect = subs.length > 0;
  const showSubOther = sub === MUU;

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCategoryOther("");
    setSub("");
    setSubOther("");
  };

  const handleSubChange = (value: string) => {
    setSub(value);
    setSubOther("");
  };

  return (
    <form className="keuda-card-enhanced space-y-6">
      {/* Nimi */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Nimi *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className={inputClass}
          placeholder="Etunimi Sukunimi"
        />
      </div>

      {/* Yritys + yksityishenkilö */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
          Yrityksen nimi (jos koskee yritystä)
        </label>
        <input
          type="text"
          id="company"
          name="company"
          disabled={isPrivate}
          className={`${inputClass} ${isPrivate ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="Yritys tai organisaatio"
        />
        <label className="flex items-center gap-2 mt-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-input"
          />
          Olen yksityishenkilö
        </label>
      </div>

      {/* Sähköposti */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Sähköposti *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={inputClass}
          placeholder="nimi@esimerkki.fi"
        />
      </div>

      {/* Puhelin */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
          Puhelin
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={inputClass}
          placeholder="+358 40 123 4567"
        />
      </div>

      {/* ── Pääkategoria ── */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Mihin asia liittyy? *
        </label>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Valitse aihe" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCategoryOther && (
          <input
            type="text"
            name="category_other"
            value={categoryOther}
            onChange={(e) => setCategoryOther(e.target.value)}
            className={`${inputClass} mt-3`}
            placeholder="Kerro lyhyesti, mistä on kyse"
          />
        )}
      </div>

      {/* ── Tarkentava valinta ── */}
      {showSubSelect && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tarkenna asiaa (valinnainen)
          </label>
          <Select value={sub} onValueChange={handleSubChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Valitse tarkennus" />
            </SelectTrigger>
            <SelectContent>
              {subs.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showSubOther && (
            <input
              type="text"
              name="sub_other"
              value={subOther}
              onChange={(e) => setSubOther(e.target.value)}
              className={`${inputClass} mt-3`}
              placeholder="Tarkenna lyhyesti"
            />
          )}
        </div>
      )}

      {/* Viesti */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          Viesti *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-none`}
          placeholder="Kerro, miten voimme auttaa..."
        />
      </div>

      <Button type="submit" variant="cta" size="lg" className="w-full">
        Lähetä viesti
      </Button>
    </form>
  );
};

export default ContactForm;
