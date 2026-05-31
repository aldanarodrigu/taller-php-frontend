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

  // cuando el usuario hace clic en "Comprar"
  async function comprar(id: number) {
    try {
      await paquetesApi.comprar(id);
      alert("¡Paquete comprado correctamente!");
    } catch {
      alert("Error al comprar el paquete");
    }
  }

  return { paquetes, cargando, error, listar, comprar };
});