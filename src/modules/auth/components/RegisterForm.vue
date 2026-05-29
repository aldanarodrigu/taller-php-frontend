<script setup lang="ts">
import { ref } from "vue";

import { UserIcon, BriefcaseIcon } from "@heroicons/vue/24/outline";
import { useAuth } from "@/modules/auth/composables/useAuth";
import GoogleButton from "@/modules/auth/components/GoogleButton.vue";

const role = ref("cliente");

const name = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const { register, loading, error } = useAuth();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden";
    return;
  }
  await register({
    name: name.value,
    lastname: lastname.value,
    email: email.value,
    password: password.value,
    role: role.value,
  });
};

const handleLoginRedirect = () => {
  window.location.href = "/login";
};
</script>

<template>
  <div class="register-wrapper">
    <div class="left-side">
      <img src="@/assets/login.png" alt="Agenda tu turno" class="illustration" />

      <div class="left-text">
        <h1 v-if="role === 'cliente'">Agenda tu turno</h1>
        <h1 v-else>Organizá tu agenda</h1>

        <p v-if="role === 'cliente'">
          Elegí el profesional, día y horario que mejor se adapte a vos.
        </p>

        <p v-else>Gestioná turnos, clientes y videollamadas desde un solo lugar.</p>

        <div class="dots">
          <span class="active"></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <div class="right-side">
      <div class="blob"></div>

      <div class="register-card">
        <div class="title">
          <h2>¡Crea tu cuenta!</h2>
          <p>¿Cómo te querés registrar?</p>
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

        <div class="name-row">
          <input type="text" v-model="name" placeholder="Nombre" />

          <input type="text" v-model="lastname" placeholder="Apellido" />
        </div>

        <input type="email" v-model="email" placeholder="Correo electrónico" />

        <input type="password" v-model="password" placeholder="Contraseña" />

        <input type="password" v-model="confirmPassword" placeholder="Confirmar contraseña" />

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button class="register-btn" @click="handleRegister" :disabled="loading">
          {{ loading ? "Creando..." : "Crear cuenta" }}
        </button>

        <div class="divider">
          <span class="line"></span>
          <p class="divider-text">o</p>
          <span class="line"></span>
        </div>

        <GoogleButton label="Registrarme con Google" />

        <p class="register-text">
          ¿Ya tienes cuenta?
          <a href="#" @click.prevent="handleLoginRedirect"> Ingresar </a>
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
.register-wrapper {
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
  max-width: 560px;
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
.register-card {
  width: 100%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 80px 40px;
  background: rgba(255, 255, 255);
  border: 1px solid #e8e8e8;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border-radius: 5px;
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
  box-shadow: 0 0 0 4px rgba(45, 94, 230, 0.15);
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

.name-row {
  display: flex;
  gap: 14px;
  width: 100%;
}

.name-row input {
  flex: 1;
}

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

.card-icon {
  width: 24px;
  height: 24px;

  color: #1a1a1a;

  stroke-width: 2;

  flex-shrink: 0;

  transition: 0.25s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* hover */

.type-card:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
}

/* seleccionado */

.account-type input:checked + .type-card {
  border: 2px solid #2563eb;
}

/* ─────────────────────────────
   RESPONSIVE
───────────────────────────── */

@media (max-width: 900px) {
  .register-wrapper {
    flex-direction: column;
  }

  .left-side,
  .right-side {
    width: 100%;
  }

  .left-side {
    padding: 40px 24px 10px;
    gap: 20px;
  }

  .right-side {
    padding: 20px;
  }

  .illustration {
    max-width: 320px;
  }

  .register-card {
    max-width: 100%;
    padding: 40px 24px;
    border-radius: 28px;
  }

  .title h2 {
    font-size: 2.3rem;
  }
}

/* MOBILE */

@media (max-width: 640px) {
  .left-side {
    padding-top: 30px;
  }

  .left-text h1 {
    font-size: 1.8rem;
  }

  .left-text p {
    font-size: 0.95rem;
  }

  .register-card {
    padding: 32px 18px;
    gap: 16px;
  }

  .title h2 {
    font-size: 2rem;
  }

  .title p {
    font-size: 0.95rem;
  }

  /* CLIENTE / PROFESIONAL */

  .account-type {
    flex-direction: column;
  }

  .type-card {
    min-height: 110px;
    padding: 20px;
  }

  .type-card p {
    font-size: 13px;
  }

  /* NOMBRE / APELLIDO */

  .name-row {
    flex-direction: column;
    gap: 16px;
  }

  /* INPUTS */

  input {
    padding: 16px 18px;
    font-size: 0.95rem;
  }

  .register-btn,
  .google-btn {
    padding: 15px;
    font-size: 0.95rem;
  }

  .blob {
    width: 280px;
    height: 280px;

    top: -120px;
    right: -120px;
  }
}
</style>
