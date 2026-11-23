import { useEffect } from "react";

// Body freeze - used for modals and overlay menus
export const useBodyFreeze = (isFrozen: boolean) => {
  useEffect(() => {
    if (!isFrozen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFrozen]);
};
