import { Species } from "hooks/useFetchSpecies";

// Sort species by most recent detection
export const sortByLatestDetection = (species: Species[]): Species[] => {
  return [...species].sort(
    (a, b) =>
      new Date(b.latestDetectionAt).getTime() -
      new Date(a.latestDetectionAt).getTime()
  );
};

// Sort species by total number of detections
export const sortByObservations = (species: Species[]): Species[] => {
  return [...species].sort((a, b) => b.detections.total - a.detections.total);
};

// Filter species by search term (matches common name or scientific name)
export const filterSpeciesBySearch = (
  species: Species[],
  searchFilter: string
): Species[] => {
  if (!searchFilter) return species;

  const lowerSearch = searchFilter.toLowerCase();
  return species.filter(
    (s) =>
      s.commonName.toLowerCase().includes(lowerSearch) ||
      s.scientificName.toLowerCase().includes(lowerSearch)
  );
};

// Clean station name by removing BirdNET-Pi prefix
export const cleanStationName = (name: string | undefined): string => {
  return name?.replace("BirdNET-Pi - ", "") || "";
};

// Generate page title from station name
export const getPageTitle = (stationName: string | undefined): string => {
  const cleanName = cleanStationName(stationName);
  return cleanName ? `${cleanName} | BirdTunes` : "BirdTunes";
};

type GetSortedSpeciesListProps = {
  species: Species[];
  sort: string;
  search: string;
};

// Get sorted and filtered species list
export const getSortedSpeciesList = ({
  species,
  sort,
  search,
}: GetSortedSpeciesListProps): Species[] => {
  const sorted =
    sort === "observations"
      ? sortByObservations(species)
      : sortByLatestDetection(species);

  return filterSpeciesBySearch(sorted, search);
};
