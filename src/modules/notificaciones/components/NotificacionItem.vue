<script setup lang="ts">
import type { Notification } from "@/types/notification";

defineProps<{
  notification: Notification;
}>();
defineEmits<{
  "marcar-leida": [];
}>();
</script>

<template>
  <div class="notification-item" :class="{ unread: !notification.read_at }">
    <div class="content">
      <h4>{{ notification.data.titulo }}</h4>
      <p>{{ notification.data.mensaje }}</p>
      <small>{{ notification.created_at }}</small>
    </div>
    <button v-if="!notification.read_at" class="btn-link" @click="$emit('marcar-leida')">
      Marcar como leída
    </button>
  </div>
</template>

<style scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 12px 14px;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  transition: border 0.15s;
}
.notification-item.unread {
  border-color: #2563eb;
  background: #eff9ff;
}

.content {
  flex: 1;
  min-width: 0;
}

.content h4 {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  overflow-wrap: break-word;
}
.content p {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #6b7280;
  overflow-wrap: break-word;
}
.content small {
  font-size: 0.73rem;
  color: #9ca3af;
}

.btn-link {
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 8px;
  border: 0.5px solid #d1d5db;
  background: white;
  color: #1a1a1a;
  cursor: pointer;
  white-space: nowrap;
  transition: border 0.15s;
  flex-shrink: 0;
}
.btn-link:hover {
  border-color: #2563eb;
  color: #2563eb;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .notification-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .btn-link {
    align-self: flex-start;
  }
}
</style>
