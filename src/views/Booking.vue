<template>
  <div class="booking-page">
    <h1>Выбрать места</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="sessionDetails" class="booking-content">
      <div class="session-info">
        <h2 class="movie-title">{{ movieTitle }}</h2>
        <p><strong>🎪 Кинотеатр:</strong> {{ cinemaName }}</p>
        <p><strong>📍 Адрес:</strong> {{ cinemaAddress }}</p>
        <p><strong>📅 Время:</strong> {{ formatDateTime(sessionDetails.startTime) }}</p>
      </div>
      <div class="seat-selection-wrapper">
        <SeatGrid
          :rows="sessionDetails.seats.rows"
          :seats-per-row="sessionDetails.seats.seatsPerRow"
          :booked-seats="sessionDetails.bookedSeats"
          :selected-seats="selectedSeats"
          @update:selected-seats="handleSeatSelection"
        />
      </div>
      <div v-if="selectedSeats.length > 0" class="booking-actions">
        <div class="tickets-info">
          <div class="tickets-summary">{{ ticketsText }}</div>
        </div>
        <button
          v-if="!isAuthenticated"
          @click="goToLogin"
          class="book-button"
        >
          Забронировать
        </button>
        <button
          v-else
          @click="handleBooking"
          :disabled="isBooking"
          class="book-button"
        >
          {{ isBooking ? 'Бронирование...' : 'Продолжить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRootStore } from '@/stores';
import { formatDateTime } from '@/utils/date';
import SeatGrid from '@/components/SeatGrid.vue';
import { formatCinemaName } from '@/utils/format';
import { formatTicketsText } from '@/utils/text';
import type { Seat } from '@/types/api';

const route = useRoute();
const router = useRouter();
const $ = useRootStore();
const sessionId = Number(route.params.sessionId);

const selectedSeats = ref<Seat[]>([]);

const sessionDetails = computed(() => $.sessions.currentSession);
const loading = computed(() => $.sessions.loading || $.movies.loading || $.cinemas.loading);
const error = computed(() => $.sessions.error || $.movies.error || $.cinemas.error);
const isBooking = computed(() => $.sessions.loading);
const isAuthenticated = computed(() => $.auth.isAuthenticated);

const movieTitle = computed(() => {
  if (!sessionDetails.value) return '';
  return $.sessions.getMovieTitle(sessionDetails.value.movieId, $.movies.movies);
});

const cinemaName = computed(() => {
  if (!sessionDetails.value) return '';
  return formatCinemaName($.sessions.getCinemaName(sessionDetails.value.cinemaId, $.cinemas.cinemas));
});

const cinemaAddress = computed(() => {
  if (!sessionDetails.value) return '';
  return $.sessions.getCinemaAddress(sessionDetails.value.cinemaId, $.cinemas.cinemas);
});

const ticketsText = computed(() => formatTicketsText(selectedSeats.value.length));

const handleSeatSelection = (seats: Seat[]) => {
  selectedSeats.value = seats;
};

const goToLogin = () => {
  router.push({ name: 'login' });
};

const handleBooking = () => {
  if (selectedSeats.value.length === 0) return;
  $.sessions.createBooking(sessionId, selectedSeats.value)
    .then((result) => {
      router.push({ name: 'my-bookings', query: { highlight: result.id } });
    });
};

onMounted(async () => {
  await Promise.all([
    $.movies.fetchMovies(),
    $.cinemas.fetchCinemas(),
  ]);
  await $.sessions.loadSessionForBooking(sessionId);
});
</script>

<style scoped>
.booking-page {
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

.booking-content {
  max-width: 1000px;
}

.session-info {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.movie-title {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  line-height: 1.2;
}

.session-info p {
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

.session-info strong {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.seat-selection-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  height: 500px;
  overflow: hidden;
  margin-bottom: 0;
}

.booking-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  margin-top: 16px;
}

.tickets-info {
  color: #000000;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tickets-summary {
  font-weight: 600;
}

.book-button {
  padding: 0.875rem 2rem;
  background: #FFC107;
  color: #000000;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: inherit;
}

.book-button:hover:not(:disabled) {
  background: #FFB300;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.book-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile styles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .session-info {
    padding: 1rem;
  }

  .seat-selection-wrapper {
    height: 400px;
  }

  .booking-actions {
    margin-top: 16px;
    padding: 16px;
  }

  .tickets-info {
    font-size: 0.9rem;
  }

  .book-button {
    width: 190px;
    padding: 1rem;
    font-size: 1rem;
    
  }
}
</style>

