<script setup lang="ts">
const props = withDefaults(defineProps<{ label?: string }>(), {
  label: "Ingresar con Google",
});

const handleGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/redirect`;
};
</script>

<template>
  <button class="google-btn" @click="handleGoogle">
    {{ label }}
  </button>
</template>
