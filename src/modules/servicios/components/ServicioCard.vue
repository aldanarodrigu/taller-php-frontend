<script setup lang="ts">
import type { ServicioConProfesional } from "@/types";
import { useRouter } from "vue-router";

const props = defineProps<{
  servicio: ServicioConProfesional;
}>();
const router = useRouter();

function irAlDetalle() {
  router.push({ name: "ServicioDetalle", params: { id: props.servicio.id } });
}
</script>

<template>
  <article class="service-card" @click="irAlDetalle">
    <div class="img-wrap">
      <img
        :src="
          servicio.profesional?.foto ||
          'https://ui-avatars.com/api/?name=' +
            servicio.profesional?.user.nombre +
            '+' +
            servicio.profesional?.user.apellido +
            '&size=400&bold=true&font-size=0.3'
        "
        :alt="servicio.nombre"
        class="card-img"
      />
      <span
        class="badge"
        :class="{
          presencial: servicio.modalidad === 'presencial',
          online: servicio.modalidad === 'virtual',
        }"
      >
        {{ servicio.modalidad }}
      </span>
    </div>

    <div class="body">
      <div class="row-top">
        <p class="nombre">{{ servicio.nombre }}</p>
        <span class="precio">UYU {{ servicio.precio }}</span>
      </div>
      <p class="desc">{{ servicio.descripcion }}</p>
      <div class="footer">
        <div class="prof">
          <img
            :src="
              servicio.profesional?.foto ||
              'https://ui-avatars.com/api/?name=' +
                servicio.profesional?.user.nombre +
                '+' +
                servicio.profesional?.user.apellido +
                '&size=60'
            "
            :alt="servicio.profesional?.user.nombre"
            class="prof-avatar"
          />
          <span class="prof-name">
            {{ servicio.profesional?.user.nombre }}
            {{ servicio.profesional?.user.apellido }}
          </span>
        </div>
        <div class="meta">
          <span class="rating">
            <i class="ti ti-star-filled" aria-hidden="true" />
            {{
              servicio.profesional?.puntuacion_promedio > 0
                ? servicio.profesional.puntuacion_promedio
                : "Nuevo"
            }}
          </span>
          <span class="duracion">
            <i class="ti ti-clock" aria-hidden="true" />
            {{ servicio.duracion_minutos }} min
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.service-card {
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  margin-top: 20px;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.service-card:hover {
  transform: translateY(-2px);
  border-color: #d1d5db;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.service-card:hover .card-img {
  transform: scale(1.03);
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  font-weight: 500;
  text-transform: capitalize;
  border: 0.5px solid transparent;
}
.badge.presencial {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.badge.online {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}
.badge:not(.presencial):not(.online) {
  background: rgba(255, 255, 255, 0.92);
  color: #374151;
  border-color: rgba(0, 0, 0, 0.08);
}

.body {
  padding: 10px 12px 12px;
}
.row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 3px;
}
.nombre {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.precio {
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}
.desc {
  margin: 0 0 10px;
  font-size: 0.72rem;
  color: #6b7280;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 0.5px solid #e5e7eb;
}
.prof {
  display: flex;
  align-items: center;
  gap: 6px;
}
.prof-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 0.5px solid #e5e7eb;
}
.prof-name {
  font-size: 0.7rem;
  color: #6b7280;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #6b7280;
}
.rating {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #f59e0b;
}
.rating i {
  font-size: 12px;
}
.duracion {
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>
