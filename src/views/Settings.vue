<template>
  <div class="flex-1 bg-gray-900 overflow-y-auto flex flex-col min-w-0">
    <!-- HEADER MODERNO -->
    <header class="bg-gray-800 border-b border-gray-700 shadow-xl z-10">
      <div class="max-w-7xl mx-auto px-6">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between py-4 gap-6">
        
          <!-- Icono + Título -->
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <Cog6ToothIcon class="h-6 w-6 text-blue-500" />
            </div>
            <span class="text-xl font-bold tracking-wide">Configuraciones</span>
          </div>

          <!-- Tabs tipo pill -->
          <nav class="flex items-center bg-gray-900/50 p-1 rounded-2xl border border-gray-700">
            <router-link
              :to="{ name: 'profile' }"
              class="flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold"
              active-class="bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            >
              <UserCircleIcon class="h-4 w-4" />
              <span class="hidden md:block">Perfil</span>
            </router-link>

            <router-link
              :to="{ name: 'privacity' }"
              class="flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold"
              active-class="bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            >
              <LockClosedIcon class="h-4 w-4" />
              <span class="hidden md:block">Privacidad</span>
            </router-link>

            <router-link
              :to="{ name: 'security' }"
              class="flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold"
              active-class="bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            >
              <ShieldCheckIcon class="h-4 w-4" />
              <span class="hidden md:block">Seguridad</span>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- CONTENIDO -->
    <div class="flex-1 p-2">
      <router-view />

      
    </div>
  </div>
</template>

<script setup>
import Logo from '@/assets/logo.png'
import {
  PlayCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid'
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #7e22ce;
  border-radius: 4px;
}

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
  animation: fade-in 1s ease forwards;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
