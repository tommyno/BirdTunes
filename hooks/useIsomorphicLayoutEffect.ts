import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect runs before paint, preventing flashes of empty/stale state.
// On the server window is undefined, so we fall back to useEffect to avoid SSR warnings.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
