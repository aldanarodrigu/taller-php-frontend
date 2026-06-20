<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";

const store = useServiciosStore();
const router = useRouter();

onMounted(() => {
  store.listarConProfesional();
});

function verDetalle(id: number) {
  router.push({ name: "ServicioDetalle", params: { id } });
}
</script>

<template>
  <div class="form-wrap">
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Servicios</h3>
          <p>Explorá los servicios disponibles</p>
        </div>
      </div>

      <p v-if="store.cargando" class="empty-text">Cargando...</p>
      <div v-else-if="store.error" class="error-msg">{{ store.error }}</div>
      <p v-else-if="store.serviciosConProfesional.length === 0" class="empty-text">
        No hay servicios disponibles.
      </p>

      <div v-else class="lista">
        <div
          v-for="servicio in store.serviciosConProfesional"
          :key="servicio.id"
          class="card"
          @click="verDetalle(servicio.id)"
        >
          <div class="card-top">
            <span
              class="badge"
              :class="servicio.modalidad === 'presencial' ? 'verde-claro' : 'azul'"
            >
              {{ servicio.modalidad === "presencial" ? "Presencial" : "Virtual" }}
            </span>
            <span class="precio">${{ Number(servicio.precio).toFixed(2) }}</span>
          </div>

          <div class="card-body">
            <h4>{{ servicio.nombre }}</h4>
            <p class="descripcion">{{ servicio.descripcion }}</p>

            <div class="meta">
              <span class="meta-item meta-rating">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="color:#f59e0b">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ servicio.profesional?.puntuacion_promedio > 0 ? servicio.profesional.puntuacion_promedio : "Nuevo" }}
              </span>
              <span class="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ servicio.duracion_minutos }} min
              </span>
              <span
                v-if="servicio.modalidad === 'presencial' && servicio.direccion"
                class="meta-item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.692 17 9A7 7 0 103 9c0 3.692 1.698 6.227 3.354 7.585a12.85 12.85 0 002.274 1.765 11.37 11.37 0 00.757.433 5.741 5.741 0 00.28.14l.019.009.006.002zm1.055-1.828a12.17 12.17 0 01-.745-.527C8.552 15.773 5 13.308 5 9a5 5 0 1110 0c0 4.308-3.552 6.773-5 7.105z"
                    clip-rule="evenodd"
                  />
                  <path d="M10 11a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {{ servicio.direccion }}
              </span>
            </div>
          </div>

          <button class="btn-link btn-detalle">
            Ver detalle
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-wrap {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-card {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 0.5px solid #e5e7eb;
}

.form-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.form-header p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.empty-text {
  font-size: 0.875rem;
  color: #9ca3af;
  text-align: center;
  padding: 2rem 0;
}

.error-msg {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

/* ── Lista de servicios ── */
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.card:hover {
  border-color: #2563eb;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem 0;
}

.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.verde-claro {
  background: #dcfce7;
  color: #166534;
}

.badge.azul {
  background: #dbeafe;
  color: #1d4ed8;
}

.precio {
  font-size: 1.125rem;
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

.card-body h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.descripcion {
  font-size: 0.8rem;
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
  font-size: 0.8rem;
  color: #6b7280;
}

.meta-rating {
  color: #f59e0b;
  font-weight: 500;
}

.meta-item svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #9ca3af;
}

.btn-link {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: 0.5px solid #d1d5db;
  background: white;
  color: #1a1a1a;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border 0.15s,
    color 0.15s;
}

.btn-link:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.btn-detalle {
  margin: 0 1.25rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.btn-detalle svg {
  width: 16px;
  height: 16px;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .form-wrap {
    padding: 16px;
  }
  .form-card {
    padding: 1.25rem;
  }
  .lista {
    grid-template-columns: 1fr;
  }
}
</style>
