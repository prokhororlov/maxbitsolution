import { createRouter, createWebHistory } from 'vue-router';
import { useRootStore } from '@/stores';
import Movies from '@/views/Movies.vue';
import MovieDetail from '@/views/MovieDetail.vue';
import Cinemas from '@/views/Cinemas.vue';
import CinemaDetail from '@/views/CinemaDetail.vue';
import Booking from '@/views/Booking.vue';
import MyBookings from '@/views/MyBookings.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';

const router = createRouter({
  history: createWebHistory('/projects/maxbitsolution/'),
  routes: [
    {
      path: '/',
      redirect: '/movies',
    },
    {
      path: '/movies',
      name: 'movies',
      component: Movies,
    },
    {
      path: '/movies/:id',
      name: 'movie-detail',
      component: MovieDetail,
    },
    {
      path: '/cinemas',
      name: 'cinemas',
      component: Cinemas,
    },
    {
      path: '/cinemas/:id',
      name: 'cinema-detail',
      component: CinemaDetail,
    },
    {
      path: '/booking/:sessionId',
      name: 'booking',
      component: Booking,
    },
    {
      path: '/my-bookings',
      name: 'my-bookings',
      component: MyBookings,
      beforeEnter: (to, from, next) => {
        const $ = useRootStore();
        const requiresAuth = !$.auth.isAuthenticated;
        return requiresAuth ? next({ name: 'login' }) : next();
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
  ],
});

export default router;

