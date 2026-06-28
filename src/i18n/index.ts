import en from "./en";
import pt from "./pt";

export type Locale = "en" | "pt";

export const locales: Locale[] = ["en", "pt"];

export const localeNames: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
};

/** Converts nested `as const` literal types to their widened counterparts */
type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

/** Shape of translation objects (all string values) */
export type Translations = DeepStringify<typeof en>;

export const translations: Record<Locale, Translations> = { en, pt };
