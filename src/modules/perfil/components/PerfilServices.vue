<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "@/modules/auth/api/http";

const props = defineProps<{
  profesionalId?: number | null;
  esPropietario: boolean;
}>();

interface Servicio {
  id: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  precio: string;
  duracion_minutos: number;
}

const servicios = ref<Servicio[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // Si es el propio usuario usá /me, si es otro usá el filtro
    const url = props.esPropietario
      ? "/api/services/me"
      : `/api/services?profesional_id=${props.profesionalId}`;

    const res = await http.get(url);
    servicios.value = res.data;
  } catch {
    error.value = "Error al cargar los servicios";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="servicios-card">
    <h3 class="titulo">Servicios</h3>

    <div v-if="loading" class="estado">Cargando...</div>
    <div v-else-if="error" class="estado error">{{ error }}</div>
    <div v-else-if="servicios.length === 0" class="estado">No hay servicios cargados.</div>

    <ul v-else class="lista">
      <li v-for="servicio in servicios" :key="servicio.id" class="item">
        <span class="nombre">{{ servicio.nombre }}</span>
        <span class="precio">${{ servicio.precio }} / sesión</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.servicios-card {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.titulo {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.estado {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  padding: 1rem 0;
}

.estado.error {
  color: #dc2626;
}

.lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 0.5px solid #f3f4f6;
  font-size: 0.875rem;
}

.item:last-child {
  border-bottom: none;
}

.nombre {
  color: #374151;
}

.precio {
  color: #6b7280;
}
</style>

@media (max-width: 768px) { .servicios-card { padding: 1rem; } .item { flex-direction: column;
align-items: flex-start; gap: 4px; padding: 0.75rem 0; } .precio { font-size: 0.8rem; } }
