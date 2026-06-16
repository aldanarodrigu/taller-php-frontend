<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { http } from "@/modules/auth/api/http";
import { useAuthStore } from "@/modules/auth/stores/auth";

type User = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  role: string;
};

const authStore = useAuthStore();
const esAdmin = computed(() => authStore.user?.role === "admin");

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const search = ref("");

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await http.get("/admin/users");
    users.value = res.data;
  } catch {
    error.value = "Error cargando usuarios";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

const filteredUsers = computed(() => {
  if (!search.value) return users.value;

  return users.value.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(search.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="wrap">
    <div class="card">
      <!-- HEADER -->
      <div class="header">
        <div>
          <h3>Usuarios</h3>
          <p>Gestión del sistema</p>
        </div>

        <input v-model="search" class="search" placeholder="Buscar usuario..." />
      </div>

      <!-- STATES -->
      <p v-if="loading" class="empty">Cargando usuarios...</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <!-- TABLE -->
      <div v-else class="table">
        <!-- HEADER ROW -->
        <div class="row header-row">
          <div>ID</div>
          <div>Usuario</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Acciones</div>
        </div>

        <!-- DATA -->
        <div v-for="u in filteredUsers" :key="u.id" class="row">
          <div class="muted">#{{ u.id }}</div>

          <div class="user">
            <div class="avatar">{{ u.nombre?.[0] }}{{ u.apellido?.[0] }}</div>
            <span>{{ u.nombre }} {{ u.apellido }}</span>
          </div>

          <div class="muted">{{ u.email }}</div>

          <div>
            <span class="badge" :class="u.role">{{ u.role }}</span>
          </div>

          <div class="actions">
            <button v-if="u.role !== 'admin'" class="btn">Ver</button>

            <button v-if="u.role !== 'admin'" class="btn danger">Desactivar</button>
          </div>
        </div>

        <p v-if="filteredUsers.length === 0" class="empty">No hay usuarios</p>
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
  grid-template-columns: 70px 1.5fr 1.5fr 120px 160px;
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

/* ACTIONS */
.actions {
  display: flex;
  gap: 6px;
}

.btn {
  padding: 5px 10px;
  font-size: 12px;
  border: 0.5px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.15s;
}

.btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.btn.danger {
  color: #ef4444;
  border-color: #fecaca;
}

.btn.danger:hover {
  background: #fee2e2;
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
    grid-template-areas:
      "id"
      "user"
      "email"
      "role"
      "actions";
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>
