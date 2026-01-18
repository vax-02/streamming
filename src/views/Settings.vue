<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <aside class="w-[15%] bg-gray-800 flex flex-col space-y-4">
      <h2 class="text-lg font-bold p-4 border-b border-gray-800">Opciones</h2>
      <nav class="flex flex-col">
        <router-link
          :to="{ name: 'profile' }"
          class="flex items-center gap-2 text-left px-4 py-2 transition-all duration-200 border-l-4 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500"
          exact-active-class="bg-blue-500 text-white"
        >
          <UserCircleIcon class="h-6 w-6" />
          <span>Perfil</span>
        </router-link>

        <router-link
          :to="{ name: 'privacity' }"
          class="flex items-center gap-2 text-left px-4 py-2 transition-all duration-200 border-l-4 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500"
          exact-active-class="bg-blue-500 text-white"
        >
          <LockClosedIcon class="h-6 w-6" />
          <span> Privacidad </span>
        </router-link>

   <router-link
          :to="{ name: 'security' }"
          class="flex items-center gap-2 text-left px-4 py-2 transition-all duration-200 border-l-4 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent"
          active-class="bg-gray-700 text-white border-blue-500"
          exact-active-class="bg-blue-500 text-white"
        >
          <ShieldCheckIcon class="h-6 w-6" />
          <span> Seguridad </span>
        </router-link>

      </nav>
    </aside>
    <div class="flex-1 bg-gray-900 overflow-y-auto">
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
import { PlayCircleIcon,LockClosedIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
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
