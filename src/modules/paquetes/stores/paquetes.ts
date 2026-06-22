/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { ref } from "vue";
import { paquetesApi } from "@/modules/paquetes/api/paquetes";

export const usePaquetesStore = defineStore("paquetes", () => {
  const paquetes = ref<any[]>([]);
  const misPaquetes = ref<any[]>([]);
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

  async function listarMios() {
    cargando.value = true;
    error.value = "";
    try {
      const res = await paquetesApi.misPaquetesProfesional();
      misPaquetes.value = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    } catch {
      error.value = "Error al cargar los paquetes";
    } finally {
      cargando.value = false;
    }
  }

  async function crear(datos: object) {
    await paquetesApi.crear(datos);
    await listarMios();
  }

  async function eliminar(id: number) {
    await paquetesApi.eliminar(id);
    misPaquetes.value = misPaquetes.value.filter((p) => p.id !== id);
  }

  async function comprar(id: number) {
    await paquetesApi.comprar(id);
  }

  return { paquetes, misPaquetes, cargando, error, listar, listarMios, crear, eliminar, comprar };
});
