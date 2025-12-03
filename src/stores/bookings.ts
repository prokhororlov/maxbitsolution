import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/utils/api';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { RequestController } from '@/utils/requestController';
import {
  getMovieTitle as getMovieTitleUtil,
  getMoviePoster as getMoviePosterUtil,
  getCinemaName as getCinemaNameUtil,
  getSessionStartTime as getSessionStartTimeUtil,
} from '@/utils/data';
import {
  isBookingUnpaid,
  isBookingUpcoming,
  isBookingPast,
  hasExpiredUnpaid as checkHasExpiredUnpaid,
  createSessionMap,
} from '@/utils/bookings';
import type { Movie, Cinema, Seat, Booking, MovieSession, Settings } from '@/types/api';

export type { Seat, Booking, MovieSession, Settings };

const useBookingsStoreImpl = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([]);
  const movieSessions = ref<MovieSession[]>([]);
  const settings = ref<Settings | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const requestController = new RequestController();

  const fetchBookings = async (force = false) => {
    if (!force && bookings.value.length > 0 && !loading.value) {
      return bookings.value;
    }
    loading.value = true;
    error.value = null;
    
    return apiClient
      .get<Booking[]>('/me/bookings', { signal: requestController.getSignal() })
      .then((response) => {
        bookings.value = response.data;
        return response.data;
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return bookings.value;
        error.value = getApiErrorMessage(err);
        throw err;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const fetchSettings = async (force = false) => {
    if (!force && settings.value !== null) {
      return settings.value;
    }
    return apiClient
      .get<Settings>('/settings')
      .then((response) => {
        settings.value = response.data;
        return response.data;
      })
      .catch((err) => {
        throw err;
      });
  };

  const fetchSessionDetails = async (sessionIds: number[]) => {
    return Promise.all(sessionIds.map((id) => apiClient.get<MovieSession>(`/movieSessions/${id}`)))
      .then((responses) => {
        movieSessions.value = responses.map((r) => r.data);
        return responses.map((r) => r.data);
      })
      .catch((err) => {
        throw err;
      });
  };

  const payBooking = async (bookingId: string) => {
    return apiClient
      .post(`/bookings/${bookingId}/payments`)
      .then(() => {
        const booking = bookings.value.find((b) => b.id === bookingId);
        if (!booking) return;
        booking.isPaid = true;
      })
      .catch((err) => {
        error.value = getApiErrorMessage(err);
        throw err;
      });
  };

  const removeBooking = (bookingId: string) => {
    const index = bookings.value.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      bookings.value.splice(index, 1);
    }
  };

  const paymentTimeSeconds = computed(() => settings.value?.bookingPaymentTimeSeconds || 180);

  const sessionMap = computed(() => createSessionMap(movieSessions.value));

  const unpaidBookings = computed(() => {
    return bookings.value.filter((booking) => isBookingUnpaid(booking, paymentTimeSeconds.value));
  });

  const upcomingBookings = computed(() => {
    const map = sessionMap.value;
    return bookings.value.filter((booking) => isBookingUpcoming(booking, map.get(booking.movieSessionId)));
  });

  const pastBookings = computed(() => {
    const map = sessionMap.value;
    return bookings.value.filter((booking) => isBookingPast(booking, map.get(booking.movieSessionId)));
  });

  const getMovieTitle = (movieSessionId: number, movies: Movie[]): string => {
    return getMovieTitleUtil(movieSessionId, movies, movieSessions.value);
  };

  const getMoviePoster = (movieSessionId: number, movies: Movie[]): string => {
    return getMoviePosterUtil(movieSessionId, movies, movieSessions.value);
  };

  const getCinemaName = (movieSessionId: number, cinemas: Cinema[]): string => {
    return getCinemaNameUtil(movieSessionId, cinemas, movieSessions.value);
  };

  const getSessionStartTime = (movieSessionId: number): string => {
    return getSessionStartTimeUtil(movieSessionId, movieSessions.value);
  };

  const loadAllData = async () => {
    await Promise.all([
      fetchBookings(true),
      fetchSettings(),
    ]);
    const sessionIds = [...new Set(bookings.value.map((b) => b.movieSessionId))];
    if (!sessionIds.length) return;
    await fetchSessionDetails(sessionIds);
  };

  const initializeBookingsPage = async () => {
    await loadAllData();
  };

  const hasExpiredUnpaid = computed(() => {
    return checkHasExpiredUnpaid(bookings.value, paymentTimeSeconds.value);
  });

  return {
    bookings,
    movieSessions,
    settings,
    loading,
    error,
    paymentTimeSeconds,
    unpaidBookings,
    upcomingBookings,
    pastBookings,
    hasExpiredUnpaid,
    fetchBookings,
    fetchSettings,
    fetchSessionDetails,
    payBooking,
    removeBooking,
    loadAllData,
    initializeBookingsPage,
    getMovieTitle,
    getMoviePoster,
    getCinemaName,
    getSessionStartTime,
  };
});

export const useBookingsStore = () => useBookingsStoreImpl();

