import { en, type Messages } from "./messages/en";
import { ar } from "./messages/ar";

export type Locale = "en" | "ar";

const messages: Record<Locale, Messages> = {
  en,
  ar,
};

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
        : Prefix extends ""
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<Messages>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function createTranslator(locale: Locale = "en") {
  const catalog = messages[locale] as unknown as Record<string, unknown>;

  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    let value = getNestedValue(catalog, key);
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      }
    }
    return value;
  };
}

export { en };
