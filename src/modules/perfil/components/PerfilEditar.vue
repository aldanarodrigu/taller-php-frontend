<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { http } from "@/modules/auth/api/http";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const descripcion = ref("");
const profesion = ref("");
const foto = ref<File | undefined>(undefined);
const fotoPreview = ref<string | null>(null);

onMounted(() => {
  descripcion.value = authStore.user?.profesional?.descripcion ?? "";

  profesion.value = authStore.user?.profesional?.profesion ?? "";
});

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    foto.value = input.files[0];
    fotoPreview.value = URL.createObjectURL(input.files[0]);
  }
};
const guardando = ref(false);
const error = ref<string | null>(null);

const guardar = async () => {
  guardando.value = true;
  error.value = null;
  try {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("descripcion", descripcion.value);
    formData.append("profesion", profesion.value);
    if (foto.value) formData.append("foto", foto.value);

    await http.post("/profesional", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await authStore.refreshUser();
    router.push({ name: "ProfileOwn" });
  } catch {
    error.value = "Error al guardar. Intentá de nuevo.";
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div class="form-wrap">
    <div class="form-card">
      <div class="form-header">
        <h2>Editar perfil</h2>
        <p>Actualizá tu información profesional</p>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="field">
        <label>Profesión</label>
        <input
          v-model="profesion"
          type="text"
          placeholder="Ej: Psicólogo clínico"
          :disabled="guardando"
        />
      </div>

      <div class="field">
        <label>Descripción</label>
        <textarea
          v-model="descripcion"
          placeholder="Contá un poco sobre vos..."
          :disabled="guardando"
        />
      </div>

      <div class="field">
        <label>Foto de perfil</label>
        <div class="foto-area" @click="$refs.fotoInput.click()">
          <input
            ref="fotoInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            style="display: none"
          />
          <template v-if="!fotoPreview">
            <i class="ti ti-photo foto-icon" />
            <p class="foto-label">Hacé clic para subir una imagen</p>
            <p class="foto-sub">JPG, PNG o WEBP · máx. 2MB</p>
          </template>
          <template v-else>
            <img :src="fotoPreview" class="foto-preview" alt="Vista previa" />
            <p class="foto-label">{{ foto?.name }}</p>
          </template>
        </div>
      </div>

      <div class="actions">
        <button class="btn-cancel" @click="router.push({ name: 'ProfileOwn' })">Cancelar</button>
        <button class="btn-save" @click="guardar" :disabled="guardando">
          {{ guardando ? "Guardando..." : "Guardar cambios" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-wrap {
  max-width: 560px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.form-card {
  background: var(--color-background-primary, white);
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}
.form-header {
  margin-bottom: 2rem;
}
.form-header h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 500;
}
.form-header p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}
.field {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}
.field input,
.field textarea {
  border: 0.5px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  outline: none;
  transition: border 0.15s;
}
.field input:focus,
.field textarea:focus {
  border-color: #2563eb;
}
.field textarea {
  resize: vertical;
  min-height: 100px;
}
.foto-area {
  border: 0.5px dashed #d1d5db;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s;
}
.foto-area:hover {
  background: #f9fafb;
}
.foto-icon {
  font-size: 28px;
  color: #9ca3af;
  margin-bottom: 8px;
}
.foto-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}
.foto-sub {
  font-size: 0.7rem;
  color: #9ca3af;
  margin: 4px 0 0;
}
.foto-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 8px;
}
.error-msg {
  font-size: 0.8rem;
  color: #dc2626;
  background: #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 1rem;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 1.75rem;
}
.btn-cancel {
  flex: 1;
  padding: 10px;
  font-size: 0.875rem;
  border-radius: 8px;
  border: 0.5px solid #d1d5db;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}
.btn-cancel:hover {
  background: #f3f4f6;
}
.btn-save {
  flex: 2;
  padding: 10px;
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
