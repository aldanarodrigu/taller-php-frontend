import { http } from "@/modules/auth/api/http";

export const paquetesApi = {
  listar() { return http.get("/packages"); },
  obtener(id: number) { return http.get(`/packages/${id}`); },
  crear(datos: object) { return http.post("/packages", datos); },
  actualizar(id: number, datos: object) { return http.put(`/packages/${id}`, datos); },
  eliminar(id: number) { return http.delete(`/packages/${id}`); },
  misPaquetes() { return http.get("/packages/mis-paquetes"); },
  misPaquetesProfesional() { return http.get("/packages/mis-paquetes-profesional"); },
  comprar(id: number) { return http.post(`/packages/${id}/comprar`); },
  paraServicio(servicioId: number) { return http.get(`/packages/para-servicio/${servicioId}`); },
};
