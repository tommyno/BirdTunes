import { Species } from "types/api";

// What a bird card hands to the bird modal
export type BirdModalData = Species & {
  stationId: string | null;
  lang: string | null;
};
