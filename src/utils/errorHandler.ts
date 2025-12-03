import type { AxiosError } from 'axios';

export const getApiErrorMessage = (error: unknown): string => {
  if (!error) return 'Произошла ошибка';
  const axiosError = error as AxiosError<{ message?: string }>;
  if (axiosError.response?.data?.message) return axiosError.response.data.message;
  if (axiosError.message) return axiosError.message;
  return 'Произошла неизвестная ошибка';
};

