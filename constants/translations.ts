export type Locale = "en" | "no" | "sv";

export const translations = {
  pageDescription: {
    en: "Listening station for birds in the area",
    no: "Lyttestasjon for fugler i nærområdet",
    sv: "Lyssningsstation för fåglar i området",
  },
  lastHeard: {
    en: "Last heard",
    no: "Sist hørt",
    sv: "Senast hörd",
  },
  mostVisits: {
    en: "Most visits",
    no: "Flest besøk",
    sv: "Flest besök",
  },
  search: {
    en: "Search species",
    no: "Søk arter",
    sv: "Sök arter",
  },
  toTop: {
    en: "To the top",
    no: "Til toppen",
    sv: "Till toppen",
  },
  play: {
    en: "Play",
    no: "Spill av",
    sv: "Spela",
  },
  pause: {
    en: "Pause",
    no: "Pause",
    sv: "Pausa",
  },
  wikiUrl: {
    en: "https://en.wikipedia.org/wiki",
    no: "https://snl.no",
    sv: "https://sv.wikipedia.org/wiki",
  },
  wikiTitle: {
    en: "Go to Wikipedia",
    no: "Gå til Store norske leksikon",
    sv: "Gå till Wikipedia",
  },
  detections: {
    en: "detections",
    no: "observasjoner",
    sv: "observationer",
  },
  last: {
    en: "Last",
    no: "Siste",
    sv: "Sista",
  },
  lastUpdated: {
    en: "Updated",
    no: "Oppdatert",
    sv: "Uppdaterad",
  },
  closeWindow: {
    en: "Close window",
    no: "Lukk vindu",
    sv: "Stäng fönstret",
  },
  clearSearch: {
    en: "Clear search",
    no: "Nullstill søk",
    sv: "Rensa sökning",
  },
  changeStation: {
    en: "Change station",
    no: "Endre stasjon",
    sv: "Byt station",
  },
  species: {
    en: "species",
    no: "arter",
    sv: "arter",
  },
  stationIdFrom: {
    en: "Station ID from",
    no: "Stasjon ID fra",
    sv: "Stations-id från",
  },
  save: {
    en: "Save",
    no: "Lagre",
    sv: "Spara",
  },
  minute: {
    en: "minute",
    no: "minutt",
    sv: "minut",
  },
  minutes: {
    en: "minutes",
    no: "minutter",
    sv: "minuter",
  },
  hour: {
    en: "hour",
    no: "time",
    sv: "timme",
  },
  hours: {
    en: "hours",
    no: "timer",
    sv: "timmar",
  },
  day: {
    en: "day",
    no: "dag",
    sv: "dag",
  },
  days: {
    en: "days",
    no: "dager",
    sv: "dagar",
  },
  ago: {
    en: "ago",
    no: "siden",
    sv: "sedan",
  },
  detectedSeconds: {
    en: "Detection started at",
    no: "Fuglen oppdaget ved",
    sv: "Fågeln upptäckt vid",
  },
  seconds: {
    en: "seconds",
    no: "sekunder",
    sv: "sekunder",
  },
} as const;
