<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          @click="removeNotification(notification.id)"
        >
          <div class="notification-icon">
            <span v-if="notification.type === 'success'">✓</span>
            <span v-else-if="notification.type === 'error'">✕</span>
            <span v-else-if="notification.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
          <button class="notification-close" @click.stop="removeNotification(notification.id)">
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications';

const { notifications, removeNotification } = useNotifications();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  min-width: 300px;
}

.notification:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.notification-success {
  border-left: 4px solid #4ade80;
}

.notification-error {
  border-left: 4px solid #f87171;
}

.notification-warning {
  border-left: 4px solid #fbbf24;
}

.notification-info {
  border-left: 4px solid #60a5fa;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.notification-error .notification-icon {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.notification-warning .notification-icon {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.notification-info .notification-icon {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.notification-message {
  flex: 1;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile styles */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification {
    min-width: auto;
  }
}
</style>

