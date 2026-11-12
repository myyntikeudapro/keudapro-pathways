import fi from "./tyohonvalmennusPks.json";
import en from "./pks/en.json";
import sv from "./pks/sv.json";
import ui from "./pks/ui.json";

export type PksLanguage = "fi" | "en" | "sv";
export const pksLanguages = ["fi", "en", "sv"] as const;
export function pksPath(language: PksLanguage) {
  return language === "fi" ? fi.path : `${fi.path}/${language}`;
}
export function getPksLanguage(pathname: string): PksLanguage {
  if (/\/tyohonvalmennus-pks\/en\/?$/.test(pathname)) return "en";
  if (/\/tyohonvalmennus-pks\/sv\/?$/.test(pathname)) return "sv";
  return "fi";
}
export function getPksContent(language: PksLanguage) {
  const translated = language === "en" ? en : language === "sv" ? sv : fi;
  return { ...fi, ...translated, entry: { ...fi.entry, ...translated.entry }, path: pksPath(language) };
}
export function getPksUi(language: PksLanguage) {
  return ui[language];
}