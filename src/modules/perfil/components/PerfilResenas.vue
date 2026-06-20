<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { http } from "@/modules/auth/api/http";

const props = defineProps<{
  profesionalId?: number | null;
}>();

interface Resena {
  id: number;
  puntuacion: number;
  comentario?: string;
  created_at: string;

  cliente: {
    user: {
      nombre: string;
      apellido: string;
    };
  };
}
const resenas = ref<Resena[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const cargarResenas = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!props.profesionalId) {
      resenas.value = [];
      return;
    }

    const url = `/professionals/${props.profesionalId}/reviews`;

    console.log("GET:", url);

    const res = await http.get(url);

    resenas.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (e) {
    console.error(e);
    error.value = "Error al cargar las reseñas";
    resenas.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(cargarResenas);

watch(
  () => props.profesionalId,
  () => {
    cargarResenas();
  },
  { immediate: true },
);
</script>

<template>
  <div class="resenas-card">
    <h3 class="titulo">Reseñas</h3>

    <div v-if="loading" class="estado">Cargando...</div>
    <div v-else-if="error" class="estado error">{{ error }}</div>
    <div v-else-if="resenas.length === 0" class="estado">No hay reseñas todavía.</div>

    <ul v-else class="lista">
      <li v-for="r in resenas" :key="r.id" class="item">
        <div class="top">
          <span class="nombre">
            {{ r.cliente?.user?.nombre ?? "Cliente" }}
            {{ r.cliente?.user?.apellido ?? "" }}
          </span>
          <span class="estrellas"> ⭐ {{ r.puntuacion }}/5 </span>
        </div>

        <p v-if="r.comentario" class="comentario">"{{ r.comentario }}"</p>

        <span class="fecha">
          {{ new Date(r.created_at).toLocaleDateString() }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.resenas-card {
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
  gap: 12px;
}

.item {
  padding: 0.75rem 0;
  border-bottom: 0.5px solid #f3f4f6;
}

.item:last-child {
  border-bottom: none;
}

.top {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.nombre {
  color: #374151;
  font-weight: 500;
}

.estrellas {
  color: #f59e0b;
}

.comentario {
  margin: 6px 0 0;
  font-size: 0.875rem;
  color: #4b5563;
}

.fecha {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
