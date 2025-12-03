<template>
  <nav class="navigation" :class="{ 'mobile-open': isMobileMenuOpen }" ref="navigationRef">
    <div class="mobile-header">
      <h2 class="mobile-header-title">Кинотеатр</h2>
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    <ul class="nav-list">
      <li>
        <router-link to="/movies" class="nav-item" :class="{ active: isMoviesActive }" @click="closeMobileMenu">
          🎬 Фильмы
        </router-link>
      </li>
      <li>
        <router-link
          to="/cinemas"
          class="nav-item"
          :class="{ active: isCinemasActive }"
          @click="closeMobileMenu"
        >
          🎭 Кинотеатры
        </router-link>
      </li>
      <li v-if="isAuthenticated">
        <router-link
          to="/my-bookings"
          class="nav-item"
          :class="{ active: isMyBookingsActive }"
          @click="closeMobileMenu"
        >
          🎫 Мои билеты
        </router-link>
      </li>
      <li>
        <router-link
          v-if="!isAuthenticated"
          to="/login"
          class="nav-item"
          :class="{ active: isLoginActive }"
          @click="closeMobileMenu"
        >
          🔐 Вход
        </router-link>
        <button v-else @click="showLogoutModal" class="nav-item nav-button">🚪 Выход</button>
      </li>
    </ul>
    <ConfirmModal
      :is-open="isLogoutModalOpen"
      title="Выход из системы"
      message="Вы уверены, что хотите выйти из системы?"
      confirm-text="Выйти"
      cancel-text="Отмена"
      @confirm="handleLogout"
      @cancel="hideLogoutModal"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRootStore } from '@/stores';
import ConfirmModal from './ConfirmModal.vue';

const $ = useRootStore();
const router = useRouter();
const route = useRoute();
const isAuthenticated = computed(() => $.auth.isAuthenticated);
const isMobileMenuOpen = ref(false);
const isLogoutModalOpen = ref(false);
const navigationRef = ref<HTMLElement | null>(null);

// Блокировка скролла body при открытом меню
const lockBodyScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

const unlockBodyScroll = () => {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

// Отслеживание открытия/закрытия меню для блокировки скролла
watch(isMobileMenuOpen, (isOpen) => {
  if (isOpen) {
    lockBodyScroll();
  } else {
    unlockBodyScroll();
  }
});

// Обработчик клика вне меню
const handleClickOutside = (event: MouseEvent) => {
  if (isMobileMenuOpen.value && navigationRef.value) {
    const target = event.target as HTMLElement;
    if (!navigationRef.value.contains(target)) {
      closeMobileMenu();
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  unlockBodyScroll(); // Убеждаемся, что скролл разблокирован при размонтировании
});

// Функции для проверки активного маршрута на основе path
const isMoviesActive = computed(() => {
  return route.path === '/movies' || route.path.startsWith('/movies/');
});

const isCinemasActive = computed(() => {
  return route.path === '/cinemas' || route.path.startsWith('/cinemas/');
});

const isMyBookingsActive = computed(() => {
  return route.path === '/my-bookings';
});

const isLoginActive = computed(() => {
  return route.path === '/login' || route.path === '/register';
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const showLogoutModal = () => {
  isLogoutModalOpen.value = true;
  closeMobileMenu();
};

const hideLogoutModal = () => {
  isLogoutModalOpen.value = false;
};

const handleLogout = () => {
  hideLogoutModal();
  $.auth.logout();
  router.push({ name: 'movies' });
};
</script>

<style scoped>
.navigation {
  width: 240px;
  padding: 2rem 1.5rem;
  border-right: 1px solid var(--border-default);
  background: var(--bg-glass);
  backdrop-filter: var(--blur-md);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-shrink: 0;
}

.mobile-menu-toggle {
  display: none;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: block;
  padding: 0.875rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  margin-bottom: 0.5rem;
  cursor: pointer;
  background: var(--bg-glass-light);
  width: 100%;
  text-align: left;
  transition: var(--transition-default);
  font-size: 0.95rem;
  font-weight: 500;
  backdrop-filter: var(--blur-sm);
}

.nav-item:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-medium);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.nav-item.active {
  background: var(--bg-glass-active);
  border-color: var(--border-strong);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
}

.nav-button {
  border: none;
  font-size: inherit;
  font-family: inherit;
}

.mobile-overlay {
  display: none;
}

.mobile-header {
  display: none;
}

.mobile-header-title {
  display: none;
}

@media (max-width: 768px) {
  .navigation {
    width: 100%;
    height: auto;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--border-default);
    background: var(--bg-glass);
    backdrop-filter: var(--blur-md);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    overflow: visible;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--border-default);
  }

  .mobile-header-title {
    display: block;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-secondary);
    flex: 1;
    text-align: left;
  }

  .mobile-menu-toggle {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: var(--bg-glass-hover);
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    padding: 0.5rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
    backdrop-filter: var(--blur-sm);
    transition: var(--transition-default);
    position: relative;
    z-index: 1002;
    order: 2;
  }

  .mobile-menu-toggle:hover {
    background: var(--bg-glass-active);
  }

  .mobile-menu-toggle span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text-muted);
    border-radius: 2px;
    transition: var(--transition-default);
    position: absolute;
  }

  .mobile-menu-toggle span:nth-child(1) {
    top: 11px;
  }

  .mobile-menu-toggle span:nth-child(2) {
    top: 19px;
  }

  .mobile-menu-toggle span:nth-child(3) {
    top: 27px;
  }

  .navigation.mobile-open .mobile-menu-toggle span:nth-child(1) {
    transform: rotate(45deg);
    top: 19px;
  }

  .navigation.mobile-open .mobile-menu-toggle span:nth-child(2) {
    opacity: 0;
  }

  .navigation.mobile-open .mobile-menu-toggle span:nth-child(3) {
    transform: rotate(-45deg);
    top: 19px;
  }

  .nav-list {
    display: none;
    padding: 1rem;
    margin: 0;
    max-height: calc(100vh - 70px);
    overflow-y: visible;
    overflow-x: visible;
  }

  .navigation.mobile-open .nav-list {
    display: block;
  }

  .nav-item {
    font-size: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
  }

  .nav-item:hover {
    transform: none;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: var(--bg-glass-overlay);
    backdrop-filter: var(--blur-sm);
    z-index: 999;
    pointer-events: auto;
  }

  .mobile-header {
    position: relative;
    z-index: 1002;
    background: var(--bg-glass);
    backdrop-filter: var(--blur-md);
  }

  .nav-list {
    position: relative;
    z-index: 1002;
    background: var(--bg-glass);
    backdrop-filter: var(--blur-md);
  }
}
</style>

