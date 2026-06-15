<script setup lang="ts">
import { onMounted, ref } from "vue";
import { usePaquetesStore } from "@/modules/paquetes/stores/paquetes";
import { paquetesApi } from "@/modules/paquetes/api/paquetes";

const store = usePaquetesStore();
const tab = ref<"disponibles" | "mios">("disponibles");

const comprando = ref<number | null>(null);
const exito = ref<number | null>(null);
const errorCompra = ref("");

const misPaquetes = ref<any[]>([]);
const cargandoMios = ref(false);

onMounted(() => {
  store.listar();
  cargarMios();
});

async function cargarMios() {
  cargandoMios.value = true;
  try {
    const res = await paquetesApi.misPaquetes();
    misPaquetes.value = Array.isArray(res.data) ? res.data : res.data.data ?? [];
  } finally {
    cargandoMios.value = false;
  }
}

async function comprar(id: number) {
  comprando.value = id;
  exito.value = null;
  errorCompra.value = "";
  try {
    await store.comprar(id);
    exito.value = id;
    await cargarMios();
    setTimeout(() => (exito.value = null), 3000);
  } catch {
    errorCompra.value = "No se pudo completar la compra. Intentá de nuevo.";
  } finally {
    comprando.value = null;
  }
}

function estadoColor(estado: string) {
  if (estado === "activo") return "verde";
  if (estado === "agotado") return "gris";
  return "rojo";
}
</script>

<template>
  <div class="paquetes">
    <h1>Paquetes de Servicios</h1>

    <div class="tabs">
      <button :class="{ activo: tab === 'disponibles' }" @click="tab = 'disponibles'">
        Disponibles
      </button>
      <button :class="{ activo: tab === 'mios' }" @click="tab = 'mios'">
        Mis paquetes
        <span v-if="misPaquetes.length" class="badge">{{ misPaquetes.length }}</span>
      </button>
    </div>

    <!-- DISPONIBLES -->
    <template v-if="tab === 'disponibles'">
      <div v-if="store.cargando">Cargando...</div>
      <div v-else-if="store.error" class="error">{{ store.error }}</div>
      <div v-else-if="store.paquetes.length === 0">No hay paquetes disponibles.</div>

      <p v-if="errorCompra" class="error">{{ errorCompra }}</p>

      <div v-else class="lista">
        <div v-for="p in store.paquetes" :key="p.id" class="card">
          <div class="card-header">
            <span class="badge-sesiones">{{ p.cantidad_sesiones }} sesiones</span>
          </div>

          <h2>{{ p.nombre }}</h2>
          <p class="descripcion">{{ p.descripcion }}</p>

          <div class="detalle">
            <p v-if="p.vigencia_dias">Válido por {{ p.vigencia_dias }} días</p>
          </div>

          <div class="precio-box">
            <p class="precio">${{ p.precio }}</p>
            <p class="precio-sesion">
              ${{ (p.precio / p.cantidad_sesiones).toFixed(0) }} por sesión
            </p>
          </div>

          <p v-if="exito === p.id" class="msg-exito">¡Paquete comprado!</p>
          <button
            v-else
            class="btn-comprar"
            :disabled="comprando === p.id"
            @click="comprar(p.id)"
          >
            {{ comprando === p.id ? "Procesando..." : "Comprar paquete" }}
          </button>
        </div>
      </div>
    </template>

    <!-- MIS PAQUETES -->
    <template v-else>
      <div v-if="cargandoMios">Cargando...</div>
      <div v-else-if="misPaquetes.length === 0" class="vacio">
        No compraste ningún paquete todavía.
      </div>

      <div v-else class="lista">
        <div v-for="p in misPaquetes" :key="p.id" class="card">
          <div class="card-header">
            <span class="badge-sesiones">{{ p.cantidad_sesiones }} sesiones totales</span>
            <span class="badge-estado" :class="estadoColor(p.clientes?.[0]?.pivot?.estado)">
              {{ p.clientes?.[0]?.pivot?.estado ?? "—" }}
            </span>
          </div>

          <h2>{{ p.nombre }}</h2>
          <p class="descripcion">{{ p.descripcion }}</p>

          <div class="sesiones-box">
            <div class="sesiones-barra-wrap">
              <div
                class="sesiones-barra"
                :style="{
                  width: `${((p.clientes?.[0]?.pivot?.sesiones_disponibles ?? 0) / p.cantidad_sesiones) * 100}%`
                }"
              />
            </div>
            <p class="sesiones-texto">
              {{ p.clientes?.[0]?.pivot?.sesiones_disponibles ?? 0 }} sesiones disponibles
              de {{ p.cantidad_sesiones }}
            </p>
          </div>

          <div class="detalle" v-if="p.clientes?.[0]?.pivot?.fecha_vencimiento">
            <p>Vence: {{ new Date(p.clientes[0].pivot.fecha_vencimiento).toLocaleDateString('es-UY') }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.paquetes { padding: 1rem; }

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1.5px solid #e5e7eb;
  padding-bottom: 0;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tabs button.activo {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
  font-weight: 500;
}

.tabs .badge {
  background: #7c3aed;
  color: white;
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 1px 6px;
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
  border: 2px solid #e9d5ff;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-sesiones {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-estado {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-estado.verde { background: #dcfce7; color: #16a34a; }
.badge-estado.gris  { background: #f3f4f6; color: #6b7280; }
.badge-estado.rojo  { background: #fee2e2; color: #dc2626; }

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.descripcion {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.detalle {
  font-size: 0.8rem;
  color: #6b7280;
}

.detalle p { margin: 0; }

.precio-box {
  background: #f5f3ff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.precio {
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c3aed;
  margin: 0;
}

.precio-sesion {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.sesiones-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sesiones-barra-wrap {
  background: #e9d5ff;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.sesiones-barra {
  background: #7c3aed;
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.sesiones-texto {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

.btn-comprar {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.625rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  margin-top: auto;
}

.btn-comprar:hover:not(:disabled) { background: #6d28d9; }
.btn-comprar:disabled { opacity: 0.6; cursor: not-allowed; }

.msg-exito {
  text-align: center;
  color: #16a34a;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem;
  background: #f0fdf4;
  border-radius: 8px;
  margin-top: auto;
}

.vacio {
  color: #9ca3af;
  font-size: 0.875rem;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
</style>
