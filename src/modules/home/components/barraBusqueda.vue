<script setup lang="ts">
import { ref } from "vue";

const busqueda = ref("");
const modalidad = ref("");
const categoriaActiva = ref("todos");
const categorias = [
  { id: "todos", label: "Todos", icon: null },
  { id: "consultoria", label: "Consultoría", icon: "ti-briefcase" },
  { id: "entrenamiento", label: "Entrenamiento", icon: "ti-barbell" },
  { id: "salud", label: "Salud", icon: "ti-heartbeat" },
  { id: "educacion", label: "Educación", icon: "ti-school" },
  { id: "tecnicos", label: "Técnicos", icon: "ti-tool" },
];

const emit = defineEmits<{
  (e: "filtrar", filtros: { tipo?: string }): void;
}>();

function seleccionarCategoria(id: string) {
  categoriaActiva.value = id;
  emit("filtrar", {
    tipo: id === "todos" ? undefined : id,
  });
}
</script>

<template>
  <div class="search-wrap">
    <div class="search-row">
      <div class="search-input-wrap">
        <i class="ti ti-search" aria-hidden="true" />
        <input v-model="busqueda" type="text" placeholder="¿Qué servicio buscás?" />
      </div>
      <button class="filter-btn">
        <i class="ti ti-map-pin" aria-hidden="true" />
        Ubicación
        <i class="ti ti-chevron-down" aria-hidden="true" />
      </button>
      <button class="filter-btn">
        Modalidad
        <i class="ti ti-chevron-down" aria-hidden="true" />
      </button>
      <div class="divider" />
      <button class="filter-btn">
        <i class="ti ti-adjustments-horizontal" aria-hidden="true" />
        Filtros
      </button>
    </div>

    <div class="cats">
      <button
        v-for="cat in categorias"
        :key="cat.id"
        class="cat"
        :class="{ active: categoriaActiva === cat.id }"
        @click="categoriaActiva = cat.id"
      >
        <i v-if="cat.icon" :class="`ti ${cat.icon}`" aria-hidden="true" />
        {{ cat.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0.5px solid #d1d5db;
  border-radius: 999px;
  padding: 0 16px;
  height: 40px;
  background: white;
  flex: 1;
  min-width: 180px;
  transition: border 0.15s;
}

.search-input-wrap:focus-within {
  border-color: #9ca3af;
}

.search-input-wrap i {
  font-size: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input-wrap input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8rem;
  color: #1a1a1a;
  width: 100%;
}

.search-input-wrap input::placeholder {
  color: #9ca3af;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0.5px solid #d1d5db;
  border-radius: 999px;
  padding: 0 14px;
  height: 40px;
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  transition: background 0.15s;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn i {
  font-size: 15px;
}

.divider {
  width: 0.5px;
  height: 20px;
  background: #d1d5db;
  flex-shrink: 0;
}

.cats {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cat {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 0.5px solid #d1d5db;
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 0.8rem;
  color: #6b7280;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.cat:hover {
  background: #f3f4f6;
}

.cat.active {
  background: #166534;
  color: #dcfce7;
  border-color: #166534;
  font-weight: 500;
}

.cat i {
  font-size: 14px;
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrap {
    width: 100%;
  }

  .filter-btn {
    width: 100%;
    justify-content: center;
  }

  .divider {
    display: none;
  }
}
</style>
