<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { computed, ref } from "vue";

const authStore = useAuthStore();
const esProfesional = computed(() => authStore.user?.role === "profesional");
const route = useRoute();
const isActive = (path: string) => route.path === path;

const menuAbierto = ref(false);
const toggleMenu = () => (menuAbierto.value = !menuAbierto.value);
const cerrarMenu = () => (menuAbierto.value = false);
</script>

<template>
  <button class="hamburger" @click="toggleMenu" :class="{ open: menuAbierto }">
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- OVERLAY -->
  <div v-if="menuAbierto" class="overlay" @click="cerrarMenu" />

  <aside class="sidebar" :class="{ open: menuAbierto }">
    <!-- PRINCIPAL -->
    <div class="section">
      <p class="section-title">PRINCIPAL</p>
      <ul class="menu">
        <li>
          <RouterLink
            to="/app/home"
            class="item"
            :class="{ active: isActive('/') }"
            @click="cerrarMenu"
          >
            Inicio
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/" class="item" :class="{ active: isActive('/') }" @click="cerrarMenu">
            Resumen
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/app/reservas"
            class="item"
            :class="{ active: isActive('/app/reservas') }"
            @click="cerrarMenu"
          >
            Reservas
          </RouterLink>
        </li>
        <li>
          <RouterLink
            to="/app/clientes"
            class="item"
            :class="{ active: isActive('/app/clientes') }"
            @click="cerrarMenu"
          >
            Clientes
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- GESTIÓN -->
    <div class="section">
      <p class="section-title">GESTIÓN</p>
      <ul class="menu">
        <li>
          <RouterLink to="/app/servicios" class="item" @click="cerrarMenu">Servicios</RouterLink>
        </li>
        <li>
          <RouterLink to="/app/paquetes" class="item" @click="cerrarMenu">Paquetes</RouterLink>
        </li>
        <li>
          <RouterLink to="/app/disponibilidad" class="item" @click="cerrarMenu"
            >Disponibilidad</RouterLink
          >
        </li>
      </ul>
    </div>

    <!-- CUENTA -->
    <div class="section">
      <p class="section-title">CUENTA</p>
      <ul class="menu">
        <li v-if="esProfesional">
          <RouterLink
            to="/app/perfil"
            class="item"
            :class="{ active: isActive('/app/perfil') }"
            @click="cerrarMenu"
          >
            Perfil
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/app/resenas" class="item" @click="cerrarMenu">Reseñas</RouterLink>
        </li>
        <li>
          <RouterLink to="/app/configuracion" class="item" @click="cerrarMenu"
            >Configuración</RouterLink
          >
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: #ffffff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid #eee;
  font-family: Inter, system-ui, sans-serif;
  flex-shrink: 0;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #767a80;
  padding-left: 10px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s ease;
}

.item:hover {
  background: #f3f4f6;
  transform: translateX(2px);
}

.item.active {
  background: #e0f2fe6c;
  color: #2563eb;
  font-weight: 600;
}

/* HAMBURGER */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #374151;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* OVERLAY */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
