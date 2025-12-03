import { ref, type Ref } from 'vue';

export interface DataLoaderOptions<T> {
  loadFn: () => Promise<T>;
  initialData?: T;
  onError?: (error: unknown) => void;
}

export const useDataLoader = <T>(options: DataLoaderOptions<T>) => {
  const { loadFn, initialData, onError } = options;
  const data = ref<T | null>(initialData ?? null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const load = async (force = false): Promise<T | null> => {
    if (!force && data.value !== null) {
      return data.value;
    }
    loading.value = true;
    error.value = null;
    try {
      const result = await loadFn();
      data.value = result;
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки данных';
      error.value = errorMessage;
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    data.value = initialData ?? null;
    error.value = null;
    loading.value = false;
  };

  return {
    data,
    loading,
    error,
    load,
    reset,
  };
};

