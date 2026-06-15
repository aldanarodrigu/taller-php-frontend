import { defineStore } from "pinia";
import { ref } from "vue";
import { paquetesApi } from "@/modules/paquetes/api/paquetes";

export const usePaquetesStore = defineStore("paquetes", () => {
  const paquetes = ref<any[]>([]);
  const cargando = ref(false);
  const error = ref("");

  async function listar() {
    cargando.value = true;
    error.value = "";
    try {
      const res = await paquetesApi.listar();
      paquetes.value = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    } catch {
      error.value = "Error al cargar los paquetes";
    } finally {
      cargando.value = false;
    }
  }

  async function crear(datos: object) {
    await paquetesApi.crear(datos);
    await listar();
  }

  async function eliminar(id: number) {
    await paquetesApi.eliminar(id);
    await listar();
  }

  async function comprar(id: number) {
    await paquetesApi.comprar(id);
  }

  return { paquetes, cargando, error, listar, crear, eliminar, comprar };
});
