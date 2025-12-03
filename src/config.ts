export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3022';

export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

