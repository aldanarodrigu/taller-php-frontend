<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useReservasStore } from "@/modules/reservas/stores/reservas";
import { serviciosApi } from "@/modules/servicios/api/servicios";

const store = useReservasStore();
const router = useRouter();

const nombresServicios = ref<Record<number, string>>({});
const nombresProfesionales = ref<Record<number, string>>({});

const ESTADOS_COLOR: Record<string, string> = {
  pendiente:   "amarillo",
  confirmada:  "azul",
  pagada:      "verde-claro",
  en_curso:    "verde",
  finalizada:  "gris",
  cancelada:   "rojo",
  no_asistida: "naranja",
};

const ESTADOS_LABEL: Record<string, string> = {
  pendiente:   "Pendiente",
  confirmada:  "Confirmada",
  pagada:      "Pagada",
  en_curso:    "En curso",
  finalizada:  "Finalizada",
  cancelada:   "Cancelada",
  no_asistida: "No asistida",
};

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-UY", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function formatHora(hora: string) {
  return hora?.slice(0, 5);
}

async function cargarNombreServicio(servicioId: number) {
  if (nombresServicios.value[servicioId]) return;
  try {
    const res = await serviciosApi.obtener(servicioId);
    nombresServicios.value[servicioId] = res.data?.nombre ?? `Servicio #${servicioId}`;
    const prof = res.data?.profesional?.user;
    if (prof) {
      nombresProfesionales.value[servicioId] = `${prof.nombre} ${prof.apellido}`;
    }
  } catch {
    nombresServicios.value[servicioId] = `Servicio #${servicioId}`;
  }
}

onMounted(async () => {
  await store.listar();
  const ids = [...new Set(store.reservas.map((r) => r.servicio_id))];
  ids.forEach(cargarNombreServicio);
});
</script>

<template>
  <div class="reservas">
    <h1>Mis Reservas</h1>

    <div v-if="store.cargando" class="estado">Cargando...</div>
    <div v-else-if="store.error" class="estado error">{{ store.error }}</div>
    <div v-else-if="store.reservas.length === 0" class="estado">No tenés reservas aún.</div>

    <div v-else class="lista">
      <div
        v-for="r in store.reservas"
        :key="r.id"
        class="card"
        @click="router.push({ name: 'ReservaDetalle', params: { id: r.id } })"
      >
        <div class="card-left">
          <span class="badge" :class="ESTADOS_COLOR[r.estado]">
            {{ ESTADOS_LABEL[r.estado] ?? r.estado }}
          </span>
          <p class="nombre-servicio">
            {{ nombresServicios[r.servicio_id] ?? '...' }}
          </p>
          <p v-if="nombresProfesionales[r.servicio_id]" class="nombre-profesional">
            {{ nombresProfesionales[r.servicio_id] }}
          </p>
          <div class="meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd"/></svg>
              {{ formatFecha(r.fecha) }}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd"/></svg>
              {{ formatHora(r.hora_inicio) }} – {{ formatHora(r.hora_fin) }}
            </span>
          </div>
        </div>
        <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservas {
  padding: 1.5rem 2rem;
  font-family: "Poppins", sans-serif;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.estado {
  font-size: 0.875rem;
  color: #6b7280;
}

.estado.error { color: #dc2626; }

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.09);
  transform: translateY(-1px);
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nombre-servicio {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.nombre-profesional {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.meta {
  display: flex;
  gap: 1.25rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.meta svg {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.arrow {
  width: 20px;
  height: 20px;
  color: #d1d5db;
  flex-shrink: 0;
}

/* ── Badges de estado ── */
.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.badge.amarillo  { background: #fef9c3; color: #854d0e; }
.badge.azul      { background: #dbeafe; color: #1d4ed8; }
.badge.verde-claro { background: #dcfce7; color: #166534; }
.badge.verde     { background: #bbf7d0; color: #15803d; }
.badge.gris      { background: #f3f4f6; color: #4b5563; }
.badge.rojo      { background: #fee2e2; color: #b91c1c; }
.badge.naranja   { background: #ffedd5; color: #9a3412; }
</style>
