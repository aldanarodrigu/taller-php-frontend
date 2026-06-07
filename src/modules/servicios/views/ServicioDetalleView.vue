<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";
import MapaServicio from "@/modules/servicios/components/MapaServicio.vue";
import { reservasApi } from "@/modules/reservas/api/reservas";
import { serviciosApi } from "@/modules/servicios/api/servicios";

const route = useRoute();
const router = useRouter();
const store = useServiciosStore();

const disponibilidadDetalle = ref<any[]>([]);

const showModal = ref(false);
const fecha = ref("");
const horarioSeleccionado = ref("");
const disponibilidades = ref<any[]>([]);
const horarios = ref<string[]>([]);
const diaSinDisponibilidad = ref(false);
const cargandoDisponibilidad = ref(false);
const creandoReserva = ref(false);
const errorReserva = ref<string | null>(null);

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sabado"];

function horaAMinutos(hora: string): number {
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(min: number): string {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generarHorarios(disp: any, duracion: number): string[] {
  const inicio = horaAMinutos(disp.hora_inicio);
  const fin = horaAMinutos(disp.hora_fin);
  const buffer = disp.buffer ?? 0;
  const pausaInicio = disp.hora_inicio_pausa ? horaAMinutos(disp.hora_inicio_pausa) : null;
  const pausaFin = disp.hora_fin_pausa ? horaAMinutos(disp.hora_fin_pausa) : null;

  const resultado: string[] = [];
  let actual = inicio;

  while (actual + duracion <= fin) {
    const finBloque = actual + duracion;

    if (pausaInicio !== null && pausaFin !== null && actual < pausaFin && finBloque > pausaInicio) {
      actual = pausaFin;
      continue;
    }

    resultado.push(minutosAHora(actual));
    actual = finBloque + buffer;
  }

  return resultado;
}

watch(fecha, (nuevaFecha) => {
  horarioSeleccionado.value = "";
  horarios.value = [];
  diaSinDisponibilidad.value = false;

  if (!nuevaFecha) return;

  const dia = DIAS[new Date(nuevaFecha + "T00:00:00").getDay()];
  const disp = disponibilidades.value.find((d) => d.dia_semana === dia);

  if (!disp) {
    diaSinDisponibilidad.value = true;
    return;
  }

  horarios.value = generarHorarios(disp, store.servicio?.duracion_minutos ?? 60);
});

function formatHora(hora: string) {
  return hora?.slice(0, 5);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

onMounted(async () => {
  await store.obtener(Number(route.params.id));
  if (store.servicio?.profesional_id) {
    try {
      const res = await serviciosApi.disponibilidad(store.servicio.profesional_id);
      disponibilidadDetalle.value = res.data ?? [];
    } catch {
      /* no crítico */
    }
  }
});

function volver() {
  router.push({ name: "Servicios" });
}

async function abrirModal() {
  fecha.value = "";
  horarioSeleccionado.value = "";
  horarios.value = [];
  diaSinDisponibilidad.value = false;
  errorReserva.value = null;
  showModal.value = true;

  if (store.servicio?.profesional_id) {
    cargandoDisponibilidad.value = true;
    try {
      const res = await serviciosApi.disponibilidad(store.servicio.profesional_id);
      disponibilidades.value = res.data ?? [];
    } catch {
      disponibilidades.value = [];
    } finally {
      cargandoDisponibilidad.value = false;
    }
  }
}

async function confirmarReserva() {
  if (!fecha.value || !horarioSeleccionado.value) {
    errorReserva.value = "Elegí una fecha y un horario disponible.";
    return;
  }
  creandoReserva.value = true;
  errorReserva.value = null;
  try {
    await reservasApi.crear({
      servicio_id: Number(route.params.id),
      fecha: fecha.value,
      hora_inicio: horarioSeleccionado.value,
    });
    showModal.value = false;
    router.push({ name: "Reservas" });
  } catch (e: any) {
    errorReserva.value = e?.response?.data?.error ?? "Error al crear la reserva.";
  } finally {
    creandoReserva.value = false;
  }
}
</script>

<template>
  <div class="detalle-wrapper">
    <button class="btn-volver" @click="volver">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clip-rule="evenodd"
        />
      </svg>
      Volver a servicios
    </button>

    <div v-if="store.cargando" class="estado">Cargando...</div>

    <div v-else-if="store.error" class="estado error">
      {{ store.error }}
    </div>

    <div v-else-if="store.servicio" class="layout">
      <!-- Columna izquierda: info -->
      <div class="col-info">
        <div class="badges">
          <span class="badge" :class="store.servicio.modalidad">
            {{ store.servicio.modalidad === "presencial" ? "Presencial" : "Virtual" }}
          </span>
          <span v-if="store.servicio.videollamada" class="badge videollamada"> Videollamada </span>
        </div>

        <h1>{{ store.servicio.nombre }}</h1>
        <p class="descripcion">{{ store.servicio.descripcion }}</p>

        <div class="separador"></div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Precio</span>
            <span class="info-valor precio">${{ Number(store.servicio.precio).toFixed(2) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Duración</span>
            <span class="info-valor">{{ store.servicio.duracion_minutos }} min</span>
          </div>
          <div v-if="store.servicio.tipo" class="info-item">
            <span class="info-label">Tipo</span>
            <span class="info-valor">{{ store.servicio.tipo }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Modalidad</span>
            <span class="info-valor">{{
              store.servicio.modalidad === "presencial" ? "Presencial" : "Virtual"
            }}</span>
          </div>
        </div>

        <div
          v-if="store.servicio.modalidad === 'presencial' && store.servicio.direccion"
          class="direccion"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.692 17 9A7 7 0 103 9c0 3.692 1.698 6.227 3.354 7.585a12.85 12.85 0 002.274 1.765 11.37 11.37 0 00.757.433 5.741 5.741 0 00.28.14l.019.009.006.002zm1.055-1.828a12.17 12.17 0 01-.745-.527C8.552 15.773 5 13.308 5 9a5 5 0 1110 0c0 4.308-3.552 6.773-5 7.105z"
              clip-rule="evenodd"
            />
            <path d="M10 11a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          {{ store.servicio.direccion }}
        </div>

        <div v-if="disponibilidadDetalle.length > 0" class="disponibilidad-detalle">
          <p class="disponibilidad-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                clip-rule="evenodd"
              />
            </svg>
            Disponibilidad
          </p>
          <ul class="disponibilidad-lista">
            <li v-for="d in disponibilidadDetalle" :key="d.id">
              <span class="dia">{{ capitalize(d.dia_semana) }}</span>
              <span class="rango">
                {{ formatHora(d.hora_inicio) }} a {{ formatHora(d.hora_fin) }} hs
                <template v-if="d.hora_inicio_pausa && d.hora_fin_pausa">
                  <span class="pausa"
                    >(pausa {{ formatHora(d.hora_inicio_pausa) }}–{{
                      formatHora(d.hora_fin_pausa)
                    }})</span
                  >
                </template>
              </span>
            </li>
          </ul>
        </div>

        <button class="btn-reservar" @click="abrirModal">
          Reservar este servicio
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Columna derecha: mapa o visual virtual -->
      <div class="col-mapa">
        <MapaServicio
          v-if="
            store.servicio.modalidad === 'presencial' &&
            store.servicio.latitud &&
            store.servicio.longitud
          "
          :latitud="parseFloat(store.servicio.latitud)"
          :longitud="parseFloat(store.servicio.longitud)"
          :direccion="store.servicio.direccion"
        />
        <div v-else class="virtual-placeholder">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p>Servicio virtual</p>
          <span>La sesión se realiza por videollamada desde cualquier lugar</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Formulario de reserva -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Formulario de reserva</h3>
          <button class="modal-close" @click="showModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>

        <p class="modal-servicio">{{ store.servicio?.nombre }}</p>

        <div class="modal-form">
          <label>
            Fecha
            <input type="date" v-model="fecha" :min="new Date().toISOString().slice(0, 10)" />
          </label>
        </div>

        <div v-if="fecha" class="horarios-section">
          <p v-if="cargandoDisponibilidad" class="horarios-estado">Cargando horarios...</p>

          <template v-else-if="diaSinDisponibilidad">
            <p class="sin-disponibilidad">El profesional no tiene disponibilidad para este día.</p>
          </template>

          <template v-else-if="horarios.length > 0">
            <p class="horarios-label">Horarios disponibles</p>
            <div class="horarios-grid">
              <button
                v-for="horario in horarios"
                :key="horario"
                class="horario"
                :class="{ activo: horario === horarioSeleccionado }"
                @click="horarioSeleccionado = horario"
              >
                {{ horario }}
              </button>
            </div>
          </template>

          <p v-else class="horarios-estado">No hay horarios disponibles para este día.</p>
        </div>

        <p v-if="errorReserva" class="modal-error">{{ errorReserva }}</p>

        <div class="modal-actions">
          <button class="btn-cancelar-modal" @click="showModal = false">Cancelar</button>
          <button
            class="btn-confirmar-modal"
            :disabled="creandoReserva || !fecha || !horarioSeleccionado"
            @click="confirmarReserva"
          >
            {{ creandoReserva ? "Reservando..." : "Confirmar reserva" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.detalle-wrapper {
  padding: 1.5rem 2rem;
  font-family: "Poppins", sans-serif;
  height: 100%;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
  transition: color 0.15s;
}

.btn-volver svg {
  width: 16px;
  height: 16px;
}

.btn-volver:hover {
  color: #111827;
}

.estado {
  font-size: 0.875rem;
  color: #6b7280;
}

.estado.error {
  color: #dc2626;
}

/* ── Layout dos columnas ── */
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* ── Columna info ── */
.col-info {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
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

.badge.videollamada {
  background: #fef3c7;
  color: #92400e;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.descripcion {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.65;
  margin: 0;
}

.separador {
  height: 1px;
  background: #f3f4f6;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-valor {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.info-valor.precio {
  font-size: 1.375rem;
  color: #2563eb;
}

.direccion {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.direccion svg {
  width: 16px;
  height: 16px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-top: 1px;
}

.disponibilidad-detalle {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.disponibilidad-titulo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.disponibilidad-titulo svg {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.disponibilidad-lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.disponibilidad-lista li {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.dia {
  font-weight: 600;
  color: #111827;
  min-width: 80px;
}

.rango {
  color: #4b5563;
}

.pausa {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-left: 0.25rem;
}

.btn-reservar {
  padding: 0.875rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease;
  margin-top: auto;
}

.btn-reservar svg {
  width: 17px;
  height: 17px;
}

.btn-reservar:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* ── Columna mapa ── */
.col-mapa {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.col-mapa :deep(.mapa) {
  height: 100%;
  min-height: 420px;
  border-radius: 0;
}

.virtual-placeholder {
  flex: 1;
  background: #f8faff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.virtual-placeholder svg {
  width: 56px;
  height: 56px;
  color: #93c5fd;
}

.virtual-placeholder p {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.virtual-placeholder span {
  font-size: 0.875rem;
  color: #9ca3af;
  max-width: 220px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .col-mapa {
    min-height: 280px;
  }

  .col-mapa :deep(.mapa) {
    min-height: 280px;
  }
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: "Poppins", sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
}

.modal-close svg {
  width: 20px;
  height: 20px;
}
.modal-close:hover {
  color: #111827;
}

.modal-servicio {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.modal-form input {
  padding: 0.65rem 0.875rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: "Poppins", sans-serif;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
}

.modal-form input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-error {
  font-size: 0.8125rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.6rem 0.875rem;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-cancelar-modal {
  flex: 1;
  padding: 0.7rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-cancelar-modal:hover {
  border-color: #9ca3af;
}

.btn-confirmar-modal {
  flex: 2;
  padding: 0.7rem;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    box-shadow 0.2s;
}

.btn-confirmar-modal:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-confirmar-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Horarios disponibles ── */
.horarios-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.horarios-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.horarios-estado {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

.sin-disponibilidad {
  font-size: 0.8125rem;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 0.6rem 0.875rem;
  margin: 0;
}

.horarios-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.horario {
  padding: 0.4rem 0.85rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
  font-family: "Poppins", sans-serif;
}

.horario:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.horario.activo {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}
</style>
