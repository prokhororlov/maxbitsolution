export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  posterImage: string;
  lengthMinutes: number;
  description: string;
}

export interface Cinema {
  id: number;
  name: string;
  address: string;
}

export interface MovieSession {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
}

export interface Seat {
  rowNumber: number;
  seatNumber: number;
}

export interface Booking {
  id: string;
  movieSessionId: number;
  bookedAt: string;
  seats: Seat[];
  isPaid: boolean;
}

export interface SessionDetails {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
  seats: {
    rows: number;
    seatsPerRow: number;
  };
  bookedSeats: Seat[];
}

export interface Settings {
  bookingPaymentTimeSeconds: number;
}

export interface MovieWithSessions {
  movie: Movie;
  sessions: MovieSession[];
}

export interface DateGroup {
  date: string;
  dateTimestamp: number;
  movies: MovieWithSessions[];
}

