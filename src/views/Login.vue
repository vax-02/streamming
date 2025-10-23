<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <main class="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div class="login">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">Iniciar sesión</h2>

        <form @submit.prevent="login">
          <div class="flex flex-col gap-4 w-80 mx-auto mt-10">
            <input
              type="text"
              v-model="username"
              placeholder="Usuario"
              class="px-4 py-2 border text-dark border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              v-model="password"
              placeholder="Contraseña"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg transition">
              Ingresar
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
