import { createRouter, createWebHistory } from "vue-router";

import LoginView from "@/modules/auth/views/LoginView.vue";
import RegisterView from "@/modules/auth/views/RegisterView.vue";
import PerfilView from "@/modules/perfil/views/PerfilView.vue";

import AppLayout from "@/layouts/AppLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";

import { useAuthStore } from "@/modules/auth/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //ADMIN
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, role: "admin" },
      children: [
        {
          path: "dashboard",
          name: "AdminDashboard",
          component: () => import("@/modules/admin/views/AdminDashboard.vue"),
        },
        {
          path: "usuarios",
          name: "AdminUsers",
          component: () => import("@/modules/admin/views/AdminUsers.vue"),
        },
        {
          path: "actividad",
          name: "AdminActivity",
          component: () => import("@/modules/admin/views/AdminActivity.vue"),
        },
      ],
    },
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
        {
          path: "/auth/google/select-rol",
          name: "GoogleSelectRol",
          component: () => import("@/modules/auth/views/SelectRolGoogle.vue"),
          meta: { requiresGuest: true },
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
          path: "perfil/editar",
          name: "ProfileEdit",
          component: () => import("@/modules/perfil/components/PerfilEditar.vue"),
        },
        {
          path: "perfil/:id",
          component: PerfilView,
          name: "ProfileUser",
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
          path: "mis-paquetes",
          component: () => import("@/modules/paquetes/views/MisPaquetesView.vue"),
          name: "MisPaquetes",
        },
        {
          path: "reservas",
          name: "Reservas",
          component: () => import("@/modules/reservas/views/ReservasView.vue"),
        },
        {
          path: "compras",
          name: "Compras",
          component: () => import("@/modules/reservas/views/ComprasView.vue"),
        },
        {
          path: "reservas/:id",
          name: "ReservaDetalle",
          component: () => import("@/modules/reservas/views/ReservaDetalleView.vue"),
        },
        {
          path: "reservas/:id/video",
          name: "Videollamada",
          component: () => import("@/modules/reservas/views/VideollamadaView.vue"),
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
          path: "cuenta",
          name: "Cuenta",
          component: () => import("@/modules/perfil/views/CuentaView.vue"),
        },
        {
          path: "notificaciones",
          name: "Notificaciones",
          component: () => import("@/modules/notificaciones/views/NotificacionesView.vue"),
        },
      ],
    },

    {
      path: "/",
      redirect: "/auth/login",
    },
  ],
});

router.beforeEach(async (to) => {
  const token = localStorage.getItem("token");
  const isPublic = to.path.startsWith("/auth");

  const authStore = useAuthStore();

  if (token && !authStore.user) {
    await authStore.fetchUser();
  }

  const user = authStore.user;

  if (!isPublic && !token) {
    return "/auth/login";
  }

  if (to.path.startsWith("/admin") && user?.role !== "admin") {
    return "/app/home";
  }
});

export default router;
