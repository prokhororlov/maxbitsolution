<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`, 'glass-card']"
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
  cursor: pointer;
  pointer-events: auto;
  min-width: 300px;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: var(--shadow-xl);
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
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-disabled);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--transition-fast);
  flex-shrink: 0;
  line-height: 1;
}

.notification-close:hover {
  background: var(--bg-glass-hover);
  color: var(--text-muted);
}

.notification-enter-active {
  transition: var(--transition-default);
}

.notification-leave-active {
  transition: var(--transition-default);
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

