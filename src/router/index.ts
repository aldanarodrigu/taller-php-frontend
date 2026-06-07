import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/modules/auth/views/LoginView.vue";
import RegisterView from "@/modules/auth/views/RegisterView.vue";
import PerfilView from "@/modules/perfil/views/PerfilView.vue";

import AppLayout from "@/layouts/AppLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // AUTH
    {
      path: "/auth",
      component: AuthLayout,
      children: [
        {
          path: "login",
          component: LoginView,
        },
        {
          path: "register",
          component: RegisterView,
        },
        {
          path: "callback",
          component: () => import("@/modules/auth/views/GoogleCallback.vue"),
        },
      ],
    },

    // APP
    {
      path: "/app",
      component: AppLayout,
      children: [
        {
          path: "home",
          name: "Home",
          component: () => import("@/modules/home/views/HomeView.vue"),
        },
        {
          path: "perfil",
          component: PerfilView,
          name: "ProfileOwn",
        },
        {
          path: "perfil/:id",
          component: PerfilView,
          name: "ProfileUser",
        },
        {
          path: "perfil/editar",
          name: "ProfileEdit",
          component: () => import("@/modules/perfil/components/PerfilEditar.vue"),
        },
        {
          path: "servicios",
          component: () => import("@/modules/servicios/views/ServiciosView.vue"),
          name: "Servicios",
        },
        {
          path: "servicios/:id",
          name: "ServicioDetalle",
          component: () => import("@/modules/servicios/views/ServicioDetalleView.vue"),
        },
        {
          path: "mis-servicios",
          component: () => import("@/modules/servicios/views/MisServiciosView.vue"),
          name: "MisServicios",
        },
        {
          path: "paquetes",
          component: () => import("@/modules/paquetes/views/PaquetesView.vue"),
          name: "Paquetes",
        },
        {
          path: "reservas",
          name: "Reservas",
          component: () => import("@/modules/reservas/views/ReservasView.vue"),
        },
        {
          path: "reservas/:id",
          name: "ReservaDetalle",
          component: () => import("@/modules/reservas/views/ReservaDetalleView.vue"),
        },
        {
          path: "clientes",
          name: "Clientes",
          component: { template: '<div style="padding:2rem">Clientes — en construcción</div>' },
        },
        {
          path: "disponibilidad",
          name: "Disponibilidad",
          redirect: { name: "MisServicios" },
        },
        {
          path: "resenas",
          name: "Resenas",
          component: { template: '<div style="padding:2rem">Reseñas — en construcción</div>' },
        },
        {
          path: "configuracion",
          name: "Configuracion",
          component: {
            template: '<div style="padding:2rem">Configuración — en construcción</div>',
          },
        },
      ],
    },

    {
      path: "/",
      redirect: "/auth/login",
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const isPublic = to.path.startsWith("/auth");

  if (!isPublic && !token) {
    return "/auth/login";
  }
});

export default router;
