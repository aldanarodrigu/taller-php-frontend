<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { useAuth } from "@/modules/auth/composables/useAuth";

import "@/styles/sidebar.css";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const menuAbierto = ref(false);

const toggleMenu = () => (menuAbierto.value = !menuAbierto.value);
const cerrarMenu = () => (menuAbierto.value = false);

const isActive = (path: string) => route.path === path;

const handleLogout = async () => {
  cerrarMenu();
  await logout();
};

const irACuenta = () => {
  cerrarMenu();
  router.push("/app/cuenta");
};
</script>

<template>
  <!-- HAMBURGER -->
  <button
    class="hamburger"
    :class="{ open: menuAbierto }"
    @click="toggleMenu"
    aria-label="Abrir menú"
  >
    <span />
    <span />
    <span />
  </button>

  <!-- OVERLAY -->
  <div v-if="menuAbierto" class="overlay" @click="cerrarMenu" />

  <!-- SIDEBAR -->
  <aside class="sidebar" :class="{ open: menuAbierto }">
    <nav class="nav">
      <span class="section-label">ADMIN</span>

      <RouterLink
        to="/admin/dashboard"
        class="nav-item"
        :class="{ active: isActive('/admin/dashboard') }"
        @click="cerrarMenu"
      >
        Dashboard
      </RouterLink>

      <RouterLink
        to="/admin/usuarios"
        class="nav-item"
        :class="{ active: isActive('/admin/usuarios') }"
        @click="cerrarMenu"
      >
        Usuarios
      </RouterLink>

      <RouterLink
        to="/admin/actividad"
        class="nav-item"
        :class="{ active: isActive('/admin/actividad') }"
        @click="cerrarMenu"
      >
        Actividad
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <div class="user-row" @click="irACuenta">
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

/* ===== HAMBURGER ===== */ .hamburger { position: fixed; top: 14px; left: 14px; z-index: 2000;
width: 42px; height: 42px; border: none; background: white; border-radius: 10px; display: none;
flex-direction: column; justify-content: center; gap: 5px; cursor: pointer; } .hamburger span {
height: 2px; background: #111; border-radius: 2px; transition: 0.3s; } .hamburger.open
span:nth-child(1) { transform: rotate(45deg) translateY(6px); } .hamburger.open span:nth-child(2) {
opacity: 0; } .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translateY(-6px); } /*
===== OVERLAY ===== */ .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index:
1500; } /* ===== SIDEBAR BASE ===== */ .sidebar { position: fixed; top: 0; left: 0; width: 240px;
height: 100vh; background: #fff; border-right: 1px solid #eee; z-index: 1600; transition: transform
0.3s ease; } /* ===== DESKTOP ===== */ @media (min-width: 769px) { .sidebar { transform:
translateX(0); } .hamburger { display: none; } } /* ===== MOBILE ===== */ @media (max-width: 768px)
{ .hamburger { display: flex; } .sidebar { transform: translateX(-100%); } .sidebar.open {
transform: translateX(0); } .nav { padding-top: 60px; } .section-label { display: none; }
.sidebar-footer { display: none; } }
