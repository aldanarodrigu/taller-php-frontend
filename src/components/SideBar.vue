<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { computed, ref, onMounted } from "vue";
import { useAuth } from "@/modules/auth/composables/useAuth";
import { useNotificationStore } from "@/modules/notificaciones/store/notificacionStore";

import "@/styles/sidebar.css";

const authStore = useAuthStore();
const esProfesional = computed(() => authStore.user?.role === "profesional");
const route = useRoute();
const isActive = (path: string) => route.path === path;

const { logout: authLogout } = useAuth();

const menuAbierto = ref(false);
const toggleMenu = () => (menuAbierto.value = !menuAbierto.value);
const cerrarMenu = () => (menuAbierto.value = false);

const router = useRouter();

const irACuenta = () => {
  cerrarMenu();
  router.push("/app/cuenta");
};

const handleLogout = async () => {
  cerrarMenu();
  await authLogout();
};

const notificacionStore = useNotificationStore();
const unreadCount = computed(() => notificacionStore.unreadCount);

const navPrincipal = [
  { to: "/app/home", label: "Inicio", soloCliente: true },
  { to: "/app/reservas", label: "Reservas", soloProfesional: true },
  { to: "/app/compras", label: "Mis Compras", soloCliente: true },
  { to: "/app/clientes", label: "Clientes", soloProfesional: true },
  { to: "/app/servicios", label: "Servicios", soloCliente: true },
  { to: "/app/paquetes", label: "Paquetes", soloCliente: true },
  { to: "/app/mis-servicios", label: "Mis Servicios", soloProfesional: true },
  { to: "/app/mis-paquetes", label: "Mis Paquetes", soloProfesional: true },
  { to: "/app/disponibilidad", label: "Disponibilidad", soloProfesional: true },
];

const navCuenta = [
  { to: "/app/perfil", label: "Perfil", soloProfesional: true },
  { to: "/app/calificaciones", label: "Calificaciones" },
  { to: "/app/notificaciones", label: "Notificaciones", badge: true },
];
</script>

<template>
  <!-- Hamburger -->
  <button
    class="hamburger"
    :class="{ open: menuAbierto }"
    aria-label="Abrir menú"
    @click="toggleMenu"
  >
    <span />
    <span />
    <span />
  </button>

  <!-- Overlay -->
  <div v-if="menuAbierto" class="overlay" @click="cerrarMenu" />

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ open: menuAbierto }">
    <div class="sidebar-header">
      <span class="sidebar-brand">Encuentra tu profesional</span>
    </div>

    <!-- Nav -->
    <nav class="nav">
      <span class="section-label">Principal</span>
      <template v-for="item in navPrincipal" :key="item.to">
        <RouterLink
          v-if="(!item.soloProfesional || esProfesional) && (!item.soloCliente || !esProfesional)"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="cerrarMenu"
        >
          {{ item.label }}
          <span v-if="item.badge" class="badge-count">{{ item.badge }}</span>
        </RouterLink>
      </template>

<span class="section-label">Cuenta</span>
      <template v-for="item in navCuenta" :key="item.to">
        <RouterLink
          v-if="!item.soloProfesional || esProfesional"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="cerrarMenu"
        >
          {{ item.label }}

          <span v-if="item.badge && unreadCount > 0" class="badge-count">
            {{ unreadCount }}
          </span>
        </RouterLink>
      </template>
    </nav>

    <!-- Footer con usuario -->
    <div class="sidebar-footer">
      <div class="user-row" @click="irACuenta">
        <div class="user-avatar">
          {{ authStore.user?.nombre?.[0] }}{{ authStore.user?.apellido?.[0] }}
        </div>

        <div class="user-info">
          <div class="user-name">
            {{ authStore.user?.nombre }}
            {{ authStore.user?.apellido }}
          </div>

          <div class="user-role">
            {{ authStore.user?.role }}
          </div>
        </div>

        <i
          class="ti ti-dots"
          aria-hidden="true"
          style="margin-left: auto; color: #9ca3af; font-size: 15px"
        />
      </div>

      <div class="footer-divider" />

      <button class="logout-btn" @click="handleLogout">
        <i class="ti ti-logout" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
