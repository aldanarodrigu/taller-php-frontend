import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/modules/auth/views/LoginView.vue";
import RegisterView from "@/modules/auth/views/RegisterView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      component: LoginView,
    },

    {
      path: "/auth/callback",
      component: () => import("@/modules/auth/views/GoogleCallback.vue"),
    },

    {
      path: "/register",
      component: RegisterView,
    },
  ],
});

export default router;
