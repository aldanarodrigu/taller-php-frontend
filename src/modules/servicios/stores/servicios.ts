import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { serviciosApi } from "@/modules/servicios/api/servicios";
import type { Servicio, ServicioConProfesional } from "@/types";

export const useServiciosStore = defineStore("servicios", () => {
  const servicios = ref<Servicio[]>([]);
  const servicio = ref<ServicioConProfesional | null>(null);
  const serviciosConProfesional = ref<ServicioConProfesional[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  // --- FILTROS ---
  const filtros = ref({
    busqueda: "",
    tipo: "",
    modalidad: "",
  });

  function setFiltros(nuevos: { busqueda?: string; tipo?: string; modalidad?: string }) {
    filtros.value.busqueda = nuevos.busqueda ?? "";
    filtros.value.tipo = nuevos.tipo ?? "";
    filtros.value.modalidad = nuevos.modalidad ?? "";
  }

  const serviciosFiltrados = computed(() => {
    return serviciosConProfesional.value.filter((s) => {
      const b = filtros.value.busqueda.toLowerCase();
      const matchBusqueda =
        !b ||
        s.nombre?.toLowerCase().includes(b) ||
        s.descripcion?.toLowerCase().includes(b) ||
        s.profesional?.user.nombre?.toLowerCase().includes(b) ||
        s.profesional?.user.apellido?.toLowerCase().includes(b);

      const matchTipo =
        !filtros.value.tipo || s.tipo?.toLowerCase() === filtros.value.tipo.toLowerCase();

      const matchModalidad = !filtros.value.modalidad || s.modalidad === filtros.value.modalidad;

      return matchBusqueda && matchTipo && matchModalidad;
    });
  });

  // --- API ---
  async function listar(f?: object) {
    cargando.value = true;
    error.value = null;
    try {
      const res = await serviciosApi.listar(f);
      servicios.value = res.data.data ?? [];
    } catch {
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
    } catch {
      error.value = "Error al cargar el servicio";
    } finally {
      cargando.value = false;
    }
  }

  async function listarConProfesional(f?: object) {
    cargando.value = true;
    error.value = null;
    try {
      const res = await serviciosApi.listarConProfesional(f);
      serviciosConProfesional.value = res.data.data ?? [];
    } catch {
      error.value = "Error al cargar los servicios";
    } finally {
      cargando.value = false;
    }
  }

  return {
    servicios,
    servicio,
    serviciosConProfesional,
    serviciosFiltrados,
    filtros,
    cargando,
    error,
    listar,
    listarConProfesional,
    obtener,
    setFiltros,
  };
});
