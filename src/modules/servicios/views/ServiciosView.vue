<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";

const store = useServiciosStore();
const router = useRouter();

onMounted(() => {
  store.listar();
});

function verDetalle(id: number) {
  router.push({ name: "ServicioDetalle", params: { id } });
}
</script>

<template>
  <div class="servicios">
    <h1>Servicios</h1>

    <div v-if="store.cargando" class="estado">Cargando...</div>
    <div v-else-if="store.error" class="estado error">{{ store.error }}</div>
    <div v-else-if="store.servicios.length === 0" class="estado">No hay servicios disponibles.</div>

    <div v-else class="lista">
      <div
        v-for="servicio in store.servicios"
        :key="servicio.id"
        class="card"
        @click="verDetalle(servicio.id)"
      >
        <div class="card-top">
          <span class="badge" :class="servicio.modalidad">
            {{ servicio.modalidad === "presencial" ? "Presencial" : "Virtual" }}
          </span>
          <span class="precio">${{ Number(servicio.precio).toFixed(2) }}</span>
        </div>

        <div class="card-body">
          <h2>{{ servicio.nombre }}</h2>
          <p class="descripcion">{{ servicio.descripcion }}</p>

          <div class="meta">
            <span class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd"/></svg>
              {{ servicio.duracion_minutos }} min
            </span>
            <span v-if="servicio.modalidad === 'presencial' && servicio.direccion" class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.692 17 9A7 7 0 103 9c0 3.692 1.698 6.227 3.354 7.585a12.85 12.85 0 002.274 1.765 11.37 11.37 0 00.757.433 5.741 5.741 0 00.28.14l.019.009.006.002zm1.055-1.828a12.17 12.17 0 01-.745-.527C8.552 15.773 5 13.308 5 9a5 5 0 1110 0c0 4.308-3.552 6.773-5 7.105z" clip-rule="evenodd"/><path d="M10 11a2 2 0 100-4 2 2 0 000 4z"/></svg>
              {{ servicio.direccion }}
            </span>
          </div>
        </div>

        <button class="btn-detalle">
          Ver detalle
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.servicios {
  padding: 1.5rem;
  font-family: "Poppins", sans-serif;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
}

.estado {
  font-size: 0.875rem;
  color: #6b7280;
  padding: 1rem 0;
}

.estado.error {
  color: #dc2626;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem 0;
}

.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge.presencial {
  background: #dcfce7;
  color: #15803d;
}

.badge.virtual {
  background: #dbeafe;
  color: #1d4ed8;
}

.precio {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.card-body {
  padding: 0.75rem 1.25rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.descripcion {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.meta-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #9ca3af;
}

.btn-detalle {
  margin: 0 1.25rem 1.25rem;
  padding: 0.65rem 1rem;
  background: white;
  color: #2563eb;
  border: 1.5px solid #2563eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: background 0.2s ease, color 0.2s ease;
}

.btn-detalle svg {
  width: 16px;
  height: 16px;
}

.btn-detalle:hover {
  background: #2563eb;
  color: white;
}
</style>