<template>
  <div class="my-bookings-page" v-if="isAuthenticated">
    <h1>Мои билеты</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="bookings-content">
      <div v-if="unpaidBookings.length > 0" class="bookings-section">
        <h2 class="section-title">Не оплаченные</h2>
        <div class="section-divider"></div>
        <BookingCard
          v-for="booking in unpaidBookings"
          :key="booking.id"
          :booking="booking"
          :movie-title="getMovieTitle(booking.movieSessionId)"
          :movie-poster="getMoviePoster(booking.movieSessionId)"
          :cinema-name="getCinemaName(booking.movieSessionId)"
          :session-start-time="getSessionStartTime(booking.movieSessionId)"
          :payment-time-seconds="paymentTimeSeconds"
          :show-payment="true"
          :show-timer="true"
          @pay="handlePayment"
        />
      </div>
      <div v-if="upcomingBookings.length > 0" class="bookings-section">
        <h2 class="section-title">Будущие</h2>
        <div class="section-divider"></div>
        <BookingCard
          v-for="booking in upcomingBookings"
          :key="booking.id"
          :booking="booking"
          :movie-title="getMovieTitle(booking.movieSessionId)"
          :movie-poster="getMoviePoster(booking.movieSessionId)"
          :cinema-name="getCinemaName(booking.movieSessionId)"
          :session-start-time="getSessionStartTime(booking.movieSessionId)"
          :payment-time-seconds="paymentTimeSeconds"
        />
      </div>
      <div v-if="pastBookings.length > 0" class="bookings-section">
        <h2 class="section-title">Прошедшие</h2>
        <div class="section-divider"></div>
        <BookingCard
          v-for="booking in pastBookings"
          :key="booking.id"
          :booking="booking"
          :movie-title="getMovieTitle(booking.movieSessionId)"
          :movie-poster="getMoviePoster(booking.movieSessionId)"
          :cinema-name="getCinemaName(booking.movieSessionId)"
          :session-start-time="getSessionStartTime(booking.movieSessionId)"
          :payment-time-seconds="paymentTimeSeconds"
        />
      </div>
      <div v-if="allBookings.length === 0" class="no-bookings">
        У вас пока нет билетов
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiClient } from '@/utils/api';
import BookingCard from '@/components/BookingCard.vue';
import { useNotifications } from '@/composables/useNotifications';
import { useAuthStore } from '@/stores/auth';

const { success } = useNotifications();
const router = useRouter();
const authStore = useAuthStore();

interface Seat {
  rowNumber: number;
  seatNumber: number;
}

interface Booking {
  id: string;
  movieSessionId: number;
  bookedAt: string;
  seats: Seat[];
  isPaid: boolean;
}

interface MovieSession {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
}

interface Movie {
  id: number;
  title: string;
  posterImage: string;
}

interface Cinema {
  id: number;
  name: string;
}

interface Settings {
  bookingPaymentTimeSeconds: number;
}

const allBookings = ref<Booking[]>([]);
const movieSessions = ref<MovieSession[]>([]);
const movies = ref<Movie[]>([]);
const cinemas = ref<Cinema[]>([]);
const settings = ref<Settings | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const paymentTimeSeconds = computed(() => settings.value?.bookingPaymentTimeSeconds || 180);

const unpaidBookings = computed(() => {
  const now = Date.now();
  return allBookings.value.filter((booking) => {
    if (booking.isPaid) return false;
    const bookedAtTime = new Date(booking.bookedAt).getTime();
    const elapsed = Math.floor((now - bookedAtTime) / 1000);
    return elapsed < paymentTimeSeconds.value;
  });
});

const upcomingBookings = computed(() => {
  const now = Date.now();
  return allBookings.value.filter((booking) => {
    if (!booking.isPaid) return false;
    const session = movieSessions.value.find((s) => s.id === booking.movieSessionId);
    if (!session) return false;
    const startTime = new Date(session.startTime).getTime();
    return startTime > now;
  });
});

const pastBookings = computed(() => {
  const now = Date.now();
  return allBookings.value.filter((booking) => {
    const session = movieSessions.value.find((s) => s.id === booking.movieSessionId);
    if (!session) return false;
    const startTime = new Date(session.startTime).getTime();
    return startTime < now;
  });
});

const getMovieTitle = (movieSessionId: number): string => {
  const session = movieSessions.value.find((s) => s.id === movieSessionId);
  if (!session) return '';
  const movie = movies.value.find((m) => m.id === session.movieId);
  return movie?.title || '';
};

const getMoviePoster = (movieSessionId: number): string => {
  const session = movieSessions.value.find((s) => s.id === movieSessionId);
  if (!session) return '';
  const movie = movies.value.find((m) => m.id === session.movieId);
  return movie?.posterImage || '';
};

const getCinemaName = (movieSessionId: number): string => {
  const session = movieSessions.value.find((s) => s.id === movieSessionId);
  if (!session) return '';
  const cinema = cinemas.value.find((c) => c.id === session.cinemaId);
  if (!cinema?.name) return '';
  return cinema.name.charAt(0).toUpperCase() + cinema.name.slice(1).toLowerCase();
};

const getSessionStartTime = (movieSessionId: number): string => {
  const session = movieSessions.value.find((s) => s.id === movieSessionId);
  return session?.startTime || '';
};

const loadBookings = () => {
  loading.value = true;
  error.value = null;

  Promise.all([
    apiClient.get('/me/bookings'),
    apiClient.get('/settings'),
  ])
    .then(([bookingsResponse, settingsResponse]) => {
      allBookings.value = bookingsResponse.data;
      settings.value = settingsResponse.data;
      return loadSessionDetails();
    })
    .catch((err) => {
      error.value = err.response?.data?.message || 'Ошибка загрузки билетов';
    })
    .finally(() => {
      loading.value = false;
    });
};

const loadSessionDetails = () => {
  const sessionIds = [...new Set(allBookings.value.map((b) => b.movieSessionId))];
  
  return Promise.all([
    ...sessionIds.map((id) => apiClient.get(`/movieSessions/${id}`)),
    apiClient.get('/movies'),
    apiClient.get('/cinemas'),
  ])
    .then((responses) => {
      const sessionResponses = responses.slice(0, sessionIds.length);
      movieSessions.value = sessionResponses.map((r) => r.data);
      movies.value = responses[sessionIds.length].data;
      cinemas.value = responses[sessionIds.length + 1].data;
    });
};

const handlePayment = (bookingId: string) => {
  apiClient
    .post(`/bookings/${bookingId}/payments`)
    .then(() => {
      success('Бронирование успешно оплачено!');
      loadBookings();
    })
    .catch((err) => {
      error.value = err.response?.data?.message || 'Ошибка оплаты';
    });
};

let intervalId: number | null = null;

onMounted(() => {
  // Проверяем авторизацию перед загрузкой данных
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' });
    return;
  }

  loadBookings();
  
  intervalId = window.setInterval(() => {
    // Проверяем авторизацию перед обновлением
    if (!authStore.isAuthenticated) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    const now = Date.now();
    const hasExpiredUnpaid = allBookings.value.some((booking) => {
      if (booking.isPaid) return false;
      const bookedAtTime = new Date(booking.bookedAt).getTime();
      const elapsed = Math.floor((now - bookedAtTime) / 1000);
      return elapsed >= paymentTimeSeconds.value;
    });
    
    if (hasExpiredUnpaid) {
      loadBookings();
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.my-bookings-page {
  padding: 0;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.error {
  color: #ff6b6b;
}

.bookings-content {
  max-width: 1000px;
}

.bookings-section {
  margin-bottom: 3rem;
}

.section-title {
  margin-bottom: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.section-divider {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 1.5rem;
}

.no-bookings {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 1.1rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .bookings-section {
    margin-bottom: 2rem;
  }

  .no-bookings {
    padding: 2rem 1rem;
    font-size: 1rem;
  }
}
</style>

