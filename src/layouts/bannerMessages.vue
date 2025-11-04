<template>
  <div
    class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white text-center px-6"
  >
    <div class="relative mb-6">
      <div class="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-30 animate-ping"></div>
      <div
        class="relative w-24 h-24 flex items-center justify-center bg-blue-500 rounded-full shadow-lg animate-fade-in"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4.5 1.2 1.2-4.5A8.96 8.96 0 013 12C3 7.582 7.03 4 12 4s9 3.582 9 8z"
          />
        </svg>
      </div>
    </div>

    <h1 class="text-2xl md:text-3xl font-semibold tracking-wide animate-fade-in">
      Seleccione un <span class="text-blue-400"> {{ tipo }} </span> para iniciar conversación
    </h1>

    <p class="mt-3 text-gray-400 max-w-md animate-fade-in delay-200">
      Elija una conversación del panel lateral o cree un nuevo {{ tipo }} para comenzar.
    </p>
  </div>
</template>

<script setup>
defineProps({
  tipo: {
    type: String,
  },
})
</script>

