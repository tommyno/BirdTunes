import { useRouter } from "next/router";
import styles from "./LanguageSwitcher.module.scss";
import { Fragment } from "react";

// This list is identical to Birdweather's language list
const languages = [
  { code: "en", name: "English" },
  { code: "no", name: "Norsk" },
  { code: "af", name: "Afrikaans" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hu", name: "Hungarian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pl", name: "Polish" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "es", name: "Spanish" },
  { code: "sv", name: "Swedish" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const currentLang = router.query.lang || "en";

  const handleLanguageChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLang = e.target.value;
    const { query } = router;
    await router.replace(
      {
        query: { ...query, lang: newLang },
      },
      undefined,
      { shallow: true }
    );

    window.location.reload();
  };

  return (
    <div className={styles.wrap}>
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className={styles.select}
      >
        {languages.map((lang, index) => (
          <Fragment key={lang.code}>
            {index === 2 && <hr />}
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          </Fragment>
        ))}
      </select>
    </div>
  );
};
