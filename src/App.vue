<template>
  <AppLayout />
  <NotificationContainer />
</template>

<script setup lang="ts">
import AppLayout from './components/AppLayout.vue';
import NotificationContainer from './components/NotificationContainer.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
  background: url('/background.webp') center center / cover no-repeat fixed;
  background-color: #0a0a0a;
  color: #fff;
  line-height: 1.6;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
  pointer-events: none;
}

#app {
  min-height: 100vh;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

p {
  font-size: 1rem;
  line-height: 1.6;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
  }

  body {
    background-attachment: scroll;
  }
}
</style>

