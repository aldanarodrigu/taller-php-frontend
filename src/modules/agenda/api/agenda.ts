import { http } from "@/modules/auth/api/http";

export const agendaApi = {
  obtenerHorarios(
    profesionalId: number,
    fecha: string,
    servicioId: number
  ) {
    return http.get(`/agenda/profesional/${profesionalId}`, {
      params: {
        fecha,
        servicio_id: servicioId,
      },
    });
  },
};