<template>
  <div
    class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
    <!-- EFECTO DE RESPLANDOR ANIMADO -->
    <div class="absolute w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>

    <!-- AVATAR / FOTO DE CONTACTO -->
    <div class="relative z-10">
      <div class="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg animate-fade-in">
        <img :src="contactPhoto || 'https://ui-avatars.com/api/?name=User&background=random'" alt="Contacto"
          class="w-full h-full object-cover" />
      </div>
    </div>

    <!-- NOMBRE -->
    <h2 class="mt-6 text-2xl font-semibold tracking-wide animate-fade-in">
      Llamando a <span class="text-blue-400">{{ contactName }}</span>
    </h2>

    <!-- TEXTO LLAMANDO... -->
    <p class="mt-2 text-gray-400 text-lg flex gap-1 animate-fade-in delay-200">
      Llamando<span class="animate-typing">.</span><span class="animate-typing delay-200">.</span><span
        class="animate-typing delay-400">.</span>
    </p>

    <!-- BOTÓN COLGAR -->
    <button @click="$emit('hangup')"
      class="mt-10 p-4 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition transform hover:scale-105 z-10">
      <PhoneXMarkIcon class="w-6 h-6 text-white" />
    </button>
    <span class="mt-2 text-sm text-gray-400">Colgar llamada</span>
  </div>
</template>

<script setup>
import { PhoneXMarkIcon } from '@heroicons/vue/24/solid'

defineProps({
  contactName: String,
  contactPhoto: String
})

defineEmits(['hangup'])
</script>

<style scoped>
/* --- Animaciones personalizadas --- */

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

.animate-fade-in.delay-200 {
  animation-delay: 0.2s;
}

@keyframes typing {

  0%,
  20% {
    opacity: 0;
  }

  50%,
  100% {
    opacity: 1;
  }
}

.animate-typing {
  animation: typing 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 3s infinite ease-in-out;
}
</style>
