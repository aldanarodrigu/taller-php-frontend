import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { echo } from "@/plugins/echo";
import { useAuthStore } from "@/modules/auth/stores/auth";

import { getNotifications, markAsRead, markAllAsRead } from "../api/notificacionesApi";

import type { Notification } from "@/types/notification";

export const useNotificationStore = defineStore("notifications", () => {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read_at).length);

  // =========================
  // LOAD INICIAL
  // =========================
  const fetchNotifications = async () => {
    loading.value = true;

    try {
      const response = await getNotifications();

      notifications.value = response.data.map((n: Notification) => ({
        ...n,
        read_at: n.read_at ?? null,
      }));
    } finally {
      loading.value = false;
    }
  };

  // =========================
  // MARK AS READ
  // =========================
  const markNotificationAsRead = async (id: string) => {
    await markAsRead(id);

    const notification = notifications.value.find((n) => n.id === id);

    if (notification) {
      notification.read_at = new Date().toISOString();
    }
  };

  const markEveryNotificationAsRead = async () => {
    await markAllAsRead();

    notifications.value.forEach((n) => {
      n.read_at = new Date().toISOString();
    });
  };

  const iniciarTiempoReal = () => {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    const profesionalId = authStore.user?.profesional?.id;

    if (!userId) {
      console.warn("iniciarTiempoReal: sin userId, abortando");
      return;
    }

    // Escuchar notificaciones Laravel broadcast (NuevaReserva, Confirmada, Cancelada, etc.)
    echo.private(`usuario.${userId}`).notification(async () => {
      await fetchNotifications();
    });

    // Escuchar evento ReservationCreated en el canal del usuario (clientes)
    echo.private(`usuario.${userId}`).listen("ReservationCreated", async () => {
      await fetchNotifications();
    });

    // Si es profesional, también escuchar en el canal profesional
    if (profesionalId) {
      echo
        .private(`profesional.${profesionalId}`)
        .listen("ReservationCreated", async () => {
          await fetchNotifications();
        });
    }
  };
  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    iniciarTiempoReal,
    markNotificationAsRead,
    markEveryNotificationAsRead,
  };
});
