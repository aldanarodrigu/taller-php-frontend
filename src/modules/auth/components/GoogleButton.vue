<script setup lang="ts">
const props = withDefaults(defineProps<{ label?: string }>(), {
  label: "Ingresar con Google",
});

const handleGoogle = () => {
  window.location.href = "http://localhost:8000/auth/google/redirect";
};
</script>

<template>
  <button class="google-btn" @click="handleGoogle">
    {{ label }}
  </button>
</template>
