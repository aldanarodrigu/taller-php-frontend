<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { UserIcon, BriefcaseIcon } from "@heroicons/vue/24/outline";
import { useAuth } from "@/modules/auth/composables/useAuth";

const route = useRoute();
const payload = route.query.payload as string;
const role = ref<"cliente" | "profesional">("cliente");

const { completeGoogleRegister, loading, error } = useAuth();
</script>

<template>
  <div class="register-wrapper">
    <div class="right-side" style="width: 100%">
      <div class="register-card" style="max-width: 500px">
        <div class="title">
          <h2>¡Casi listo!</h2>
          <p>¿Cómo querés usar TurnoYa?</p>
        </div>

        <div class="account-type">
          <input type="radio" id="cliente" value="cliente" v-model="role" />
          <label for="cliente" class="type-card">
            <div class="card-header">
              <UserIcon class="card-icon" />
              <h3>Cliente</h3>
            </div>
            <p>Reservar turnos fácilmente</p>
          </label>

          <input type="radio" id="profesional" value="profesional" v-model="role" />
          <label for="profesional" class="type-card">
            <div class="card-header">
              <BriefcaseIcon class="card-icon" />
              <h3>Profesional</h3>
            </div>
            <p>Gestionar agenda y clientes</p>
          </label>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button
          class="register-btn"
          :disabled="loading"
          @click="completeGoogleRegister(payload, role)"
        >
          {{ loading ? "Creando cuenta..." : "Continuar" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-wrapper {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  font-family: "Poppins", sans-serif;
  background: #ffffff;
}

.register-card {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 60px 40px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border-radius: 5px;
}

.title h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
}
.title p {
  margin-top: 10px;
  color: #9d9d9d;
  font-size: 1rem;
}

.account-type {
  display: flex;
  gap: 16px;
  width: 100%;
}
.account-type input {
  display: none;
}

.type-card {
  flex: 1;
  padding: 24px 20px;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.25s ease;
}
.type-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
}
.account-type input:checked + .type-card {
  border: 2px solid #2563eb;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-icon {
  width: 24px;
  height: 24px;
  color: #1a1a1a;
  stroke-width: 2;
}
.type-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #111;
}
.type-card p {
  font-size: 14px;
  color: #777;
  text-align: center;
}

.error {
  color: #ff6b6b;
  font-size: 0.9rem;
}

.register-btn {
  width: 100%;
  padding: 17px;
  border: none;
  border-radius: 5px;
  background: #2563eb;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}
.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(16, 52, 254, 0.22);
}
.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.right-side {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
