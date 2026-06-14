import { http } from "@/modules/auth/api/http";

export const getNotifications = async () => {
  const { data } = await http.get("/notificaciones");
  return data;
};

export const getNotification = async (id: string) => {
  const { data } = await http.get(`/notificaciones/${id}`);
  return data;
};

export const markAsRead = async (id: string) => {
  const { data } = await http.patch(`/notificaciones/${id}/leer`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await http.post("/notificaciones/leer-todas");
  return data;
};

export const deleteNotification = async (id: string) => {
  const { data } = await http.delete(`/notificaciones/${id}`);
  return data;
};
