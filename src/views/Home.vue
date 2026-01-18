<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <header class="bg-gray-800 p-4 flex items-center justify-between shadow-md">
      <h1 class="text-2xl font-bold">EduStream</h1>

      <nav class="hidden md:flex space-x-6">
        <a href="#" class="hover:text-blue-400 transition">Inicio</a>
        <a href="#features" class="hover:text-blue-400 transition">Características</a>
      </nav>

      <div>
        <button
          @click="goToLogin"
          class="flex items-center space-x-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
        >
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
          <span>Iniciar sesión</span>
        </button>
      </div>
    </header>

    <main class="banner h-[90vh] flex flex-col items-center justify-center text-center px-4">
      <h2 class="banner-text text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Bienvenido a EduStream</h2>
      <p class="banner-text text-gray-300 text-base sm:text-lg max-w-xl mb-6">
        Tu nueva plataforma para transmisiones en vivo, interacción en tiempo real y contenido
        exclusivo orientado a la educación.
      </p>
    </main>

    <!-- FEATURES SECTION -->
    <section id="features" class="py-16 bg-gray-800 px-6 md:px-16">
      <h3 class="text-3xl font-bold text-center mb-12">Características Principales</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
        <!-- Feature 1 -->
        <div class="flex flex-col items-center space-y-4">
          <VideoCameraIcon class="h-12 w-12 text-blue-400" />
          <h4 class="text-xl font-semibold">Transmisiones en Vivo</h4>
          <p class="text-gray-400">
            Comparte clases y conferencias en tiempo real con tus estudiantes desde cualquier lugar.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="flex flex-col items-center space-y-4">
          <ChatBubbleLeftRightIcon class="h-12 w-12 text-green-400" />
          <h4 class="text-xl font-semibold">Chat Interactivo</h4>
          <p class="text-gray-400">
            Fomenta la participación con mensajes instantáneos y reacciones durante las
            transmisiones.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="flex flex-col items-center space-y-4">
          <UserGroupIcon class="h-12 w-12 text-purple-400" />
          <h4 class="text-xl font-semibold">Gestión de Clases</h4>
          <p class="text-gray-400">
            Administra grupos, docentes y estudiantes de forma sencilla con un panel intuitivo.
          </p>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-gray-900 text-center py-4 text-sm text-gray-400 border-t border-gray-800">
      &copy; 2025 EduStream. Todos los derechos reservados.
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<style>

.banner {
  position: relative;
  overflow: hidden;
}

.banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/images/back.webp') center/cover no-repeat;
  opacity: 0.4; /* solo el fondo */
  z-index: 0;
}

.banner-text {
  position: relative;
  z-index: 1; /* texto sobre el fondo */
  color: white; /* opcional */
}
</style>