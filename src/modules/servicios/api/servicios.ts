import { http } from "@/modules/auth/api/http";

export const serviciosApi = {
  listar(filtros?: { tipo?: string; modalidad?: string; precio_max?: number }) {
    return http.get("/services", { params: filtros });
  },

  listarConProfesional(filtros?: { tipo?: string; modalidad?: string; precio_max?: number }) {
    return http.get("/services/con-profesional", {
      params: filtros,
    });
  },

  obtener(id: number) {
    return http.get(`/services/${id}`);
  },

  coordenadas(id: number) {
    return http.get(`/services/${id}/coordenadas`);
  },

  reseñas(id: number) {
    return http.get(`/services/${id}/reviews`);
  },
};
