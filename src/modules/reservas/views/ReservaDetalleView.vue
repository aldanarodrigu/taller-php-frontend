<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useReservasStore } from "@/modules/reservas/stores/reservas";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { serviciosApi } from "@/modules/servicios/api/servicios";
import { pagosApi } from "@/modules/pagos/api/pagos";
import { calificacionesApi } from "@/modules/calificaciones/api/calificaciones";

const route = useRoute();
const router = useRouter();
const store = useReservasStore();
const authStore = useAuthStore();

const servicio = ref<any | null>(null);

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

const rol = computed(() => authStore.user?.role ?? "");
const estado = computed(() => store.reserva?.estado ?? "");

const puedeConfirmar = computed(() => estado.value === "pendiente" && rol.value === "profesional");

const puedeCancelar = computed(
  () => ["pendiente", "confirmada"].includes(estado.value) && rol.value === "cliente",
);

const puedePagar = computed(() => estado.value === "confirmada" && rol.value === "cliente");

const esOnline = computed(() => servicio.value?.modalidad === "online");

// Solo para servicios presenciales: el profesional inicia la sesión
const puedeIniciar = computed(
  () =>
    estado.value === "pagada" &&
    rol.value === "profesional" &&
    servicio.value !== null &&
    !esOnline.value,
);

const puedeFinalizar = computed(() => estado.value === "en_curso" && rol.value === "profesional");

const puedeNoAsistida = computed(() => estado.value === "en_curso" && rol.value === "profesional");

// Para online: profesional desde confirmada/pagada, cliente desde confirmada/pagada/en_curso
// Si el servicio aún no cargó pero el estado es en_curso, también se muestra
const puedeVideollamada = computed(() => {
  if (!store.reserva?.pago_id) return false;
  const estadoOk = ["pagada", "en_curso"].includes(estado.value);
  if (!estadoOk) return false;
  if (estado.value === "en_curso") return esOnline.value;
  return esOnline.value;
});

const mostrarFormPago = ref(false);
const pagoCargando = ref(false);
const pagoError = ref("");

const puntuacion = ref(0);
const comentario = ref("");
const resenaEnviando = ref(false);
const resenaError = ref("");
const resenaEnviada = ref(false);

const puedeCalificar = computed(() =>
  rol.value === "cliente" &&
  estado.value === "finalizada" &&
  !store.reserva?.calificacion &&
  !resenaEnviada.value
);

async function enviarResena() {
  if (!puntuacion.value) {
    resenaError.value = "Elegí una puntuación.";
    return;
  }
  resenaEnviando.value = true;
  resenaError.value = "";
  try {
    await calificacionesApi.crear({
      reserva_id: store.reserva!.id,
      puntuacion: puntuacion.value,
      comentario: comentario.value || undefined,
    });
    resenaEnviada.value = true;
  } catch (e: any) {
    resenaError.value = e?.response?.data?.error ?? "Error al enviar la reseña.";
  } finally {
    resenaEnviando.value = false;
  }
}

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
    pendiente: esCliente
      ? "Tu reserva está esperando confirmación del profesional."
      : "Tenés una reserva pendiente de confirmación.",
    confirmada: esCliente
      ? "Reserva confirmada. Completá el pago para asegurar tu lugar."
      : "Reserva confirmada. Podés iniciar la sesión cuando corresponda.",
    pagada: esCliente
      ? `Pago recibido. Te esperamos el ${store.reserva?.fecha ?? ""}.`
      : "Pago recibido. Iniciá la sesión cuando corresponda.",
    en_curso: esCliente ? "Tu sesión está en curso." : "Sesión en curso.",
    finalizada: "Sesión finalizada.",
    cancelada: "Esta reserva fue cancelada.",
    no_asistida: "El cliente no asistió a la sesión.",
  };
  return msgs[estado.value] ?? "";
});

function formatFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
  <div class="form-wrap">
    <button class="btn-volver" @click="router.push({ name: 'Reservas' })">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clip-rule="evenodd"
        />
      </svg>
      Volver a mis reservas
    </button>

    <p v-if="store.cargando" class="empty-text">Cargando...</p>
    <div v-else-if="store.error" class="error-msg">{{ store.error }}</div>

    <div v-else-if="store.reserva" class="layout">
      <!-- Columna izquierda: info + acciones -->
      <div class="form-card col-info">
        <div class="form-header">
          <div>
            <div class="info-header">
              <span class="badge" :class="ESTADOS_COLOR[store.reserva.estado]">
                {{ ESTADOS_LABEL[store.reserva.estado] ?? store.reserva.estado }}
              </span>
              <span class="reserva-id">#{{ store.reserva.id }}</span>
            </div>
            <h3>{{ servicio?.nombre ?? `Servicio #${store.reserva.servicio_id}` }}</h3>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Fecha</span>
            <span class="info-valor">{{ formatFecha(store.reserva.fecha) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Horario</span>
            <span class="info-valor"
              >{{ formatHora(store.reserva.hora_inicio) }} –
              {{ formatHora(store.reserva.hora_fin) }}</span
            >
          </div>
          <div v-if="store.reserva.pago_id" class="info-item">
            <span class="info-label">Pago</span>
            <span class="info-valor">#{{ store.reserva.pago_id }}</span>
          </div>
        </div>

        <!-- Mensaje de estado -->
        <div
          v-if="mensajeEstado"
          class="mensaje-estado"
          :class="ESTADOS_COLOR[store.reserva.estado]"
        >
          {{ mensajeEstado }}
        </div>

        <div v-if="store.accionError" class="error-msg">
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
            {{ store.accionCargando ? "Procesando..." : "Confirmar reserva" }}
          </button>
          <button
            v-if="puedeCancelar"
            class="btn-accion cancelar"
            :disabled="store.accionCargando"
            @click="store.cancelar(store.reserva.id)"
          >
            {{ store.accionCargando ? "Procesando..." : "Cancelar reserva" }}
          </button>
          <button v-if="puedePagar" class="btn-accion pagar" @click="mostrarFormPago = true">
            Pagar reserva
          </button>
          <button
            v-if="puedeIniciar"
            class="btn-accion iniciar"
            :disabled="store.accionCargando"
            @click="store.iniciar(store.reserva.id)"
          >
            {{ store.accionCargando ? "Procesando..." : "Iniciar sesión" }}
          </button>
          <button
            v-if="puedeFinalizar"
            class="btn-accion finalizar"
            :disabled="store.accionCargando"
            @click="store.finalizar(store.reserva.id)"
          >
            {{ store.accionCargando ? "Procesando..." : "Finalizar sesión" }}
          </button>
          <button
            v-if="puedeNoAsistida"
            class="btn-accion no-asistida"
            :disabled="store.accionCargando"
            @click="store.noAsistida(store.reserva.id)"
          >
            {{ store.accionCargando ? "Procesando..." : "Marcar no asistida" }}
          </button>
          <button
            v-if="puedeVideollamada"
            class="btn-accion videollamada"
            @click="router.push({ name: 'Videollamada', params: { id: store.reserva.id } })"
          >
            {{
              rol === "profesional" && estado !== "en_curso"
                ? "Iniciar videollamada"
                : "Unirse a videollamada"
            }}
          </button>
        </div>
      </div>

      <!-- Columna derecha: resumen del servicio -->
      <div class="form-card col-servicio">
        <template v-if="servicio">
          <div class="form-header">
            <div>
              <h3>{{ servicio.nombre }}</h3>
              <p>{{ servicio.descripcion }}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Modalidad</span>
              <span class="info-valor">{{
                servicio.modalidad === "presencial" ? "Presencial" : "Virtual"
              }}</span>
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
              <path
                fill-rule="evenodd"
                d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.692 17 9A7 7 0 103 9c0 3.692 1.698 6.227 3.354 7.585a12.85 12.85 0 002.274 1.765 11.37 11.37 0 00.757.433 5.741 5.741 0 00.28.14l.019.009.006.002zm1.055-1.828a12.17 12.17 0 01-.745-.527C8.552 15.773 5 13.308 5 9a5 5 0 1110 0c0 4.308-3.552 6.773-5 7.105z"
                clip-rule="evenodd"
              />
              <path d="M10 11a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            {{ servicio.direccion }}
          </div>
        </template>

        <p v-else class="empty-text">Cargando información del servicio...</p>
      </div>

      <!-- Calificación -->
      <div v-if="puedeCalificar" class="form-card resena-card">
        <div class="form-header">
          <div>
            <h3>Calificá tu experiencia</h3>
            <p>Contanos cómo fue tu experiencia</p>
          </div>
        </div>

        <div class="puntuacion-opciones">
          <button
            v-for="n in 5"
            :key="n"
            class="puntuacion-btn"
            :class="{ activo: puntuacion >= n }"
            @click="puntuacion = n"
          >
            {{ n }}
          </button>
        </div>

        <textarea
          v-model="comentario"
          class="resena-textarea"
          rows="3"
          placeholder="Comentario (opcional)"
        />

        <div v-if="resenaError" class="error-msg">{{ resenaError }}</div>

        <button class="btn-save" :disabled="resenaEnviando" @click="enviarResena">
          {{ resenaEnviando ? "Enviando..." : "Enviar calificación" }}
        </button>
      </div>

      <div v-else-if="resenaEnviada || store.reserva?.calificacion" class="form-card resena-card">
        <p class="resena-confirmacion">Tu calificación fue enviada. Gracias por tu opinión.</p>
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
            <span>{{ formatFecha(store.reserva?.fecha ?? "") }}</span>
          </div>
          <div class="pago-fila">
            <span>Horario</span>
            <span
              >{{ formatHora(store.reserva?.hora_inicio ?? "") }} –
              {{ formatHora(store.reserva?.hora_fin ?? "") }}</span
            >
          </div>
          <div class="pago-fila total">
            <span>Total</span>
            <span>UYU {{ Number(servicio?.precio).toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="pagoError" class="error-msg">{{ pagoError }}</div>

        <div class="pago-botones">
          <button class="btn-link" :disabled="pagoCargando" @click="mostrarFormPago = false">
            Cancelar
          </button>
          <button class="btn-save" :disabled="pagoCargando" @click="confirmarPago">
            {{ pagoCargando ? "Procesando..." : "Confirmar pago" }}
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

/* ── Layout ── */
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.reserva-id {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
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

/* ── Mensaje de estado ── */
.mensaje-estado {
  font-size: 0.8rem;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  line-height: 1.5;
}

.mensaje-estado.amarillo {
  background: #fef9c3;
  color: #854d0e;
}
.mensaje-estado.azul {
  background: #dbeafe;
  color: #1d4ed8;
}
.mensaje-estado.verde-claro {
  background: #dcfce7;
  color: #166534;
}
.mensaje-estado.verde {
  background: #bbf7d0;
  color: #15803d;
}
.mensaje-estado.gris {
  background: #f3f4f6;
  color: #4b5563;
}
.mensaje-estado.rojo {
  background: #fee2e2;
  color: #b91c1c;
}
.mensaje-estado.naranja {
  background: #ffedd5;
  color: #9a3412;
}

/* ── Acciones ── */
.acciones {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-accion {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition:
    opacity 0.15s,
    background 0.15s;
}

.btn-accion:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-accion:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-accion.confirmar,
.btn-accion.pagar,
.btn-accion.finalizar,
.btn-accion.videollamada {
  background: #1a1a1a;
  color: white;
}

.btn-accion.cancelar {
  background: #fee2e2;
  color: #b91c1c;
}
.btn-accion.iniciar {
  background: #dcfce7;
  color: #15803d;
}
.btn-accion.no-asistida {
  background: #ffedd5;
  color: #9a3412;
}

/* ── Columna servicio ── */
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

/* ── Badges ── */
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

/* ── Formulario de pago (modal) ── */
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
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}

.pago-form h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.pago-detalle {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
}

.pago-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #4b5563;
}

.pago-fila span:first-child {
  color: #9ca3af;
}

.pago-fila.total {
  border-top: 0.5px solid #e5e7eb;
  padding-top: 0.6rem;
  margin-top: 0.2rem;
  font-weight: 700;
  font-size: 0.9375rem;
  color: #111827;
}

.pago-fila.total span:first-child {
  color: #111827;
}

.pago-botones {
  display: flex;
  gap: 0.75rem;
}

.pago-botones .btn-link,
.pago-botones .btn-save {
  flex: 1;
  text-align: center;
}

.pago-botones button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Reseña ── */
.resena-card { gap: 1rem; }

.puntuacion-opciones {
  display: flex;
  gap: 0.5rem;
}

.puntuacion-btn {
  width: 40px;
  height: 40px;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.puntuacion-btn.activo {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: white;
}

.resena-textarea {
  width: 100%;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.resena-textarea:focus {
  outline: none;
  border-color: #1a1a1a;
}

.resena-confirmacion {
  font-size: 0.875rem;
  color: #16a34a;
  margin: 0;
  text-align: center;
  padding: 0.5rem 0;
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
