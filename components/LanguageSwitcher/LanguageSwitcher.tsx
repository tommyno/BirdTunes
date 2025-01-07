import { useRouter } from "next/router";
import styles from "./LanguageSwitcher.module.scss";

// This list is identical to Birdweather's language list
const languages = [
  { code: "af", name: "Afrikaans" },
  { code: "ar", name: "Arabic" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "de", name: "German" },
  { code: "en", name: "English" },
  // { code: "en", name: "English (US)" },
  // { code: "en-UK", name: "English (UK)" },
  { code: "es", name: "Spanish" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "hu", name: "Hungarian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "nl", name: "Dutch" },
  { code: "no", name: "Norwegian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  // { code: "pt-BR", name: "Portuguese (Brazil)" },
  // { code: "pt-PT", name: "Portuguese (Portugal)" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "sv", name: "Swedish" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "zh", name: "Chinese" },
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const currentLang = router.query.lang || "no";

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
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
