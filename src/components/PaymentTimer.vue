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

const updateTimer = () => {
  remainingSeconds.value = calculateRemaining();
};

onMounted(() => {
  updateTimer();
  intervalId = window.setInterval(updateTimer, 1000);
});

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.payment-timer {
  color: rgba(255, 152, 0, 0.9);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 152, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  display: inline-block;
}

/* Mobile styles */
@media (max-width: 768px) {
  .payment-timer {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }
}
</style>

