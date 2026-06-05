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

onMounted(() => {
  descripcion.value = authStore.user?.profesional?.descripcion ?? "";

  profesion.value = authStore.user?.profesional?.profesion ?? "";
});

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (input.files?.length) {
    foto.value = input.files[0];
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
  } catch (e) {
    error.value = "Error al guardar. Intentá de nuevo.";
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <div class="edit-card">
    <h2>Editar perfil</h2>

    <label>Profesión</label>
    <input v-model="profesion" />

    <label>Descripción</label>
    <textarea v-model="descripcion" rows="5" />

    <label>Foto</label>
    <input type="file" accept="image/*" @change="onFileChange" />

    <button @click="guardar">Guardar cambios</button>
  </div>
</template>
