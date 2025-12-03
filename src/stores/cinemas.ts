import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '@/utils/api';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { RequestController } from '@/utils/requestController';
import { getCinemaById as findCinemaById } from '@/utils/data';
import type { Cinema, MovieSession, MovieWithSessions, DateGroup, Movie } from '@/types/api';

export type { Cinema, MovieSession, MovieWithSessions, DateGroup };

const useCinemasStoreImpl = defineStore('cinemas', () => {
  const cinemas = ref<Cinema[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestController = new RequestController();

  const fetchCinemas = async (force = false) => {
    if (!force && cinemas.value.length > 0) {
      return cinemas.value;
    }
    loading.value = true;
    error.value = null;
    
    return apiClient
      .get<Cinema[]>('/cinemas', { signal: requestController.getSignal() })
      .then((response) => {
        cinemas.value = response.data;
        return response.data;
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return cinemas.value;
        error.value = getApiErrorMessage(err);
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const fetchCinemaSessions = async (cinemaId: number) => {
    return apiClient
      .get<MovieSession[]>(`/cinemas/${cinemaId}/sessions`)
      .then((response) => response.data)
      .catch((err) => {
        throw err;
      });
  };

  const getCinemaById = (id: number): Cinema | undefined => findCinemaById(cinemas.value, id);

  const loadCinemaDetail = async (cinemaId: number) => {
    await fetchCinemas();
    const cinema = getCinemaById(cinemaId);
    if (!cinema) return { cinema: null, sessions: [] };
    const sessionsData = await fetchCinemaSessions(cinemaId);
    return {
      cinema,
      sessions: sessionsData,
    };
  };


  return {
    cinemas,
    loading,
    error,
    fetchCinemas,
    fetchCinemaSessions,
    getCinemaById,
    loadCinemaDetail,
  };
});

export const useCinemasStore = () => useCinemasStoreImpl();

