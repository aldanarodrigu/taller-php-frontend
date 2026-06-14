import { http } from "@/modules/auth/api/http";

export const pagosApi = {
  crear: (reservaId: number, monto: number) =>
    http.post("/pagos", { reserva_id: reservaId, monto }),
  obtener: (id: number) =>
    http.get(`/pagos/${id}`),
};
