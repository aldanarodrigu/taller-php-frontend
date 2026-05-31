import { http } from "@/modules/auth/api/http";

export const serviciosApi = {
  listar(filtros?: {
    tipo?: string;
    modalidad?: string;
    precio_max?: number;
  }) {
    return http.get("/api/services", { params: filtros });
  },

  obtener(id: number) {
    return http.get(`/api/services/${id}`);
  },

  coordenadas(id: number) {
    return http.get(`/api/services/${id}/coordenadas`);
  },

  reseñas(id: number) {
    return http.get(`/api/services/${id}/reviews`);
  },
};