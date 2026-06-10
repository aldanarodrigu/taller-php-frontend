<script setup lang="ts">
import { ref, watch, computed } from "vue";

const busqueda = ref("");
const modalidadActiva = ref("");
const categoriaActiva = ref("todos");

const categorias = [
  { id: "todos", label: "Todos", icon: "ti-layout-grid" },
  { id: "consultoria", label: "Consultoría", icon: "ti-briefcase" },
  { id: "entrenamiento", label: "Entrenamiento", icon: "ti-barbell" },
  { id: "salud", label: "Salud", icon: "ti-heartbeat" },
  { id: "educacion", label: "Educación", icon: "ti-school" },
  { id: "tecnicos", label: "Técnicos", icon: "ti-tool" },
];

const modalidades = [
  { id: "", label: "Todas" },
  { id: "presencial", label: "Presencial" },
  { id: "virtual", label: "Virtual" },
];

const showModalidad = ref(false);

const emit = defineEmits<{
  (e: "filtrar", filtros: { tipo?: string; busqueda?: string; modalidad?: string }): void;
}>();

function emitir() {
  emit("filtrar", {
    busqueda: busqueda.value || undefined,
    tipo: categoriaActiva.value === "todos" ? undefined : categoriaActiva.value,
    modalidad: modalidadActiva.value || undefined,
  });
}

// búsqueda reactiva mientras escribe
watch(busqueda, emitir);

function seleccionarCategoria(id: string) {
  categoriaActiva.value = id;
  emitir();
}

function seleccionarModalidad(id: string) {
  modalidadActiva.value = id;
  showModalidad.value = false;
  emitir();
}

function limpiarFiltros() {
  busqueda.value = "";
  categoriaActiva.value = "todos";
  modalidadActiva.value = "";
  emitir();
}

const hayFiltros = computed(
  () => busqueda.value || categoriaActiva.value !== "todos" || modalidadActiva.value,
);
</script>

<template>
  <div class="search-wrap">
    <div class="search-bar">
      <div class="search-main">
        <i class="ti ti-search" aria-hidden="true" />
        <input v-model="busqueda" type="text" placeholder="¿Qué servicio buscás?" />
        <button v-if="busqueda" class="clear-input" @click="busqueda = ''" aria-label="Limpiar">
          <i class="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div class="sep" />

      <!-- Modalidad dropdown -->
      <div class="dropdown-wrap" v-click-outside="() => (showModalidad = false)">
        <button
          class="filter-pill"
          :class="{ active: modalidadActiva }"
          @click="showModalidad = !showModalidad"
        >
          <i class="ti ti-adjustments-horizontal" aria-hidden="true" />
          {{
            modalidadActiva ? modalidades.find((m) => m.id === modalidadActiva)?.label : "Modalidad"
          }}
          <i class="ti ti-chevron-down" aria-hidden="true" />
        </button>
        <div v-if="showModalidad" class="dropdown">
          <button
            v-for="m in modalidades"
            :key="m.id"
            class="dropdown-item"
            :class="{ active: modalidadActiva === m.id }"
            @click="seleccionarModalidad(m.id)"
          >
            <i
              :class="
                m.id === 'presencial'
                  ? 'ti ti-map-pin'
                  : m.id === 'virtual'
                    ? 'ti ti-video'
                    : 'ti ti-layout-grid'
              "
              aria-hidden="true"
            />
            {{ m.label }}
            <i v-if="modalidadActiva === m.id" class="ti ti-check check" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="sep" />

      <button v-if="hayFiltros" class="filter-pill clear" @click="limpiarFiltros">
        <i class="ti ti-x" aria-hidden="true" />
        Limpiar
      </button>

      <button class="search-btn" aria-label="Buscar" @click="emitir">
        <i class="ti ti-arrow-right" aria-hidden="true" />
      </button>
    </div>

    <!-- Categorías -->
    <div class="cats">
      <button
        v-for="cat in categorias"
        :key="cat.id"
        class="cat"
        :class="{ active: categoriaActiva === cat.id }"
        @click="seleccionarCategoria(cat.id)"
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

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 0.5px solid #d1d5db;
  border-radius: 999px;
  padding: 6px 6px 6px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: border-color 0.15s;
  gap: 0;
}
.search-bar:focus-within {
  border-color: #9ca3af;
}

.search-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.search-main > i {
  font-size: 16px;
  color: #9ca3af;
  flex-shrink: 0;
}
.search-main input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8rem;
  color: #1a1a1a;
  width: 100%;
  font-family: inherit;
}
.search-main input::placeholder {
  color: #9ca3af;
}

.clear-input {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 14px;
  display: flex;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;
}
.clear-input:hover {
  color: #374151;
}

.sep {
  width: 0.5px;
  height: 20px;
  background: #d1d5db;
  flex-shrink: 0;
  margin: 0 4px;
}

.filter-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0 12px;
  white-space: nowrap;
  background: transparent;
  border: none;
  font-family: inherit;
  height: 36px;
  transition: color 0.15s;
  border-radius: 999px;
}
.filter-pill:hover {
  color: #374151;
}
.filter-pill.active {
  color: #2563eb;
  font-weight: 500;
}
.filter-pill.clear {
  color: #9ca3af;
  font-size: 0.75rem;
}
.filter-pill.clear:hover {
  color: #374151;
}
.filter-pill i {
  font-size: 14px;
}

/* Dropdown */
.dropdown-wrap {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 0.5px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  min-width: 160px;
  z-index: 50;
  overflow: hidden;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 0.82rem;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: background 0.12s;
}
.dropdown-item:hover {
  background: #f9fafb;
}
.dropdown-item.active {
  color: #2563eb;
  font-weight: 500;
}
.dropdown-item i {
  font-size: 15px;
  color: #9ca3af;
}
.dropdown-item.active i {
  color: #2563eb;
}
.check {
  margin-left: auto;
  font-size: 14px !important;
}

.search-btn {
  background: #2563eb;
  color: #dcfce7;
  border: none;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
  margin-left: 4px;
  transition: background 0.15s;
}
.search-btn:hover {
  background: #2563eb;
}

/* Categorías */
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
  padding: 6px 14px;
  font-size: 0.78rem;
  color: #6b7280;
  background: white;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  transition: all 0.15s;
}
.cat i {
  font-size: 14px;
}
.cat:not(.active):hover {
  background: #f3f4f6;
}
.cat.active {
  background: #2563eb;
  color: #dcfce7;
  border-color: #2563eb;
  font-weight: 500;
}

@media (max-width: 640px) {
  .search-bar {
    flex-wrap: wrap;
    border-radius: 12px;
    padding: 10px 12px;
    gap: 8px;
  }
  .sep {
    display: none;
  }
  .search-main {
    width: 100%;
    order: 0;
  }
  .filter-pill {
    padding: 0 8px;
  }
  .search-btn {
    margin-left: auto;
  }
  .cats {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .cats::-webkit-scrollbar {
    display: none;
  }
  .cat {
    flex-shrink: 0;
  }
}
</style>
