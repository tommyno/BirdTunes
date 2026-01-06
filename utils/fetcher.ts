import { Species } from "types/api";

// Generic fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.message || response.statusText;
    throw new Error(`Error: ${response.status} ${message}`);
  }

  return response.json();
};

// Custom fetcher that handles pagination for species endpoint
export const fetchAllSpeciesPages = async (url: string): Promise<Species[]> => {
  let allResults: Species[] = [];
  let currentPage = 1;

  // Loop through all pages (API returns max 100 per page)
  while (true) {
    const response = await fetch(`${url}&page=${currentPage}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.message || response.statusText;
      throw new Error(`Error: ${response.status} ${message}`);
    }

    const pageData = await response.json();
    allResults = [...allResults, ...pageData?.species];

    // Exit loop when last page is reached (less than 100 results)
    if (pageData?.species?.length < 100) {
      break;
    }

    currentPage++;
  }

  return allResults;
};
