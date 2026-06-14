import { http } from "@/modules/auth/api/http";

export const videoApi = {
  obtenerToken: (reservaId: number) =>
    http.post(`/video/reservas/${reservaId}/token`),
  finalizar: (reservaId: number) =>
    http.patch(`/video/reservas/${reservaId}/finalizar`),
};
