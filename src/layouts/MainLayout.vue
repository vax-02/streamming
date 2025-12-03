<template>
  <div class="flex h-screen">
    <div class="w-30 bg-gray-900 flex flex-col items-center py-6 space-y-4 px-3">
      <router-link :to="{ name: 'dashboard' }">
        <div class="bg-blue-600 w-20 h-16 rounded-2xl flex items-center justify-center">
          <img :src="Logo" alt="Logo" class="w-12 h-12 object-contain" />
        </div>
      </router-link>

      <router-link
        :to="{ name: 'statistics' }"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <HomeIcon class="w-6 h-6 text-blue-500" />
        </span>
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

      <button
        @click="logout"
        class="w-12 h-12 bg-gray-700 rounded-full flex flex-col items-center justify-center hover:bg-blue-500 transition"
        active-class="bg-blue-600 text-white"
        exact-active-class="bg-blue-500 text-white"
      >
        <span class="text-xs">
          <ArrowRightOnRectangleIcon class="w-6 h-6 text-red-400" />
        </span>
      </button>
    </div>

    <!-- Contenido dinámico -->
    <div class="flex-1 bg-gray-900 text-white overflow-y-auto">
      <router-view />
      <p v-if="$route.name === 'dashboard'">
        <HomeComponent />
      </p>
    </div>
  </div>

  <!--modal primer inicio de session-->
  <transition name="fade">
    <form @submit.prevent="firstLogin">
      <div
        v-if="firstLoginModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
          <!-- Header -->
          <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
            <h2 class="text-lg font-semibold">Cambie su contraseña</h2>
          </div>

          <!-- Formulario -->
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="block text-gray-300 mb-1">Nueva contraseña</label>
              <input
                v-model="newPassword"
                type="password"
                class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-gray-300 mb-1">Confirmar nueva contraseña</label>
              <input
                v-model="confirmNewPassword"
                type="password"
                class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div class="flex justify-end px-6 py-4 border-t border-gray-700 space-x-2">
            <button class="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-lg" type="submit">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </form>
  </transition>
</template>

<script setup>
import {
  UserGroupIcon,
  UsersIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/solid' // o @heroicons/vue/24/outline
import Logo from '@/assets/logo.png'
import HomeComponent from '@/components/homeComponent.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const userData = JSON.parse(localStorage.getItem('user'))
const firstLoginModal = userData && userData.first_login === 1 ? ref(true) : ref(false)
const newPassword = ref('')
const confirmNewPassword = ref('')
import api from '@/services/api.js'

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}

async function firstLogin() {
  if (newPassword.value !== confirmNewPassword.value) {
    return
  }
  try {
    const response = await api.post('/user/newPassword', {
      id: userData.id,
      password: newPassword.value,
    })
    userData.first_login = 0
    localStorage.setItem('user', JSON.stringify(userData))
    alert('Contraseña actualizada correctamente')
    firstLoginModal.value = false
  } catch (error) {
    alert('error')
  }
}
</script>
