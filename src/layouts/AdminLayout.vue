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

/* desktop */
.admin-content {
  flex: 1;
  margin-left: 240px;
  padding: 20px;
  background: #f9fafb;
}

/* tablet + mobile */
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-content {
    margin-left: 0;
    padding: 16px;
    padding-top: 70px; /* espacio si sidebar pasa a top */
  }
}
</style>
