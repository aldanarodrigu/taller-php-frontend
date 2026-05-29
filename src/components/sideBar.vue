<script setup lang="ts"></script>

<template>
  <aside class="sidebar">
    <!-- PRINCIPAL -->
    <div class="section">
      <p class="section-title">PRINCIPAL</p>

      <ul class="menu">
        <li class="item active">Resumen</li>
        <li class="item">Reservas</li>
        <li class="item">Clientes</li>
      </ul>
    </div>

    <!-- GESTION -->
    <div class="section">
      <p class="section-title">GESTIÓN</p>

      <ul class="menu">
        <li class="item">Servicios</li>
        <li class="item">Paquetes</li>
        <li class="item">Disponibilidad</li>
      </ul>
    </div>

    <!-- CUENTA -->
    <div class="section">
      <p class="section-title">CUENTA</p>

      <ul class="menu">
        <li class="item">Perfil</li>
        <li class="item">Reseñas</li>
        <li class="item">Configuración</li>
      </ul>
    </div>
  </aside>
</template>

<style>
.sidebar {
  width: 300px;
  height: 100vh;
  background: #ffffff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  border-right: 1px solid #f2f2f2;
  font-family: Inter, system-ui, sans-serif;
}

/* SECCIONES */
.section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #b5b5b5;
  font-weight: 600;
  padding-left: 8px;
}

/* MENU */
.menu {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ITEMS */
.item {
  padding: 10px 12px;
  border-radius: 5px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;

  transition: all 0.2s ease;
}

/* HOVER */
.item:hover {
  background: #f2f2f2;
}

/* ACTIVE */
.item.active {
  background: #f2f2f2;
  color: #1a1a1a;
  font-weight: 600;
}

.item.active::before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #1a1a1a;
  border-radius: 999px;
  margin-right: 10px;
  vertical-align: middle;
}
</style>
