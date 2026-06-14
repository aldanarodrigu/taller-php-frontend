<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useReservasStore } from "@/modules/reservas/stores/reservas";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { serviciosApi } from "@/modules/servicios/api/servicios";
import { pagosApi } from "@/modules/pagos/api/pagos";

const route = useRoute();
const router = useRouter();
const store = useReservasStore();
const authStore = useAuthStore();

const servicio = ref<any | null>(null);

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

const rol = computed(() => authStore.user?.role ?? "");
const estado = computed(() => store.reserva?.estado ?? "");

const puedeConfirmar = computed(() =>
  estado.value === "pendiente" && rol.value === "profesional"
);

const puedeCancelar = computed(() =>
  ["pendiente", "confirmada"].includes(estado.value) &&
  rol.value === "cliente"
);

const puedePagar = computed(() =>
  estado.value === "confirmada" && rol.value === "cliente"
);

const esOnline = computed(() => servicio.value?.modalidad === "online");

// Solo para servicios presenciales: el profesional inicia la sesión
const puedeIniciar = computed(() =>
  ["confirmada", "pagada"].includes(estado.value) &&
  rol.value === "profesional" &&
  servicio.value !== null &&
  !esOnline.value
);

const puedeFinalizar = computed(() =>
  estado.value === "en_curso" && rol.value === "profesional"
);

const puedeNoAsistida = computed(() =>
  estado.value === "en_curso" && rol.value === "profesional"
);

// Para online: profesional desde confirmada/pagada, cliente desde confirmada/pagada/en_curso
// Si el servicio aún no cargó pero el estado es en_curso, también se muestra
const puedeVideollamada = computed(() => {
  const estadoOk = ["confirmada", "pagada", "en_curso"].includes(estado.value);
  if (!estadoOk) return false;
  if (estado.value === "en_curso") return true; // si ya está en curso, mostramos siempre
  return esOnline.value; // para confirmada/pagada dependemos de que cargue el servicio
});

const mostrarFormPago = ref(false);
const pagoCargando = ref(false);
const pagoError = ref("");

async function confirmarPago() {
  if (!store.reserva || !servicio.value) return;
  pagoCargando.value = true;
  pagoError.value = "";
  try {
    await pagosApi.crear(store.reserva.id, servicio.value.precio);
    mostrarFormPago.value = false;
    await store.obtener(store.reserva.id); // recargar reserva con estado "pagada"
  } catch (e: any) {
    pagoError.value = e?.response?.data?.error ?? "Error al procesar el pago.";
  } finally {
    pagoCargando.value = false;
  }
}

const mensajeEstado = computed(() => {
  const esCliente = rol.value === "cliente";
  const msgs: Record<string, string> = {
    pendiente:   esCliente
      ? "Tu reserva está esperando confirmación del profesional."
      : "Tenés una reserva pendiente de confirmación.",
    confirmada:  esCliente
      ? "Reserva confirmada. Completá el pago para asegurar tu lugar."
      : "Reserva confirmada. Podés iniciar la sesión cuando corresponda.",
    pagada:      esCliente
      ? `Pago recibido. Te esperamos el ${store.reserva?.fecha ?? ""}.`
      : "Pago recibido. Iniciá la sesión cuando corresponda.",
    en_curso:    esCliente ? "Tu sesión está en curso." : "Sesión en curso.",
    finalizada:  "Sesión finalizada.",
    cancelada:   "Esta reserva fue cancelada.",
    no_asistida: "El cliente no asistió a la sesión.",
  };
  return msgs[estado.value] ?? "";
});

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-UY", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function formatHora(hora: string) {
  return hora?.slice(0, 5);
}

onMounted(async () => {
  await store.obtener(Number(route.params.id));
  if (store.reserva?.servicio_id) {
    try {
      const res = await serviciosApi.obtener(store.reserva.servicio_id);
      servicio.value = res.data;
    } catch (e) {
      console.warn("No se pudo cargar el servicio:", e);
    }
  }
});
</script>

<template>
  <div class="detalle-wrapper">
    <button class="btn-volver" @click="router.push({ name: 'Reservas' })">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd"/>
      </svg>
      Volver a mis reservas
    </button>

    <div v-if="store.cargando" class="estado">Cargando...</div>
    <div v-else-if="store.error" class="estado error">{{ store.error }}</div>

    <div v-else-if="store.reserva" class="layout">

      <!-- Columna izquierda: info + acciones -->
      <div class="col-info">
        <div class="info-header">
          <span class="badge" :class="ESTADOS_COLOR[store.reserva.estado]">
            {{ ESTADOS_LABEL[store.reserva.estado] ?? store.reserva.estado }}
          </span>
          <span class="reserva-id">#{{ store.reserva.id }}</span>
        </div>

        <h1>{{ servicio?.nombre ?? `Servicio #${store.reserva.servicio_id}` }}</h1>

        <div class="separador"></div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Fecha</span>
            <span class="info-valor">{{ formatFecha(store.reserva.fecha) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Horario</span>
            <span class="info-valor">{{ formatHora(store.reserva.hora_inicio) }} – {{ formatHora(store.reserva.hora_fin) }}</span>
          </div>
          <div v-if="store.reserva.pago_id" class="info-item">
            <span class="info-label">Pago</span>
            <span class="info-valor">#{{ store.reserva.pago_id }}</span>
          </div>
        </div>

        <!-- Mensaje de estado -->
        <div v-if="mensajeEstado" class="mensaje-estado" :class="ESTADOS_COLOR[store.reserva.estado]">
          {{ mensajeEstado }}
        </div>

        <div v-if="store.accionError" class="accion-error">
          {{ store.accionError }}
        </div>

        <!-- Acciones -->
        <div class="acciones">
          <button
            v-if="puedeConfirmar"
            class="btn-accion confirmar"
            :disabled="store.accionCargando"
            @click="store.confirmar(store.reserva.id)"
          >
            {{ store.accionCargando ? 'Procesando...' : 'Confirmar reserva' }}
          </button>
          <button
            v-if="puedeCancelar"
            class="btn-accion cancelar"
            :disabled="store.accionCargando"
            @click="store.cancelar(store.reserva.id)"
          >
            {{ store.accionCargando ? 'Procesando...' : 'Cancelar reserva' }}
          </button>
          <button
            v-if="puedePagar"
            class="btn-accion pagar"
            @click="mostrarFormPago = true"
          >
            Pagar reserva
          </button>
          <button
            v-if="puedeIniciar"
            class="btn-accion iniciar"
            :disabled="store.accionCargando"
            @click="store.iniciar(store.reserva.id)"
          >
            {{ store.accionCargando ? 'Procesando...' : 'Iniciar sesión' }}
          </button>
          <button
            v-if="puedeFinalizar"
            class="btn-accion finalizar"
            :disabled="store.accionCargando"
            @click="store.finalizar(store.reserva.id)"
          >
            {{ store.accionCargando ? 'Procesando...' : 'Finalizar sesión' }}
          </button>
          <button
            v-if="puedeNoAsistida"
            class="btn-accion no-asistida"
            :disabled="store.accionCargando"
            @click="store.noAsistida(store.reserva.id)"
          >
            {{ store.accionCargando ? 'Procesando...' : 'Marcar no asistida' }}
          </button>
          <button
            v-if="puedeVideollamada"
            class="btn-accion videollamada"
            @click="router.push({ name: 'Videollamada', params: { id: store.reserva.id } })"
          >
            {{ rol === 'profesional' && estado !== 'en_curso' ? 'Iniciar videollamada' : 'Unirse a videollamada' }}
          </button>
        </div>
      </div>

      <!-- Columna derecha: resumen del servicio -->
      <div class="col-servicio">
        <div v-if="servicio" class="servicio-card">
          <p class="servicio-label">Servicio</p>
          <h2>{{ servicio.nombre }}</h2>
          <p class="servicio-desc">{{ servicio.descripcion }}</p>

          <div class="separador"></div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Modalidad</span>
              <span class="info-valor">{{ servicio.modalidad === "presencial" ? "Presencial" : "Virtual" }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Precio</span>
              <span class="info-valor precio">${{ Number(servicio.precio).toFixed(2) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Duración</span>
              <span class="info-valor">{{ servicio.duracion_minutos }} min</span>
            </div>
          </div>

          <div v-if="servicio.modalidad === 'presencial' && servicio.direccion" class="direccion">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.692 17 9A7 7 0 103 9c0 3.692 1.698 6.227 3.354 7.585a12.85 12.85 0 002.274 1.765 11.37 11.37 0 00.757.433 5.741 5.741 0 00.28.14l.019.009.006.002zm1.055-1.828a12.17 12.17 0 01-.745-.527C8.552 15.773 5 13.308 5 9a5 5 0 1110 0c0 4.308-3.552 6.773-5 7.105z" clip-rule="evenodd"/>
              <path d="M10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            {{ servicio.direccion }}
          </div>
        </div>

        <div v-else class="servicio-loading">
          Cargando información del servicio...
        </div>
      </div>

    </div>
  </div>

  <!-- Formulario de pago -->
  <Teleport to="body">
    <div v-if="mostrarFormPago" class="pago-overlay" @click.self="mostrarFormPago = false">
      <div class="pago-form">
        <h3>Confirmar pago</h3>

        <div class="pago-detalle">
          <div class="pago-fila">
            <span>Servicio</span>
            <span>{{ servicio?.nombre }}</span>
          </div>
          <div class="pago-fila">
            <span>Fecha</span>
            <span>{{ formatFecha(store.reserva?.fecha ?? '') }}</span>
          </div>
          <div class="pago-fila">
            <span>Horario</span>
            <span>{{ formatHora(store.reserva?.hora_inicio ?? '') }} – {{ formatHora(store.reserva?.hora_fin ?? '') }}</span>
          </div>
          <div class="pago-fila total">
            <span>Total</span>
            <span>UYU {{ Number(servicio?.precio).toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="pagoError" class="pago-error">{{ pagoError }}</div>

        <div class="pago-botones">
          <button class="btn-cancelar-pago" :disabled="pagoCargando" @click="mostrarFormPago = false">
            Cancelar
          </button>
          <button class="btn-confirmar-pago" :disabled="pagoCargando" @click="confirmarPago">
            {{ pagoCargando ? 'Procesando...' : 'Confirmar pago' }}
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

.btn-volver svg { width: 16px; height: 16px; }
.btn-volver:hover { color: #111827; }

.estado { font-size: 0.875rem; color: #6b7280; }
.estado.error { color: #dc2626; }

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
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reserva-id {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
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
  font-size: 1.25rem;
  color: #2563eb;
}

.mensaje-estado {
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  line-height: 1.5;
}

.mensaje-estado.amarillo  { background: #fef9c3; color: #854d0e; }
.mensaje-estado.azul      { background: #dbeafe; color: #1d4ed8; }
.mensaje-estado.verde-claro { background: #dcfce7; color: #166534; }
.mensaje-estado.verde     { background: #bbf7d0; color: #15803d; }
.mensaje-estado.gris      { background: #f3f4f6; color: #4b5563; }
.mensaje-estado.rojo      { background: #fee2e2; color: #b91c1c; }
.mensaje-estado.naranja   { background: #ffedd5; color: #9a3412; }

.btn-accion.pagar {
  background: #2563eb;
  color: white;
}
.btn-accion.pagar:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

.accion-error {
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-accion {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, box-shadow 0.2s;
}

.btn-accion:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-accion.confirmar  { background: #2563eb; color: white; }
.btn-accion.confirmar:hover:not(:disabled)  { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

.btn-accion.cancelar   { background: #fee2e2; color: #b91c1c; }
.btn-accion.cancelar:hover:not(:disabled)   { background: #fecaca; }

.btn-accion.iniciar    { background: #dcfce7; color: #15803d; }
.btn-accion.iniciar:hover:not(:disabled)    { background: #bbf7d0; }

.btn-accion.finalizar  { background: #2563eb; color: white; }
.btn-accion.finalizar:hover:not(:disabled)  { box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

.btn-accion.no-asistida { background: #ffedd5; color: #9a3412; }
.btn-accion.no-asistida:hover:not(:disabled) { background: #fed7aa; }

.btn-accion.videollamada { background: #111827; color: white; }
.btn-accion.videollamada:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

/* ── Columna servicio ── */
.col-servicio {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
}

.servicio-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.servicio-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.servicio-desc {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
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
  width: 15px;
  height: 15px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-top: 1px;
}

.servicio-loading {
  padding: 2rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.amarillo    { background: #fef9c3; color: #854d0e; }
.badge.azul        { background: #dbeafe; color: #1d4ed8; }
.badge.verde-claro { background: #dcfce7; color: #166534; }
.badge.verde       { background: #bbf7d0; color: #15803d; }
.badge.gris        { background: #f3f4f6; color: #4b5563; }
.badge.rojo        { background: #fee2e2; color: #b91c1c; }
.badge.naranja     { background: #ffedd5; color: #9a3412; }

/* ── Formulario de pago ── */
.pago-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  backdrop-filter: blur(2px);
}

.pago-form {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.pago-form h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.pago-detalle {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem;
}

.pago-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #4b5563;
}

.pago-fila span:first-child { color: #9ca3af; }

.pago-fila.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.6rem;
  margin-top: 0.2rem;
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.pago-fila.total span:first-child { color: #111827; }

.pago-aviso {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
  text-align: center;
}

.pago-error {
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
}

.pago-botones {
  display: flex;
  gap: 0.75rem;
}

.btn-cancelar-pago {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancelar-pago:hover:not(:disabled) { background: #f9fafb; }

.btn-confirmar-pago {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirmar-pago:hover:not(:disabled) { background: #1d4ed8; }
.btn-confirmar-pago:disabled,
.btn-cancelar-pago:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .pago-form { margin: 1rem; }
}
</style>
