<template>
  <div class="movies-page">
    <h1>Фильмы</h1>
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table class="movies-table">
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
                  :src="`http://localhost:3022${movie.posterImage}`"
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
                class="view-sessions-button"
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
          class="movie-card"
          @click="$router.push({ name: 'movie-detail', params: { id: movie.id } })"
        >
          <img
            :src="`http://localhost:3022${movie.posterImage}`"
            :alt="movie.title"
            class="card-poster"
          />
          <div class="card-content">
            <h3 class="card-title">{{ movie.title }}</h3>
            <div class="card-meta">
              <span class="card-duration">{{ formatDuration(movie.lengthMinutes) }}</span>
              <span class="card-rating">⭐ {{ movie.rating }}</span>
            </div>
            <router-link
              :to="{ name: 'movie-detail', params: { id: movie.id } }"
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
import { ref, onMounted } from 'vue';
import { apiClient } from '@/utils/api';
import { formatDuration } from '@/utils/date';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterImage: string;
  lengthMinutes: number;
  description: string;
}

const movies = ref<Movie[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(() => {
  apiClient
    .get('/movies')
    .then((response) => {
      movies.value = response.data;
    })
    .catch((err) => {
      error.value = err.response?.data?.message || 'Ошибка загрузки фильмов';
    })
    .finally(() => {
      loading.value = false;
    });
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
  color: rgba(255, 255, 255, 0.8);
}

.error {
  color: #ff6b6b;
}

.movies-table {
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

.movies-table th {
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

.movies-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.3s ease;
}

.movies-table tr:hover td {
  background: rgba(255, 255, 255, 0.08);
}

.movies-table tr:last-child td {
  border-bottom: none;
}

.movie-row {
  cursor: pointer;
  transition: all 0.3s ease;
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
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.poster:hover {
  transform: scale(1.05);
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

.movies-table {
  display: none;
}

.movies-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.movie-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 1rem;
  min-width: 0;
  overflow: hidden;
}

.movie-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.card-button {
  margin-top: auto;
  padding: 0.5rem 1rem;
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
  width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
  flex-shrink: 0;
}

.card-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Tablet - 2 columns */
@media (max-width: 1200px) {
  .movies-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile - 1 column */
@media (max-width: 768px) {
  .movies-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style>

