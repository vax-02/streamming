<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
  >
    <div class="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm text-center p-6 animate-fadeIn">
      <h3 class="text-2xl font-bold text-white mb-3">{{ title }}</h3>
      <p class="text-gray-300 mb-6">{{ message }}</p>

      <div class="flex justify-center space-x-4">
        <button
          @click="$emit('confirm')"
          class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Sí, eliminar
        </button>
        <button
          @click="$emit('cancel')"
          class="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ConfirmationComponent',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Confirmar eliminación',
    },
    message: {
      type: String,
      default: '¿Estás seguro de que deseas eliminar este elemento?',
    },
  },
}
</script>