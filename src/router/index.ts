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
          path: "auth/callback",
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
        },
      ],
    },
  ],
});

export default router;
