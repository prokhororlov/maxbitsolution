<template>
  <div class="seat-grid-container">
    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>
    </div>
    <div v-if="tooltip.visible" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div v-if="tooltip.hasPrice">Цена: {{ tooltip.price }} ₽</div>
      <div>Ряд: {{ tooltip.row }}</div>
      <div>Место: {{ tooltip.seat }}</div>
    </div>
    <div class="zoom-controls">
      <button class="zoom-btn" @click="zoomIn" aria-label="Увеличить">+</button>
      <button class="zoom-btn" @click="zoomOut" aria-label="Уменьшить">−</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

interface Seat {
  rowNumber: number;
  seatNumber: number;
}

interface Props {
  rows: number;
  seatsPerRow: number;
  bookedSeats: Seat[];
  selectedSeats?: Seat[];
  seatPrices?: Map<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  selectedSeats: () => [],
  seatPrices: () => new Map(),
});

const emit = defineEmits<{
  'update:selectedSeats': [seats: Seat[]];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const localSelectedSeats = ref<Seat[]>([]);
const minScale = 0.4;
const maxScale = 3;
const scale = ref(1);
const panX = ref(0);
const panY = ref(0);
const tooltip = ref({ visible: false, x: 0, y: 0, row: 0, seat: 0, price: 0, hasPrice: false });
const hoveredSeat = ref<{ row: number; seat: number } | null>(null);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0, panX: 0, panY: 0 });
const velocity = ref({ x: 0, y: 0 });
const lastMoveTime = ref(0);
const lastMovePos = ref({ x: 0, y: 0 });
const kineticAnimationId = ref<number | null>(null);
const hasNavigated = ref(false);
const dragThreshold = 5;
const clickStartPos = ref({ x: 0, y: 0 });
const isZooming = ref(false);
const isPinching = ref(false);
const pinchStartDistance = ref(0);
const pinchStartScale = ref(0);
const pinchCenter = ref({ x: 0, y: 0 });

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

const BASE_SEAT_SIZE = 16;
const BASE_SEAT_GAP = 16;
const BASE_ROW_GAP = 26;
const BASE_ROW_LABEL_WIDTH = 50;
const BASE_RIGHT_LABEL_OFFSET = 20;
const BASE_SCREEN_HEIGHT = 100;
const BASE_PADDING = 40;
const SCREEN_TO_SEATS_GAP = 50;
const HOVER_SCALE = 1.5;

const getSeatKey = (row: number, seat: number) => `${row}-${seat}`;
const isSeatBooked = (row: number, seat: number) => bookedSeatsMap.value.get(getSeatKey(row, seat)) === true;
const isSeatSelected = (row: number, seat: number) => selectedSeatsMap.value.get(getSeatKey(row, seat)) === true;

watch(
  () => props.selectedSeats,
  (newSeats) => {
    if (newSeats && newSeats.length !== localSelectedSeats.value.length) {
      localSelectedSeats.value = [...(newSeats || [])];
    }
  },
  { immediate: true }
);

const getSeatPosition = (row: number, seat: number) => {
  const x = BASE_PADDING + BASE_ROW_LABEL_WIDTH + (seat - 1) * (BASE_SEAT_SIZE + BASE_SEAT_GAP) + BASE_SEAT_SIZE / 2;
  const y = BASE_PADDING + BASE_SCREEN_HEIGHT + SCREEN_TO_SEATS_GAP + (row - 1) * (BASE_SEAT_SIZE + BASE_ROW_GAP) + BASE_SEAT_SIZE / 2;
  return { x, y, radius: BASE_SEAT_SIZE / 2 };
};

const getSeatAtPosition = (x: number, y: number): { row: number; seat: number } | null => {
  const adjustedX = (x - panX.value) / scale.value;
  const adjustedY = (y - panY.value) / scale.value;

  const seatX = adjustedX - BASE_PADDING - BASE_ROW_LABEL_WIDTH;
  const seatY = adjustedY - BASE_PADDING - BASE_SCREEN_HEIGHT - SCREEN_TO_SEATS_GAP;

  if (seatX < 0 || seatY < 0) return null;

  const seat = Math.floor(seatX / (BASE_SEAT_SIZE + BASE_SEAT_GAP)) + 1;
  const row = Math.floor(seatY / (BASE_SEAT_SIZE + BASE_ROW_GAP)) + 1;

  if (seat < 1 || seat > props.seatsPerRow || row < 1 || row > props.rows) return null;

  const pos = getSeatPosition(row, seat);
  const dx = adjustedX - pos.x;
  const dy = adjustedY - pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= pos.radius * 2) {
    return { row, seat };
  }

  return null;
};

const getContentSize = () => {
  const contentWidth = BASE_ROW_LABEL_WIDTH + props.seatsPerRow * (BASE_SEAT_SIZE + BASE_SEAT_GAP) - BASE_SEAT_GAP + BASE_RIGHT_LABEL_OFFSET;
  const contentHeight = BASE_SCREEN_HEIGHT + SCREEN_TO_SEATS_GAP + props.rows * (BASE_SEAT_SIZE + BASE_ROW_GAP) - BASE_ROW_GAP;
  return { width: contentWidth + BASE_PADDING * 2, height: contentHeight + BASE_PADDING * 2 };
};

const fitToScreen = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const { width: contentWidth, height: contentHeight } = getContentSize();
  
  const scaleX = (rect.width * 0.95) / contentWidth;
  const scaleY = (rect.height * 0.95) / contentHeight;
  
  scale.value = Math.min(scaleX, scaleY, 1);
};

const centerContent = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const { width: contentWidth, height: contentHeight } = getContentSize();
  const scaledWidth = contentWidth * scale.value;
  const scaledHeight = contentHeight * scale.value;

  panX.value = (rect.width - scaledWidth) / 2;
  panY.value = (rect.height - scaledHeight) / 2;
  clampCamera();
};

const getClampBoundsForScale = (currentScale: number) => {
  const canvas = canvasRef.value;
  if (!canvas) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  const rect = canvas.getBoundingClientRect();
  const { width: contentWidth, height: contentHeight } = getContentSize();
  const scaledWidth = contentWidth * currentScale;
  const scaledHeight = contentHeight * currentScale;

  if (scaledWidth <= rect.width && scaledHeight <= rect.height) {
    const centerX = (rect.width - scaledWidth) / 2;
    const centerY = (rect.height - scaledHeight) / 2;
    return {
      minX: centerX,
      maxX: centerX,
      minY: centerY,
      maxY: centerY,
    };
  }

  const minX = Math.min(0, rect.width - scaledWidth);
  const maxX = Math.max(0, rect.width - scaledWidth);
  const minY = Math.min(0, rect.height - scaledHeight);
  const maxY = Math.max(0, rect.height - scaledHeight);

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
};

const clampCamera = () => {
  if (isZooming.value) return;
  const bounds = getClampBoundsForScale(scale.value);
  panX.value = Math.max(bounds.minX, Math.min(bounds.maxX, panX.value));
  panY.value = Math.max(bounds.minY, Math.min(bounds.maxY, panY.value));
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.save();
  ctx.translate(panX.value, panY.value);
  ctx.scale(scale.value, scale.value);

  const { width: contentWidth, height: contentHeight } = getContentSize();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, contentWidth, contentHeight);

  ctx.fillStyle = '#e0e0e0';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Экран', contentWidth / 2, BASE_SCREEN_HEIGHT / 2);

  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const screenY = BASE_SCREEN_HEIGHT;
  const screenStartX = BASE_PADDING + BASE_ROW_LABEL_WIDTH;
  const screenEndX = BASE_PADDING + BASE_ROW_LABEL_WIDTH + props.seatsPerRow * (BASE_SEAT_SIZE + BASE_SEAT_GAP) - BASE_SEAT_GAP;
  const screenMidX = (screenStartX + screenEndX) / 2;
  const screenCurve = 50;
  ctx.moveTo(screenStartX, screenY);
  ctx.quadraticCurveTo(screenMidX, screenY - screenCurve, screenEndX, screenY);
  ctx.stroke();

  ctx.fillStyle = '#666666';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let row = 1; row <= props.rows; row++) {
    const y = BASE_PADDING + BASE_SCREEN_HEIGHT + SCREEN_TO_SEATS_GAP + (row - 1) * (BASE_SEAT_SIZE + BASE_ROW_GAP) + BASE_SEAT_SIZE / 2;
    ctx.fillText(row.toString(), BASE_PADDING + BASE_ROW_LABEL_WIDTH - 10 - 15, y);
    const rightLabelX = BASE_PADDING + BASE_ROW_LABEL_WIDTH + props.seatsPerRow * (BASE_SEAT_SIZE + BASE_SEAT_GAP) - BASE_SEAT_GAP + BASE_RIGHT_LABEL_OFFSET + 15;
    ctx.fillText(row.toString(), rightLabelX, y);
  }

  ctx.fillStyle = '#666666';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  for (let seat = 1; seat <= props.seatsPerRow; seat++) {
    const x = BASE_PADDING + BASE_ROW_LABEL_WIDTH + (seat - 1) * (BASE_SEAT_SIZE + BASE_SEAT_GAP) + BASE_SEAT_SIZE / 2;
    ctx.fillText(seat.toString(), x, BASE_PADDING + BASE_SCREEN_HEIGHT + SCREEN_TO_SEATS_GAP - 5 - 15);
  }

  for (let row = 1; row <= props.rows; row++) {
    for (let seat = 1; seat <= props.seatsPerRow; seat++) {
      const pos = getSeatPosition(row, seat);
      const booked = isSeatBooked(row, seat);
      const selected = isSeatSelected(row, seat);
      const isHovered = hoveredSeat.value?.row === row && hoveredSeat.value?.seat === seat;
      let radius = pos.radius;
      if (booked) {
        radius = pos.radius * 0.5;
      } else if (selected) {
        radius = pos.radius * 1.5;
      } else if (isHovered) {
        radius = pos.radius * HOVER_SCALE;
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);

      if (booked) {
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();
      } else if (selected) {
        ctx.fillStyle = '#66bb6a';
        ctx.fill();
      } else {
        ctx.fillStyle = '#02acf6';
        ctx.fill();
      }
    }
  }

  ctx.restore();
};

const stopKinetic = () => {
  if (kineticAnimationId.value !== null) {
    cancelAnimationFrame(kineticAnimationId.value);
    kineticAnimationId.value = null;
  }
};

const startKinetic = () => {
  const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2);
  if (speed < 0.1) {
    velocity.value.x = 0;
    velocity.value.y = 0;
    return;
  }
  stopKinetic();
  const friction = 0.92;
  const maxSpeed = 50;
  const clampedSpeed = Math.min(speed, maxSpeed);
  const normalizedX = velocity.value.x / speed;
  const normalizedY = velocity.value.y / speed;
  velocity.value.x = normalizedX * clampedSpeed;
  velocity.value.y = normalizedY * clampedSpeed;
  const animate = () => {
    const prevX = panX.value;
    const prevY = panY.value;
    velocity.value.x *= friction;
    velocity.value.y *= friction;
    const currentSpeed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2);
    if (currentSpeed < 0.1) {
      stopKinetic();
      return;
    }
    panX.value += velocity.value.x * 16;
    panY.value += velocity.value.y * 16;
    clampCamera();
    if (Math.abs(panX.value - prevX) < 0.01) velocity.value.x = 0;
    if (Math.abs(panY.value - prevY) < 0.01) velocity.value.y = 0;
    if (Math.abs(velocity.value.x) < 0.1 && Math.abs(velocity.value.y) < 0.1) {
      stopKinetic();
      return;
    }
    draw();
    kineticAnimationId.value = requestAnimationFrame(animate);
  };
  kineticAnimationId.value = requestAnimationFrame(animate);
};

const getDragDistance = (): number => {
  if (!isDragging.value) return 0;
  const deltaX = lastMovePos.value.x - clickStartPos.value.x;
  const deltaY = lastMovePos.value.y - clickStartPos.value.y;
  return Math.sqrt(deltaX ** 2 + deltaY ** 2);
};

const handlePointerDown = (e: PointerEvent) => {
  if (e.button !== 0 || isZooming.value) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  e.preventDefault();
  canvas.style.cursor = 'grabbing';
  tooltip.value.visible = false;
  isDragging.value = true;
  hasNavigated.value = false;
  const rect = canvas.getBoundingClientRect();
  const startX = e.clientX - rect.left;
  const startY = e.clientY - rect.top;
  dragStart.value = {
    x: startX,
    y: startY,
    panX: panX.value,
    panY: panY.value,
  };
  clickStartPos.value = { x: e.clientX, y: e.clientY };
  velocity.value = { x: 0, y: 0 };
  lastMoveTime.value = Date.now();
  lastMovePos.value = { x: e.clientX, y: e.clientY };
  stopKinetic();
  canvas.setPointerCapture(e.pointerId);
};

const handlePointerMove = (e: PointerEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  if (!isDragging.value || isZooming.value) {
    updateTooltip(e);
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  const deltaX = currentX - dragStart.value.x;
  const deltaY = currentY - dragStart.value.y;
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  if (distance > dragThreshold) {
    hasNavigated.value = true;
    canvas.style.cursor = 'grabbing';
  }
  panX.value = dragStart.value.panX + deltaX;
  panY.value = dragStart.value.panY + deltaY;

  const now = Date.now();
  const dt = now - lastMoveTime.value;
  if (dt > 0 && dt < 100) {
    velocity.value.x = (e.clientX - lastMovePos.value.x) / dt;
    velocity.value.y = (e.clientY - lastMovePos.value.y) / dt;
  }
  lastMoveTime.value = now;
  lastMovePos.value = { x: e.clientX, y: e.clientY };
  clampCamera();
  draw();
};

const updateTooltip = (e: MouseEvent | PointerEvent) => {
  if (isDragging.value) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const seat = getSeatAtPosition(x, y);
  if (seat) {
    const booked = isSeatBooked(seat.row, seat.seat);
    if (booked) {
      canvas.style.cursor = 'grab';
      tooltip.value.visible = false;
      if (hoveredSeat.value) {
        hoveredSeat.value = null;
        draw();
      }
      return;
    }
    const price = props.seatPrices.get(getSeatKey(seat.row, seat.seat));
    const hasPrice = price !== undefined;
    const pos = getSeatPosition(seat.row, seat.seat);
    const tooltipX = panX.value + pos.x * scale.value;
    const tooltipY = panY.value + pos.y * scale.value;
    
    canvas.style.cursor = 'pointer';
    tooltip.value = {
      visible: true,
      x: tooltipX,
      y: tooltipY - 10,
      row: seat.row,
      seat: seat.seat,
      price: hasPrice ? price : 0,
      hasPrice,
    };
    if (!hoveredSeat.value || hoveredSeat.value.row !== seat.row || hoveredSeat.value.seat !== seat.seat) {
      hoveredSeat.value = { row: seat.row, seat: seat.seat };
      draw();
    }
  } else {
    canvas.style.cursor = isDragging.value ? 'grabbing' : 'grab';
    tooltip.value.visible = false;
    if (hoveredSeat.value) {
      hoveredSeat.value = null;
      draw();
    }
  }
};

const handlePointerUp = (e: PointerEvent) => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.releasePointerCapture(e.pointerId);
  }
  
  const dragDistance = getDragDistance();
  const wasNavigating = isDragging.value && (hasNavigated.value || dragDistance > dragThreshold);
  
  isDragging.value = false;
  
  if (wasNavigating) {
    hasNavigated.value = true;
    setTimeout(() => {
      hasNavigated.value = false;
    }, 200);
    startKinetic();
    if (canvas) {
      canvas.style.cursor = 'grab';
    }
    return;
  }
  
  if (canvas && !isZooming.value) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const seat = getSeatAtPosition(x, y);
    if (seat) {
      const booked = isSeatBooked(seat.row, seat.seat);
      if (!booked) {
        const index = localSelectedSeats.value.findIndex(
          (s) => s.rowNumber === seat.row && s.seatNumber === seat.seat
        );
        if (index !== -1) {
          localSelectedSeats.value.splice(index, 1);
        } else {
          localSelectedSeats.value.push({ rowNumber: seat.row, seatNumber: seat.seat });
        }
        emit('update:selectedSeats', [...localSelectedSeats.value]);
        draw();
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'grab';
      }
    } else {
      canvas.style.cursor = 'grab';
    }
  } else if (canvas) {
    canvas.style.cursor = 'grab';
  }
  
  setTimeout(() => {
    hasNavigated.value = false;
  }, 10);
};

const handlePointerLeave = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.style.cursor = 'grab';
  }
  tooltip.value.visible = false;
  hoveredSeat.value = null;
  draw();
};

const handleWheel = (e: WheelEvent) => {
  if (isDragging.value) return;
  e.preventDefault();
  e.stopPropagation();
  hasNavigated.value = true;
  isZooming.value = true;
  stopKinetic();
  setTimeout(() => {
    hasNavigated.value = false;
    isZooming.value = false;
  }, 100);

  const delta = e.deltaY > 0 ? 0.92 : 1.08;
  const requestedScale = scale.value * delta;
  const newScale = Math.max(minScale, Math.min(maxScale, requestedScale));
  if (Math.abs(newScale - scale.value) < 0.001) {
    isZooming.value = false;
    return;
  }

  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const zoomPointX = e.clientX - rect.left;
  const zoomPointY = e.clientY - rect.top;

  const oldScale = scale.value;
  const bounds = getClampBoundsForScale(newScale);

  const worldX = (zoomPointX - panX.value) / oldScale;
  const worldY = (zoomPointY - panY.value) / oldScale;

  scale.value = newScale;

  let newCameraX = zoomPointX - worldX * newScale;
  let newCameraY = zoomPointY - worldY * newScale;

  newCameraX = Math.max(bounds.minX, Math.min(bounds.maxX, newCameraX));
  newCameraY = Math.max(bounds.minY, Math.min(bounds.maxY, newCameraY));

  panX.value = newCameraX;
  panY.value = newCameraY;
  draw();
};

const zoomAtPoint = (x: number, y: number, delta: number) => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const zoomPointX = x - rect.left;
  const zoomPointY = y - rect.top;

  const oldScale = scale.value;
  const requestedScale = delta > 0 ? oldScale * 1.1 : oldScale / 1.1;
  const newScale = Math.max(minScale, Math.min(maxScale, requestedScale));

  if (Math.abs(newScale - oldScale) < 0.001) return;

  const bounds = getClampBoundsForScale(newScale);
  const worldX = (zoomPointX - panX.value) / oldScale;
  const worldY = (zoomPointY - panY.value) / oldScale;

  scale.value = newScale;

  let newCameraX = zoomPointX - worldX * newScale;
  let newCameraY = zoomPointY - worldY * newScale;

  newCameraX = Math.max(bounds.minX, Math.min(bounds.maxX, newCameraX));
  newCameraY = Math.max(bounds.minY, Math.min(bounds.maxY, newCameraY));

  panX.value = newCameraX;
  panY.value = newCameraY;
  draw();
};

const zoomIn = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 1);
};

const zoomOut = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  zoomAtPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, -1);
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    if (isDragging.value) {
      isDragging.value = false;
      stopKinetic();
    }
    e.preventDefault();
    hasNavigated.value = true;
    isPinching.value = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pinchCenter.value.x = (touch1.clientX + touch2.clientX) / 2 - rect.left;
    pinchCenter.value.y = (touch1.clientY + touch2.clientY) / 2 - rect.top;
    pinchStartDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    pinchStartScale.value = scale.value;
  } else if (e.touches.length === 1 && !isZooming.value && !isPinching.value) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.value;
    if (!canvas) return;
    tooltip.value.visible = false;
    isDragging.value = true;
    hasNavigated.value = false;
    const rect = canvas.getBoundingClientRect();
    dragStart.value = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      panX: panX.value,
      panY: panY.value,
    };
    velocity.value = { x: 0, y: 0 };
    lastMoveTime.value = Date.now();
    lastMovePos.value = { x: touch.clientX, y: touch.clientY };
    stopKinetic();
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2 && isPinching.value) {
    if (isDragging.value) {
      isDragging.value = false;
      stopKinetic();
    }
    e.preventDefault();
    hasNavigated.value = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const zoomPointX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
    const zoomPointY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    const scaleDelta = distance / pinchStartDistance.value;
    const requestedScale = pinchStartScale.value * scaleDelta;
    const newScale = Math.max(minScale, Math.min(maxScale, requestedScale));
    if (Math.abs(newScale - scale.value) < 0.001) {
      return;
    }
    isZooming.value = true;
    const oldScale = scale.value;

    const worldX = (zoomPointX - panX.value) / oldScale;
    const worldY = (zoomPointY - panY.value) / oldScale;

    scale.value = newScale;

    let newCameraX = zoomPointX - worldX * newScale;
    let newCameraY = zoomPointY - worldY * newScale;

    const bounds = getClampBoundsForScale(newScale);
    newCameraX = Math.max(bounds.minX, Math.min(bounds.maxX, newCameraX));
    newCameraY = Math.max(bounds.minY, Math.min(bounds.maxY, newCameraY));

    panX.value = newCameraX;
    panY.value = newCameraY;
    setTimeout(() => {
      isZooming.value = false;
    }, 50);
    draw();
  } else if (
    e.touches.length === 1 &&
    isDragging.value &&
    !isPinching.value &&
    !isZooming.value
  ) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.value;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    const deltaX = currentX - dragStart.value.x;
    const deltaY = currentY - dragStart.value.y;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    if (distance > dragThreshold) {
      hasNavigated.value = true;
    }
    panX.value = dragStart.value.panX + deltaX;
    panY.value = dragStart.value.panY + deltaY;

    const now = Date.now();
    const dt = now - lastMoveTime.value;
    if (dt > 0 && dt < 100) {
      velocity.value.x = (touch.clientX - lastMovePos.value.x) / dt;
      velocity.value.y = (touch.clientY - lastMovePos.value.y) / dt;
    }
    lastMoveTime.value = now;
    lastMovePos.value = { x: touch.clientX, y: touch.clientY };
    clampCamera();
    draw();
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.touches.length === 0) {
    e.preventDefault();
    const dragDistance = getDragDistance();
    const wasNavigating =
      hasNavigated.value || isPinching.value || dragDistance > dragThreshold;
    if (wasNavigating) {
      hasNavigated.value = true;
      setTimeout(() => {
        hasNavigated.value = false;
      }, 200);
    }
    isPinching.value = false;
    isDragging.value = false;
    isZooming.value = false;
    startKinetic();
  } else if (e.touches.length === 1) {
    isPinching.value = false;
    isZooming.value = false;
  }
};

const resetSelection = () => {
  localSelectedSeats.value = [];
  emit('update:selectedSeats', []);
  draw();
};

const handleResize = () => {
  nextTick(() => {
    fitToScreen();
    centerContent();
    draw();
  });
};

watch([() => props.rows, () => props.seatsPerRow, () => props.bookedSeats], () => {
  nextTick(() => {
    fitToScreen();
    centerContent();
    draw();
  });
});

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.addEventListener('wheel', handleWheel, { passive: false });
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);

  window.addEventListener('resize', handleResize);
  nextTick(() => {
    fitToScreen();
    centerContent();
    draw();
  });
});

onUnmounted(() => {
  stopKinetic();
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerUp);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
  }
  window.removeEventListener('resize', handleResize);
});

defineExpose({
  resetSelection,
});
</script>

<style scoped>
.seat-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  border-radius: 8px;
}

.tooltip {
  position: absolute;
  background: #ffffff;
  color: #333333;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #ffffff;
}

.tooltip div {
  margin: 2px 0;
}

.zoom-controls {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #ffffff;
  color: #333;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.zoom-btn:active {
  transform: scale(0.95);
}
</style>
