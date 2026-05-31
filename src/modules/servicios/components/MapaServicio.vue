<script setup lang="ts">
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps<{
  latitud: number;
  longitud: number;
  direccion: string;
}>();

const mapaRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!mapaRef.value) return;

  const mapa = L.map(mapaRef.value).setView(
    [props.latitud, props.longitud],
    15
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(mapa);

  L.marker([props.latitud, props.longitud])
    .addTo(mapa)
    .bindPopup(props.direccion)
    .openPopup();
});
</script>

<template>
  <div ref="mapaRef" class="mapa"></div>
</template>

<style scoped>
.mapa {
  height: 300px;
  width: 100%;
  border-radius: 12px;
  z-index: 0;
}
</style>