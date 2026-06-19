<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { http } from "@/modules/auth/api/http";

type Actividad = {
  id: number;
  accion: string;
  descripcion: string;
  created_at: string;
  usuario: {
    nombre: string;
    apellido: string;
  };
};

const actividades = ref<Actividad[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const search = ref("");

const fetchActividades = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await http.get("/admin/actividades");
    actividades.value = res.data;
  } catch {
    error.value = "Error cargando actividades";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchActividades);

const filteredActividades = computed(() => {
  if (!search.value) return actividades.value;

  return actividades.value.filter((a) =>
    `${a.usuario.nombre} ${a.usuario.apellido} ${a.accion} ${a.descripcion}`
      .toLowerCase()
      .includes(search.value.toLowerCase()),
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
    <div class="card">
      <!-- HEADER -->
      <div class="header">
        <div>
          <h3>Actividad del sistema</h3>
          <p>Últimos eventos registrados</p>
        </div>

        <input v-model="search" class="search" placeholder="Buscar actividad..." />
      </div>

      <!-- STATES -->
      <p v-if="loading" class="empty">Cargando actividades...</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <!-- TABLE -->
      <div v-else class="table">
        <!-- HEADER ROW -->
        <div class="row header-row">
          <div>ID</div>
          <div>Usuario</div>
          <div>Acción</div>
          <div>Descripción</div>
          <div>Fecha</div>
        </div>

        <!-- DATA -->
        <div v-for="a in filteredActividades" :key="a.id" class="row">
          <div class="muted">#{{ a.id }}</div>

          <div class="user">
            <div class="avatar">{{ a.usuario.nombre?.[0] }}{{ a.usuario.apellido?.[0] }}</div>
            <span>{{ a.usuario.nombre }} {{ a.usuario.apellido }}</span>
          </div>

          <div>
            <span class="badge">{{ a.accion }}</span>
          </div>

          <div class="muted">{{ a.descripcion }}</div>

          <div class="muted">{{ formatDate(a.created_at) }}</div>
        </div>

        <p v-if="filteredActividades.length === 0" class="empty">No hay actividades registradas</p>
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

/* CARD PRINCIPAL */
.card {
  width: 100%;
  max-width: 2000px;
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
  grid-template-columns: 70px 1.5fr 1fr 2fr 1.2fr;
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

/* USER CELL */
.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 11px;
  font-weight: 700;
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
}
</style>
