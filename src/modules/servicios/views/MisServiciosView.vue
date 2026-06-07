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

  if (!form.value.nombre || !form.value.tipo || !form.value.precio || !form.value.duracion_minutos) {
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
  formDisp.value = { hora_inicio: "", hora_fin: "", buffer: null, hora_inicio_pausa: "", hora_fin_pausa: "" };
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
      diasSeleccionados.value.map((dia) => http.post("/disponibilidades", { ...base, dia_semana: dia }))
    );

    const fallidos = resultados
      .map((r, i) => r.status === "rejected" ? capitalize(diasSeleccionados.value[i]) : null)
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

function formatHora(h: string) { return h?.slice(0, 5); }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
// ────────────────────────────────────────────────────────

// ── Excepciones ─────────────────────────────────────────
const TIPOS_EXCEPCION = [
  { value: "feriado",           label: "Feriado (día completo)" },
  { value: "licencia",          label: "Licencia (día completo)" },
  { value: "bloqueo",           label: "Bloqueo de horario" },
  { value: "pausa",             label: "Pausa puntual" },
  { value: "habilitacion_extra",label: "Habilitación extra" },
];

const TIPO_LABEL: Record<string, string> = {
  feriado:            "Feriado",
  licencia:           "Licencia",
  bloqueo:            "Bloqueo",
  pausa:              "Pausa",
  habilitacion_extra: "Extra",
};

const TIPO_COLOR: Record<string, string> = {
  feriado:            "rojo",
  licencia:           "naranja",
  bloqueo:            "gris",
  pausa:              "amarillo",
  habilitacion_extra: "verde",
};

const excepciones        = ref<any[]>([]);
const cargandoExc        = ref(false);
const errorExc           = ref("");
const mostrarFormExc     = ref(false);
const guardandoExc       = ref(false);
const errorFormExc       = ref("");

const formExc = ref({
  fecha:            "",
  tipo:             "feriado",
  hora_inicio:      "",
  hora_fin:         "",
  motivo:           "",
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
    if (formExc.value.hora_fin)    payload.hora_fin    = formExc.value.hora_fin;
    if (formExc.value.motivo)      payload.motivo      = formExc.value.motivo;
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
  return new Date(f + "T00:00:00").toLocaleDateString("es-UY", { day: "numeric", month: "short", year: "numeric" });
}
// ────────────────────────────────────────────────────────

onMounted(async () => {
  await cargar();
  await Promise.all([cargarDisponibilidad(), cargarExcepciones()]);
});
</script>

<template>
  <div class="mis-servicios">
    <div class="header">
      <h1>Mis Servicios</h1>
      <button class="btn-primary" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? "Cancelar" : "+ Nuevo servicio" }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario">
      <h2>Nuevo servicio</h2>

      <div v-if="errorForm" class="error-msg">{{ errorForm }}</div>

      <div class="campo">
        <label>Nombre *</label>
        <input v-model="form.nombre" placeholder="Ej: Consultoría empresarial" />
      </div>

      <div class="campo">
        <label>Descripción</label>
        <input v-model="form.descripcion" placeholder="Describí tu servicio" />
      </div>

      <div class="campo">
        <label>Tipo *</label>
        <input v-model="form.tipo" placeholder="Ej: consultoria, entrenamiento, terapia" />
      </div>

      <div class="campo">
        <label>Modalidad *</label>
        <select v-model="form.modalidad">
          <option value="virtual">Virtual</option>
          <option value="presencial">Presencial</option>
          <option value="hibrida">Híbrida</option>
        </select>
      </div>

      <div class="fila">
        <div class="campo">
          <label>Precio (USD) *</label>
          <input v-model.number="form.precio" type="number" min="0" placeholder="Ej: 50" />
        </div>
        <div class="campo">
          <label>Duración (minutos) *</label>
          <input v-model.number="form.duracion_minutos" type="number" min="15" placeholder="Ej: 60" />
        </div>
      </div>

      <div class="checkbox">
        <input type="checkbox" v-model="form.videollamada" id="video" />
        <label for="video">Incluye videollamada</label>
      </div>

      <div v-if="form.modalidad !== 'virtual'" class="campo">
        <label>Ubicación</label>
        <p class="hint">Buscá la dirección y ajustá el marcador en el mapa</p>
        <MapaSelector @ubicacion-seleccionada="onUbicacionSeleccionada" />
        <p v-if="form.direccion" class="direccion-seleccionada">📍 {{ form.direccion }}</p>
      </div>

      <button class="btn-primary" @click="crear">Guardar servicio</button>
    </div>

    <div v-if="cargando">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="servicios.length === 0">No tenés servicios creados todavía.</div>

    <div v-else class="lista">
      <div v-for="s in servicios" :key="s.id" class="card">
        <div class="card-badge">{{ s.modalidad }}</div>
        <h2>{{ s.nombre }}</h2>
        <p>{{ s.descripcion }}</p>
        <p><strong>Tipo:</strong> {{ s.tipo }}</p>
        <p><strong>Precio:</strong> ${{ s.precio }}</p>
        <p><strong>Duración:</strong> {{ s.duracion_minutos }} min</p>
        <p v-if="s.direccion"><strong>Dirección:</strong> {{ s.direccion }}</p>
        <button class="btn-danger" @click="eliminar(s.id)">Eliminar</button>
      </div>
    </div>
  </div>

  <!-- ── Sección excepciones ── -->
  <div class="seccion-disponibilidad">
    <div class="header">
      <h1>Mis Excepciones</h1>
      <button class="btn-primary" @click="mostrarFormExc = !mostrarFormExc; if (!mostrarFormExc) resetFormExc()">
        {{ mostrarFormExc ? "Cancelar" : "+ Agregar excepción" }}
      </button>
    </div>

    <div v-if="mostrarFormExc" class="formulario">
      <h2>Nueva excepción</h2>
      <div v-if="errorFormExc" class="error-msg">{{ errorFormExc }}</div>

      <div class="fila">
        <div class="campo">
          <label>Fecha *</label>
          <input type="date" v-model="formExc.fecha" :min="new Date().toISOString().slice(0,10)" />
        </div>
        <div class="campo">
          <label>Tipo *</label>
          <select v-model="formExc.tipo">
            <option v-for="t in TIPOS_EXCEPCION" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
      </div>

      <div class="fila">
        <div class="campo">
          <label>Hora inicio</label>
          <input type="time" v-model="formExc.hora_inicio" />
        </div>
        <div class="campo">
          <label>Hora fin</label>
          <input type="time" v-model="formExc.hora_fin" />
        </div>
      </div>

      <div class="campo">
        <label>Motivo</label>
        <input v-model="formExc.motivo" placeholder="Ej: Feriado nacional, reunión, etc." />
      </div>

      <button class="btn-primary" :disabled="guardandoExc" @click="agregarExcepcion">
        {{ guardandoExc ? "Guardando..." : "Guardar excepción" }}
      </button>
    </div>

    <div v-if="cargandoExc">Cargando...</div>
    <div v-else-if="errorExc" class="error-msg">{{ errorExc }}</div>
    <div v-else-if="excepciones.length === 0" class="vacio">No tenés excepciones cargadas.</div>

    <div v-else class="lista-disponibilidad">
      <div v-for="e in excepciones" :key="e.id" class="disp-card">
        <span class="exc-badge" :class="TIPO_COLOR[e.tipo]">{{ TIPO_LABEL[e.tipo] }}</span>
        <div class="disp-info">
          <span class="disp-dia">{{ formatFecha(e.fecha) }}</span>
          <span v-if="e.hora_inicio && e.hora_fin" class="disp-extra">
            {{ formatHora(e.hora_inicio) }} – {{ formatHora(e.hora_fin) }}
          </span>
          <span v-if="e.motivo" class="disp-extra">· {{ e.motivo }}</span>
        </div>
        <button class="btn-danger-sm" @click="eliminarExcepcion(e.id)">✕</button>
      </div>
    </div>
  </div>

  <!-- ── Sección disponibilidad ── -->
  <div class="seccion-disponibilidad">
    <div class="header">
      <h1>Mi Disponibilidad</h1>
      <button class="btn-primary" @click="mostrarFormDisp = !mostrarFormDisp; if (!mostrarFormDisp) resetFormDisp()">
        {{ mostrarFormDisp ? "Cancelar" : "+ Agregar horario" }}
      </button>
    </div>

    <div v-if="mostrarFormDisp" class="formulario">
      <h2>Nuevo horario</h2>
      <div v-if="errorFormDisp" class="error-msg">{{ errorFormDisp }}</div>

      <div class="campo">
        <div class="dias-header">
          <label>Días *</label>
          <button type="button" class="btn-atajo" @click="seleccionarLunesViernes">Lunes a viernes</button>
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

      <div class="fila">
        <div class="campo">
          <label>Hora inicio *</label>
          <input type="time" v-model="formDisp.hora_inicio" />
        </div>
        <div class="campo">
          <label>Hora fin *</label>
          <input type="time" v-model="formDisp.hora_fin" />
        </div>
      </div>

      <div class="campo">
        <label>Buffer entre turnos (minutos)</label>
        <input type="number" min="0" v-model.number="formDisp.buffer" placeholder="Ej: 15 (opcional)" />
      </div>

      <div class="fila">
        <div class="campo">
          <label>Inicio de pausa</label>
          <input type="time" v-model="formDisp.hora_inicio_pausa" />
        </div>
        <div class="campo">
          <label>Fin de pausa</label>
          <input type="time" v-model="formDisp.hora_fin_pausa" />
        </div>
      </div>

      <button class="btn-primary" :disabled="guardandoDisp" @click="agregarDisponibilidad">
        {{ guardandoDisp ? "Guardando..." : "Guardar horario" }}
      </button>
    </div>

    <div v-if="cargandoDisp">Cargando...</div>
    <div v-else-if="errorDisp" class="error-msg">{{ errorDisp }}</div>
    <div v-else-if="disponibilidades.length === 0" class="vacio">
      No tenés horarios cargados. Agregá tu disponibilidad para que los clientes puedan reservar.
    </div>

    <div v-else class="lista-disponibilidad">
      <div v-for="d in disponibilidades" :key="d.id" class="disp-card">
        <div class="disp-dia">{{ capitalize(d.dia_semana) }}</div>
        <div class="disp-info">
          <span>{{ formatHora(d.hora_inicio) }} – {{ formatHora(d.hora_fin) }} hs</span>
          <span v-if="d.buffer" class="disp-extra">· Buffer: {{ d.buffer }} min</span>
          <span v-if="d.hora_inicio_pausa && d.hora_fin_pausa" class="disp-extra">
            · Pausa: {{ formatHora(d.hora_inicio_pausa) }}–{{ formatHora(d.hora_fin_pausa) }}
          </span>
        </div>
        <button class="btn-danger-sm" @click="eliminarDisponibilidad(d.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mis-servicios { padding: 1rem; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1 { font-size: 1.5rem; font-weight: 600; color: #111827; }

.formulario {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.campo label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.campo input, .campo select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.direccion-seleccionada {
  font-size: 0.875rem;
  color: #2563eb;
  margin: 0.25rem 0 0;
}

.error-msg {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e5e7eb;
  position: relative;
}

.card-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0369a1;
  margin-bottom: 0.75rem;
}

.card h2 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #111827; }
.card p { font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0; }

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.75rem;
}

/* ── Selector de días ── */
.dias-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.btn-atajo {
  font-size: 0.75rem;
  font-weight: 500;
  color: #2563eb;
  background: none;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-atajo:hover { background: #eff6ff; }

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
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}

.dia-check input { display: none; }

.dia-check.activo {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

/* ── Badges excepción ── */
.exc-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
.exc-badge.rojo    { background: #fee2e2; color: #b91c1c; }
.exc-badge.naranja { background: #ffedd5; color: #9a3412; }
.exc-badge.gris    { background: #f3f4f6; color: #4b5563; }
.exc-badge.amarillo{ background: #fef9c3; color: #854d0e; }
.exc-badge.verde   { background: #dcfce7; color: #15803d; }

/* ── Disponibilidad ── */
.seccion-disponibilidad {
  padding: 1rem;
  margin-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.vacio {
  font-size: 0.875rem;
  color: #9ca3af;
  padding: 0.5rem 0;
}

.lista-disponibilidad {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.disp-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.875rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.disp-dia {
  font-weight: 700;
  color: #111827;
  font-size: 0.9375rem;
  min-width: 90px;
}

.disp-info {
  flex: 1;
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.disp-extra {
  color: #9ca3af;
}

.btn-danger-sm {
  background: none;
  border: 1px solid #fecaca;
  color: #ef4444;
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
  flex-shrink: 0;
}

.btn-danger-sm:hover {
  background: #fee2e2;
}
</style>