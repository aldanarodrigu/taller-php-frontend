import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { echo } from "@/plugins/echo";
import { useAuthStore } from "@/modules/auth/stores/auth";

import { getNotifications, markAsRead, markAllAsRead } from "../api/notificacionesApi";

import type { Notification } from "@/types/Notification";

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

    const profesionalId = authStore.user?.profesional?.id;

    console.log("PROFESIONAL ID REAL:", profesionalId);

    if (!profesionalId) return;

    echo
      .private(`profesional.${profesionalId}`)
      .subscribed(() => {
        console.log("SUSCRIPTO OK PROFESIONAL");
      })
      .listen("ReservationCreated", (event) => {
        console.log("EVENTO:", event);
        fetchNotifications();
      });
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
