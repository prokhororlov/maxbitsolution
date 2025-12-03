<template>
  <div class="booking-card glass-card">
    <img
      v-if="moviePoster"
      :src="getImageUrl(moviePoster)"
      :alt="movieTitle"
      class="movie-poster"
    />
    <div class="booking-info">
      <h3 class="movie-title">{{ movieTitle }}</h3>
      <p><strong>🎪 Кинотеатр:</strong> {{ formatCinemaName(cinemaName) }}</p>
      <p v-if="sessionStartTime"><strong>📅 Дата и время:</strong> {{ formatDateTime(sessionStartTime) }}</p>
      <p class="seats-info">
        <strong>🎫 Места:</strong>
        <span
          v-for="(group, index) in formattedSeatsGroups"
          :key="index"
          class="seat-group"
        >
          {{ group }}
        </span>
      </p>
      <div v-if="showPayment" class="booking-actions">
        <div class="payment-row">
          <button @click="handlePayment" class="pay-button glass-button">
            Оплатить
          </button>
          <PaymentTimer
            v-if="showTimer"
            :booked-at="booking.bookedAt"
            :payment-time-seconds="paymentTimeSeconds"
            @expired="handleExpired"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDateTime } from '@/utils/date';
import PaymentTimer from './PaymentTimer.vue';
import { getImageUrl } from '@/config';
import { formatCinemaName } from '@/utils/format';
import type { Booking } from '@/types/api';

interface Props {
  booking: Booking;
  movieTitle: string;
  moviePoster?: string;
  cinemaName: string;
  sessionStartTime: string;
  paymentTimeSeconds: number;
  showPayment?: boolean;
  showTimer?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPayment: false,
  showTimer: false,
});

const emit = defineEmits<{
  pay: [bookingId: string];
  expired: [bookingId: string];
}>();

const handleExpired = () => {
  emit('expired', props.booking.id);
};

const formattedSeatsGroups = computed(() => {
  const seatsByRow = new Map<number, number[]>();
  props.booking.seats.forEach(seat => {
    const row = seat.rowNumber;
    if (!seatsByRow.has(row)) {
      seatsByRow.set(row, []);
    }
    seatsByRow.get(row)!.push(seat.seatNumber);
  });
  
  const sortedRows = Array.from(seatsByRow.keys()).sort((a, b) => a - b);
  
  return sortedRows.map(row => {
    const seats = seatsByRow.get(row)!.sort((a, b) => a - b);
    const seatsStr = seats.join(', ');
    return `ряд ${row}: места ${seatsStr}`;
  });
});

const handlePayment = () => {
  emit('pay', props.booking.id);
};
</script>

<style scoped>
.booking-card {
  padding: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.movie-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.booking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.movie-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.booking-info p {
  margin-bottom: 0.25rem;
  color: var(--text-muted);
}

.booking-info strong {
  font-weight: 600;
  color: var(--text-secondary);
}

.seats-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.seat-group {
  padding: 0px 8px 3px;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  white-space: nowrap;
}

.booking-actions {
  margin-top: 0.75rem;
}

.payment-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pay-button {
  padding: 0.625rem 1.25rem;
  background: var(--button-success-bg);
  color: var(--text-secondary);
  border: 1px solid var(--button-success-border);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
}

.pay-button:hover:not(:disabled) {
  background: var(--button-success-hover-bg);
  border-color: var(--button-success-hover-border);
  box-shadow: 0 4px 12px var(--button-success-shadow);
}

@media (max-width: 768px) {
  .booking-card {
    flex-direction: row;
    align-items: flex-start;
    padding: 1rem;
    gap: 1rem;
  }

  .movie-poster {
    width: 60px;
    height: 90px;
  }

  .movie-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .booking-actions {
    margin-top: 0.5rem;
  }

  .payment-row {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>

