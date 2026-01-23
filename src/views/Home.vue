<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
    <!-- Navbar with Glassmorphism -->
    <header class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-slate-900/60 border-b border-white/5">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <VideoCameraIcon class="h-5 w-5 text-white" />
          </div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            EduStream
          </h1>
        </div>

        <nav class="hidden md:flex space-x-8">
          <a href="#" class="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Inicio
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
          </a>
          <a href="#features" class="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
            Características
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
          </a>
        </nav>

        <div>
          <button
            @click="goToLogin"
            class="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-indigo-500 rounded-full shadow-md group"
          >
            <span class="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-indigo-500 group-hover:translate-x-0 ease">
              <ArrowRightOnRectangleIcon class="h-5 w-5" />
            </span>
            <span class="absolute flex items-center justify-center w-full h-full text-indigo-500 transition-all duration-300 transform group-hover:translate-x-full ease">Ingresar</span>
            <span class="relative invisible">Start Now</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div class="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div class="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" style="animation-delay: 2s;"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        <div class="inline-flex items-center px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4 backdrop-blur-sm">
          <span class="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
          Nueva versión disponible
        </div>
        
        <h2 class="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
          <span class="block text-white">Revoluciona tu</span>
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Aprendizaje en Vivo
          </span>
        </h2>
        
        <p class="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Plataforma premium para transmisiones en tiempo real. 
          Interactúa, enseña y aprende con herramientas diseñadas para la educación moderna.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <a href="#features" class="px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-white font-semibold transition-all backdrop-blur-sm border border-white/5 hover:border-white/10">
            Saber más
          </a>
        </div>
      </div>
    </main>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-slate-900/50 relative">
      <div class="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="text-center mb-16 space-y-4">
          <h3 class="text-3xl md:text-4xl font-bold text-white">Todo lo que necesitas</h3>
          <p class="text-slate-400 max-w-2xl mx-auto">
            Herramientas potentes para llevar tu enseñanza al siguiente nivel.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-inner">
                <VideoCameraIcon class="h-7 w-7 text-indigo-400" />
              </div>
              <h4 class="text-xl font-bold text-white mb-3">Transmisiones HD</h4>
              <p class="text-slate-400 leading-relaxed">
                Streaming de baja latencia y alta definición para que tus clases se vean cristalinas desde cualquier dispositivo.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-inner">
                <ChatBubbleLeftRightIcon class="h-7 w-7 text-purple-400" />
              </div>
              <h4 class="text-xl font-bold text-white mb-3">Chat Interactivo</h4>
              <p class="text-slate-400 leading-relaxed">
                Herramientas de moderación, reacciones en vivo y preguntas y respuestas para mantener a tu audiencia enganchada.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="group p-8 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-pink-500/50 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative z-10">
              <div class="h-14 w-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-inner">
                <UserGroupIcon class="h-7 w-7 text-pink-400" />
              </div>
              <h4 class="text-xl font-bold text-white mb-3">Gestión Total</h4>
              <p class="text-slate-400 leading-relaxed">
                Controla roles, accesos y analiza el rendimiento de tus estudiantes con nuestro dashboard avanzado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-950 py-12 border-t border-white/5">
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
        <p class="text-sm text-slate-400 mb-4 md:mb-0">
          &copy; 2025 EduStream. Creado con pasión para la educación.
        </p>
        <div class="flex space-x-6">
          <a href="#" class="text-slate-400 hover:text-white transition-colors">Términos</a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">Privacidad</a>
          <a href="#" class="text-slate-400 hover:text-white transition-colors">Ayuda</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon
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