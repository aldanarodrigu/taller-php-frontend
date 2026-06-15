<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { computed, ref, onMounted } from "vue";
import { useAuth } from "@/modules/auth/composables/useAuth";
import { useNotificationStore } from "@/modules/notificaciones/store/notificacionStore";

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
  { to: "/app/home", label: "Inicio" },
  { to: "/app/resumen", label: "Resumen" },
  { to: "/app/reservas", label: "Reservas" },
  { to: "/app/clientes", label: "Clientes", soloProfesional: true },
];

const navGestionCliente = [
  { to: "/app/servicios", label: "Servicios" },
  { to: "/app/paquetes", label: "Paquetes" },
];

const navGestionProfesional = [
  { to: "/app/mis-servicios", label: "Mis Servicios" },
  { to: "/app/disponibilidad", label: "Disponibilidad" },
];

const navCuenta = [
  { to: "/app/perfil", label: "Perfil", soloProfesional: true },
  { to: "/app/resenas", label: "Reseñas" },
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
    <!-- Nav -->
    <nav class="nav">
      <span class="section-label">Principal</span>
      <template v-for="item in navPrincipal" :key="item.to">
        <RouterLink
          v-if="!item.soloProfesional || esProfesional"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="cerrarMenu"
        >
          {{ item.label }}
          <span v-if="item.badge" class="badge-count">{{ item.badge }}</span>
        </RouterLink>
      </template>

      <span class="section-label">Gestión</span>
      <template v-if="!esProfesional">
        <RouterLink
          v-for="item in navGestionCliente"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="cerrarMenu"
        >
          {{ item.label }}
        </RouterLink>
      </template>
      <template v-else>
        <RouterLink
          v-for="item in navGestionProfesional"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="cerrarMenu"
        >
          {{ item.label }}
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

      <button class="logout-btn" @click="handleLogout">
        <i class="ti ti-logout" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-right: 0.5px solid #e5e7eb;
  z-index: 100;
}

/* Nav */
.nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  margin-top: 40px;
}

.section-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  padding: 12px 8px 4px;
}
.section-label:first-child {
  padding-top: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: #4b5563;
  text-decoration: none;
  transition:
    background 0.12s,
    color 0.12s;
  cursor: pointer;
}
.nav-item i {
  font-size: 16px;
  flex-shrink: 0;
  color: #9ca3af;
  transition: color 0.12s;
}
.nav-item:hover {
  background: #f9fafb;
  color: #111827;
}
.nav-item:hover i {
  color: #4b5563;
}
.nav-item.active {
  background: #eff9ff;
  color: #2563eb;
  font-weight: 500;
}
.nav-item.active i {
  color: #2563eb;
}

.badge-count {
  margin-left: auto;
  font-size: 10px;
  font-weight: 500;
  background: #dcf4fc;
  color: #2563eb;
  border-radius: 999px;
  padding: 1px 7px;
  min-width: 18px;
  text-align: center;
}

/* Footer */
.sidebar-footer {
  padding: 10px;
  border-top: 0.5px solid #dcf0fc;
  flex-shrink: 0;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}
.user-row:hover {
  background: #f9fafb;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dcf0fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #2563eb;
  flex-shrink: 0;
  text-transform: uppercase;
}
.user-name {
  font-size: 12px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 11px;
  color: #9ca3af;
  text-transform: capitalize;
}

/* Hamburger */
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
  width: 22px;
  height: 1.5px;
  background: #374151;
  border-radius: 2px;
  transition: all 0.25s ease;
}
.hamburger.open span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

.logout-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 8px;

  transition: background 0.12s;
}

.logout-btn:hover {
  background: #fef2f2;
}

.logout-btn i {
  font-size: 16px;
}

/* Overlay */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 999;
  backdrop-filter: blur(2px);
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
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.08);
  }
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
