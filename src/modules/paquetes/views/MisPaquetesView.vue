<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { usePaquetesStore } from "@/modules/paquetes/stores/paquetes";
import { http } from "@/modules/auth/api/http";

const store = usePaquetesStore();
<<<<<<< Updated upstream
=======
const mostrarModal = ref(false);
const enviando = ref(false);
const errorForm = ref("");
const exitoForm = ref("");
const misServicios = ref<any[]>([]);
>>>>>>> Stashed changes

const mostrarForm = ref(false);
const guardando = ref(false);
const errorForm = ref("");
const eliminando = ref<number | null>(null);

const form = reactive({
  nombre: "",
  descripcion: "",
  cantidad_sesiones: 1,
  precio: 0,
<<<<<<< Updated upstream
  vigencia_dias: null as number | null,
});

onMounted(() => {
  store.listar();
});

function abrirForm() {
  form.nombre = "";
  form.descripcion = "";
  form.cantidad_sesiones = 1;
  form.precio = 0;
  form.vigencia_dias = null;
  errorForm.value = "";
  mostrarForm.value = true;
}
=======
  vigencia_dias: 30,
  servicio_ids: [] as number[],
});

onMounted(async () => {
  store.listarMios();
  const res = await http.get("/services/me");
  misServicios.value = res.data;
});
>>>>>>> Stashed changes

async function guardar() {
  if (!form.nombre || form.cantidad_sesiones < 1 || form.precio < 0) {
    errorForm.value = "Completá nombre, cantidad de sesiones y precio.";
    return;
  }
  guardando.value = true;
  errorForm.value = "";
  try {
<<<<<<< Updated upstream
    await store.crear({ ...form });
    mostrarForm.value = false;
=======
    await store.crear({ ...form.value });
    exitoForm.value = "Paquete creado correctamente.";
    form.value = { nombre: "", descripcion: "", cantidad_sesiones: 1, precio: 0, vigencia_dias: 30, servicio_ids: [] };
    setTimeout(() => {
      mostrarModal.value = false;
      exitoForm.value = "";
    }, 1200);
>>>>>>> Stashed changes
  } catch {
    errorForm.value = "Error al crear el paquete.";
  } finally {
    guardando.value = false;
  }
}

async function eliminar(id: number) {
  if (!confirm("¿Eliminar este paquete?")) return;
  eliminando.value = id;
  try {
    await store.eliminar(id);
  } catch {
    alert("No se pudo eliminar el paquete.");
  } finally {
    eliminando.value = null;
  }
}
</script>

<template>
  <div class="mis-paquetes">
    <div class="encabezado">
      <div>
        <h1>Mis Paquetes</h1>
        <p class="subtitulo">Creá paquetes de sesiones para tus clientes</p>
      </div>
      <button class="btn-nuevo" @click="abrirForm">+ Nuevo paquete</button>
    </div>

    <div v-if="store.cargando">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <div v-else-if="store.paquetes.length === 0" class="vacio">
      No tenés paquetes creados todavía.
    </div>

    <div v-else class="lista">
      <div v-for="p in store.paquetes" :key="p.id" class="card">
        <div class="card-top">
          <div>
            <h2>{{ p.nombre }}</h2>
            <p class="descripcion">{{ p.descripcion }}</p>
          </div>
          <span class="badge">{{ p.cantidad_sesiones }} sesiones</span>
        </div>
<<<<<<< Updated upstream

        <div class="datos">
          <span class="precio">${{ p.precio }}</span>
          <span class="detalle">
            ${{ (p.precio / p.cantidad_sesiones).toFixed(0) }} c/u
          </span>
          <span v-if="p.vigencia_dias" class="detalle">· {{ p.vigencia_dias }} días</span>
=======
        <h2>{{ p.nombre }}</h2>
        <p class="descripcion">{{ p.descripcion }}</p>
        <p v-if="p.servicios?.length" class="detalle">
          Servicios: {{ p.servicios.map((s: any) => s.nombre).join(", ") }}
        </p>
        <p v-else class="detalle" style="color:#ef4444">Sin servicios asignados</p>
        <p class="detalle">Válido por {{ p.vigencia_dias ?? "—" }} días</p>
        <div class="precio-box">
          <p class="precio">${{ p.precio }}</p>
          <p class="precio-sesion">${{ (p.precio / p.cantidad_sesiones).toFixed(0) }} por sesión</p>
>>>>>>> Stashed changes
        </div>

        <button
          class="btn-eliminar"
          :disabled="eliminando === p.id"
          @click="eliminar(p.id)"
        >
          {{ eliminando === p.id ? "Eliminando..." : "Eliminar" }}
        </button>
      </div>
    </div>

    <!-- Formulario nuevo paquete -->
    <Teleport to="body">
      <div v-if="mostrarForm" class="overlay" @click.self="mostrarForm = false">
        <div class="modal">
          <h2>Nuevo paquete</h2>

          <label>Nombre *</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Pack 5 sesiones" />

          <label>Descripción</label>
          <textarea v-model="form.descripcion" placeholder="Descripción opcional" rows="2" />

          <div class="fila">
            <div class="campo">
              <label>Cantidad de sesiones *</label>
              <input v-model.number="form.cantidad_sesiones" type="number" min="1" />
            </div>
            <div class="campo">
              <label>Precio *</label>
              <input v-model.number="form.precio" type="number" min="0" step="0.01" />
            </div>
          </div>

          <label>Vigencia (días, opcional)</label>
          <input v-model.number="form.vigencia_dias" type="number" min="1" placeholder="Ej: 90" />

          <p v-if="errorForm" class="error">{{ errorForm }}</p>

<<<<<<< Updated upstream
          <div class="acciones">
            <button class="btn-cancelar" @click="mostrarForm = false">Cancelar</button>
            <button class="btn-guardar" :disabled="guardando" @click="guardar">
              {{ guardando ? "Guardando..." : "Crear paquete" }}
=======
          <label>Servicios que incluye</label>
          <div v-if="misServicios.length === 0" style="font-size:0.8rem; color:#6b7280">
            No tenés servicios creados.
          </div>
          <div v-else style="display:flex; flex-direction:column; gap:0.35rem; max-height:140px; overflow-y:auto; border:1px solid #d1d5db; padding:0.5rem">
            <label
              v-for="s in misServicios"
              :key="s.id"
              style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:400; cursor:pointer"
            >
              <input
                type="checkbox"
                :value="s.id"
                v-model="form.servicio_ids"
                style="width:auto"
              />
              {{ s.nombre }}
            </label>
          </div>

          <p v-if="errorForm" class="msg-error">{{ errorForm }}</p>
          <p v-if="exitoForm" class="msg-exito">{{ exitoForm }}</p>

          <div class="modal-acciones">
            <button class="btn-cancelar" @click="mostrarModal = false">Cancelar</button>
            <button class="btn-guardar" :disabled="enviando" @click="guardar">
              {{ enviando ? "Guardando..." : "Guardar" }}
>>>>>>> Stashed changes
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.mis-paquetes { padding: 1rem; }

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
}

.subtitulo {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.btn-nuevo {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.btn-nuevo:hover { background: #6d28d9; }

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1.5px solid #e9d5ff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

h2 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem;
}

.descripcion {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.badge {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.datos {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.precio {
  font-size: 1.25rem;
  font-weight: 700;
  color: #7c3aed;
}

.detalle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.btn-eliminar {
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  align-self: flex-start;
}

.btn-eliminar:hover:not(:disabled) { background: #fef2f2; }
.btn-eliminar:disabled { opacity: 0.5; cursor: not-allowed; }

.vacio {
  color: #9ca3af;
  font-size: 0.875rem;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.modal label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  margin-top: 0.25rem;
}

.modal input,
.modal textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
}

.modal input:focus,
.modal textarea:focus {
  border-color: #7c3aed;
}

.fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancelar {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-guardar {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-guardar:hover:not(:disabled) { background: #6d28d9; }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
