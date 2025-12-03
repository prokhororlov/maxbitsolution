import { getApiErrorMessage } from './errorHandler';
import type { Ref } from 'vue';

export const handleStoreError = (
  err: unknown,
  errorRef: Ref<string | null>,
  fallbackData?: unknown
): unknown => {
  if (err && typeof err === 'object' && ('name' in err || 'code' in err)) {
    const errorName = 'name' in err ? err.name : '';
    const errorCode = 'code' in err ? err.code : '';
    if (errorName === 'CanceledError' || errorCode === 'ERR_CANCELED') {
      return fallbackData;
    }
  }
  errorRef.value = getApiErrorMessage(err);
  throw err;
};

export const createApiRequest = <T>(
  requestFn: () => Promise<T>,
  errorRef: Ref<string | null>,
  fallbackData?: T
): Promise<T> => {
  return requestFn().catch((err) => handleStoreError(err, errorRef, fallbackData));
};

