import { http } from "@/modules/auth/api/http";

export const paquetesApi = {
  listar() {
    return http.get("/packages");
  },

  obtener(id: number) {
    return http.get(`/packages/${id}`);
  },

  comprar(id: number) {
    return http.post(`/packages/${id}/comprar`);
  },
};