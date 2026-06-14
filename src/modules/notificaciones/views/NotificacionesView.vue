<script setup lang="ts">
import { onMounted } from "vue";
import { useNotificationStore } from "../store/notificacionStore";
import NotificacionItem from "../components/NotificacionItem.vue";

const notificationStore = useNotificationStore();

onMounted(async () => {
  await notificationStore.fetchNotifications();
});
</script>

<template>
  <div class="page">
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Notificaciones</h3>
          <p>Novedades sobre tus reservas y actividad</p>
        </div>

        <button
          v-if="notificationStore.unreadCount > 0"
          class="btn-save"
          @click="notificationStore.markEveryNotificationAsRead()"
        >
          Marcar todas como leídas
        </button>
      </div>

      <p v-if="notificationStore.loading" class="empty-text">Cargando...</p>

      <p v-else-if="notificationStore.notifications.length === 0" class="empty-text">
        No tenés notificaciones.
      </p>

      <div v-else class="notification-list">
        <NotificacionItem
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          :notification="notification"
          @marcar-leida="notificationStore.markNotificationAsRead(notification.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 0.5px solid #e5e7eb;
}

.form-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.form-header p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.empty-text {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  padding: 2rem 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-save {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}
.btn-save:hover {
  opacity: 0.85;
}
.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
