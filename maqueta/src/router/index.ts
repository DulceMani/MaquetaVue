import { createRouter, createWebHistory } from 'vue-router';
import InicioView from '../views/InicioView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: InicioView,
      redirect: {path: '/login'},
      children: [
        {
          path: '/login',
          component: () => import('../components/Inicio/Login.vue')
        },
        {
          path: '/registro',
          component: () => import('../components/Inicio/Registro.vue')
        }
      ]
    },
    {
      path: '/contenido',
      name: 'home',
      component: () => import('../components/Navbar.vue'),
      redirect: {path: '/home'},
      children: [
        {
          path:'/home',
          component: () => import('../views/HomeView.vue')
        },
        {
          path:'/perros',
          component: () => import('../views/PerrosView.vue')
        },
        {
          path:'/usuarios',
          component: () => import('../views/UsuariosView.vue')
        },
        {
          path: '/detalle-usuario/:usuarioId',
          name: "detalle-usuario",
          component: () => import('../components/usuario/DetalleUsuario.vue'),
          props: true
        }
      ]
    }
  ]
});

export default router;
