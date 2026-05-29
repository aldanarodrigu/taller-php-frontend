<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { computed } from "vue";
const authStore = useAuthStore();

const esProfesional = computed(() => authStore.user?.role === "profesional");

const route = useRoute();

const isActive = (path: string) => route.path === path;
</script>

<template>
  <aside class="sidebar">
    <!-- PRINCIPAL -->
    <div class="section">
      <p class="section-title">PRINCIPAL</p>

      <ul class="menu">
        <li>
          <RouterLink to="/" class="item" :class="{ active: isActive('/') }"> Resumen </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/app/reservas"
            class="item"
            :class="{ active: isActive('/app/reservas') }"
          >
            Reservas
          </RouterLink>
        </li>

        <li>
          <RouterLink
            to="/app/clientes"
            class="item"
            :class="{ active: isActive('/app/clientes') }"
          >
            Clientes
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- GESTION -->
    <div class="section">
      <p class="section-title">GESTIÓN</p>

      <ul class="menu">
        <li>
          <RouterLink to="/app/servicios" class="item">Servicios</RouterLink>
        </li>
        <li>
          <RouterLink to="/app/paquetes" class="item">Paquetes</RouterLink>
        </li>
        <li>
          <RouterLink to="/app/disponibilidad" class="item">Disponibilidad</RouterLink>
        </li>
      </ul>
    </div>

    <!-- CUENTA -->
    <div class="section">
      <p class="section-title">CUENTA</p>

      <ul class="menu">
        <li v-if="esProfesional">
          <RouterLink to="/app/perfil" class="item" :class="{ active: isActive('/app/perfil') }">
            Perfil
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/app/resenas" class="item">Reseñas</RouterLink>
        </li>

        <li>
          <RouterLink to="/app/configuracion" class="item">Configuración</RouterLink>
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
}

/* SECTIONS */
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

/* MENU */
.menu {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ITEM */
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

/* HOVER */
.item:hover {
  background: #f3f4f6;
  transform: translateX(2px);
}

/* ACTIVE */
.item.active {
  background: #e0f2fe6c;
  color: #2563eb;
  font-weight: 600;
}
</style>
