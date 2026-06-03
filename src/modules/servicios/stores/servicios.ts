import { defineStore } from "pinia";
import { ref } from "vue";
import { serviciosApi } from "@/modules/servicios/api/servicios";

export const useServiciosStore = defineStore("servicios", () => {
  const servicios = ref<any[]>([]);
  const servicio = ref<any | null>(null);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  async function listar(filtros?: object) {
    cargando.value = true;
    error.value = null;
    try {
      const res = await serviciosApi.listar(filtros);
      servicios.value = res.data.data ?? [];
    } catch (e) {
      error.value = "Error al cargar los servicios";
    } finally {
      cargando.value = false;
    }
  }

  async function obtener(id: number) {
    cargando.value = true;
    error.value = null;
    try {
      const res = await serviciosApi.obtener(id);
      servicio.value = res.data;
    } catch (e) {
      error.value = "Error al cargar el servicio";
    } finally {
      cargando.value = false;
    }
  }

  return { servicios, servicio, cargando, error, listar, obtener };
});