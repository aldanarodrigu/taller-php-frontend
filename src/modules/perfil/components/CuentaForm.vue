<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { http } from "@/modules/auth/api/http";
import type { User } from "@/types";
import { useAuthStore } from "@/modules/auth/stores/auth";
const guardando = ref(false);

const props = defineProps<{
  user: User;
}>();

const form = reactive({
  nombre: "",
  apellido: "",
  email: "",
});

watch(
  () => props.user,
  (u) => {
    if (!u) return;

    form.nombre = u.nombre ?? "";
    form.apellido = u.apellido ?? "";
    form.email = u.email ?? "";
  },
  { immediate: true, deep: true },
);

const authStore = useAuthStore();

const guardar = async () => {
  try {
    guardando.value = true;

    await http.put(`/usuarios/${props.user.id}`, {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
    });

    await authStore.refreshUser();

    alert("Datos actualizados");
  } catch (error) {
    console.error(error);
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div class="form-wrap">
    <div class="form-card">
      <div class="form-header">
        <h3>Datos personales</h3>
        <p>Actualizá la información de tu cuenta</p>
      </div>

      <div class="form-grid">
        <div class="field">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            class="input"
            :disabled="guardando"
          />
        </div>

        <div class="field">
          <label for="apellido">Apellido</label>
          <input
            id="apellido"
            v-model="form.apellido"
            type="text"
            class="input"
            :disabled="guardando"
          />
        </div>

        <div class="field full">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" class="input" disabled />

          <p class="field-hint">
            <i class="ti ti-lock" />
            El correo no puede modificarse
          </p>
        </div>
      </div>

      <div class="actions">
        <button class="btn-save" @click="guardar" :disabled="guardando">
          {{ guardando ? "Guardando..." : "Guardar cambios" }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.input {
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  outline: none;
  transition: border 0.15s;
  background: white;
}

.input:focus {
  border-color: #2563eb;
}

.field-hint {
  font-size: 0.73rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.75rem;
  padding-top: 1.5rem;
  border-top: 0.5px solid #e5e7eb;
}

.btn-save {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.85;
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
