<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="w-30 bg-gray-900 flex flex-col items-center py-6 space-y-4 px-3">
      <router-link :to="{ name:'dashboard' }">
        <div class="bg-purple-600 w-20 h-16 rounded-2xl flex items-center justify-center">
          <img :src="Logo" alt="Logo" class="w-12 h-12 object-contain" />
        </div>
      </router-link>

      <router-link
        :to="{ name: 'users' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-purple-500 transition"
      >
        <span class="text-xs"> </span>
      </router-link>

      <router-link
        :to="{ name: 'chats' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-purple-500 transition"
      >
        <span class="text-xs">Chats</span>
      </router-link>

      <router-link
        :to="{ name: 'groups' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-purple-500 transition"
      >
        <span class="text-xs">Grupos</span>
      </router-link>

      <router-link
        :to="{ name: 'transmitions' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-purple-500 transition"
      >
        <span class="text-xs">Transmisiones</span>
      </router-link>

      <router-link
        :to="{ name: 'settings' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-purple-500 transition"
      >
        ⚙️
        <span class="text-xs">Ajustes</span>
      </router-link>
    </div>

    <!-- Contenido dinámico -->
    <div class="flex-1 bg-gray-900 text-white overflow-y-auto">
      <router-view />
      <p v-if="$route.name === 'dashboard'">
        <HomeComponent />
      </p>
    </div>
  </div>
</template>

<script setup>
import Logo from '@/assets/logo.png'
import HomeComponent from '@/components/homeComponent.vue';
</script>
