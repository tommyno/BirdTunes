import { useRouter } from "next/router";
import { Locale, translations } from "constants/translations";
import { getQueryParam } from "hooks/useQueryParams";

export type TranslationKey = keyof typeof translations;

export const useTranslation = () => {
  const { query } = useRouter();
  const locale = getQueryParam({
    value: query.lang,
    defaultValue: "en",
  }) as Locale;

  const t = (key: TranslationKey): string => {
    return (
      translations?.[key]?.[locale] ||
      translations?.[key]?.["en"] ||
      "[missing translation]"
    );
  };

  return { t };
};
