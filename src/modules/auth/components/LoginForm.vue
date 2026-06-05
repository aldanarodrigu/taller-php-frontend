<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "@/modules/auth/composables/useAuth.ts";
import GoogleButton from "./GoogleButton.vue";

const email = ref("");
const password = ref("");
const { login, loading, error } = useAuth();

const handleLogin = async () => await login(email.value, password.value);
</script>

<template>
  <div class="login-wrapper">
    <div class="left-side">
      <img src="@/assets/login.png" alt="Agenda tu turno" class="illustration" />
      <div class="left-text">
        <h1>Agenda tu turno</h1>
        <p>Elegí el profesional, día y horario que mejor se adapte a vos.</p>
        <div class="dots">
          <span class="active"></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
    <div class="right-side">
      <div class="login-card">
        <div class="title">
          <h2>¡Bienvenido de nuevo!</h2>
          <p>Ingresá a tu cuenta para continuar</p>
        </div>

        <input v-model="email" type="email" placeholder="Correo electrónico" />
        <input v-model="password" type="password" placeholder="Contraseña" />

        <p v-if="error" class="error">{{ error }}</p>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          {{ loading ? "Cargando..." : "Ingresar" }}
        </button>

        <GoogleButton />

        <p class="register-text">
          ¿No tienes cuenta?
          <RouterLink to="/auth/register">Regístrate</RouterLink>
        </p>
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

/* ─────────────────────────────
   LAYOUT
───────────────────────────── */
.login-wrapper {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  font-family: "Poppins", sans-serif;
}

/* ─────────────────────────────
   LEFT SIDE
───────────────────────────── */
.left-side {
  width: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  gap: 32px;
}

.illustration {
  width: 100%;
  max-width: 600px;
  object-fit: contain;
  mask-image: radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 85% 85% at center, black 60%, transparent 100%);
}

.left-text {
  text-align: center;
}

.left-text h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.left-text p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 420px;
}

/* ─────────────────────────────
   DOTS
───────────────────────────── */
.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
}

.dots span {
  width: 10px;
  height: 10px;
  background: #d5d5d5;
  border-radius: 999px;
}

.dots .active {
  width: 28px;
  background: #2563eb;
}

/* ─────────────────────────────
   RIGHT SIDE
───────────────────────────── */
.right-side {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}
/*
.blob {
  position: absolute;
  top: -140px;
  right: -140px;
  width: 520px;
  height: 480px;
  background: #febe10;
  border-radius: 50% 20% 60% 30% / 40% 50% 40% 60%;
  z-index: 1;
  opacity: 0.9;
}
*/
/* ─────────────────────────────
   CARD
───────────────────────────── */
.login-card {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 80px 40px;
  background: rgba(255, 255, 255);
  border: 1px solid #e8e8e8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  position: relative;
  z-index: 2;
}

/* ─────────────────────────────
   TITLE
───────────────────────────── */
.title {
  margin-bottom: 12px;
}

.title h2 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1a1a1a;
}

.title h2::after {
  content: "";
}

.title p {
  margin-top: 10px;
  color: #9d9d9d;
  font-size: 1rem;
}

/* ─────────────────────────────
   INPUTS
───────────────────────────── */
input {
  width: 100%;
  padding: 18px 20px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #1a1a1a;
  font-size: 1rem;
  outline: none;
  transition: 0.25s ease;
}

input::placeholder {
  color: #8d8d8d;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(31, 34, 214, 0.089);
}

/* ─────────────────────────────
   ERROR
───────────────────────────── */
.error {
  color: #ff6b6b;
  font-size: 0.9rem;
}

/* ─────────────────────────────
   LOGIN BUTTON
───────────────────────────── */
.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(16, 40, 254, 0.22);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ─────────────────────────────
   DIVIDER
───────────────────────────── */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 8px 0;
}

.divider .line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  color: #8d8d8d;
  font-size: 0.95rem;
  font-weight: 500;
}

/* ─────────────────────────────
   GOOGLE BUTTON
───────────────────────────── */
.google-btn {
  width: 100%;
  padding: 16px;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  color: #333333;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: 0.25s ease;
}

.google-btn:hover {
  background: #f9f9f9;
  border-color: #cccccc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* ─────────────────────────────
   REGISTER
───────────────────────────── */
.register-text {
  text-align: center;
  color: #9d9d9d;
  font-size: 0.95rem;
  margin-top: 8px;
}

.register-text a {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.register-text a:hover {
  text-decoration: underline;
}

/* ─────────────────────────────
   RESPONSIVE
───────────────────────────── */
@media (max-width: 900px) {
  .login-wrapper {
    flex-direction: column;
  }

  .left-side,
  .right-side {
    width: 100%;
  }

  .left-side {
    padding: 50px 24px 20px;
  }

  .right-side {
    padding: 24px;
  }

  .login-card {
    padding: 35px 24px;
  }

  .title h2 {
    font-size: 2.3rem;
  }
}
</style>
