import { http } from "@/modules/auth/api/http";

export const reservasApi = {
  crear: (data: { servicio_id: number; fecha: string; hora_inicio: string }) =>
    http.post("/reservas", data),
  listar: () => http.get("/reservas"),
  obtener: (id: number) => http.get(`/reservas/${id}`),
  cancelar: (id: number) => http.patch(`/reservas/${id}/cancelar`),
  confirmar: (id: number) => http.patch(`/reservas/${id}/confirmar`),
  iniciar: (id: number) => http.patch(`/reservas/${id}/iniciar`),
  finalizar: (id: number) => http.patch(`/reservas/${id}/finalizar`),
  noAsistida: (id: number) => http.patch(`/reservas/${id}/no-asistida`),
  reprogramar: (
  id: number,
  data: { fecha: string; hora_inicio: string }
) => http.patch(`/reservas/${id}/reprogramar`, data),
};


