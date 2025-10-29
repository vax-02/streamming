<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <main class="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div class="login bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
          <img
            :src="UserImg"
            alt="user"
            class="w-20 h-20 object-contain rounded-full border-4 border-blue-500 shadow-md"
          />
          <h2 class="text-2xl md:text-3xl font-bold mt-4">Iniciar sesión</h2>
        </div>

        <form @submit.prevent="login">
          <div class="flex flex-col gap-4">
            <input
              type="text"
              v-model="username"
              placeholder="Usuario"
              class="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              v-model="password"
              placeholder="Contraseña"
              class="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-lg font-semibold transition transform hover:scale-105"
            >
              Ingresar
            </button>

            <button
              type="button"
              class="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-4 py-2 rounded-lg text-lg font-semibold transition transform hover:scale-105"
            >
              Olvidé mi contraseña
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'
import UserImg from '@/assets/login.png'

const username = ref('')
const password = ref('')
const router = useRouter()

function login() {
  if (username.value === 'admin' && password.value === 'admin') {
    router.push('/dashboard')
  } else {
    alert('Credenciales incorrectas')
  }
}
</script>

<style scoped>
.login {
  max-width: 300px;
  margin: auto;
}
</style>
