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
          path: "servicios",
          component: () => import("@/modules/servicios/views/ServiciosView.vue"),
          name: "Servicios",
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
