<script setup lang="ts">
import { onMounted, ref } from "vue";
import { http } from "@/modules/auth/api/http";
import MapaSelector from "@/modules/servicios/components/MapaSelector.vue";
import { useAuthStore } from "@/modules/auth/stores/auth";

const authStore = useAuthStore();

const servicios = ref<any[]>([]);
const cargando = ref(false);
const error = ref("");
const errorForm = ref("");
const mostrarFormulario = ref(false);

const form = ref({
  nombre: "",
  descripcion: "",
  tipo: "",
  modalidad: "virtual",
  precio: null as number | null,
  duracion_minutos: 60,
  videollamada: false,
  direccion: "",
  latitud: null as number | null,
  longitud: null as number | null,
});

function onUbicacionSeleccionada(coords: { lat: number; lng: number; direccion: string }) {
  form.value.latitud = coords.lat;
  form.value.longitud = coords.lng;
  form.value.direccion = coords.direccion;
}

async function cargar() {
  cargando.value = true;
  try {
    const res = await http.get("/services/me");
    servicios.value = res.data ?? [];
  } catch {
    error.value = "Error al cargar tus servicios";
  } finally {
    cargando.value = false;
  }
}

async function crear() {
  errorForm.value = "";

  if (
    !form.value.nombre ||
    !form.value.tipo ||
    !form.value.precio ||
    !form.value.duracion_minutos
  ) {
    errorForm.value = "Completá todos los campos obligatorios";
    return;
  }

  try {
    await http.post("/services", form.value);
    mostrarFormulario.value = false;
    form.value = {
      nombre: "",
      descripcion: "",
      tipo: "",
      modalidad: "virtual",
      precio: null,
      duracion_minutos: 60,
      videollamada: false,
      direccion: "",
      latitud: null,
      longitud: null,
    };
    await cargar();
  } catch (e: any) {
    errorForm.value = e.response?.data?.message ?? "Error al crear el servicio";
  }
}

async function eliminar(id: number) {
  if (!confirm("¿Seguro que querés eliminar este servicio?")) return;
  try {
    await http.delete(`/services/${id}`);
    await cargar();
  } catch {
    error.value = "Error al eliminar el servicio";
  }
}

// ── Disponibilidad ──────────────────────────────────────
const DIAS_SEMANA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sabado", "domingo"];

const disponibilidades = ref<any[]>([]);
const cargandoDisp = ref(false);
const errorDisp = ref("");
const mostrarFormDisp = ref(false);
const guardandoDisp = ref(false);
const errorFormDisp = ref("");

const diasSeleccionados = ref<string[]>([]);

const formDisp = ref({
  hora_inicio: "",
  hora_fin: "",
  buffer: null as number | null,
  hora_inicio_pausa: "",
  hora_fin_pausa: "",
});

function resetFormDisp() {
  diasSeleccionados.value = [];
  formDisp.value = {
    hora_inicio: "",
    hora_fin: "",
    buffer: null,
    hora_inicio_pausa: "",
    hora_fin_pausa: "",
  };
  errorFormDisp.value = "";
}

function seleccionarLunesViernes() {
  diasSeleccionados.value = ["lunes", "martes", "miércoles", "jueves", "viernes"];
}

async function cargarDisponibilidad() {
  const profesionalId = authStore.user?.profesional?.id;
  if (!profesionalId) return;
  cargandoDisp.value = true;
  try {
    const res = await http.get(`/disponibilidades/profesional/${profesionalId}`);
    disponibilidades.value = res.data ?? [];
  } catch {
    errorDisp.value = "Error al cargar la disponibilidad";
  } finally {
    cargandoDisp.value = false;
  }
}

async function agregarDisponibilidad() {
  errorFormDisp.value = "";
  if (diasSeleccionados.value.length === 0) {
    errorFormDisp.value = "Seleccioná al menos un día.";
    return;
  }
  if (!formDisp.value.hora_inicio || !formDisp.value.hora_fin) {
    errorFormDisp.value = "Completá hora de inicio y hora de fin.";
    return;
  }
  guardandoDisp.value = true;
  try {
    const base: any = {
      hora_inicio: formDisp.value.hora_inicio,
      hora_fin: formDisp.value.hora_fin,
    };
    if (formDisp.value.buffer !== null) base.buffer = formDisp.value.buffer;
    if (formDisp.value.hora_inicio_pausa) base.hora_inicio_pausa = formDisp.value.hora_inicio_pausa;
    if (formDisp.value.hora_fin_pausa) base.hora_fin_pausa = formDisp.value.hora_fin_pausa;

    const resultados = await Promise.allSettled(
      diasSeleccionados.value.map((dia) =>
        http.post("/disponibilidades", { ...base, dia_semana: dia }),
      ),
    );

    const fallidos = resultados
      .map((r, i) => (r.status === "rejected" ? capitalize(diasSeleccionados.value[i]) : null))
      .filter(Boolean);

    await cargarDisponibilidad();
    mostrarFormDisp.value = false;
    resetFormDisp();

    if (fallidos.length > 0) {
      errorDisp.value = `Algunos días ya tenían disponibilidad y no se agregaron: ${fallidos.join(", ")}.`;
    }
  } catch (e: any) {
    errorFormDisp.value = e.response?.data?.error ?? "Error al guardar la disponibilidad";
  } finally {
    guardandoDisp.value = false;
  }
}

async function eliminarDisponibilidad(id: number) {
  if (!confirm("¿Eliminás este horario de disponibilidad?")) return;
  try {
    await http.delete(`/disponibilidades/${id}`);
    await cargarDisponibilidad();
  } catch {
    errorDisp.value = "Error al eliminar la disponibilidad";
  }
}

function formatHora(h: string) {
  return h?.slice(0, 5);
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// ────────────────────────────────────────────────────────

// ── Excepciones ─────────────────────────────────────────
const TIPOS_EXCEPCION = [
  { value: "feriado", label: "Feriado (día completo)" },
  { value: "licencia", label: "Licencia (día completo)" },
  { value: "bloqueo", label: "Bloqueo de horario" },
  { value: "pausa", label: "Pausa puntual" },
  { value: "habilitacion_extra", label: "Habilitación extra" },
];

const TIPO_LABEL: Record<string, string> = {
  feriado: "Feriado",
  licencia: "Licencia",
  bloqueo: "Bloqueo",
  pausa: "Pausa",
  habilitacion_extra: "Extra",
};

const TIPO_COLOR: Record<string, string> = {
  feriado: "rojo",
  licencia: "naranja",
  bloqueo: "gris",
  pausa: "amarillo",
  habilitacion_extra: "verde",
};

const excepciones = ref<any[]>([]);
const cargandoExc = ref(false);
const errorExc = ref("");
const mostrarFormExc = ref(false);
const guardandoExc = ref(false);
const errorFormExc = ref("");

const formExc = ref({
  fecha: "",
  tipo: "feriado",
  hora_inicio: "",
  hora_fin: "",
  motivo: "",
});

function resetFormExc() {
  formExc.value = { fecha: "", tipo: "feriado", hora_inicio: "", hora_fin: "", motivo: "" };
  errorFormExc.value = "";
}

async function cargarExcepciones() {
  cargandoExc.value = true;
  try {
    const res = await http.get("/excepciones");
    excepciones.value = res.data ?? [];
  } catch {
    errorExc.value = "Error al cargar las excepciones";
  } finally {
    cargandoExc.value = false;
  }
}

async function agregarExcepcion() {
  errorFormExc.value = "";
  if (!formExc.value.fecha) {
    errorFormExc.value = "La fecha es obligatoria.";
    return;
  }
  guardandoExc.value = true;
  try {
    const payload: any = { fecha: formExc.value.fecha, tipo: formExc.value.tipo };
    if (formExc.value.hora_inicio) payload.hora_inicio = formExc.value.hora_inicio;
    if (formExc.value.hora_fin) payload.hora_fin = formExc.value.hora_fin;
    if (formExc.value.motivo) payload.motivo = formExc.value.motivo;
    await http.post("/excepciones", payload);
    mostrarFormExc.value = false;
    resetFormExc();
    await cargarExcepciones();
  } catch (e: any) {
    errorFormExc.value = e.response?.data?.error ?? "Error al guardar la excepción";
  } finally {
    guardandoExc.value = false;
  }
}

async function eliminarExcepcion(id: number) {
  if (!confirm("¿Eliminás esta excepción?")) return;
  try {
    await http.delete(`/excepciones/${id}`);
    await cargarExcepciones();
  } catch {
    errorExc.value = "Error al eliminar la excepción";
  }
}

function formatFecha(f: string) {
  return new Date(f + "T00:00:00").toLocaleDateString("es-UY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
// ────────────────────────────────────────────────────────

onMounted(async () => {
  await cargar();
  await Promise.all([cargarDisponibilidad(), cargarExcepciones()]);
});
</script>

<template>
  <div class="form-wrap">
    <!-- ── Sección servicios ── -->
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Mis Servicios</h3>
          <p>Gestioná los servicios que ofrecés</p>
        </div>
        <button class="btn-save" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? "Cancelar" : "+ Nuevo servicio" }}
        </button>
      </div>

      <div v-if="mostrarFormulario" class="formulario">
        <h4 class="form-subtitle">Nuevo servicio</h4>

        <div v-if="errorForm" class="error-msg">{{ errorForm }}</div>

        <div class="field">
          <label>Nombre *</label>
          <input class="input" v-model="form.nombre" placeholder="Ej: Consultoría empresarial" />
        </div>

        <div class="field">
          <label>Descripción</label>
          <input class="input" v-model="form.descripcion" placeholder="Describí tu servicio" />
        </div>

        <div class="field">
          <label>Tipo *</label>
          <input
            class="input"
            v-model="form.tipo"
            placeholder="Ej: consultoria, entrenamiento, terapia"
          />
        </div>

        <div class="field">
          <label>Modalidad *</label>
          <select class="input" v-model="form.modalidad">
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
            <option value="hibrida">Híbrida</option>
          </select>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Precio (USD) *</label>
            <input
              class="input"
              v-model.number="form.precio"
              type="number"
              min="0"
              placeholder="Ej: 50"
            />
          </div>
          <div class="field">
            <label>Duración (minutos) *</label>
            <input
              class="input"
              v-model.number="form.duracion_minutos"
              type="number"
              min="15"
              placeholder="Ej: 60"
            />
          </div>
        </div>

        <div class="checkbox">
          <input type="checkbox" v-model="form.videollamada" id="video" />
          <label for="video">Incluye videollamada</label>
        </div>

        <div v-if="form.modalidad !== 'virtual'" class="field">
          <label>Ubicación</label>
          <p class="hint">Buscá la dirección y ajustá el marcador en el mapa</p>
          <MapaSelector @ubicacion-seleccionada="onUbicacionSeleccionada" />
          <p v-if="form.direccion" class="direccion-seleccionada">📍 {{ form.direccion }}</p>
        </div>

        <button class="btn-save" @click="crear">Guardar servicio</button>
      </div>

      <p v-if="cargando" class="empty-text">Cargando...</p>
      <div v-else-if="error" class="error-msg">{{ error }}</div>
      <p v-else-if="servicios.length === 0" class="empty-text">
        No tenés servicios creados todavía.
      </p>

      <div v-else class="notification-list">
        <div v-for="s in servicios" :key="s.id" class="notification-item">
          <div class="content">
            <span class="card-badge">{{ s.modalidad }}</span>
            <h4>{{ s.nombre }}</h4>
            <p>{{ s.descripcion }}</p>
            <p><strong>Tipo:</strong> {{ s.tipo }}</p>
            <p><strong>Precio:</strong> ${{ s.precio }}</p>
            <p><strong>Duración:</strong> {{ s.duracion_minutos }} min</p>
            <p v-if="s.direccion"><strong>Dirección:</strong> {{ s.direccion }}</p>
          </div>
          <button class="btn-link btn-link-danger" @click="eliminar(s.id)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- ── Sección excepciones ── -->
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Mis Excepciones</h3>
          <p>Feriados, licencias y bloqueos puntuales</p>
        </div>
        <button
          class="btn-save"
          @click="
            mostrarFormExc = !mostrarFormExc;
            if (!mostrarFormExc) resetFormExc();
          "
        >
          {{ mostrarFormExc ? "Cancelar" : "+ Agregar excepción" }}
        </button>
      </div>

      <div v-if="mostrarFormExc" class="formulario">
        <h4 class="form-subtitle">Nueva excepción</h4>
        <div v-if="errorFormExc" class="error-msg">{{ errorFormExc }}</div>

        <div class="form-grid">
          <div class="field">
            <label>Fecha *</label>
            <input
              class="input"
              type="date"
              v-model="formExc.fecha"
              :min="new Date().toISOString().slice(0, 10)"
            />
          </div>
          <div class="field">
            <label>Tipo *</label>
            <select class="input" v-model="formExc.tipo">
              <option v-for="t in TIPOS_EXCEPCION" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Hora inicio</label>
            <input class="input" type="time" v-model="formExc.hora_inicio" />
          </div>
          <div class="field">
            <label>Hora fin</label>
            <input class="input" type="time" v-model="formExc.hora_fin" />
          </div>
        </div>

        <div class="field">
          <label>Motivo</label>
          <input
            class="input"
            v-model="formExc.motivo"
            placeholder="Ej: Feriado nacional, reunión, etc."
          />
        </div>

        <button class="btn-save" :disabled="guardandoExc" @click="agregarExcepcion">
          {{ guardandoExc ? "Guardando..." : "Guardar excepción" }}
        </button>
      </div>

      <p v-if="cargandoExc" class="empty-text">Cargando...</p>
      <div v-else-if="errorExc" class="error-msg">{{ errorExc }}</div>
      <p v-else-if="excepciones.length === 0" class="empty-text">No tenés excepciones cargadas.</p>

      <div v-else class="notification-list">
        <div v-for="e in excepciones" :key="e.id" class="notification-item">
          <div class="content">
            <span class="exc-badge" :class="TIPO_COLOR[e.tipo]">{{ TIPO_LABEL[e.tipo] }}</span>
            <h4>{{ formatFecha(e.fecha) }}</h4>
            <p v-if="e.hora_inicio && e.hora_fin">
              {{ formatHora(e.hora_inicio) }} – {{ formatHora(e.hora_fin) }}
            </p>
            <small v-if="e.motivo">{{ e.motivo }}</small>
          </div>
          <button class="btn-link btn-link-danger" @click="eliminarExcepcion(e.id)">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- ── Sección disponibilidad ── -->
    <div class="form-card">
      <div class="form-header">
        <div>
          <h3>Mi Disponibilidad</h3>
          <p>Horarios en los que los clientes pueden reservar</p>
        </div>
        <button
          class="btn-save"
          @click="
            mostrarFormDisp = !mostrarFormDisp;
            if (!mostrarFormDisp) resetFormDisp();
          "
        >
          {{ mostrarFormDisp ? "Cancelar" : "+ Agregar horario" }}
        </button>
      </div>

      <div v-if="mostrarFormDisp" class="formulario">
        <h4 class="form-subtitle">Nuevo horario</h4>
        <div v-if="errorFormDisp" class="error-msg">{{ errorFormDisp }}</div>

        <div class="field">
          <div class="dias-header">
            <label>Días *</label>
            <button type="button" class="btn-atajo" @click="seleccionarLunesViernes">
              Lunes a viernes
            </button>
          </div>
          <div class="dias-grid">
            <label
              v-for="dia in DIAS_SEMANA"
              :key="dia"
              class="dia-check"
              :class="{ activo: diasSeleccionados.includes(dia) }"
            >
              <input type="checkbox" :value="dia" v-model="diasSeleccionados" />
              {{ capitalize(dia) }}
            </label>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Hora inicio *</label>
            <input class="input" type="time" v-model="formDisp.hora_inicio" />
          </div>
          <div class="field">
            <label>Hora fin *</label>
            <input class="input" type="time" v-model="formDisp.hora_fin" />
          </div>
        </div>

        <div class="field">
          <label>Buffer entre turnos (minutos)</label>
          <input
            class="input"
            type="number"
            min="0"
            v-model.number="formDisp.buffer"
            placeholder="Ej: 15 (opcional)"
          />
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Inicio de pausa</label>
            <input class="input" type="time" v-model="formDisp.hora_inicio_pausa" />
          </div>
          <div class="field">
            <label>Fin de pausa</label>
            <input class="input" type="time" v-model="formDisp.hora_fin_pausa" />
          </div>
        </div>

        <button class="btn-save" :disabled="guardandoDisp" @click="agregarDisponibilidad">
          {{ guardandoDisp ? "Guardando..." : "Guardar horario" }}
        </button>
      </div>

      <p v-if="cargandoDisp" class="empty-text">Cargando...</p>
      <div v-else-if="errorDisp" class="error-msg">{{ errorDisp }}</div>
      <p v-else-if="disponibilidades.length === 0" class="empty-text">
        No tenés horarios cargados. Agregá tu disponibilidad para que los clientes puedan reservar.
      </p>

      <div v-else class="notification-list">
        <div v-for="d in disponibilidades" :key="d.id" class="notification-item">
          <div class="content">
            <h4>{{ capitalize(d.dia_semana) }}</h4>
            <p>{{ formatHora(d.hora_inicio) }} – {{ formatHora(d.hora_fin) }} hs</p>
            <small v-if="d.buffer">Buffer: {{ d.buffer }} min</small>
            <small v-if="d.hora_inicio_pausa && d.hora_fin_pausa">
              Pausa: {{ formatHora(d.hora_inicio_pausa) }}–{{ formatHora(d.hora_fin_pausa) }}
            </small>
          </div>
          <button class="btn-link btn-link-danger" @click="eliminarDisponibilidad(d.id)">
            Eliminar
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
  flex-wrap: wrap;
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

.notification-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.content {
  flex: 1;
  min-width: 0;
}

.content h4 {
  margin: 0 0 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.content p {
  margin: 0 0 4px;
  font-size: 0.8rem;
  color: #6b7280;
}

.content small {
  font-size: 0.73rem;
  color: #9ca3af;
  display: block;
}

/* ── Botones ── */
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
  padding: 8px 14px;
  font-size: 0.8rem;
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
  flex-shrink: 0;
}

.btn-link:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.btn-link-danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── Formulario ── */
.formulario {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 8px;
  border: 0.5px solid #e5e7eb;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-subtitle {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #374151;
}

.hint {
  font-size: 0.73rem;
  color: #9ca3af;
  margin: 0;
}

.direccion-seleccionada {
  font-size: 0.8rem;
  color: #2563eb;
  margin: 0.25rem 0 0;
}

.error-msg {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

/* ── Badge de modalidad ── */
.card-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  background: #eff9ff;
  color: #2563eb;
  margin-bottom: 4px;
}

/* ── Selector de días ── */
.dias-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-atajo {
  font-size: 0.73rem;
  font-weight: 500;
  color: #2563eb;
  background: none;
  border: 0.5px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-atajo:hover {
  background: #eff6ff;
}

.dias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.dia-check {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border: 0.5px solid #d1d5db;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  user-select: none;
}

.dia-check input {
  display: none;
}

.dia-check.activo {
  border-color: #2563eb;
  background: #eff9ff;
  color: #1d4ed8;
  font-weight: 600;
}

/* ── Badges excepción ── */
.exc-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  margin-bottom: 4px;
}
.exc-badge.rojo {
  background: #fee2e2;
  color: #b91c1c;
}
.exc-badge.naranja {
  background: #ffedd5;
  color: #9a3412;
}
.exc-badge.gris {
  background: #f3f4f6;
  color: #4b5563;
}
.exc-badge.amarillo {
  background: #fef9c3;
  color: #854d0e;
}
.exc-badge.verde {
  background: #dcfce7;
  color: #15803d;
}

@media (max-width: 768px) {
  .form-wrap {
    padding: 12px;
  }

  .form-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-save {
    width: 100%;
  }

  .notification-item {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-link {
    width: 100%;
    text-align: center;
  }
}
</style>
