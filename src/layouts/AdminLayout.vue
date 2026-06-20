<script setup lang="ts">
import AdminSidebar from "@/components/AdminSidebar.vue";
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="admin-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-content {
  flex: 1;
  margin-left: 240px;
  padding: 20px;
  background: #f9fafb;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem;
  }
}
</style>
