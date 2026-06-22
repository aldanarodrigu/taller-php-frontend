<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed, onMounted, onActivated, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useReservasStore } from "@/modules/reservas/stores/reservas";
import { serviciosApi } from "@/modules/servicios/api/servicios";
import { paquetesApi } from "@/modules/paquetes/api/paquetes";

const router = useRouter();
const store = useReservasStore();

const tab = ref<"reservas" | "paquetes">("reservas");

// --- Reservas ---
const nombresServicios = ref<Record<number, string>>({});
const nombresProfesionales = ref<Record<number, string>>({});
const filtroEstado = ref("todas");

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

function requiereReprogramacion(r: any) {
  return (
    r.requiere_reprogramacion === true ||
    r.requiere_reprogramacion === 1 ||
    r.requiere_reprogramacion === "1" ||
    r.requiere_reprogramacion === "true"
  );
}

function irAReprogramar(id: number) {
  router.push({
    name: "ReservaDetalle",
    params: { id },
    query: { reprogramar: "1" },
  });
}

async function cargarNombreServicio(servicioId: number) {
  if (nombresServicios.value[servicioId]) return;

  try {
    const res = await serviciosApi.obtener(servicioId);

    nombresServicios.value[servicioId] =
      res.data?.nombre ?? `Servicio #${servicioId}`;

    const prof = res.data?.profesional?.user;

    if (prof) {
      nombresProfesionales.value[servicioId] = `${prof.nombre} ${prof.apellido}`;
    }
  } catch {
    nombresServicios.value[servicioId] = `Servicio #${servicioId}`;
  }
}

async function cargarReservas() {
  await store.listar();

  const ids = [...new Set(store.reservas.map((r) => r.servicio_id))];
  ids.forEach(cargarNombreServicio);
}

// --- Paquetes ---
const paquetes = ref<any[]>([]);
const errorPaquetes = ref("");
const cargando = ref(true);

const ESTADOS_PAQUETE: Record<string, string> = {
  activo: "verde-claro",
  agotado: "gris",
  vencido: "rojo",
};

async function cargarPaquetes() {
  try {
    const res = await paquetesApi.misPaquetes();
    paquetes.value = Array.isArray(res.data) ? res.data : res.data.data ?? [];
  } catch {
    errorPaquetes.value = "Error al cargar tus paquetes.";
  }
}

async function cargarDatos(mostrarCargando = false) {
  if (mostrarCargando) {
    cargando.value = true;
  }

  await Promise.all([cargarReservas(), cargarPaquetes()]);

  cargando.value = false;
}

function refrescarDatos() {
  cargarDatos(false);
}

onMounted(async () => {
  await cargarDatos(true);
  window.addEventListener("focus", refrescarDatos);
});

onActivated(async () => {
  await cargarDatos(false);
});

onUnmounted(() => {
  window.removeEventListener("focus", refrescarDatos);
});
</script>

<template>
  <div class="form-wrap">
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Mis Compras</h3>
          <p>Tus reservas y paquetes adquiridos</p>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab"
          :class="{ activo: tab === 'reservas' }"
          @click="tab = 'reservas'"
        >
          Reservas
        </button>
        <button
          class="tab"
          :class="{ activo: tab === 'paquetes' }"
          @click="tab = 'paquetes'"
        >
          Paquetes
        </button>
      </div>

      <p v-if="cargando" class="empty-text">Cargando...</p>

      <!-- Tab reservas -->
      <template v-else-if="tab === 'reservas'">
        <div v-if="store.error" class="error-msg">{{ store.error }}</div>
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

          <div v-else class="lista">
            <div
              v-for="r in reservasFiltradas"
              :key="r.id"
              class="item clickable"
              @click="router.push({ name: 'ReservaDetalle', params: { id: r.id } })"
            >
              <div class="content">
                <span class="badge" :class="ESTADOS_COLOR[r.estado]">
                  {{ ESTADOS_LABEL[r.estado] ?? r.estado }}
                </span>

                <div v-if="requiereReprogramacion(r)" class="reprogramacion-box">
                  <div class="reprogramacion-texto">
                    <span class="reprogramacion-titulo">Requiere reprogramación</span>

                    <span v-if="r.motivo_reprogramacion" class="reprogramacion-motivo">
                      {{ r.motivo_reprogramacion }}
                    </span>

                    <span v-else class="reprogramacion-motivo">
                      Esta reserva fue afectada por un cambio de disponibilidad.
                    </span>
                  </div>

                  <button
                    class="btn-reprogramar"
                    @click.stop="irAReprogramar(r.id)"
                  >
                    Reprogramar
                  </button>
                </div>

                <h4>{{ nombresServicios[r.servicio_id] ?? "..." }}</h4>
                <p v-if="nombresProfesionales[r.servicio_id]">
                  {{ nombresProfesionales[r.servicio_id] }}
                </p>
                <div class="meta">
                  <span>{{ formatFecha(r.fecha) }}</span>
                  <span>{{ formatHora(r.hora_inicio) }} – {{ formatHora(r.hora_fin) }}</span>
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
      </template>

      <!-- Tab paquetes -->
      <template v-else-if="tab === 'paquetes'">
        <div v-if="errorPaquetes" class="error-msg">{{ errorPaquetes }}</div>
        <p v-else-if="paquetes.length === 0" class="empty-text">No adquiriste ningún paquete aún.</p>

        <div v-else class="lista-paquetes">
          <div v-for="p in paquetes" :key="p.id" class="card-paquete">
            <div class="card-paquete-header">
              <h4>{{ p.nombre }}</h4>
              <span class="badge" :class="ESTADOS_PAQUETE[p.clientes?.[0]?.pivot?.estado] ?? 'gris'">
                {{ p.clientes?.[0]?.pivot?.estado ?? "—" }}
              </span>
            </div>
            <p class="card-paquete-desc">{{ p.descripcion }}</p>
            <p class="card-paquete-sesiones">
              {{ p.clientes?.[0]?.pivot?.sesiones_disponibles ?? 0 }} de {{ p.cantidad_sesiones }} sesiones disponibles
            </p>
            <div class="card-paquete-footer">
              <span v-if="p.clientes?.[0]?.pivot?.fecha_compra">
                Comprado el {{ formatFecha(p.clientes[0].pivot.fecha_compra) }}
              </span>
              <span v-if="p.clientes?.[0]?.pivot?.fecha_vencimiento">
                Vence el {{ formatFecha(p.clientes[0].pivot.fecha_vencimiento) }}
              </span>
            </div>
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
  margin-bottom: 1.25rem;
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.tab {
  padding: 0.4rem 1rem;
  border: 0.5px solid #d1d5db;
  border-radius: 20px;
  background: white;
  font-size: 0.85rem;
  color: #374151;
  cursor: pointer;
}

.tab.activo {
  background: #eff9ff;
  border-color: #2563eb;
  color: #1d4ed8;
  font-weight: 600;
}

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

.lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 12px 14px;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
}

.item.clickable {
  cursor: pointer;
}

.item.clickable:hover {
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

.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.73rem;
  color: #9ca3af;
  margin-top: 2px;
}

.arrow {
  width: 18px;
  height: 18px;
  color: #d1d5db;
  flex-shrink: 0;
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

.reprogramacion-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.55rem;
  padding: 0.55rem 0.7rem;
  border: 0.5px solid #facc15;
  border-radius: 8px;
  background: #fffbeb;
}

.reprogramacion-texto {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.reprogramacion-titulo {
  font-size: 0.72rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.reprogramacion-motivo {
  font-size: 0.73rem;
  color: #a16207;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-reprogramar {
  border: 0.5px solid #f59e0b;
  border-radius: 20px;
  padding: 0.35rem 0.75rem;
  background: white;
  color: #b45309;
  font-size: 0.73rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}

.btn-reprogramar:hover {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.lista-paquetes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-paquete {
  border: 0.5px solid #e9d5ff;
  border-left: 4px solid #7c3aed;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-paquete-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-paquete-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.card-paquete-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.card-paquete-sesiones {
  font-size: 0.8rem;
  color: #7c3aed;
  font-weight: 500;
}

.card-paquete-footer {
  font-size: 0.73rem;
  color: #9ca3af;
  display: flex;
  gap: 1rem;
}
</style>
