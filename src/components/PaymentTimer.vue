<template>
  <span class="payment-timer">Осталось {{ formatTime(remainingSeconds) }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  bookedAt: string;
  paymentTimeSeconds: number;
}

const props = defineProps<Props>();

const remainingSeconds = ref(0);
let intervalId: number | null = null;

const calculateRemaining = () => {
  const bookedAtTime = new Date(props.bookedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - bookedAtTime) / 1000);
  const remaining = props.paymentTimeSeconds - elapsed;
  return Math.max(0, remaining);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const emit = defineEmits<{
  expired: [];
}>();

const updateTimer = () => {
  const prev = remainingSeconds.value;
  remainingSeconds.value = calculateRemaining();
  if (prev > 0 && remainingSeconds.value === 0) {
    emit('expired');
  }
};

onMounted(() => {
  updateTimer();
  intervalId = window.setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (!intervalId) return;
  clearInterval(intervalId);
});
</script>

<style scoped>
.payment-timer {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-weight: 400;
  white-space: nowrap;
}

/* Mobile styles */
@media (max-width: 768px) {
  .payment-timer {
    font-size: 0.8rem;
  }
}
</style>

