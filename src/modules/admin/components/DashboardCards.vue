<script setup lang="ts">
import { onMounted, ref } from "vue";
import { http } from "@/modules/auth/api/http";

type Metricas = {
  cant_usuarios: number;
  cant_clientes: number;
  cant_profesionales: number;
  cant_reservas: number;
};

const metricas = ref<Metricas>();
const loading = ref(false);
const error = ref<string | null>(null);

const fetchMetricas = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await http.get("/admin/dashboard/metricas");
    metricas.value = res.data;
  } catch {
    error.value = "Error cargando métricas";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMetricas);

const cards = [
  { key: "cant_usuarios", label: "Usuarios", icon: "👥", color: "blue" },
  { key: "cant_clientes", label: "Clientes", icon: "🧑", color: "green" },
  { key: "cant_profesionales", label: "Profesionales", icon: "💼", color: "purple" },
  { key: "cant_reservas", label: "Reservas", icon: "📅", color: "orange" },
] as const;
</script>

<template>
  <div class="wrap">
    <p v-if="loading" class="empty">Cargando métricas...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else class="grid">
      <div v-for="c in cards" :key="c.key" class="card" :class="c.color">
        <div class="icon">{{ c.icon }}</div>

        <div class="info">
          <span class="label">{{ c.label }}</span>
          <span class="value">{{ metricas?.[c.key] ?? 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* CARD */
.card {
  display: flex;
  align-items: center;
  gap: 14px;

  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;

  transition: 0.15s;
}

.card:hover {
  border-color: #2563eb;
  background: #eff9ff;
}

/* ICON */
.icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.25rem;
  flex-shrink: 0;
}

.card.blue .icon {
  background: #dbeafe;
}

.card.green .icon {
  background: #dcfce7;
}

.card.purple .icon {
  background: #ede9fe;
}

.card.orange .icon {
  background: #ffedd5;
}

/* INFO */
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

/* STATES */
.empty {
  text-align: center;
  padding: 2rem 0;
  color: #9ca3af;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
