<template>
  <div class="app-layout">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from './Navigation.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 2rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

/* Mobile styles */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .main-content {
    padding: 1rem;
    border-left: none;
    margin-top: 70px;
  }
}
</style>

