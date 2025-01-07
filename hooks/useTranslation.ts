import { useRouter } from "next/router";
import { Locale, translations } from "constants/translations";

type TranslationKey = keyof typeof translations;

export const useTranslation = () => {
  const { query } = useRouter();
  const locale = (query.lang as Locale) || "no";

  const t = (key: TranslationKey): string => {
    return (
      translations?.[key]?.[locale] ||
      translations?.[key]?.["no"] ||
      "[missing translation]"
    );
  };

  return { t };
};
