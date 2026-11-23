import { useSyncExternalStore } from "react";

// The hostname never changes, so there is nothing to subscribe to
const subscribe = () => () => {};

export const useIsLocalhost = () => {
  // The server snapshot is true, so tracking is skipped during SSR
  return useSyncExternalStore(
    subscribe,
    () => window.location.hostname === "localhost",
    () => true
  );
};
