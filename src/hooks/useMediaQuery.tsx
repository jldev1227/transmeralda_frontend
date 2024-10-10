import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);

      // Verifica si la consulta media coincide
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Usar `addEventListener` en lugar de `addListener`
      media.addEventListener("change", listener);

      return () => {
        // Usar `removeEventListener` en lugar de `removeListener`
        media.removeEventListener("change", listener);
      };
    }, [matches, query]);

    return matches;
  }
