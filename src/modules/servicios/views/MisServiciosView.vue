<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { http } from "@/modules/auth/api/http";
import MapaSelector from "@/modules/servicios/components/MapaSelector.vue";

const servicios = ref<any[]>([]);
const cargando = ref(false);
const error = ref("");
const errorForm = ref("");
const mostrarFormulario = ref(false);

const form = ref({
  nombre: "",
  descripcion: "",
  tipo: "",
  modalidad: "virtual",
  precio: null as number | null,
  duracion_minutos: 60,
  videollamada: false,
  direccion: "",
  latitud: null as number | null,
  longitud: null as number | null,
});

function onUbicacionSeleccionada(coords: { lat: number; lng: number; direccion: string }) {
  form.value.latitud = coords.lat;
  form.value.longitud = coords.lng;
  form.value.direccion = coords.direccion;
}

async function cargar() {
  cargando.value = true;
  try {
    const res = await http.get("/api/services/me");
    servicios.value = res.data ?? [];
  } catch {
    error.value = "Error al cargar tus servicios";
  } finally {
    cargando.value = false;
  }
}

async function crear() {
  errorForm.value = "";

  if (!form.value.nombre || !form.value.tipo || !form.value.precio || !form.value.duracion_minutos) {
    errorForm.value = "Completá todos los campos obligatorios";
    return;
  }

  try {
    await http.post("/api/services", form.value);
    mostrarFormulario.value = false;
    form.value = {
      nombre: "",
      descripcion: "",
      tipo: "",
      modalidad: "virtual",
      precio: null,
      duracion_minutos: 60,
      videollamada: false,
      direccion: "",
      latitud: null,
      longitud: null,
    };
    await cargar();
  } catch (e: any) {
    errorForm.value = e.response?.data?.message ?? "Error al crear el servicio";
  }
}

async function eliminar(id: number) {
  if (!confirm("¿Seguro que querés eliminar este servicio?")) return;
  try {
    await http.delete(`/api/services/${id}`);
    await cargar();
  } catch {
    error.value = "Error al eliminar el servicio";
  }
}

onMounted(cargar);
</script>

<template>
  <div class="mis-servicios">
    <div class="header">
      <h1>Mis Servicios</h1>
      <button class="btn-primary" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? "Cancelar" : "+ Nuevo servicio" }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario">
      <h2>Nuevo servicio</h2>

      <div v-if="errorForm" class="error-msg">{{ errorForm }}</div>

      <div class="campo">
        <label>Nombre *</label>
        <input v-model="form.nombre" placeholder="Ej: Consultoría empresarial" />
      </div>

      <div class="campo">
        <label>Descripción</label>
        <input v-model="form.descripcion" placeholder="Describí tu servicio" />
      </div>

      <div class="campo">
        <label>Tipo *</label>
        <input v-model="form.tipo" placeholder="Ej: consultoria, entrenamiento, terapia" />
      </div>

      <div class="campo">
        <label>Modalidad *</label>
        <select v-model="form.modalidad">
          <option value="virtual">Virtual</option>
          <option value="presencial">Presencial</option>
          <option value="hibrida">Híbrida</option>
        </select>
      </div>

      <div class="fila">
        <div class="campo">
          <label>Precio (USD) *</label>
          <input v-model.number="form.precio" type="number" min="0" placeholder="Ej: 50" />
        </div>
        <div class="campo">
          <label>Duración (minutos) *</label>
          <input v-model.number="form.duracion_minutos" type="number" min="15" placeholder="Ej: 60" />
        </div>
      </div>

      <div class="checkbox">
        <input type="checkbox" v-model="form.videollamada" id="video" />
        <label for="video">Incluye videollamada</label>
      </div>

      <div v-if="form.modalidad !== 'virtual'" class="campo">
        <label>Ubicación</label>
        <p class="hint">Buscá la dirección y ajustá el marcador en el mapa</p>
        <MapaSelector @ubicacion-seleccionada="onUbicacionSeleccionada" />
        <p v-if="form.direccion" class="direccion-seleccionada">📍 {{ form.direccion }}</p>
      </div>

      <button class="btn-primary" @click="crear">Guardar servicio</button>
    </div>

    <div v-if="cargando">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="servicios.length === 0">No tenés servicios creados todavía.</div>

    <div v-else class="lista">
      <div v-for="s in servicios" :key="s.id" class="card">
        <div class="card-badge">{{ s.modalidad }}</div>
        <h2>{{ s.nombre }}</h2>
        <p>{{ s.descripcion }}</p>
        <p><strong>Tipo:</strong> {{ s.tipo }}</p>
        <p><strong>Precio:</strong> ${{ s.precio }}</p>
        <p><strong>Duración:</strong> {{ s.duracion_minutos }} min</p>
        <p v-if="s.direccion"><strong>Dirección:</strong> {{ s.direccion }}</p>
        <button class="btn-danger" @click="eliminar(s.id)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mis-servicios { padding: 1rem; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1 { font-size: 1.5rem; font-weight: 600; color: #111827; }

.formulario {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.campo label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.campo input, .campo select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.direccion-seleccionada {
  font-size: 0.875rem;
  color: #2563eb;
  margin: 0.25rem 0 0;
}

.error-msg {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
  position: relative;
}

.card-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0369a1;
  margin-bottom: 0.75rem;
}

.card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #111827; }
.card p { font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0; }

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}
</style>