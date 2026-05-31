import { http } from "@/modules/auth/api/http";

export const paquetesApi = {
  listar() {
    return http.get("/api/packages");
  },

  obtener(id: number) {
    return http.get(`/api/packages/${id}`);
  },

  comprar(id: number) {
    return http.post(`/api/packages/${id}/comprar`);
  },
};