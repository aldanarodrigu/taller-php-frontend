<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted } from "vue";
import { http } from "@/modules/auth/api/http";
import { calificacionesApi } from "@/modules/calificaciones/api/calificaciones";

const cargando = ref(true);
const resenas = ref<any[]>([]);

onMounted(async () => {
  try {
    const serviciosRes = await http.get("/services/me");
    const servicios = serviciosRes.data;

    const todas: any[] = [];
    await Promise.all(
      servicios.map(async (s: any) => {
        const res = await calificacionesApi.porServicio(s.id);
        res.data.forEach((r: any) => {
          todas.push({ ...r, servicio_nombre: s.nombre });
        });
      })
    );

    resenas.value = todas.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } finally {
    cargando.value = false;
  }
});

function estrellas(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}
</script>

<template>
  <div style="padding: 1.5rem; max-width: 700px">
    <h2 style="margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 600">Calificaciones</h2>

    <p v-if="cargando" style="color: #6b7280">Cargando...</p>

    <p v-else-if="resenas.length === 0" style="color: #6b7280">
      Todavía no tenés calificaciones.
    </p>

    <div v-else style="display: flex; flex-direction: column; gap: 1rem">
      <div
        v-for="r in resenas"
        :key="r.id"
        style="
          background: white;
          border: 0.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px">
          <span style="font-size: 0.8rem; color: #6b7280">{{ r.servicio_nombre }}</span>
          <span style="color: #f59e0b; letter-spacing: 1px; font-size: 1rem">
            {{ estrellas(r.puntuacion) }}
          </span>
        </div>
        <p v-if="r.comentario" style="margin: 4px 0 0; font-size: 0.875rem; color: #374151">
          {{ r.comentario }}
        </p>
        <p v-else style="margin: 4px 0 0; font-size: 0.8rem; color: #9ca3af; font-style: italic">
          Sin comentario
        </p>
        <p style="margin: 6px 0 0; font-size: 0.75rem; color: #9ca3af">
          {{ new Date(r.created_at).toLocaleDateString("es-UY") }}
        </p>
      </div>
    </div>
  </div>
</template>
