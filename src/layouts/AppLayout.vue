<script setup lang="ts">
import Sidebar from "@/components/SideBar.vue";
import { useAuthStore } from "@/modules/auth/stores/auth";
import { onMounted } from "vue";

const authStore = useAuthStore();

onMounted(async () => {
  const token = localStorage.getItem("token");

  if (token && !authStore.loaded) {
    await authStore.fetchUser();
  }
});
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: #e4fee06c;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  overflow-y: auto;
  padding: 2rem;
}
</style>
