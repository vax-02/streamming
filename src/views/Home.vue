<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col font-sans antialiased tracking-tight selection:bg-blue-500 selection:text-white overflow-x-hidden">
    
    <!-- NAVBAR -->
    <header class="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/80 border-b border-blue-500/10 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="h-9 w-9 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <VideoCameraIcon class="h-5 w-5 text-white" />
          </div>
          <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
            EduStream
          </h1>
        </div>

        <!-- Nav -->
        <nav class="hidden md:flex space-x-8">
          <a href="#" class="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
            Inicio
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
          </a>
          <a href="#features" class="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
            Características
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
          </a>
        </nav>

        <!-- Button -->
        <button
          @click="goToLogin"
          class="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Ingresar
        </button>

      </div>
    </header>

    <!-- HERO -->
    <main class="relative pt-36 pb-28 flex flex-col items-center justify-center text-center px-6 overflow-hidden">

      <!-- Background glow -->
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>

      <div class="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">

        <div class="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium backdrop-blur-sm">
          <span class="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          Nueva versión disponible
        </div>

        <h2 class="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight">
          <span class="block text-white">Revoluciona tu</span>
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-blue-300">
            Aprendizaje en Vivo
          </span>
        </h2>

        <div class="h-px w-40 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <p class="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Plataforma premium para transmisiones en tiempo real. 
          Interactúa, enseña y aprende con herramientas diseñadas para la educación moderna.
        </p>

        <div class="pt-6">
          <a href="#features" class="px-8 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-white font-semibold transition-all backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 hover:scale-105">
            Saber más
          </a>
        </div>

      </div>
    </main>

    <!-- FEATURES -->
    <section id="features" class="py-28 bg-slate-950 relative">

      <div class="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent"></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">

        <div class="text-center mb-20 space-y-4">
          <h3 class="text-3xl md:text-4xl font-bold text-white leading-tight">
            Todo lo que necesitas
          </h3>
          <p class="text-slate-400 max-w-2xl mx-auto">
            Herramientas potentes para llevar tu enseñanza al siguiente nivel.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">

          <!-- Card -->
          <div class="group p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
            <div class="h-14 w-14 rounded-xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
              <VideoCameraIcon class="h-7 w-7 text-blue-400" />
            </div>
            <h4 class="text-xl font-bold text-white mb-3">Transmisiones HD</h4>
            <p class="text-slate-400 leading-relaxed">
              Streaming de baja latencia y alta definición para que tus clases se vean cristalinas desde cualquier dispositivo.
            </p>
          </div>

          <!-- Card -->
          <div class="group p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
            <div class="h-14 w-14 rounded-xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
              <ChatBubbleLeftRightIcon class="h-7 w-7 text-blue-400" />
            </div>
            <h4 class="text-xl font-bold text-white mb-3">Chat Interactivo</h4>
            <p class="text-slate-400 leading-relaxed">
              Herramientas de moderación, reacciones en vivo y preguntas y respuestas para mantener a tu audiencia enganchada.
            </p>
          </div>

          <!-- Card -->
          <div class="group p-8 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-blue-500/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
            <div class="h-14 w-14 rounded-xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
              <UserGroupIcon class="h-7 w-7 text-blue-400" />
            </div>
            <h4 class="text-xl font-bold text-white mb-3">Gestión Total</h4>
            <p class="text-slate-400 leading-relaxed">
              Controla roles, accesos y analiza el rendimiento de tus estudiantes con nuestro dashboard avanzado.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-slate-950 py-12 border-t border-blue-500/10">
      <div class="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
        &copy; 2026 EduStream. Creado con pasión para la educación.
      </div>
    </footer>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.animate-pulse-slow {
  animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}
</style>