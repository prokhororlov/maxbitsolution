<template>
  <div class="movie-detail-page">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="movie && sessions.length > 0" class="movie-content">
      <div class="movie-header">
        <img
          :src="`http://localhost:3022${movie.posterImage}`"
          :alt="movie.title"
          class="poster-large"
        />
        <div class="movie-info">
          <h1>{{ movie.title }}</h1>
          <p class="description">{{ movie.description }}</p>
          <div class="movie-meta">
            <p>📅 Год: {{ movie.year }}</p>
            <p>⏱️ Продолжительность: {{ formatDuration(movie.lengthMinutes) }}</p>
            <p>⭐ Рейтинг: {{ movie.rating }}</p>
          </div>
        </div>
      </div>
      <div class="sessions">
        <div v-for="(dateSessions, date) in groupedSessions" :key="date" class="date-group">
          <h2 class="date-header">{{ date }}</h2>
          <div v-for="(cinemaSessions, cinemaId) in dateSessions" :key="cinemaId" class="cinema-group">
            <h3 class="cinema-name">{{ getCinemaName(Number(cinemaId)) }}</h3>
            <div class="session-times">
              <router-link
                v-for="session in cinemaSessions"
                :key="session.id"
                :to="{ name: 'booking', params: { sessionId: session.id } }"
                class="session-time-button"
              >
                {{ formatTime(session.startTime) }}
              </router-link>
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

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterImage: string;
  lengthMinutes: number;
  description: string;
}

interface MovieSession {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
}

interface Cinema {
  id: number;
  name: string;
  address: string;
}

const route = useRoute();
const movie = ref<Movie | null>(null);
const sessions = ref<MovieSession[]>([]);
const cinemas = ref<Cinema[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const groupedSessions = computed(() => {
  const groups: Record<string, Record<number, MovieSession[]>> = {};
  const now = new Date();

  sessions.value
    .filter((session) => {
      // Фильтруем прошедшие сеансы
      return new Date(session.startTime) > now;
    })
    .forEach((session) => {
      const date = formatDate(session.startTime);
      const cinemaId = session.cinemaId;

      if (!groups[date]) {
        groups[date] = {};
      }
      if (!groups[date][cinemaId]) {
        groups[date][cinemaId] = [];
      }
      groups[date][cinemaId].push(session);
    });

  return groups;
});

const getCinemaName = (cinemaId: number): string => {
  const cinema = cinemas.value.find((c) => c.id === cinemaId);
  if (!cinema?.name) return '';
  return cinema.name.charAt(0).toUpperCase() + cinema.name.slice(1).toLowerCase();
};

onMounted(() => {
  const movieId = Number(route.params.id);

  Promise.all([
    apiClient.get('/movies'),
    apiClient.get(`/movies/${movieId}/sessions`),
    apiClient.get('/cinemas'),
  ])
    .then(([moviesResponse, sessionsResponse, cinemasResponse]) => {
      const movies = moviesResponse.data;
      movie.value = movies.find((m: Movie) => m.id === movieId) || null;
      sessions.value = sessionsResponse.data;
      cinemas.value = cinemasResponse.data;
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
.movie-detail-page {
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

.movie-content {
  max-width: 1200px;
}

.movie-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.poster-large {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
}

h1 {
  margin-bottom: 1rem;
}

.description {
  margin-bottom: 1.5rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
}

.movie-meta p {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.sessions {
  margin-top: 3rem;
}

.date-group {
  margin-bottom: 2.5rem;
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
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.cinema-group {
  margin-bottom: 1.5rem;
  margin-left: 1rem;
}

.cinema-name {
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.session-times {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.session-time-button {
  padding: 0.625rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.session-time-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Mobile styles */
@media (max-width: 768px) {
  .movie-header {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .poster-large {
    width: 150px;
    height: 225px;
    align-self: flex-start;
  }

  h1 {
    font-size: 1.5rem;
    text-align: left;
  }

  .sessions {
    margin-top: 2rem;
  }

  .date-group {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .cinema-group {
    margin-left: 0;
  }

  .session-times {
    gap: 0.5rem;
  }

  .session-time-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>

