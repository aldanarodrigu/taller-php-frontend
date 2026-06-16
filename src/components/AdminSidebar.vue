<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { useAuth } from "@/modules/auth/composables/useAuth";

import "@/styles/sidebar.css";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const isActive = (path: string) => route.path === path;

const handleLogout = async () => {
  await logout();
};

const irACuenta = () => {
  router.push("/app/cuenta");
};
</script>

<template>
  <aside class="sidebar">
    <nav class="nav">
      <span class="section-label">ADMIN</span>

      <RouterLink
        to="/admin/dashboard"
        class="nav-item"
        :class="{ active: isActive('/admin/dashboard') }"
      >
        Dashboard
      </RouterLink>

      <RouterLink
        to="/admin/usuarios"
        class="nav-item"
        :class="{ active: isActive('/admin/usuarios') }"
      >
        Usuarios
      </RouterLink>

      <RouterLink
        to="/admin/actividad"
        class="nav-item"
        :class="{ active: isActive('/admin/actividad') }"
      >
        Actividad
      </RouterLink>
    </nav>

    <!-- FOOTER  -->
    <div class="sidebar-footer">
      <div class="user-row">
        <div class="user-avatar">
          {{ authStore.user?.nombre?.[0] }}{{ authStore.user?.apellido?.[0] }}
        </div>

        <div class="user-info">
          <div class="user-name">{{ authStore.user?.nombre }} {{ authStore.user?.apellido }}</div>

          <div class="user-role">admin</div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <i class="ti ti-logout" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
