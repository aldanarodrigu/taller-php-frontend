<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/stores/auth";
import PerfilHeader from "@/modules/perfil/components/PerfilHeader.vue";
import PerfilServicios from "@/modules/perfil/components/PerfilServices.vue";
import { http } from "@/modules/auth/api/http";
import type { User } from "@/types";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const profileUser = ref<User | null>(null);
const loading = ref(!authStore.loaded && !authStore.user);
const error = ref<string | null>(null);

const loadProfile = async () => {
  try {
    loading.value = true;
    error.value = null;

    if (!authStore.user) {
      await authStore.fetchUser();
    }

    if (authStore.user?.role === "cliente") {
      router.push("/app/configuracion");
      return;
    }

    const id = route.params.id as string | undefined;

    if (id) {
      const res = await http.get(`/api/usuarios/${id}`);
      profileUser.value = res.data;
    } else {
      profileUser.value = authStore.user;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Error cargando perfil";
    profileUser.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});

watch(
  () => route.params.id,
  () => {
    loadProfile();
  },
);

const handleEditProfile = () => {
  router.push({ name: "ProfileEdit" });
};
</script>

<template>
  <div class="perfil-view">
    <div v-if="loading" class="loading">
      <p>Cargando perfil...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="$router.back()">Volver</button>
    </div>
    <div v-else-if="profileUser" class="perfil-contenido">
      <PerfilHeader :user="profileUser" :auth-user="authStore.user" @edit="handleEditProfile" />
      <PerfilServicios
        :profesional-id="profileUser.profesional?.id"
        :es-propietario="authStore.user?.id === profileUser.id"
      />
    </div>
  </div>
</template>

<style scoped>
.perfil-view {
  background-color: #f5f4f46c;
  min-height: 100%;
  padding: 1rem;
}

.perfil-contenido {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #dc2626;
  background: #fee2e2;
  border-radius: 8px;
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

@media (max-width: 768px) { .perfil-view { padding: 1rem; } .perfil-contenido { gap: 0.75rem; } }
