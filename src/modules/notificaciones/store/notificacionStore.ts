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

  const fetchNotifications = async () => {
    loading.value = true;

    try {
      const response = await getNotifications();

      console.log(response);

      notifications.value = response.data;
    } finally {
      loading.value = false;
    }
  };

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

    console.log("INICIANDO REALTIME");

    if (!authStore.user) {
      console.log("NO HAY USUARIO");
      return;
    }

    console.log("USUARIO:", authStore.user.id);

    echo
      .private(`usuario.${authStore.user.id}`)
      .subscribed(() => {
        console.log("SUSCRIPTO OK");
      })
      .error((error) => {
        console.error("ERROR CANAL", error);
      })
      .listen("ReservationCreated", (event) => {
        console.log("EVENTO RECIBIDO", event);

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
