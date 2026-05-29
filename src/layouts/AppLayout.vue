<script setup lang="ts">
import Sidebar from "@/components/SideBar.vue";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { onMounted } from "vue";

const authStore = useAuthStore();

onMounted(() => {
  authStore.fetchUser(); //carga el usuario al montar el layout
});
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}
</style>
