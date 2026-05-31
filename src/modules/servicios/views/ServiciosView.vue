<script setup lang="ts">
import { onMounted } from "vue";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";
import MapaServicio from "@/modules/servicios/components/MapaServicio.vue";

const store = useServiciosStore();

onMounted(() => {
  store.listar();
});
</script>

<template>
  <div class="servicios">
    <h1>Servicios</h1>

    <div v-if="store.cargando">Cargando...</div>

    <div v-else-if="store.error">{{ store.error }}</div>

    <div v-else-if="store.servicios.length === 0">
      No hay servicios disponibles.
    </div>

    <div v-else class="lista">
      <div
        v-for="servicio in store.servicios"
        :key="servicio.id"
        class="card"
      >
        <h2>{{ servicio.nombre }}</h2>
        <p>{{ servicio.descripcion }}</p>
        <p><strong>Modalidad:</strong> {{ servicio.modalidad }}</p>
        <p><strong>Precio:</strong> ${{ servicio.precio }}</p>
        <p><strong>Duración:</strong> {{ servicio.duracion_minutos }} min</p>

        <div v-if="servicio.modalidad === 'presencial' && servicio.latitud && servicio.longitud">
          <p><strong>Dirección:</strong> {{ servicio.direccion }}</p>
          <MapaServicio
            :latitud="parseFloat(servicio.latitud)"
            :longitud="parseFloat(servicio.longitud)"
            :direccion="servicio.direccion"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.servicios {
  padding: 1rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.card h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.card p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
}
</style>