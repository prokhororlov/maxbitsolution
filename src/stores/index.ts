import { useAuthStore } from './auth';
import { useMoviesStore } from './movies';
import { useCinemasStore } from './cinemas';
import { useSessionsStore } from './sessions';
import { useBookingsStore } from './bookings';

export const useRootStore = () => {
  const auth = useAuthStore();
  const movies = useMoviesStore();
  const cinemas = useCinemasStore();
  const sessions = useSessionsStore();
  const bookings = useBookingsStore();

  return {
    auth,
    movies,
    cinemas,
    sessions,
    bookings,
  };
};

export type RootStore = ReturnType<typeof useRootStore>;

