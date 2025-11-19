const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1/topic';

export const getApiUrl = (path: string) => {
  const segment = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${segment}`;
};

