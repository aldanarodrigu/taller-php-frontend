<script setup lang="ts">
import Sidebar from "@/components/SideBar.vue";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { useNotificationStore } from "@/modules/notificaciones/store/notificacionStore";
import { onMounted } from "vue";

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (token && !authStore.loaded) {
    await authStore.fetchUser(); // user debe estar cargado antes de iniciarTiempoReal
  }
  await notificationStore.fetchNotifications();
  notificationStore.iniciarTiempoReal(); // ahora sí authStore.user?.profesional?.id existe
});
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f4f46c;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  min-width: 0;
}

/* ── Responsive ──
   El sidebar pasa a ser un drawer fuera de pantalla
   (ver Sidebar.vue), así que el contenido principal
   deja de necesitar el margen de 240px y le damos
   espacio arriba para el botón hamburguesa. */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem;
  }
}
</style>
