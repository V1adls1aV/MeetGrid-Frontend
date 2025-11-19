import { useEffect, useState } from 'react';

const safeRead = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const useLocalStorage = (key: string, initialValue: string) => {
  const [value, setValue] = useState<string>(() => safeRead(key) ?? initialValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore storage failures for browsers without permission
    }
  }, [key, value]);

  return [value, setValue] as const;
};
