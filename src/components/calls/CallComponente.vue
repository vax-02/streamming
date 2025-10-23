<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">

    <!-- VIDEO PRINCIPAL -->
    <div class="relative w-full h-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-700">
      <!-- Aquí iría el video remoto -->
      <video
        class="w-full h-full object-cover bg-gray-800"
        autoplay
        playsinline
        muted
      ></video>

      <!-- MINI VIDEO LOCAL -->
      <div class="absolute bottom-6 right-6 w-40 h-28 bg-gray-900 rounded-lg overflow-hidden border border-gray-600 shadow-lg">
        <video
          class="w-full h-full object-cover"
          autoplay
          playsinline
          muted
        ></video>
      </div>

      <!-- CONTROLES DE LLAMADA -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-5 bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-gray-700 shadow-lg">
        <!-- Micrófono -->
        <button class="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 1v10m0 0a3 3 0 01-3-3V4a3 3 0 016 0v4a3 3 0 01-3 3zm-6 7a9 9 0 0018 0M4 18v2m16-2v2m-8 2v2" />
          </svg>
        </button>

        <!-- Cámara -->
        <button class="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v4z" />
          </svg>
        </button>

        <!-- Colgar -->
        <button class="p-3 bg-red-600 hover:bg-red-700 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M22 16.92v3a1 1 0 01-1.09 1 19.86 19.86 0 01-8.91-3.34A19.86 19.86 0 013 17.92a1 1 0 01-1-1v-3a1 1 0 011.09-1 19.86 19.86 0 018.91 3.34A19.86 19.86 0 0121 15.92a1 1 0 011 1z" />
          </svg>
        </button>

        <!-- Compartir pantalla -->
        <button class="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 18l9-5-9-5-9 5 9 5zm0 0v5m0-5V4" />
          </svg>
        </button>

        <!-- Ajustes -->
        <button class="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11.983 4.081a1 1 0 01.034 1.95l-.217.033a1 1 0 00-.744.459l-.086.141a1 1 0 00.041 1.117l.165.165a1 1 0 001.117.041l.141-.086a1 1 0 00.459-.744l.033-.217a1 1 0 011.95.034l.018.11a1 1 0 00.846.846l.11.018a1 1 0 01.034 1.95l-.217.033a1 1 0 00-.744.459l-.086.141a1 1 0 00.041 1.117l.165.165a1 1 0 001.117.041l.141-.086a1 1 0 00.459-.744l.033-.217a1 1 0 011.95.034l.018.11a1 1 0 00.846.846l.11.018a1 1 0 01.034 1.95l-.217.033a1 1 0 00-.744.459l-.086.141a1 1 0 00.041 1.117l.165.165a1 1 0 001.117.041l.141-.086a1 1 0 00.459-.744l.033-.217a1 1 0 011.95.034" />
          </svg>
        </button>
      </div>
    </div>

    <!-- NOMBRE / ESTADO -->
    <div class="absolute top-6 left-1/2 transform -translate-x-1/2 text-center animate-fade-in">
      <h2 class="text-xl font-semibold">Llamando a <span class="text-blue-400">María Gómez...</span></h2>
    </div>

  </div>
</template>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
</style>
