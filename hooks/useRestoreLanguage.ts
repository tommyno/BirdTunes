import { useEffect } from "react";
import { useRouter } from "next/router";

import { getQueryParam, setQueryParams } from "hooks/useQueryParams";
import { getItem, setItem } from "hooks/useLocalStorage";

const STORAGE_KEY = "birdtunes-lang";

// Remember the chosen language so it can be restored on visits without ?lang
export const storeLanguage = (lang: string) => {
  setItem(STORAGE_KEY, JSON.stringify(lang));
};

// Restore the stored language when the url has no ?lang param, so the
// setting survives links and direct visits that drop the query param
export const useRestoreLanguage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.lang) return;

    const storedLang = getItem(STORAGE_KEY);
    if (typeof storedLang !== "string" || storedLang === "en") return;

    setQueryParams({ router, params: { lang: storedLang } });
  }, [router]);

  // The html lang attribute is set server-side, but shallow query updates
  // (like the restore above) skip the server, so mirror it client-side too
  useEffect(() => {
    if (!router.isReady) return;

    document.documentElement.lang = getQueryParam({
      value: router.query.lang,
      defaultValue: "en",
    });
  }, [router]);
};
