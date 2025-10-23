<template>
  <div
    class="fixed bottom-4 right-4 w-64 bg-gray-800 text-white rounded-lg shadow-lg flex items-center p-3 space-x-3 cursor-pointer"
  >
    <!-- Foto o avatar -->
    <img
      src="https://randomuser.me/api/portraits/women/65.jpg"
      alt="Llamando"
      class="w-12 h-12 rounded-full object-cover"
    />

    <!-- Info -->
    <div class="flex-1">
      <p class="font-semibold truncate">Ana López</p>
      <p class="text-sm text-gray-300">Llamando...</p>
    </div>

    <!-- Botones -->
    <button
      @click="$emit('maximizar')"
      class="hover:text-green-400 focus:outline-none"
      title="Maximizar"
    >
      🔼
    </button>
    <button @click="$emit('colgar')" class="hover:text-red-500 focus:outline-none" title="Colgar">
      ❌
    </button>
  </div>
</template>

<script setup>
// Recibe props o emite eventos para controlar la llamada
</script>
