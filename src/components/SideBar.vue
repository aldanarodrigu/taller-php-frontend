<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const isActive = (path: string) => route.path === path;
</script>

<template>
  <aside class="sidebar">
    <!-- BRAND -->
    <div class="brand">
      <h1>Panel</h1>
    </div>

    <!-- PRINCIPAL -->
    <div class="section">
      <p class="section-title">PRINCIPAL</p>

      <ul class="menu">
        <li>
          <RouterLink to="/" class="item" :class="{ active: isActive('/') }"> Resumen </RouterLink>
        </li>

        <li>
          <RouterLink to="/reservas" class="item" :class="{ active: isActive('/reservas') }">
            Reservas
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/clientes" class="item" :class="{ active: isActive('/clientes') }">
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
          <RouterLink to="/servicios" class="item">Servicios</RouterLink>
        </li>
        <li>
          <RouterLink to="/paquetes" class="item">Paquetes</RouterLink>
        </li>
        <li>
          <RouterLink to="/disponibilidad" class="item">Disponibilidad</RouterLink>
        </li>
      </ul>
    </div>

    <!-- CUENTA -->
    <div class="section">
      <p class="section-title">CUENTA</p>

      <ul class="menu">
        <li>
          <RouterLink to="/perfil" class="item" :class="{ active: isActive('/perfil') }">
            Perfil
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/resenas" class="item">Reseñas</RouterLink>
        </li>

        <li>
          <RouterLink to="/configuracion" class="item">Configuración</RouterLink>
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

/* BRAND */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #2563eb;
}

.brand h1 {
  font-size: 16px;
  margin: 0;
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
  color: #9ca3af;
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
