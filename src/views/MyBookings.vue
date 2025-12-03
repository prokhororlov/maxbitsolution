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
          @expired="handleExpired"
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookingCard from '@/components/BookingCard.vue';
import { useNotifications } from '@/composables/useNotifications';
import { useRootStore } from '@/stores';

const { success } = useNotifications();
const route = useRoute();
const router = useRouter();
const $ = useRootStore();
const isMounted = ref(false);

const loading = computed(() => $.bookings.loading || $.movies.loading || $.cinemas.loading);
const error = computed(() => $.bookings.error);
const isAuthenticated = computed(() => $.auth.isAuthenticated);

const unpaidBookings = computed(() => $.bookings.unpaidBookings);
const upcomingBookings = computed(() => $.bookings.upcomingBookings);
const pastBookings = computed(() => $.bookings.pastBookings);
const allBookings = computed(() => $.bookings.bookings);
const paymentTimeSeconds = computed(() => $.bookings.paymentTimeSeconds);

const getMovieTitle = (movieSessionId: number) => {
  return $.bookings.getMovieTitle(movieSessionId, $.movies.movies);
};

const getMoviePoster = (movieSessionId: number) => {
  return $.bookings.getMoviePoster(movieSessionId, $.movies.movies);
};

const getCinemaName = (movieSessionId: number) => {
  return $.bookings.getCinemaName(movieSessionId, $.cinemas.cinemas);
};

const getSessionStartTime = (movieSessionId: number) => {
  return $.bookings.getSessionStartTime(movieSessionId);
};

const handlePayment = (bookingId: string) => {
  $.bookings.payBooking(bookingId)
    .then(() => {
      success('Бронирование успешно оплачено!');
      return $.bookings.loadAllData();
    });
};

const handleExpired = (bookingId: string) => {
  $.bookings.removeBooking(bookingId);
};

let intervalId: number | null = null;

onMounted(async () => {
  if (!$.auth.isAuthenticated) {
    router.push({ name: 'login' });
    return;
  }
  isMounted.value = true;
  await Promise.all([
    $.bookings.initializeBookingsPage(),
    $.movies.fetchMovies(),
    $.cinemas.fetchCinemas(),
  ]);
  if (!isMounted.value) return;
  intervalId = window.setInterval(() => {
    if (!isMounted.value || !$.auth.isAuthenticated) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }
    if ($.bookings.hasExpiredUnpaid) $.bookings.loadAllData();
  }, 1000);
});

watch(() => route.query.highlight, async (highlight) => {
  if (highlight && isMounted.value) {
    await $.bookings.loadAllData();
  }
});

onBeforeUnmount(() => {
  isMounted.value = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
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

