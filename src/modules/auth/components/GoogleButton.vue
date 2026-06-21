<script setup lang="ts">
const props = withDefaults(defineProps<{ label?: string }>(), {
  label: "Ingresar con Google",
});

const handleGoogle = () => {
  const appUrl = import.meta.env.VITE_APP_URL ?? "http://localhost:8000";
  window.location.href = `${appUrl}/auth/google/redirect`;
};
</script>

<template>
  <button class="google-btn" @click="handleGoogle">
    {{ label }}
  </button>
</template>
