<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container glass-card">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="handleCancel" aria-label="Close">
              ×
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-message">{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-button modal-button-cancel glass-button" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button class="modal-button modal-button-confirm glass-button" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Подтверждение',
  message: 'Вы уверены, что хотите выполнить это действие?',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-glass-overlay);
  backdrop-filter: var(--blur-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-default);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--text-lighter);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: var(--bg-glass-hover);
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-message {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-default);
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.modal-button-cancel {
  color: var(--text-muted);
  border-color: var(--border-medium);
}

.modal-button-confirm {
  background: var(--button-danger-bg);
  color: var(--text-secondary);
  border-color: var(--button-danger-border);
}

.modal-button-confirm:hover {
  background: var(--button-danger-hover-bg);
  border-color: var(--button-danger-hover-border);
  box-shadow: 0 4px 12px var(--button-danger-shadow);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 90%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .modal-footer {
    padding: 1.25rem;
    flex-direction: column-reverse;
  }

  .modal-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
}
</style>

