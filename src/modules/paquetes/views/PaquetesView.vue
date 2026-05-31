<script setup lang="ts">
import { onMounted } from "vue";
import { usePaquetesStore } from "@/modules/paquetes/stores/paquetes";

const store = usePaquetesStore();

onMounted(() => {
  store.listar();
});
</script>

<template>
  <div class="paquetes">
    <h1>Paquetes de Servicios</h1>
    <p class="subtitulo">Comprá múltiples sesiones con descuento</p>

    <div v-if="store.cargando">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <div v-else-if="store.paquetes.length === 0">No hay paquetes disponibles.</div>

    <div v-else class="lista">
      <div v-for="p in store.paquetes" :key="p.id" class="card">

        <div class="card-header">
          <span class="badge-sesiones">📦 {{ p.cantidad_sesiones }} sesiones</span>
        </div>

        <h2>{{ p.nombre }}</h2>
        <p class="descripcion">{{ p.descripcion }}</p>

        <div class="detalle">
          <p>🕐 Válido por {{ p.vigencia_dias ?? "—" }} días</p>
        </div>

        <div class="precio-box">
          <p class="precio">${{ p.precio }}</p>
          <p class="precio-sesion">
            ${{ (p.precio / p.cantidad_sesiones).toFixed(0) }} por sesión
          </p>
        </div>

        <button class="btn-comprar" @click="store.comprar(p.id)">
          Comprar paquete
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paquetes { padding: 1rem; }

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.subtitulo {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
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
  border: 2px solid #e9d5ff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.badge-sesiones {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.descripcion {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.detalle {
  font-size: 0.875rem;
  color: #6b7280;
}

.detalle p { margin: 0.25rem 0; }

.precio-box {
  background: #f5f3ff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.precio {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c3aed;
  margin: 0;
}

.precio-sesion {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.btn-comprar {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.625rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  margin-top: auto;
}

.btn-comprar:hover {
  background: #6d28d9;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
}
</style>