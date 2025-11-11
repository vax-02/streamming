<template>
  <div
    v-if="shareTransmision"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <!-- Modal contenido -->
    <div class="bg-gray-800 text-white rounded-xl w-11/12 max-w-lg p-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Compartir transmisión</h2>
        <button @click="shareTransmision = false" class="text-gray-400 hover:text-white">✖</button>
      </div>

      <!-- Input búsqueda -->
      <div class="mb-4">
        <input
          type="text"
          placeholder="Buscar grupo..."
          v-model="search"
          class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Lista de grupos filtrados -->
      <div class="max-h-60 overflow-y-auto mb-4">
        <div
          v-for="grupo in filteredGrupos"
          :key="grupo.id"
          class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
          @click="toggleGrupo(grupo.id)"
        >
          <span>{{ grupo.nombre }}</span>
          <input type="checkbox" :checked="selectedGrupos.includes(grupo.id)" readonly />
        </div>
        <div v-if="filteredGrupos.length === 0" class="text-gray-400 text-sm text-center py-4">
          No se encontraron grupos
        </div>
      </div>

      <!-- Link de transmisión -->
      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium">Link de transmisión</label>
        <input
          type="text"
          :value="linkTransmision"
          readonly
          class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed"
        />
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-2">
        <button
          @click="shareTransmision = false"
          class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          @click="enviarTransmision"
          :disabled="selectedGrupos.length === 0"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          Compartir
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
</script>
