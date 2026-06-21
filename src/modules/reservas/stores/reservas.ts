import { defineStore } from "pinia";
import { ref } from "vue";
import { reservasApi } from "@/modules/reservas/api/reservas";

export const useReservasStore = defineStore("reservas", () => {
  const reservas = ref<any[]>([]);
  const reserva = ref<any | null>(null);
  const cargando = ref(false);
  const error = ref<string | null>(null);
  const accionCargando = ref(false);
  const accionError = ref<string | null>(null);

  async function listar() {
    cargando.value = true;
    error.value = null;

    try {
      const res = await reservasApi.listar();
      reservas.value = res.data ?? [];
    } catch {
      error.value = "Error al cargar las reservas";
    } finally {
      cargando.value = false;
    }
  }

  async function obtener(id: number) {
    cargando.value = true;
    error.value = null;
    accionError.value = null;

    try {
      const res = await reservasApi.obtener(id);
      reserva.value = res.data;

      const idx = reservas.value.findIndex((r) => r.id === res.data.id);
      if (idx !== -1) {
        reservas.value[idx] = res.data;
      }
    } catch {
      error.value = "Error al cargar la reserva";
    } finally {
      cargando.value = false;
    }
  }

  async function ejecutarAccion(accion: () => Promise<any>) {
    accionCargando.value = true;
    accionError.value = null;

    try {
      const res = await accion();

      const reservaActualizada = res.data?.reserva ?? res.data;

      reserva.value = reservaActualizada;

      const idx = reservas.value.findIndex(
        (r) => r.id === reservaActualizada.id
      );

      if (idx !== -1) {
        reservas.value[idx] = reservaActualizada;
      }

      return true;
    } catch (e: any) {
      accionError.value =
        e?.response?.data?.error ?? "Error al ejecutar la acción";

      return false;
    } finally {
      accionCargando.value = false;
    }
  }

  const cancelar = (id: number) =>
    ejecutarAccion(() => reservasApi.cancelar(id));

  const confirmar = (id: number) =>
    ejecutarAccion(() => reservasApi.confirmar(id));

  const iniciar = (id: number) =>
    ejecutarAccion(() => reservasApi.iniciar(id));

  const finalizar = (id: number) =>
    ejecutarAccion(() => reservasApi.finalizar(id));

  const noAsistida = (id: number) =>
    ejecutarAccion(() => reservasApi.noAsistida(id));

  const reprogramar = (
    id: number,
    data: { fecha: string; hora_inicio: string }
  ) => ejecutarAccion(() => reservasApi.reprogramar(id, data));

  return {
    reservas,
    reserva,
    cargando,
    error,
    accionCargando,
    accionError,

    listar,
    obtener,
    cancelar,
    confirmar,
    iniciar,
    finalizar,
    noAsistida,
    reprogramar,
  };
});