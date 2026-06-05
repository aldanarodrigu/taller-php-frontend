<script setup lang="ts">
interface Profesional {
  descripcion?: string | null;
  profesion?: string | null;
  foto?: string | null;
  puntuacion_promedio?: number | null;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  foto?: string | null;
  profesional?: Profesional;
}

defineProps<{
  user: User;
  authUser: User | null;
}>();

defineEmits<{
  edit: [];
}>();
</script>

<template>
  <div class="perfil-card">
    <div class="perfil-top">
      <div class="perfil-identity">
        <img
          :src="
            user.profesional?.foto ||
            user.foto ||
            `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=2563eb&color=fff`
          "
          :alt="user.nombre"
          class="avatar"
        />
        <div>
          <h2 class="nombre">{{ user.nombre }} {{ user.apellido }}</h2>
          <p class="profesion">{{ user.profesional?.profesion || "Sin profesión" }}</p>
        </div>
      </div>
      <button v-if="authUser?.id === user.id" class="edit-btn" @click="$emit('edit')">
        Editar perfil
      </button>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-value">—</span>
        <span class="stat-label">Reseñas</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ user.profesional?.puntuacion_promedio ?? "—" }}</span>
        <span class="stat-label">Calificación</span>
      </div>
      <div class="stat">
        <span class="stat-value">—</span>
        <span class="stat-label">Sesiones</span>
      </div>
    </div>

    <div v-if="user.profesional" class="sobre-mi">
      <h3 class="sobre-mi-title">Sobre mí</h3>
      <p class="sobre-mi-text">
        {{ user.profesional.descripcion || "Este profesional aún no agregó una descripción." }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.perfil-card {
  background: var(--color-background-primary, white);
  border: 0.5px solid var(--color-border-tertiary, #e5e7eb);
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.perfil-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.perfil-identity {
  display: flex;
  align-items: flex-start; /* clave */
  gap: 1rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  object-fit: cover;

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.027);
}

.nombre {
  margin: 0 0 4px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.profesion {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.edit-btn {
  padding: 8px 20px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #f3f4f6;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-radius: 5px;
  overflow: hidden;
}

.stat {
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 0.5px solid #e5e7eb;
}

.stat:last-child {
  border-right: none;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.sobre-mi-title {
  margin: 0 0 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
}

.sobre-mi-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .perfil-card {
    padding: 1rem;
  }
  .perfil-top {
    flex-direction: column;
    align-items: flex-start;
  }
  .perfil-identity {
    flex-direction: column;
    align-items: center;
    width: 100%;
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
  }
  .edit-btn {
    width: 100%;
  }
  .stats {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .stat-value {
    font-size: 1.1rem;
  }
}
</style>
