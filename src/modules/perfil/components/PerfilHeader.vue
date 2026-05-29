<script setup lang="ts">
interface Profesional {
  descripcion?: string | null;
  profesion?: string | null;
  foto?: string | null;
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
</script>

<template>
  <div class="profile-header">
    <div class="profile-header__content">
      <img
        :src="
          user.profesional?.foto || user.foto || 'https://ui-avatars.com/api/?name=' + user.nombre
        "
        alt="Foto de perfil"
        class="profile-header__avatar"
      />

      <div class="profile-header__info">
        <h1 class="profile-header__name">{{ user.nombre }} {{ user.apellido }}</h1>

        <h2 v-if="user.profesional?.profesion" class="profile-header__profession">
          {{ user.profesional.profesion }}
        </h2>

        <p v-if="user.profesional?.descripcion" class="profile-header__description">
          {{ user.profesional.descripcion }}
        </p>

        <p v-else-if="user.profesional" class="text-muted">
          Este profesional aún no agregó una descripción.
        </p>
      </div>
    </div>

    <button v-if="authUser?.id === user.id" class="edit-button">Editar perfil</button>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  padding: 2rem;
  border-radius: 12px;
  background: white;
}

.profile-header__content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-header__avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-header__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.profile-header__name {
  margin: 0;
  font-size: 1.8rem;
}

.profile-header__profession {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.profile-header__description {
  margin: 0;
  margin-top: 0.3rem;
}

.text-muted {
  color: #6b7280;
  margin: 0;
}

.edit-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #2563eb;
  color: white;
}
</style>
