<script setup lang="ts">
import { computed, onActivated, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useReservasStore } from "@/modules/reservas/stores/reservas";
import { serviciosApi } from "@/modules/servicios/api/servicios";

const store = useReservasStore();
const router = useRouter();

const nombresServicios = ref<Record<number, string>>({});
const nombresProfesionales = ref<Record<number, string>>({});

const ESTADOS_COLOR: Record<string, string> = {
  pendiente: "amarillo",
  confirmada: "azul",
  pagada: "verde-claro",
  en_curso: "verde",
  finalizada: "gris",
  cancelada: "rojo",
  no_asistida: "naranja",
};

const ESTADOS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  pagada: "Pagada",
  en_curso: "En curso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  no_asistida: "No asistida",
};

const filtroEstado = ref<string>("todas");

const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "todas") return store.reservas;
  return store.reservas.filter((r) => r.estado === filtroEstado.value);
});

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-UY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHora(hora: string) {
  return hora?.slice(0, 5);
}

async function cargarReservas() {
  await store.listar();

  const ids = [...new Set(store.reservas.map((r) => r.servicio_id))];
  ids.forEach(cargarNombreServicio);
}

function refrescarReservas() {
  cargarReservas();
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
  await cargarReservas();
  window.addEventListener("focus", refrescarReservas);
});

onActivated(async () => {
  await cargarReservas();
});

onUnmounted(() => {
  window.removeEventListener("focus", refrescarReservas);
});
</script>

<template>
  <div class="form-wrap">
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Mis Reservas</h3>
          <p>Tus turnos y servicios reservados</p>
        </div>
      </div>

      <p v-if="store.cargando" class="empty-text">Cargando...</p>
      <div v-else-if="store.error" class="error-msg">{{ store.error }}</div>
      <p v-else-if="store.reservas.length === 0" class="empty-text">No tenés reservas aún.</p>

      <template v-else>
        <div class="filtros">
          <button
            class="filtro-chip"
            :class="{ activo: filtroEstado === 'todas' }"
            @click="filtroEstado = 'todas'"
          >
            Todas
          </button>
          <button
            v-for="(label, key) in ESTADOS_LABEL"
            :key="key"
            class="filtro-chip"
            :class="{ activo: filtroEstado === key }"
            @click="filtroEstado = key"
          >
            {{ label }}
          </button>
        </div>

        <p v-if="reservasFiltradas.length === 0" class="empty-text">
          No tenés reservas con este estado.
        </p>

        <div v-else class="notification-list">
          <div
            v-for="r in reservasFiltradas"
            :key="r.id"
            class="notification-item clickable"
            @click="router.push({ name: 'ReservaDetalle', params: { id: r.id } })"
          >
            <div class="content">
              <span class="badge" :class="ESTADOS_COLOR[r.estado]">
                {{ ESTADOS_LABEL[r.estado] ?? r.estado }}
              </span>

              <h4>{{ nombresServicios[r.servicio_id] ?? "..." }}</h4>
              <p v-if="nombresProfesionales[r.servicio_id]">
                {{ nombresProfesionales[r.servicio_id] }}
              </p>
              <div class="meta">
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ formatFecha(r.fecha) }}
                </span>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ formatHora(r.hora_inicio) }} – {{ formatHora(r.hora_fin) }}
                </span>
              </div>
            </div>
            <svg
              class="arrow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </template>
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

.notification-list {
  display: grid;
  grid-template-columns: repeat(1, minmax(280px, 1fr));
  gap: 8px;
}

/* ── Filtros por estado ── */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.filtro-chip {
  padding: 0.3rem 0.85rem;
  border: 0.5px solid #d1d5db;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  background: white;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
}

.filtro-chip:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.filtro-chip.activo {
  border-color: #2563eb;
  background: #eff9ff;
  color: #1d4ed8;
  font-weight: 600;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 12px 14px;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  transition: border 0.15s;
}

.notification-item.clickable {
  cursor: pointer;
}

.notification-item.clickable:hover {
  border-color: #2563eb;
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.content p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* ── Meta (fecha/hora) ── */
.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.73rem;
  color: #9ca3af;
  margin-top: 2px;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.meta svg {
  width: 13px;
  height: 13px;
  color: #9ca3af;
}

.arrow {
  width: 18px;
  height: 18px;
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

.badge.amarillo {
  background: #fef9c3;
  color: #854d0e;
}
.badge.azul {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge.verde-claro {
  background: #dcfce7;
  color: #166534;
}
.badge.verde {
  background: #bbf7d0;
  color: #15803d;
}
.badge.gris {
  background: #f3f4f6;
  color: #4b5563;
}
.badge.rojo {
  background: #fee2e2;
  color: #b91c1c;
}
.badge.naranja {
  background: #ffedd5;
  color: #9a3412;
}
</style>
