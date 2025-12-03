<template>
  <div class="seat-canvas-container">
    <div class="canvas-wrapper">
      <canvas
        ref="canvasRef"
        @click="handleCanvasClick"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      ></canvas>
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn">+</button>
        <button @click="zoomOut" class="zoom-btn">—</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Seat } from '@/types/api';

interface Props {
  rows: number;
  seatsPerRow: number;
  bookedSeats: Seat[];
  selectedSeats?: Seat[];
}

const props = withDefaults(defineProps<Props>(), {
  selectedSeats: () => [],
});

const emit = defineEmits<{
  'update:selectedSeats': [seats: Seat[]];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const localSelectedSeats = ref<Seat[]>([]);
const hoveredSeat = ref<{ row: number; seat: number } | null>(null);

const bookedSeatsMap = computed(() => {
  const map = new Map<string, boolean>();
  props.bookedSeats.forEach((seat) => {
    map.set(`${seat.rowNumber}-${seat.seatNumber}`, true);
  });
  return map;
});

const selectedSeatsMap = computed(() => {
  const map = new Map<string, boolean>();
  localSelectedSeats.value.forEach((seat) => {
    map.set(`${seat.rowNumber}-${seat.seatNumber}`, true);
  });
  return map;
});

const SEAT_SIZE = 20;
const SEAT_SPACING = 10;
const ROW_SPACING = 20;
const ROW_LABEL_WIDTH = 50;
const SCREEN_HEIGHT = 50;
const PADDING = 50;

const getSeatPosition = (row: number, seat: number) => {
  const x = ROW_LABEL_WIDTH + (seat - 1) * (SEAT_SIZE + SEAT_SPACING) + SEAT_SIZE / 2;
  const y = SCREEN_HEIGHT + 20 + (row - 1) * (SEAT_SIZE + ROW_SPACING);
  return { x, y };
};

const getSeatAtPosition = (x: number, y: number): { row: number; seat: number } | null => {
  const canvas = canvasRef.value;
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const canvasX = (x - rect.left) * scaleX;
  const canvasY = (y - rect.top) * scaleY;

  for (let row = 1; row <= props.rows; row++) {
    for (let seat = 1; seat <= props.seatsPerRow; seat++) {
      const pos = getSeatPosition(row, seat);
      const dx = canvasX - pos.x;
      const dy = canvasY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= SEAT_SIZE / 2 + 2) {
        return { row, seat };
      }
    }
  }
  return null;
};

const isSeatBooked = (row: number, seat: number): boolean => {
  return bookedSeatsMap.value.get(`${row}-${seat}`) === true;
};

const isSeatSelected = (row: number, seat: number): boolean => {
  return selectedSeatsMap.value.get(`${row}-${seat}`) === true;
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = ROW_LABEL_WIDTH + (props.seatsPerRow - 1) * (SEAT_SIZE + SEAT_SPACING) + SEAT_SIZE + PADDING;
  const height = SCREEN_HEIGHT + props.rows * (SEAT_SIZE + ROW_SPACING) + PADDING;

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const screenY = SCREEN_HEIGHT / 2;
  const screenStartX = ROW_LABEL_WIDTH;
  const screenEndX = ROW_LABEL_WIDTH + (props.seatsPerRow - 1) * (SEAT_SIZE + SEAT_SPACING) + SEAT_SIZE;
  const screenCenterX = (screenStartX + screenEndX) / 2;
  const screenRadius = (screenEndX - screenStartX) / 2;
  ctx.arc(screenCenterX, screenY, screenRadius, Math.PI, 0, false);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Экран', screenCenterX, screenY - 15);

  for (let row = 1; row <= props.rows; row++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(row.toString(), ROW_LABEL_WIDTH - 10, getSeatPosition(row, 1).y);
    ctx.fillText(row.toString(), width - 10, getSeatPosition(row, 1).y);
  }

  for (let row = 1; row <= props.rows; row++) {
    for (let seat = 1; seat <= props.seatsPerRow; seat++) {
      const pos = getSeatPosition(row, seat);
      const booked = isSeatBooked(row, seat);
      const selected = isSeatSelected(row, seat);
      const hovered = hoveredSeat.value?.row === row && hoveredSeat.value?.seat === seat;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, SEAT_SIZE / 2, 0, Math.PI * 2);

      if (booked) {
        ctx.fillStyle = '#9e9e9e';
        ctx.strokeStyle = '#757575';
      } else if (selected) {
        ctx.fillStyle = '#64b5f6';
        ctx.strokeStyle = '#42a5f5';
      } else if (hovered) {
        ctx.fillStyle = '#90caf9';
        ctx.strokeStyle = '#64b5f6';
      } else {
        ctx.fillStyle = '#64b5f6';
        ctx.strokeStyle = '#42a5f5';
      }

      ctx.fill();
      ctx.lineWidth = booked ? 1 : 1.5;
      ctx.stroke();
    }
  }
};

const handleCanvasClick = (e: MouseEvent) => {
  const seat = getSeatAtPosition(e.clientX, e.clientY);
  if (!seat) return;

  const { row, seat: seatNum } = seat;
  if (isSeatBooked(row, seatNum)) return;

  const index = localSelectedSeats.value.findIndex(
    (s) => s.rowNumber === row && s.seatNumber === seatNum
  );

  if (index !== -1) {
    localSelectedSeats.value.splice(index, 1);
  } else {
    localSelectedSeats.value.push({ rowNumber: row, seatNumber: seatNum });
  }

  emit('update:selectedSeats', [...localSelectedSeats.value]);
  draw();
};

const handleMouseMove = (e: MouseEvent) => {
  const seat = getSeatAtPosition(e.clientX, e.clientY);
  hoveredSeat.value = seat;
  draw();
};

const handleMouseLeave = () => {
  hoveredSeat.value = null;
  draw();
};

const zoomIn = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const currentWidth = parseInt(canvas.style.width) || canvas.width;
  canvas.style.width = `${currentWidth * 1.1}px`;
  canvas.style.height = `${(currentWidth * 1.1 * canvas.height) / canvas.width}px`;
};

const zoomOut = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const currentWidth = parseInt(canvas.style.width) || canvas.width;
  canvas.style.width = `${currentWidth * 0.9}px`;
  canvas.style.height = `${(currentWidth * 0.9 * canvas.height) / canvas.width}px`;
};

watch(
  () => props.selectedSeats,
  (newSeats) => {
    if (newSeats && newSeats.length !== localSelectedSeats.value.length) {
      localSelectedSeats.value = [...(newSeats || [])];
      draw();
    }
  },
  { immediate: true }
);

watch([() => props.rows, () => props.seatsPerRow, () => props.bookedSeats], () => {
  draw();
});

onMounted(() => {
  draw();
  window.addEventListener('resize', draw);
});

onUnmounted(() => {
  window.removeEventListener('resize', draw);
});
</script>

<style scoped>
.seat-canvas-container {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
}

.canvas-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: auto;
}

canvas {
  display: block;
  cursor: pointer;
}

.zoom-controls {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .canvas-wrapper {
    padding: 1rem;
  }

  .zoom-controls {
    right: 10px;
  }

  .zoom-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
}
</style>

