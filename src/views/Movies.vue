<template>
  <div class="movies-page">
    <h1>Фильмы</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="movies-table glass-card">
        <thead>
          <tr>
            <th>Название</th>
            <th>Продолжительность</th>
            <th>Рейтинг</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="movie in movies"
            :key="movie.id"
            class="movie-row"
            @click="$router.push({ name: 'movie-detail', params: { id: movie.id } })"
          >
            <td>
              <div class="movie-info">
                <img
                  :src="getImageUrl(movie.posterImage)"
                  :alt="movie.title"
                  class="poster"
                />
                <span>{{ movie.title }}</span>
              </div>
            </td>
            <td>{{ formatDuration(movie.lengthMinutes) }}</td>
            <td>{{ movie.rating }}</td>
            <td>
              <router-link
                :to="{ name: 'movie-detail', params: { id: movie.id } }"
                class="view-sessions-button glass-button"
                @click.stop
              >
                Посмотреть сеансы
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="movies-cards">
        <div
          v-for="movie in movies"
          :key="movie.id"
          class="movie-card glass-card"
          @click="$router.push({ name: 'movie-detail', params: { id: movie.id } })"
        >
          <img
            :src="getImageUrl(movie.posterImage)"
            :alt="movie.title"
            class="card-poster"
          />
          <div class="card-content">
            <h3 class="card-title">{{ movie.title }}</h3>
            <div class="card-meta">
              <span class="card-duration">⏱️ {{ formatDuration(movie.lengthMinutes) }}</span>
              <span class="card-rating">⭐ {{ movie.rating }}</span>
            </div>
            <router-link
              :to="{ name: 'movie-detail', params: { id: movie.id } }"
              class="card-button glass-button"
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
import { formatDuration } from '@/utils/date';
import { getImageUrl } from '@/config';

const $ = useRootStore();
const movies = computed(() => $.movies.movies);
const loading = computed(() => $.movies.loading);
const error = computed(() => $.movies.error);

onMounted(() => {
  $.movies.fetchMovies();
});
</script>

<style scoped>
.movies-page {
  padding: 0;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}

.error {
  color: #ff6b6b;
}

.movies-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.movies-table th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  background: var(--bg-glass-hover);
  border-bottom: 1px solid var(--border-default);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.movies-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--bg-glass-light);
  background: var(--bg-glass-light);
  transition: var(--transition-default);
}

.movies-table tr:hover td {
  background: var(--bg-glass-hover);
}

.movies-table tr:last-child td {
  border-bottom: none;
}

.movie-row {
  cursor: pointer;
  transition: var(--transition-default);
}

.movie-row:hover {
  transform: scale(1.01);
}

.movie-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.poster {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-default);
}

.poster:hover {
  transform: scale(1.05);
}

.view-sessions-button {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.movies-table {
  display: none;
}

.movies-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.movie-card {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  min-width: 0;
  overflow: hidden;
}

.card-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-lighter);
}

.card-button {
  margin-top: auto;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
  flex-shrink: 0;
}

/* Tablet - 2 columns */
@media (max-width: 1280px) {
  .movies-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile - 1 column */
@media (max-width: 992px) {
  .movies-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.25rem;
  }
}
</style>

