import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '@/utils/api';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { RequestController } from '@/utils/requestController';
import { getMovieById, getCinemaById } from '@/utils/data';
import type { Movie, Cinema, Seat, SessionDetails } from '@/types/api';

export type { Seat, SessionDetails };

const useSessionsStoreImpl = defineStore('sessions', () => {
  const currentSession = ref<SessionDetails | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestController = new RequestController();

  const fetchSession = async (sessionId: number) => {
    loading.value = true;
    error.value = null;
    return apiClient
      .get<SessionDetails>(`/movieSessions/${sessionId}`, { signal: requestController.getSignal() })
      .then((response) => {
        const sessionData = response.data;
        const sessionStartTime = new Date(sessionData.startTime);
        const now = new Date();
        const isPastSession = sessionStartTime <= now;
        if (isPastSession) {
          error.value = 'Нельзя забронировать места на прошедший сеанс';
          throw new Error('Нельзя забронировать места на прошедший сеанс');
        }
        currentSession.value = sessionData;
        return sessionData;
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return currentSession.value;
        }
        if (!error.value) error.value = getApiErrorMessage(err);
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const loadSessionForBooking = async (sessionId: number) => {
    await fetchSession(sessionId);
    return currentSession.value;
  };

  const createBooking = async (sessionId: number, seats: Seat[]) => {
    loading.value = true;
    error.value = null;
    
    return apiClient
      .post<{ id: string }>(`/movieSessions/${sessionId}/bookings`, { seats })
      .then((response) => response.data)
      .catch((err) => {
        error.value = getApiErrorMessage(err);
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const getMovieTitle = (movieId: number, movies: Movie[]): string => {
    return getMovieById(movies, movieId)?.title || '';
  };

  const getCinemaName = (cinemaId: number, cinemas: Cinema[]): string => {
    return getCinemaById(cinemas, cinemaId)?.name || '';
  };

  const getCinemaAddress = (cinemaId: number, cinemas: Cinema[]): string => {
    return getCinemaById(cinemas, cinemaId)?.address || '';
  };

  return {
    currentSession,
    loading,
    error,
    fetchSession,
    loadSessionForBooking,
    createBooking,
    getMovieTitle,
    getCinemaName,
    getCinemaAddress,
  };
});

export const useSessionsStore = () => useSessionsStoreImpl();

