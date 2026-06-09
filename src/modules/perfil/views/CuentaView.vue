<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/modules/auth/stores/auth";
import CuentaForm from "../components/CuentaForm.vue";
import type { User } from "@/types";

const authStore = useAuthStore();

const loading = ref(true);
const error = ref<string | null>(null);
const user = ref<User | null>(null);

const loadUser = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!authStore.user) {
      await authStore.fetchUser();
    }

    user.value = authStore.user;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Error cargando usuario";
  } finally {
    loading.value = false;
  }
};

onMounted(loadUser);
</script>

<template>
  <div class="cuenta-view">
    <div class="cuenta-card">
      <div class="header">
        <h1>Configuración de cuenta</h1>
      </div>

      <div v-if="loading">Cargando cuenta...</div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <CuentaForm v-else-if="user" :user="user" />
    </div>
  </div>
</template>

<style scoped>
.cuenta-view {
  padding: 1rem;
}

.cuenta-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}

.header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.error {
  color: #dc2626;
}

@media (max-width: 768px) {
  .cuenta-view {
    padding: 0.75rem;
  }

  .cuenta-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .header h1 {
    font-size: 1.25rem;
  }
}
</style>
