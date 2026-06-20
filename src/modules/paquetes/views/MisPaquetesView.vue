<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePaquetesStore } from "@/modules/paquetes/stores/paquetes";
import { http } from "@/modules/auth/api/http";

const store = usePaquetesStore();
const mostrarModal = ref(false);
const enviando = ref(false);
const errorForm = ref("");
const exitoForm = ref("");
const misServicios = ref<any[]>([]);

const form = ref({
  nombre: "",
  descripcion: "",
  cantidad_sesiones: 1,
  precio: 0,
  vigencia_dias: 30,
  servicio_ids: [] as number[],
});

onMounted(async () => {
  store.listarMios();
  const res = await http.get("/services/me");
  misServicios.value = Array.isArray(res.data) ? res.data : res.data.data ?? [];
});

async function guardar() {
  errorForm.value = "";
  exitoForm.value = "";
  enviando.value = true;
  try {
    await store.crear({ ...form.value });
    exitoForm.value = "Paquete creado correctamente.";
    form.value = { nombre: "", descripcion: "", cantidad_sesiones: 1, precio: 0, vigencia_dias: 30, servicio_ids: [] };
    setTimeout(() => {
      mostrarModal.value = false;
      exitoForm.value = "";
    }, 1200);
  } catch {
    errorForm.value = "Error al crear el paquete. Revisá los datos.";
  } finally {
    enviando.value = false;
  }
}

async function borrar(id: number) {
  if (!confirm("¿Eliminar este paquete?")) return;
  try {
    await store.eliminar(id);
  } catch {
    alert("Error al eliminar el paquete.");
  }
}
</script>

<template>
  <div class="mis-paquetes">
    <div class="encabezado">
      <div>
        <h1>Mis Paquetes</h1>
        <p class="subtitulo">Creá y gestioná tus paquetes de sesiones</p>
      </div>
      <button class="btn-nuevo" @click="mostrarModal = true">+ Nuevo paquete</button>
    </div>

    <div v-if="store.cargando">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <div v-else-if="store.misPaquetes.length === 0" class="vacio">
      Todavía no creaste ningún paquete.
    </div>

    <div v-else class="lista">
      <div v-for="p in store.misPaquetes" :key="p.id" class="card">
        <div class="card-top">
          <span class="badge">{{ p.cantidad_sesiones }} sesiones</span>
          <button class="btn-eliminar" @click="borrar(p.id)">Eliminar</button>
        </div>
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
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="mostrarModal" class="overlay" @click.self="mostrarModal = false">
        <div class="modal">
          <h2>Nuevo paquete</h2>

          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Pack 10 sesiones" />

          <label>Descripción</label>
          <textarea v-model="form.descripcion" rows="3" placeholder="Describí qué incluye el paquete" />

          <label>Cantidad de sesiones</label>
          <input v-model.number="form.cantidad_sesiones" type="number" min="1" />

          <label>Precio total ($)</label>
          <input v-model.number="form.precio" type="number" min="0" step="0.01" />

          <label>Vigencia (días)</label>
          <input v-model.number="form.vigencia_dias" type="number" min="1" />

          <label>Servicios que incluye</label>
          <div v-if="misServicios.length === 0" style="font-size:0.8rem; color:#6b7280">
            No tenés servicios creados.
          </div>
          <div
            v-else
            style="display:flex; flex-direction:column; gap:0.35rem; max-height:140px; overflow-y:auto; border:1px solid #d1d5db; padding:0.5rem; border-radius:6px"
          >
            <label
              v-for="s in misServicios"
              :key="s.id"
              style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; font-weight:400; cursor:pointer"
            >
              <input type="checkbox" :value="s.id" v-model="form.servicio_ids" style="width:auto" />
              {{ s.nombre }}
            </label>
          </div>

          <p v-if="errorForm" class="msg-error">{{ errorForm }}</p>
          <p v-if="exitoForm" class="msg-exito">{{ exitoForm }}</p>

          <div class="modal-acciones">
            <button class="btn-cancelar" @click="mostrarModal = false">Cancelar</button>
            <button class="btn-guardar" :disabled="enviando" @click="guardar">
              {{ enviando ? "Guardando..." : "Guardar" }}
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
}

h1 { font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 0.25rem; }

.subtitulo { color: #6b7280; font-size: 0.875rem; margin: 0; }

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

.vacio { color: #6b7280; font-size: 0.875rem; }

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: 2px solid #e9d5ff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-eliminar {
  background: none;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-eliminar:hover { background: #fee2e2; }

h2 { font-size: 1rem; font-weight: 600; color: #111827; margin: 0; }

.descripcion { font-size: 0.875rem; color: #6b7280; margin: 0; }

.detalle { font-size: 0.875rem; color: #6b7280; margin: 0; }

.precio-box {
  background: #f5f3ff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  margin-top: auto;
}

.precio { font-size: 1.4rem; font-weight: 700; color: #7c3aed; margin: 0; }

.precio-sesion { font-size: 0.75rem; color: #6b7280; margin: 0; }

.error { color: #dc2626; font-size: 0.875rem; }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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

.modal h2 { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 600; color: #111827; }

label { font-size: 0.8rem; font-weight: 500; color: #374151; }

input, textarea {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
}
input:focus, textarea:focus { outline: none; border-color: #7c3aed; }

.msg-error { color: #dc2626; font-size: 0.8rem; margin: 0; }
.msg-exito { color: #16a34a; font-size: 0.8rem; margin: 0; }

.modal-acciones {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-cancelar {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-guardar {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-guardar:not(:disabled):hover { background: #6d28d9; }
</style>
