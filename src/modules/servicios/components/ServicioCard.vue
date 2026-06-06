<script setup lang="ts">
import type { ServicioConProfesional } from "@/types";
defineProps<{
  servicio: ServicioConProfesional;
}>();
</script>

<template>
  <article class="service-card">
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
      <span class="badge">{{ servicio.modalidad }}</span>
    </div>

    <div class="body">
      <div class="row-top">
        <p class="nombre">{{ servicio.nombre }}</p>
        <span class="precio">USD {{ servicio.precio }}</span>
      </div>
      <p class="desc">{{ servicio.descripcion }}</p>
      <hr class="divider" />
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
            <i class="ti ti-star"></i>
            {{
              servicio.profesional?.puntuacion_promedio > 0
                ? servicio.profesional.puntuacion_promedio
                : "Nuevo"
            }}
          </span>
          <span class="duracion">
            <i class="ti ti-clock"></i>
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
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  border-color: #d1d5db;
}

.img-wrap {
  position: relative;
  width: 100%;
  height: 300px;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  color: #374151;
  font-weight: 500;
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  text-transform: capitalize;
}

.body {
  padding: 10px 12px 12px;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.nombre {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
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
  margin: 0 0 8px;
  font-size: 0.72rem;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.divider {
  border: none;
  border-top: 0.5px solid #e5e7eb;
  margin: 8px 0;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.duracion {
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>
