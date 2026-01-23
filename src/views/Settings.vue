<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg">
      <div class="p-6 border-b border-gray-700">
        <h2 class="text-xl font-bold tracking-wide flex items-center space-x-2">
           <Cog6ToothIcon class="h-6 w-6 text-blue-500" />
           <span>Opciones</span>
        </h2>
      </div>
      
      <nav class="flex-1 px-3 py-6 space-y-2">
        <router-link
          :to="{ name: 'profile' }"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium border-l-4 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500 shadow-md"
          exact-active-class="bg-blue-500 text-white"
        >
          <UserCircleIcon class="h-5 w-5" />
          <span>Perfil</span>
        </router-link>

        <router-link
          :to="{ name: 'privacity' }"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium border-l-4 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500 shadow-md"
          exact-active-class="bg-blue-500 text-white"
        >
          <LockClosedIcon class="h-5 w-5" />
          <span>Privacidad</span>
        </router-link>

        <router-link
          :to="{ name: 'security' }"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium border-l-4 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500 shadow-md"
          exact-active-class="bg-blue-500 text-white"
        >
          <ShieldCheckIcon class="h-5 w-5" />
          <span>Seguridad</span>
        </router-link>
      </nav>
    </aside>
    <div class="flex-1 bg-gray-900 overflow-y-auto flex flex-col min-w-0">
      <router-view />
      <div v-if="$route.name === 'settings'">
        <div
          class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
        >
          <div class="relative">
            <div
              class="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-40 animate-ping"
            ></div>
            <img :src="Logo" alt="Logo" class="relative w-20 h-20 object-contain animate-bounce" />
          </div>
          <h1 class="mt-6 text-3xl font-semibold tracking-wide animate-fade-in">
            Configuración de <span class="text-blue-400">EduStream</span>
          </h1>
          <p class="mt-3 text-gray-400 animate-fade-in delay-200 text-center max-w-md">
            Personaliza tu experiencia, ajusta tus preferencias y administra tu cuenta fácilmente.
          </p>
          <div
            class="mt-8 h-[2px] w-32 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse rounded-full"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Logo from '@/assets/logo.png'
import { PlayCircleIcon,LockClosedIcon, ShieldCheckIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { UserIcon } from '@heroicons/vue/24/solid';
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
