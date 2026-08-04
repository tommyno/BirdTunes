import { GetServerSideProps } from "next";

import { getQueryParam } from "hooks/useQueryParams";

// Pass language to _document.tsx (to dynamically set html lang attribute).
// Shared by every page that needs a correct <html lang>.
export const getLangServerSideProps: GetServerSideProps<{
  lang: string;
}> = async (context) => {
  return {
    props: {
      lang: getQueryParam({ value: context.query.lang, defaultValue: "en" }),
    },
  };
};
