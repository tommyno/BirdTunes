import { useState, useEffect } from "react";

export const useIsLocalhost = () => {
  // Default to true to prevent tracking during SSR
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === "localhost");
  }, []);

  return isLocalhost;
};
