import type { Booking, MovieSession, Settings } from '@/types/api';

export const isBookingUnpaid = (booking: Booking, paymentTimeSeconds: number): boolean => {
  if (booking.isPaid) return false;
  const now = Date.now();
  const bookedAtTime = new Date(booking.bookedAt).getTime();
  const elapsed = Math.floor((now - bookedAtTime) / 1000);
  return elapsed < paymentTimeSeconds;
};

export const isBookingUpcoming = (booking: Booking, session: MovieSession | undefined): boolean => {
  if (!booking.isPaid || !session) return false;
  return new Date(session.startTime).getTime() > Date.now();
};

export const isBookingPast = (booking: Booking, session: MovieSession | undefined): boolean => {
  if (!session) return false;
  return new Date(session.startTime).getTime() < Date.now();
};

export const hasExpiredUnpaid = (bookings: Booking[], paymentTimeSeconds: number): boolean => {
  const now = Date.now();
  return bookings.some((booking) => {
    if (booking.isPaid) return false;
    const bookedAtTime = new Date(booking.bookedAt).getTime();
    const elapsed = Math.floor((now - bookedAtTime) / 1000);
    return elapsed >= paymentTimeSeconds;
  });
};

export const createSessionMap = (sessions: MovieSession[]): Map<number, MovieSession> => {
  return new Map(sessions.map((s) => [s.id, s]));
};

