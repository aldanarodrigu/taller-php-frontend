<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServiciosStore } from "@/modules/servicios/stores/servicios";
import MapaServicio from "@/modules/servicios/components/MapaServicio.vue";
import { reservasApi } from "@/modules/reservas/api/reservas";
import { serviciosApi } from "@/modules/servicios/api/servicios";
import { calificacionesApi } from "@/modules/calificaciones/api/calificaciones";
import { paquetesApi } from "@/modules/paquetes/api/paquetes";

import { useAuthStore } from "@/modules/auth/stores/auth";

const route = useRoute();
const router = useRouter();
const store = useServiciosStore();

const authStore = useAuthStore();

const disponibilidadDetalle = ref<any[]>([]);

const resenas = ref<any[]>([]);
const promedioResenas = ref<number | null>(null);

function calcularPromedio(lista: any[]) {
  if (!lista.length) return null;
  const suma = lista.reduce((acc, r) => acc + r.puntuacion, 0);
  return Math.round((suma / lista.length) * 10) / 10;
}

const showModal = ref(false);
const fecha = ref("");
const horarioSeleccionado = ref("");
const disponibilidades = ref<any[]>([]);
const horarios = ref<string[]>([]);
const diaSinDisponibilidad = ref(false);
const cargandoDisponibilidad = ref(false);
const creandoReserva = ref(false);
const errorReserva = ref<string | null>(null);
const paquetesDisponibles = ref<any[]>([]);
const paqueteClienteIdSeleccionado = ref<number | null>(null);

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
  const id = Number(route.params.id);
  await store.obtener(id);
  if (store.servicio?.profesional_id) {
    try {
      const res = await serviciosApi.disponibilidad(store.servicio.profesional_id);
      disponibilidadDetalle.value = res.data ?? [];
    } catch {
      /* no crítico */
    }
  }
  try {
    const res = await calificacionesApi.porServicio(id);
    resenas.value = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
    promedioResenas.value = calcularPromedio(resenas.value);
  } catch {
    /* no crítico */
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
  paqueteClienteIdSeleccionado.value = null;
  paquetesDisponibles.value = [];
  showModal.value = true;

  const servicioId = Number(route.params.id);

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

  if (authStore.user?.role === "cliente") {
    try {
      const res = await paquetesApi.paraServicio(servicioId);
      paquetesDisponibles.value = res.data ?? [];
    } catch {
      paquetesDisponibles.value = [];
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
    const payload: any = {
      servicio_id: Number(route.params.id),
      fecha: fecha.value,
      hora_inicio: horarioSeleccionado.value,
    };
    if (paqueteClienteIdSeleccionado.value) {
      payload.paquete_cliente_id = paqueteClienteIdSeleccionado.value;
    }
    await reservasApi.crear(payload);
    showModal.value = false;
    router.push({ name: "Compras" });
  } catch (e: any) {
    errorReserva.value = e?.response?.data?.error ?? "Error al crear la reserva.";
  } finally {
    creandoReserva.value = false;
  }
}
</script>

<template>
  <div class="form-wrap">
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

    <p v-if="store.cargando" class="empty-text">Cargando...</p>
    <div v-else-if="store.error" class="error-msg">{{ store.error }}</div>

    <template v-else-if="store.servicio">
      <!-- Card de información -->
      <div class="form-card">
        <div class="profesional-strip" v-if="store.servicio.profesional">
          <img
            :src="
              store.servicio.profesional?.foto ||
              'https://ui-avatars.com/api/?name=' +
                store.servicio.profesional?.user.nombre +
                '+' +
                store.servicio.profesional?.user.apellido +
                '&size=80&bold=true'
            "
            :alt="store.servicio.profesional?.user.nombre"
            class="profesional-avatar"
          />
          <div class="profesional-info">
            <router-link
              class="profesional-nombre"
              :to="{
                name: 'ProfileUser',
                params: {
                  id: store.servicio.profesional?.user.id,
                },
              }"
            >
              {{ store.servicio.profesional?.user.nombre }}
              {{ store.servicio.profesional?.user.apellido }}
            </router-link>
            <span class="profesional-rating">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l1.83 4.401 4.753.381c1.164.093 1.636 1.545.749 2.305l-3.62 3.106 1.106 4.637c.27 1.136-.96 2.033-1.96 1.425L12 16.847l-4.07 2.618c-1 .608-2.23-.29-1.96-1.425l1.106-4.637-3.62-3.106c-.887-.76-.415-2.212.749-2.305l4.753-.38 1.83-4.402z"
                />
              </svg>
              {{
                store.servicio.profesional?.puntuacion_promedio > 0
                  ? store.servicio.profesional.puntuacion_promedio
                  : "Nuevo"
              }}
            </span>
          </div>
        </div>

        <div class="form-header">
          <div>
            <div class="badges">
              <span
                class="badge"
                :class="
                  store.servicio.modalidad === 'presencial'
                    ? 'verde-claro'
                    : store.servicio.modalidad === 'hibrida'
                      ? 'naranja'
                      : 'azul'
                "
              >
                {{
                  store.servicio.modalidad === "presencial"
                    ? "Presencial"
                    : store.servicio.modalidad === "hibrida"
                      ? "Híbrida"
                      : "Virtual"
                }}
              </span>
              <span v-if="store.servicio.videollamada" class="badge amarillo"> Videollamada </span>
            </div>
            <h3>{{ store.servicio.nombre }}</h3>
            <p>{{ store.servicio.descripcion }}</p>
          </div>
        </div>

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
              store.servicio.modalidad === "presencial"
                ? "Presencial"
                : store.servicio.modalidad === "hibrida"
                  ? "Híbrida"
                  : "Virtual"
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

        <button
          v-if="authStore.user?.role === 'cliente'"
          class="btn-save btn-reservar"
          @click="abrirModal"
        >
          Reservar este servicio
        </button>
      </div>

      <!-- Card de mapa / placeholder virtual, a ancho completo -->
      <div class="form-card col-mapa">
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
        <div v-else-if="store.servicio.modalidad === 'hibrida'" class="virtual-placeholder">
          <p>Modalidad híbrida</p>
          <span>La modalidad de cada sesión se coordina directamente con el profesional</span>
        </div>
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
      <!-- Calificaciones -->
      <div class="form-card">
        <div class="form-header">
          <div>
            <h3>
              Calificaciones
              <span v-if="promedioResenas !== null" class="promedio">
                {{ promedioResenas }} / 5
              </span>
            </h3>
            <p>
              {{ resenas.length }} {{ resenas.length === 1 ? "calificación" : "calificaciones" }}
            </p>
          </div>
        </div>

        <p v-if="resenas.length === 0" class="empty-text">
          Todavía no hay calificaciones para este servicio.
        </p>

        <div v-else class="resenas-lista">
          <div v-for="r in resenas" :key="r.id" class="resena-item">
            <div class="resena-header">
              <span class="resena-autor">
                {{ r.cliente?.user?.nombre ?? "Cliente" }}
              </span>
              <span class="resena-puntuacion">{{ r.puntuacion }} / 5</span>
            </div>
            <p v-if="r.comentario" class="resena-comentario">{{ r.comentario }}</p>
          </div>
        </div>
      </div>
    </template>
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
            <input
              class="input"
              type="date"
              v-model="fecha"
              :min="new Date().toISOString().slice(0, 10)"
            />
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

        <div v-if="paquetesDisponibles.length > 0" class="paquete-section">
          <p class="horarios-label">¿Usar sesión de un paquete?</p>
          <div class="paquete-opciones">
            <label class="paquete-opcion">
              <input type="radio" :value="null" v-model="paqueteClienteIdSeleccionado" />
              No, reservar sin paquete
            </label>
            <label
              v-for="p in paquetesDisponibles"
              :key="p.paquete_cliente_id"
              class="paquete-opcion"
            >
              <input
                type="radio"
                :value="p.paquete_cliente_id"
                v-model="paqueteClienteIdSeleccionado"
              />
              {{ p.nombre }}
              <span class="paquete-sesiones"
                >{{ p.sesiones_disponibles }} sesión{{
                  p.sesiones_disponibles !== 1 ? "es" : ""
                }}
                disponible{{ p.sesiones_disponibles !== 1 ? "s" : "" }}</span
              >
            </label>
          </div>
        </div>

        <p v-if="errorReserva" class="error-msg">{{ errorReserva }}</p>

        <div class="modal-actions">
          <button class="btn-link" @click="showModal = false">Cancelar</button>
          <button
            class="btn-save"
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
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 0.5px solid #e5e7eb;
}

.form-header h3 {
  margin: 0.5rem 0 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.form-header p {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
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

/* ── Volver ── */
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
  transition: color 0.15s;
}

.btn-volver svg {
  width: 16px;
  height: 16px;
}

.btn-volver:hover {
  color: #111827;
}

/* ── Profesional (franja compacta) ── */
.profesional-strip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 1.25rem;
  border-bottom: 0.5px solid #e5e7eb;
}

.profesional-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 0.5px solid #e5e7eb;
  flex-shrink: 0;
}

.profesional-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.profesional-nombre {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.profesional-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  color: #f59e0b;
}

.profesional-rating svg {
  width: 12px;
  height: 12px;
}

/* ── Badges ── */
.badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
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

/* ── Info ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-valor {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.info-valor.precio {
  font-size: 1.125rem;
  color: #2563eb;
}

/* ── Dirección ── */
.direccion {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.direccion svg {
  width: 14px;
  height: 14px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Disponibilidad ── */
.disponibilidad-detalle {
  background: #f9fafb;
  border: 0.5px solid #e5e7eb;
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
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
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
  font-size: 0.8rem;
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
  font-size: 0.73rem;
  color: #9ca3af;
  margin-left: 0.25rem;
}

/* ── Botón reservar ── */
.btn-reservar {
  width: fit-content;
  padding: 10px 24px;
}

/* ── Mapa / placeholder virtual ── */
.col-mapa {
  padding: 0;
  overflow: hidden;
  min-height: 320px;
}

.col-mapa :deep(.mapa) {
  height: 100%;
  min-height: 320px;
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
  min-height: 320px;
}

.virtual-placeholder svg {
  width: 48px;
  height: 48px;
  color: #93c5fd;
}

.virtual-placeholder p {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.virtual-placeholder span {
  font-size: 0.8rem;
  color: #9ca3af;
  max-width: 280px;
}

/* ── Botones genéricos (unificados) ── */
.btn-save {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.btn-save:hover {
  opacity: 0.85;
}
.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

.input {
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  outline: none;
  transition: border 0.15s;
  background: white;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  border-color: #2563eb;
}

/* ── Modal de reserva ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  backdrop-filter: blur(2px);
}

.modal {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1rem;
  font-weight: 600;
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
  font-size: 0.8rem;
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
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-actions .btn-link,
.modal-actions .btn-save {
  flex: 1;
  text-align: center;
}

/* ── Horarios disponibles ── */
.horarios-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.horarios-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.horarios-estado {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.sin-disponibilidad {
  font-size: 0.8rem;
  color: #9a3412;
  background: #ffedd5;
  border-radius: 8px;
  padding: 0.6rem 0.875rem;
  margin: 0;
}

.horarios-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.horario {
  padding: 0.3rem 0.85rem;
  border: 0.5px solid #d1d5db;
  border-radius: 20px;
  background: white;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
}

.horario:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.horario.activo {
  border-color: #2563eb;
  background: #eff9ff;
  color: #1d4ed8;
  font-weight: 600;
}

/* ── Reseñas ── */
.promedio {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2563eb;
  margin-left: 0.5rem;
}

.resenas-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resena-item {
  padding: 0.75rem 1rem;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.resena-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resena-autor {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
}

.resena-puntuacion {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563eb;
}

.resena-comentario {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.paquete-section {
  margin-top: 0.75rem;
}

.paquete-opciones {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.paquete-opcion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 400;
  color: #374151;
  cursor: pointer;
}

.paquete-sesiones {
  margin-left: auto;
  font-size: 0.7rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.1rem 0.4rem;
}
</style>
