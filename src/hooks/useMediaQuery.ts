import { useEffect, useState } from 'react';

/**
 * Следит за media query и синхронно сообщает, активен ли breakpoint.
 */
const useMediaQuery = (query: string): boolean => {
  const getMatch = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;


