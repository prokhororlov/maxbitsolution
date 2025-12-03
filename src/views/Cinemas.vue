<template>
  <div class="cinemas-page">
    <h1>Кинотеатры</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="cinemas-table">
        <thead>
          <tr>
            <th>Кинотеатр</th>
            <th>Адрес</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cinema in cinemas"
            :key="cinema.id"
            class="cinema-row"
            @click="$router.push({ name: 'cinema-detail', params: { id: cinema.id } })"
          >
            <td>{{ formatCinemaName(cinema.name) }}</td>
            <td>{{ cinema.address }}</td>
            <td>
              <router-link
                :to="{ name: 'cinema-detail', params: { id: cinema.id } }"
                class="view-sessions-button"
                @click.stop
              >
                Посмотреть сеансы
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="cinemas-cards">
        <div
          v-for="cinema in cinemas"
          :key="cinema.id"
          class="cinema-card"
          @click="$router.push({ name: 'cinema-detail', params: { id: cinema.id } })"
        >
          <div class="card-content">
            <h3 class="card-title">{{ formatCinemaName(cinema.name) }}</h3>
            <p class="card-address">{{ cinema.address }}</p>
            <router-link
              :to="{ name: 'cinema-detail', params: { id: cinema.id } }"
              class="card-button"
              @click.stop
            >
              Посмотреть сеансы
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRootStore } from '@/stores';
import { formatCinemaName } from '@/utils/format';

const $ = useRootStore();
const cinemas = computed(() => $.cinemas.cinemas);
const loading = computed(() => $.cinemas.loading);
const error = computed(() => $.cinemas.error);

onMounted(() => {
  $.cinemas.fetchCinemas();
});
</script>

<style scoped>
.cinemas-page {
  padding: 0;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.error {
  color: #ff6b6b;
}

.cinemas-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.cinemas-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.9);
}

.cinemas-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.3s ease;
}

.cinemas-table tr:hover td {
  background: rgba(255, 255, 255, 0.08);
}

.cinemas-table tr:last-child td {
  border-bottom: none;
}

.cinema-row {
  cursor: pointer;
  transition: all 0.3s ease;
}

.cinema-row:hover {
  transform: scale(1.01);
}

.view-sessions-button {
  padding: 0.625rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-sessions-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cinemas-cards {
  display: none;
}

.cinema-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cinema-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: rgba(255, 255, 255, 0.98);
  line-height: 1.3;
}

.card-address {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.card-button {
  margin-top: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  align-self: flex-start;
}

.card-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Tablet and smaller screens - switch to cards */
@media (max-width: 1059px) {
  .cinemas-table {
    display: none;
  }

  .cinemas-cards {
    display: block;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
  }
}
</style>

