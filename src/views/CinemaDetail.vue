<template>
  <div class="cinema-detail-page">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="cinema && groupedByDate.length > 0" class="cinema-content">
      <h1>{{ cinema.name.charAt(0).toUpperCase() + cinema.name.slice(1).toLowerCase() }}</h1>
      <div class="date-groups">
        <div
          v-for="dateGroup in groupedByDate"
          :key="dateGroup.date"
          class="date-group"
        >
          <h2 class="date-header">{{ dateGroup.date }}</h2>
          <div class="movies-cards">
            <div
              v-for="movieData in dateGroup.movies"
              :key="movieData.movie.id"
              class="movie-card"
            >
              <img
                :src="`http://localhost:3022${movieData.movie.posterImage}`"
                :alt="movieData.movie.title"
                class="card-poster"
              />
              <div class="card-content">
                <h3 class="card-title">{{ movieData.movie.title }}</h3>
                <div class="card-meta">
                  <span class="card-duration">{{ formatDuration(movieData.movie.lengthMinutes) }}</span>
                  <span class="card-rating">⭐ {{ movieData.movie.rating }}</span>
                </div>
                <div class="session-times">
                  <router-link
                    v-for="session in movieData.sessions"
                    :key="session.id"
                    :to="{ name: 'booking', params: { sessionId: session.id } }"
                    class="session-time-button"
                    @click.stop
                  >
                    {{ formatTime(session.startTime) }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@/utils/api';
import { formatDate, formatTime, formatDuration } from '@/utils/date';

interface Cinema {
  id: number;
  name: string;
  address: string;
}

interface MovieSession {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
}

interface Movie {
  id: number;
  title: string;
  posterImage: string;
  lengthMinutes: number;
  rating: number;
}

interface MovieWithSessions {
  movie: Movie;
  sessions: MovieSession[];
}

interface DateGroup {
  date: string;
  dateTimestamp: number;
  movies: MovieWithSessions[];
}

const route = useRoute();
const cinema = ref<Cinema | null>(null);
const sessions = ref<MovieSession[]>([]);
const movies = ref<Movie[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const groupedByDate = computed(() => {
  const dateMap = new Map<string, { dateKey: string; dateTimestamp: number; movieMap: Map<number, MovieWithSessions> }>();
  const now = new Date();

  sessions.value
    .filter((session) => {
      // Фильтруем прошедшие сеансы
      return new Date(session.startTime) > now;
    })
    .forEach((session) => {
      const movie = movies.value.find((m) => m.id === session.movieId);
      if (!movie) return;

      const dateKey = formatDate(session.startTime);
      const sessionDate = new Date(session.startTime);
      // Получаем начало дня для правильной сортировки
      const dateTimestamp = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate()).getTime();

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          dateKey,
          dateTimestamp,
          movieMap: new Map(),
        });
      }

      const dateGroup = dateMap.get(dateKey)!;

      if (!dateGroup.movieMap.has(movie.id)) {
        dateGroup.movieMap.set(movie.id, {
          movie,
          sessions: [],
        });
      }

      dateGroup.movieMap.get(movie.id)!.sessions.push(session);
    });

  // Сортируем сеансы по времени для каждого фильма
  dateMap.forEach((dateGroup) => {
    dateGroup.movieMap.forEach((movieData) => {
      movieData.sessions.sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    });
  });

  // Преобразуем в массив и сортируем по дате
  return Array.from(dateMap.values())
    .map((dateGroup) => ({
      date: dateGroup.dateKey,
      dateTimestamp: dateGroup.dateTimestamp,
      movies: Array.from(dateGroup.movieMap.values()),
    }))
    .sort((a, b) => {
      // Используем timestamp для правильной сортировки
      return a.dateTimestamp - b.dateTimestamp;
    });
});

onMounted(() => {
  const cinemaId = Number(route.params.id);

  Promise.all([
    apiClient.get('/cinemas'),
    apiClient.get(`/cinemas/${cinemaId}/sessions`),
    apiClient.get('/movies'),
  ])
    .then(([cinemasResponse, sessionsResponse, moviesResponse]) => {
      const cinemas = cinemasResponse.data;
      cinema.value = cinemas.find((c: Cinema) => c.id === cinemaId) || null;
      sessions.value = sessionsResponse.data;
      movies.value = moviesResponse.data;
    })
    .catch((err) => {
      error.value = err.response?.data?.message || 'Ошибка загрузки данных';
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<style scoped>
.cinema-detail-page {
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

.cinema-content {
  max-width: 1200px;
}

h1 {
  margin-bottom: 2rem;
}

.date-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.date-group {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.date-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.25rem;
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

.card-duration,
.card-rating {
  white-space: nowrap;
}

.session-times {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.session-time-button {
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
  white-space: nowrap;
}

.session-time-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Tablet - 2 columns */
@media (max-width: 1200px) {
  .movies-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile - 1 column */
@media (max-width: 768px) {
  .date-groups {
    gap: 1.5rem;
  }

  .date-group {
    padding: 1rem;
  }

  .date-header {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .movies-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .movie-card {
    padding: 0.875rem;
  }

  .card-poster {
    width: 70px;
    height: 105px;
  }

  .session-times {
    gap: 0.4rem;
  }

  .session-time-button {
    padding: 0.45rem 0.875rem;
    font-size: 0.85rem;
  }
}
</style>

