<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <header class="bg-gray-800 p-4 flex items-center justify-between shadow-md">
      <h1 class="text-2xl font-bold">EduStream</h1>

      <nav class="hidden md:flex space-x-6">
        <a href="#" class="hover:text-blue-400 transition">Inicio</a>
        <a href="#" class="hover:text-blue-400 transition">Características</a>
      </nav>

      <div class="space-x-3">
        <button
          @click="goToLogin"
          class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
        >
          Iniciar sesión
        </button>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h2 class="text-4xl md:text-5xl font-bold mb-4">Bienvenido a EduStream</h2>
      <p class="text-gray-300 text-lg max-w-xl mb-6">
        Tu nueva plataforma para transmisiones en vivo, interacción en tiempo real y contenido
        exclusivo orientado a la educacion
      </p>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-center py-4 text-sm text-gray-400">
      &copy; 2025 StreamNow. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToLogin() {
  router.push('/login')
}

</script>
