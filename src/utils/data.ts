import type { Movie, Cinema, MovieSession } from '@/types/api';

export const findById = <T extends { id: number }>(items: T[], id: number): T | undefined => {
  return items.find((item) => item.id === id);
};

export const getMovieById = (movies: Movie[], id: number): Movie | undefined => {
  return findById(movies, id);
};

export const getCinemaById = (cinemas: Cinema[], id: number): Cinema | undefined => {
  return findById(cinemas, id);
};

export const getMovieTitle = (movieSessionId: number, movies: Movie[], sessions: MovieSession[]): string => {
  const session = findById(sessions, movieSessionId);
  if (!session) return '';
  const movie = getMovieById(movies, session.movieId);
  return movie?.title || '';
};

export const getMoviePoster = (movieSessionId: number, movies: Movie[], sessions: MovieSession[]): string => {
  const session = findById(sessions, movieSessionId);
  if (!session) return '';
  const movie = getMovieById(movies, session.movieId);
  return movie?.posterImage || '';
};

export const getCinemaName = (movieSessionId: number, cinemas: Cinema[], sessions: MovieSession[]): string => {
  const session = findById(sessions, movieSessionId);
  if (!session) return '';
  const cinema = getCinemaById(cinemas, session.cinemaId);
  return cinema?.name || '';
};

export const getCinemaAddress = (movieSessionId: number, cinemas: Cinema[], sessions: MovieSession[]): string => {
  const session = findById(sessions, movieSessionId);
  if (!session) return '';
  const cinema = getCinemaById(cinemas, session.cinemaId);
  return cinema?.address || '';
};

export const getSessionStartTime = (movieSessionId: number, sessions: MovieSession[]): string => {
  const session = findById(sessions, movieSessionId);
  return session?.startTime || '';
};

