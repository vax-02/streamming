<template>
  <div class="flex h-screen">
    <div class="w-30 bg-gray-900 flex flex-col items-center py-6 space-y-4 px-3">
      <router-link :to="{ name: 'dashboard' }">
        <div class="bg-blue-600 w-20 h-16 rounded-2xl flex items-center justify-center">
          <img :src="Logo" alt="Logo" class="w-12 h-12 object-contain" />
        </div>
      </router-link>

      <router-link
        :to="{ name: 'users' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <UserGroupIcon class="w-6 h-6 text-blue-400" />
        </span>
      </router-link>

      <router-link
        :to="{ name: 'application' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <UserPlusIcon class="w-6 h-6 text-yellow-400" />
        </span>
      </router-link>

      <router-link
        :to="{ name: 'chats' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <ChatBubbleLeftRightIcon class="w-6 h-6 text-purple-400" />
        </span>
      </router-link>

      <router-link
        :to="{ name: 'groups' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <UsersIcon class="w-6 h-6 text-blue-400" />
        </span>
      </router-link>

      <router-link
        :to="{ name: 'transmitions' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <VideoCameraIcon class="w-6 h-6 text-red-400" />
        </span>
      </router-link>

      <router-link
        :to="{ name: 'settings' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <Cog6ToothIcon class="w-6 h-6 text-gray-400" />
        </span>
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
import {
  UserGroupIcon,
  UsersIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/solid' // o @heroicons/vue/24/outline
import Logo from '@/assets/logo.png'
import HomeComponent from '@/components/homeComponent.vue'
</script>
