import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/utils/api';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { formatCinemaName } from '@/utils/format';
import { RequestController } from '@/utils/requestController';
import { getMovieById as findMovieById } from '@/utils/data';
import type { Movie, MovieSession } from '@/types/api';

export type { Movie, MovieSession };

const useMoviesStoreImpl = defineStore('movies', () => {
  const movies = ref<Movie[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestController = new RequestController();

  const fetchMovies = async (force = false) => {
    if (!force && movies.value.length > 0) {
      return movies.value;
    }
    loading.value = true;
    error.value = null;
    
    return apiClient
      .get<Movie[]>('/movies', { signal: requestController.getSignal() })
      .then((response) => {
        movies.value = response.data;
        return response.data;
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return movies.value;
        error.value = getApiErrorMessage(err);
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const fetchMovieSessions = async (movieId: number) => {
    return apiClient
      .get<MovieSession[]>(`/movies/${movieId}/sessions`)
      .then((response) => response.data)
      .catch((err) => {
        throw err;
      });
  };

  const getMovieById = (id: number): Movie | undefined => findMovieById(movies.value, id);

  const loadMovieDetail = async (movieId: number) => {
    await fetchMovies();
    const movie = getMovieById(movieId);
    if (!movie) return { movie: null, sessions: [] };
    const sessionsData = await fetchMovieSessions(movieId);
    return {
      movie,
      sessions: sessionsData,
    };
  };


  const getCinemaName = (cinemaId: number, cinemas: { id: number; name?: string | null }[]): string => {
    return formatCinemaName(cinemas.find((c) => c.id === cinemaId)?.name);
  };

  return {
    movies,
    loading,
    error,
    fetchMovies,
    fetchMovieSessions,
    getMovieById,
    loadMovieDetail,
    getCinemaName,
  };
});

export const useMoviesStore = () => useMoviesStoreImpl();

