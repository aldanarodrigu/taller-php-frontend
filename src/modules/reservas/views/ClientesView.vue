<script setup lang="ts">
import { ref, onMounted } from "vue";
import { http } from "@/modules/auth/api/http";

const clientes = ref<any[]>([]);
const cargando = ref(true);
const abierto = ref<Record<number, boolean>>({});

function toggleCliente(id: number) {
  abierto.value[id] = !abierto.value[id];
}

function formatFecha(fecha: string) {
  if (!fecha) return "—";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

function formatHora(hora: string) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

const ESTADOS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  pagada: "Pagada",
  en_curso: "En curso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  no_asistida: "No asistida",
};

const ESTADOS_COLOR: Record<string, string> = {
  pendiente: "amarillo",
  confirmada: "azul",
  pagada: "verde-claro",
  en_curso: "verde",
  finalizada: "gris",
  cancelada: "rojo",
  no_asistida: "naranja",
};

onMounted(async () => {
  try {
    const res = await http.get("/reservas/mis-clientes");
    clientes.value = res.data;
  } finally {
    cargando.value = false;
  }
});
</script>

<template>
  <div style="padding: 1.5rem; max-width: 700px">
    <h2 style="margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 600">Clientes</h2>

    <p v-if="cargando" style="color: #6b7280">Cargando...</p>

    <p v-else-if="clientes.length === 0" style="color: #6b7280">
      Todavía no tenés clientes con reservas.
    </p>

    <div v-else style="display: flex; flex-direction: column; gap: 0.5rem">
      <div
        v-for="cliente in clientes"
        :key="cliente.id"
        style="background: white; border: 0.5px solid #e5e7eb"
      >
        <!-- Fila del cliente -->
        <button
          @click="toggleCliente(cliente.id)"
          style="
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.875rem 1rem;
            background: none;
            border: none;
            cursor: pointer;
            text-align: left;
          "
        >
          <div style="display: flex; align-items: center; gap: 0.75rem">
            <div
              style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #dbeafe;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 600;
                color: #2563eb;
                flex-shrink: 0;
                text-transform: uppercase;
              "
            >
              {{ cliente.nombre?.[0] }}{{ cliente.apellido?.[0] }}
            </div>
            <div>
              <p style="margin: 0; font-size: 0.875rem; font-weight: 500; color: #111827">
                {{ cliente.nombre }} {{ cliente.apellido }}
              </p>
              <p style="margin: 0; font-size: 0.75rem; color: #6b7280">{{ cliente.email }}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem">
            <span style="font-size: 0.75rem; color: #6b7280; white-space: nowrap">
              {{ cliente.reservas.length }}
              {{ cliente.reservas.length === 1 ? "reserva" : "reservas" }}
            </span>
            <span style="font-size: 0.65rem; color: #9ca3af">
              {{ abierto[cliente.id] ? "▲" : "▼" }}
            </span>
          </div>
        </button>

        <!-- Reservas del cliente -->
        <div v-if="abierto[cliente.id]" style="border-top: 0.5px solid #f3f4f6">
          <div
            v-for="(reserva, i) in cliente.reservas"
            :key="reserva.id"
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0.6rem 1rem 0.6rem 3.5rem;
              font-size: 0.8rem;
              color: #374151;
            "
            :style="i < cliente.reservas.length - 1 ? 'border-bottom: 0.5px solid #f9fafb' : ''"
          >
            <div>
              <span style="font-weight: 500">{{ reserva.servicio_nombre }}</span>
              <span style="color: #6b7280; margin-left: 0.5rem">
                {{ formatFecha(reserva.fecha) }}
                <span v-if="reserva.hora_inicio"> · {{ formatHora(reserva.hora_inicio) }}</span>
              </span>
            </div>
            <span class="badge" :class="ESTADOS_COLOR[reserva.estado]">
              {{ ESTADOS_LABEL[reserva.estado] ?? reserva.estado }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge.amarillo  { background: #fef9c3; color: #854d0e; }
.badge.azul      { background: #dbeafe; color: #1d4ed8; }
.badge.verde-claro { background: #dcfce7; color: #166534; }
.badge.verde     { background: #bbf7d0; color: #15803d; }
.badge.gris      { background: #f3f4f6; color: #4b5563; }
.badge.rojo      { background: #fee2e2; color: #b91c1c; }
.badge.naranja   { background: #ffedd5; color: #9a3412; }
</style>
