import { formatDate } from '@/utils/date';
import type { MovieSession, Movie, MovieWithSessions, DateGroup } from '@/types/api';

export const getGroupedSessions = (
  sessions: MovieSession[],
  cinemas: { id: number; name: string }[]
): Record<string, Record<number, MovieSession[]>> => {
  const groups: Record<string, Record<number, MovieSession[]>> = {};
  const now = new Date();
  sessions
    .filter((session) => new Date(session.startTime) > now)
    .forEach((session) => {
      const date = formatDate(session.startTime);
      const cinemaId = session.cinemaId;
      if (!groups[date]) groups[date] = {};
      if (!groups[date][cinemaId]) groups[date][cinemaId] = [];
      groups[date][cinemaId].push(session);
    });
  return groups;
};

export const getGroupedByDate = (sessions: MovieSession[], movies: Movie[]): DateGroup[] => {
  const dateMap = new Map<string, { dateKey: string; dateTimestamp: number; movieMap: Map<number, MovieWithSessions> }>();
  const now = new Date();
  sessions
    .filter((session) => new Date(session.startTime) > now)
    .forEach((session) => {
      const movie = movies.find((m) => m.id === session.movieId);
      if (!movie) return;
      const dateKey = formatDate(session.startTime);
      const sessionDate = new Date(session.startTime);
      const dateTimestamp = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate()).getTime();
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { dateKey, dateTimestamp, movieMap: new Map() });
      }
      const dateGroup = dateMap.get(dateKey)!;
      if (!dateGroup.movieMap.has(movie.id)) {
        dateGroup.movieMap.set(movie.id, { movie, sessions: [] });
      }
      dateGroup.movieMap.get(movie.id)!.sessions.push(session);
    });
  dateMap.forEach((dateGroup) => {
    dateGroup.movieMap.forEach((movieData) => {
      movieData.sessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });
  });
  return Array.from(dateMap.values())
    .map((dateGroup) => ({
      date: dateGroup.dateKey,
      dateTimestamp: dateGroup.dateTimestamp,
      movies: Array.from(dateGroup.movieMap.values()),
    }))
    .sort((a, b) => a.dateTimestamp - b.dateTimestamp);
};

