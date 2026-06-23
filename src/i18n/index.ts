import en from "./en";
import pt from "./pt";

export type Locale = "en" | "pt";

export const locales: Locale[] = ["en", "pt"];

export const localeNames: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const translations: Record<Locale, any> = { en, pt };
