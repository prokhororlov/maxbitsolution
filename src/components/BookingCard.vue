<template>
  <div class="booking-card">
    <img
      v-if="moviePoster"
      :src="`http://localhost:3022${moviePoster}`"
      :alt="movieTitle"
      class="movie-poster"
    />
    <div class="booking-info">
      <p><strong>Фильм:</strong> {{ movieTitle }}</p>
      <p><strong>Кинотеатр:</strong> {{ cinemaName ? cinemaName.charAt(0).toUpperCase() + cinemaName.slice(1).toLowerCase() : '' }}</p>
      <p><strong>Дата и время:</strong> {{ formatDateTime(sessionStartTime) }}</p>
      <p class="seats-info">
        <strong>Места:</strong>
        <span
          v-for="(group, index) in formattedSeatsGroups"
          :key="index"
          class="seat-group"
        >
          {{ group }}
        </span>
      </p>
    </div>
    <div v-if="showPayment" class="booking-actions">
      <button @click="handlePayment" :disabled="isPaying" class="pay-button">
        Оплатить
      </button>
      <PaymentTimer
        v-if="showTimer"
        :booked-at="booking.bookedAt"
        :payment-time-seconds="paymentTimeSeconds"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatDateTime } from '@/utils/date';
import PaymentTimer from './PaymentTimer.vue';

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
}>();

const isPaying = computed(() => false);

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
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 1rem;
  display: flex;
  gap: 1.5rem;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.movie-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.booking-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.3);
}

.booking-info {
  flex: 1;
}

.booking-info p {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.booking-info strong {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.seats-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.seat-group {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  white-space: nowrap;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.pay-button {
  padding: 0.625rem 1.25rem;
  background: rgba(76, 175, 80, 0.2);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(76, 175, 80, 0.4);
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.pay-button:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.3);
  border-color: rgba(76, 175, 80, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.pay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile styles */
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

  .booking-actions {
    width: 100%;
    align-items: stretch;
  }

  .pay-button {
    width: 100%;
  }
}
</style>

