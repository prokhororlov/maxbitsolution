<template>
  <div class="movie-detail-page">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="movie && sessions.length > 0" class="movie-content">
      <div class="movie-header">
        <img
          :src="getImageUrl(movie.posterImage)"
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
import { useRootStore } from '@/stores';
import { formatTime, formatDuration } from '@/utils/date';
import { getImageUrl } from '@/config';
import { getGroupedSessions } from '@/utils/sessions';
import { formatCinemaName } from '@/utils/format';
import type { Movie, MovieSession } from '@/types/api';

const route = useRoute();
const $ = useRootStore();
const movieId = Number(route.params.id);

const movie = ref<Movie | null>(null);
const sessions = ref<MovieSession[]>([]);

const loading = computed(() => $.movies.loading || $.cinemas.loading);
const error = computed(() => $.movies.error || $.cinemas.error);

const groupedSessions = computed(() => {
  if (!sessions.value.length) return {};
  return getGroupedSessions(sessions.value, $.cinemas.cinemas);
});

const getCinemaName = (cinemaId: number) => {
  return formatCinemaName($.cinemas.cinemas.find((c) => c.id === cinemaId)?.name);
};

onMounted(async () => {
  const data = await $.movies.loadMovieDetail(movieId);
  movie.value = data.movie;
  sessions.value = data.sessions;
  await $.cinemas.fetchCinemas();
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
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.98);
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.description {
  margin-bottom: 1.5rem;
  line-height: 1.4;
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
    font-size: 1.25rem;
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

