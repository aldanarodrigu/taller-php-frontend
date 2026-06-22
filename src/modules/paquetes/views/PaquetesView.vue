<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted } from "vue";
import { usePaquetesStore } from "@/modules/paquetes/stores/paquetes";

const store = usePaquetesStore();

const paqueteSeleccionado = ref<any>(null);
const pagoCargando = ref(false);
const pagoError = ref("");
const pagoExito = ref(false);

onMounted(() => store.listar());

function abrirPago(paquete: any) {
  paqueteSeleccionado.value = paquete;
  pagoError.value = "";
  pagoExito.value = false;
}

function cerrarModal() {
  paqueteSeleccionado.value = null;
  pagoError.value = "";
  pagoExito.value = false;
}

async function confirmarPago() {
  if (!paqueteSeleccionado.value) return;
  pagoCargando.value = true;
  pagoError.value = "";
  try {
    await store.comprar(paqueteSeleccionado.value.id);
    pagoExito.value = true;
    setTimeout(() => cerrarModal(), 1800);
  } catch {
    pagoError.value = "No se pudo procesar el pago. Intentá de nuevo.";
  } finally {
    pagoCargando.value = false;
  }
}
</script>

<template>
  <div class="paquetes">
    <h1>Paquetes de Servicios</h1>

    <div v-if="store.cargando">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <div v-else-if="store.paquetes.length === 0">No hay paquetes disponibles.</div>

    <div v-else class="lista">
      <div v-for="p in store.paquetes" :key="p.id" class="card">
        <div class="card-header">
          <span class="badge-sesiones">{{ p.cantidad_sesiones }} sesiones</span>
        </div>
        <h2>{{ p.nombre }}</h2>
        <p class="descripcion">{{ p.descripcion }}</p>
        <div class="detalle">
          <p>Válido por {{ p.vigencia_dias ?? "—" }} días</p>
        </div>
        <div class="precio-box">
          <p class="precio">${{ p.precio }}</p>
          <p class="precio-sesion">
            ${{ (p.precio / p.cantidad_sesiones).toFixed(0) }} por sesión
          </p>
        </div>
        <button class="btn-comprar" @click="abrirPago(p)">
          Comprar paquete
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de pago -->
  <Teleport to="body">
    <div v-if="paqueteSeleccionado" class="pago-overlay" @click.self="cerrarModal">
      <div class="pago-form">

        <div v-if="pagoExito" class="pago-exito">
          <p class="exito-icono">✓</p>
          <p class="exito-texto">¡Paquete adquirido con éxito!</p>
        </div>

        <template v-else>
          <h3>Confirmar compra</h3>

          <div class="pago-detalle">
            <div class="pago-fila">
              <span>Paquete</span>
              <span>{{ paqueteSeleccionado.nombre }}</span>
            </div>
            <div class="pago-fila">
              <span>Sesiones</span>
              <span>{{ paqueteSeleccionado.cantidad_sesiones }} sesiones</span>
            </div>
            <div class="pago-fila">
              <span>Vigencia</span>
              <span>{{ paqueteSeleccionado.vigencia_dias ?? "—" }} días</span>
            </div>
            <div class="pago-fila total">
              <span>Total</span>
              <span>UYU {{ Number(paqueteSeleccionado.precio).toFixed(2) }}</span>
            </div>
          </div>

          <div v-if="pagoError" class="error-msg">{{ pagoError }}</div>

          <div class="pago-botones">
            <button class="btn-link" :disabled="pagoCargando" @click="cerrarModal">
              Cancelar
            </button>
            <button class="btn-save" :disabled="pagoCargando" @click="confirmarPago">
              {{ pagoCargando ? "Procesando..." : "Confirmar pago" }}
            </button>
          </div>
        </template>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.paquetes { padding: 1rem; }

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
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

.card-header { display: flex; justify-content: space-between; }

.badge-sesiones {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

h2 { font-size: 1rem; font-weight: 600; color: #111827; margin: 0; }

.descripcion { font-size: 0.875rem; color: #6b7280; margin: 0; }

.detalle { font-size: 0.875rem; color: #6b7280; }
.detalle p { margin: 0.25rem 0; }

.precio-box {
  background: #f5f3ff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.precio { font-size: 1.5rem; font-weight: 700; color: #7c3aed; margin: 0; }
.precio-sesion { font-size: 0.75rem; color: #6b7280; margin: 0; }

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
.btn-comprar:hover { background: #6d28d9; }

.error { color: #dc2626; font-size: 0.875rem; }

/* Modal de pago */
.pago-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pago-form {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pago-form h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.pago-detalle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
}

.pago-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #374151;
}

.pago-fila span:first-child { color: #6b7280; }

.pago-fila.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  margin-top: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.pago-fila.total span:first-child { color: #111827; }

.pago-botones {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-link {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-save {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save:not(:disabled):hover { background: #6d28d9; }

.error-msg { color: #dc2626; font-size: 0.875rem; }

.pago-exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.exito-icono {
  font-size: 2.5rem;
  color: #16a34a;
  background: #dcfce7;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.exito-texto {
  font-size: 1rem;
  font-weight: 600;
  color: #16a34a;
  margin: 0;
}
</style>
