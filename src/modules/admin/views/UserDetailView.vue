<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { http } from "@/modules/auth/api/http";

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
};

type Actividad = {
  id: number;
  accion: string;
  descripcion: string;
  created_at: string;
};

const route = useRoute();

const usuario = ref<Usuario>();
const actividades = ref<Actividad[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

const search = ref("");

const fetchUsuario = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await http.get(`/admin/users/${route.params.id}`);
    usuario.value = res.data.usuario;
    actividades.value = res.data.actividades;
  } catch {
    error.value = "Error cargando el usuario";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsuario);

const filteredActividades = computed(() => {
  if (!search.value) return actividades.value;

  return actividades.value.filter((a) =>
    `${a.accion} ${a.descripcion}`.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="wrap">
    <div class="stack">
      <!-- DATOS DEL USUARIO -->
      <div class="card">
        <div class="header">
          <div>
            <h3>{{ usuario?.nombre }} {{ usuario?.apellido }}</h3>
            <p>{{ usuario?.email }}</p>
          </div>
        </div>

        <div class="table">
          <div class="row info-row">
            <div class="info-item">
              <span class="label">Rol</span>
              <span class="badge" :class="usuario?.role">{{ usuario?.role }}</span>
            </div>

            <div class="info-item">
              <span class="label">ID</span>
              <span class="muted">#{{ usuario?.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTIVIDAD RECIENTE -->
      <div class="card">
        <div class="header">
          <div>
            <h3>Actividad reciente</h3>
            <p>Historial del usuario</p>
          </div>

          <input v-model="search" class="search" placeholder="Buscar actividad..." />
        </div>

        <!-- STATES -->
        <p v-if="loading" class="empty">Cargando actividades...</p>
        <p v-else-if="error" class="error">{{ error }}</p>

        <!-- TABLE -->
        <div v-else class="table">
          <div class="row header-row">
            <div>Acción</div>
            <div>Descripción</div>
            <div>Fecha</div>
          </div>

          <div v-for="a in filteredActividades" :key="a.id" class="row">
            <div>
              <span class="badge">{{ a.accion }}</span>
            </div>

            <div class="muted">{{ a.descripcion }}</div>

            <div class="muted">{{ formatDate(a.created_at) }}</div>
          </div>

          <p v-if="filteredActividades.length === 0" class="empty">
            No hay actividades registradas
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.stack {
  width: 100%;
  max-width: 2000px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* CARD PRINCIPAL */
.card {
  width: 100%;
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 0.5px solid #e5e7eb;
}

h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

p {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* SEARCH */
.search {
  padding: 8px 10px;
  border: 0.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}

.search:focus {
  border-color: #2563eb;
}

/* TABLE */
.table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ROW */
.row {
  display: grid;
  grid-template-columns: 1fr 2fr 1.2fr;
  gap: 10px;

  padding: 12px 14px;
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  background: white;

  align-items: center;
  transition: 0.15s;
}

.row:hover {
  border-color: #2563eb;
  background: #eff9ff;
}

/* HEADER ROW */
.header-row {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  pointer-events: none;
}

/* INFO ROW (datos del usuario) */
.info-row {
  grid-template-columns: repeat(2, 1fr);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
}

/* TEXT */
.muted {
  font-size: 0.8rem;
  color: #6b7280;
}

/* BADGES */
.badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  background: #dbeafe;
  color: #1d4ed8;
  width: fit-content;
}

.badge.admin {
  background: #fee2e2;
  color: #b91c1c;
}

.badge.profesional {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge.cliente {
  background: #dcfce7;
  color: #166534;
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

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .search {
    width: 100%;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>
