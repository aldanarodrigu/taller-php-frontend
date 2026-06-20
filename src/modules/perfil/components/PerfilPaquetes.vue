<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { http } from "@/modules/auth/api/http";
import { useRouter } from "vue-router";

const router = useRouter();

const irADetalle = (id: number) => {};

const props = defineProps<{
  profesionalId?: number | null;
  esPropietario: boolean;
}>();

interface Paquete {
  id: number;
  nombre: string;
  descripcion?: string;
  cantidad_sesiones: number;
  precio: string;
}

const paquetes = ref<Paquete[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const cargarPaquetes = async () => {
  try {
    loading.value = true;
    error.value = null;

    let url = "";

    if (props.esPropietario) {
      url = "/packages/mis-paquetes-profesional";
    } else {
      if (props.profesionalId == null) {
        paquetes.value = [];
        return;
      }
      url = `/packages/profesional/${props.profesionalId}`;
    }

    console.log("GET:", url);

    const res = await http.get(url);

    // soporta array o {data: []}
    paquetes.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (e) {
    console.error(e);
    error.value = "Error al cargar los paquetes";
    paquetes.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(cargarPaquetes);

watch(
  () => [props.profesionalId, props.esPropietario],
  () => {
    cargarPaquetes();
  },
  { immediate: true },
);
</script>

<template>
  <div class="paquetes-card">
    <h3 class="titulo">Paquetes</h3>

    <div v-if="loading" class="estado">Cargando...</div>
    <div v-else-if="error" class="estado error">{{ error }}</div>
    <div v-else-if="paquetes.length === 0" class="estado">No hay paquetes cargados.</div>

    <ul v-else class="lista">
      <li
        v-for="paquete in paquetes"
        :key="paquete.id"
        class="item"
        @click="irADetalle(paquete.id)"
      >
        <span class="nombre">{{ paquete.nombre }}</span>
        <span class="precio">
          ${{ paquete.precio }} / {{ paquete.cantidad_sesiones }} sesiones
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.paquetes-card {
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
  cursor: pointer;
  transition: background-color 0.2s;
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

@media (max-width: 768px) {
  .paquetes-card {
    padding: 1rem;
  }

  .item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 0.75rem 0;
  }

  .precio {
    font-size: 0.8rem;
  }
}
</style>
