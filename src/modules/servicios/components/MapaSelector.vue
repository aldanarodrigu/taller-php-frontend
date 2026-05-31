<script setup lang="ts">
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const emit = defineEmits<{
  (e: "ubicacion-seleccionada", coords: { lat: number; lng: number; direccion: string }): void;
}>();

const mapaRef = ref<HTMLElement | null>(null);
const busqueda = ref("");
const buscando = ref(false);

let mapa: L.Map;
let marcador: L.Marker;

onMounted(() => {
  if (!mapaRef.value) return;

  // Montevideo por defecto
  mapa = L.map(mapaRef.value).setView([-34.9058, -56.1913], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(mapa);

  marcador = L.marker([-34.9058, -56.1913], { draggable: true }).addTo(mapa);

  // Cuando mueven el marcador
  marcador.on("dragend", async () => {
    const pos = marcador.getLatLng();
    const direccion = await obtenerDireccion(pos.lat, pos.lng);
    emit("ubicacion-seleccionada", { lat: pos.lat, lng: pos.lng, direccion });
  });

  // Cuando hacen clic en el mapa
  mapa.on("click", async (e) => {
    marcador.setLatLng(e.latlng);
    const direccion = await obtenerDireccion(e.latlng.lat, e.latlng.lng);
    emit("ubicacion-seleccionada", { lat: e.latlng.lat, lng: e.latlng.lng, direccion });
  });
});

async function buscarDireccion() {
  if (!busqueda.value) return;
  buscando.value = true;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(busqueda.value)}&format=json&limit=1`
    );
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const pos = L.latLng(parseFloat(lat), parseFloat(lon));
      mapa.setView(pos, 16);
      marcador.setLatLng(pos);
      emit("ubicacion-seleccionada", { lat: parseFloat(lat), lng: parseFloat(lon), direccion: display_name });
    }
  } finally {
    buscando.value = false;
  }
}

async function obtenerDireccion(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name ?? `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}
</script>

<template>
  <div class="mapa-selector">
    <div class="buscador">
      <input
        v-model="busqueda"
        placeholder="Buscá una dirección..."
        @keyup.enter="buscarDireccion"
      />
      <button @click="buscarDireccion" :disabled="buscando">
        {{ buscando ? "Buscando..." : "Buscar" }}
      </button>
    </div>
    <div ref="mapaRef" class="mapa"></div>
    <p class="hint">También podés hacer clic en el mapa o arrastrar el marcador</p>
  </div>
</template>

<style scoped>
.mapa-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.buscador {
  display: flex;
  gap: 0.5rem;
}

.buscador input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.buscador button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.mapa {
  height: 300px;
  border-radius: 8px;
  z-index: 0;
}

.hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}
</style>