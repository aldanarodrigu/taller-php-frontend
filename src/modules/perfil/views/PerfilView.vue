<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import PerfilHeader from "@/modules/perfil/components/PerfilHeader.vue";

interface Profesional {
  descripcion?: string | null;
  profesion?: string | null;
  foto?: string | null;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string | null;
  profesional?: Profesional;
}

const authStore = useAuthStore();
const route = useRoute();

const profileUser = ref<User | null>(null);

onMounted(async () => {
  // asegura usuario logueado (cacheado)
  await authStore.fetchUser();

  const id = route.params.id;

  if (id) {
    const res = await fetch(`/api/usuarios/${id}`);
    profileUser.value = await res.json();
  } else {
    profileUser.value = authStore.user;
  }
});
</script>

<template>
  <div v-if="profileUser">
    <PerfilHeader :user="profileUser" :auth-user="authStore.user" />
  </div>
</template>
