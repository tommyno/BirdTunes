import { useRouter } from "next/router";
import { Locale, translations } from "constants/translations";

export type TranslationKey = keyof typeof translations;

export const useTranslation = () => {
  const { query } = useRouter();
  const locale = (query.lang as Locale) || "en";

  const t = (key: TranslationKey): string => {
    return (
      translations?.[key]?.[locale] ||
      translations?.[key]?.["en"] ||
      "[missing translation]"
    );
  };

  return { t };
};
