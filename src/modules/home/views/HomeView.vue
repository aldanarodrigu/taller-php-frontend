<script setup lang="ts">
import BarraBusqueda from "@/modules/home/components/barraBusqueda.vue";
import ServiceCard from "@/modules/servicios/components/ServicioCard.vue";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";
import { onMounted } from "vue";

const store = useServiciosStore();

onMounted(() => {
  store.listarConProfesional();
});

function onFiltrar(filtros: { tipo?: string; busqueda?: string }) {
  console.log("filtros:", filtros);
}
</script>

<template>
  <div class="home">
    <div class="home-header">
      <h1 class="home-title">Encontrá tu profesional</h1>
      <p class="home-sub">Buscá por servicio, ubicación o categoría</p>
    </div>

    <BarraBusqueda @filtrar="onFiltrar" />

    <div class="cards-grid">
      <ServiceCard
        v-for="servicio in store.serviciosConProfesional"
        :key="servicio.id"
        :servicio="servicio"
      />
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.home-title {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
}
.home-sub {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 16px;
}

@media (max-width: 480px) {
  .home {
    padding: 1rem;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
