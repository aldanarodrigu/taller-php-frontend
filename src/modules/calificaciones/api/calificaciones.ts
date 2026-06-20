import { http } from "@/modules/auth/api/http";

export const calificacionesApi = {
  porServicio: (servicioId: number) => http.get(`/services/${servicioId}/reviews`),
  crear: (datos: { reserva_id: number; puntuacion: number; comentario?: string }) =>
    http.post("/reviews", datos),
};
