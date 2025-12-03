<template>
  <div class="min-h-screen bg-gray-900 banner text-white flex flex-col">
    <main class="banner-text flex-1 flex flex-col items-center justify-center text-center px-4">
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
              type="email"
              v-model="username"
              placeholder="Usuario"
              class="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="password"
              v-model="password"
              placeholder="Contraseña"
              class="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
import api from '@/services/api'
const username = ref('')
const password = ref('')
const router = useRouter()

async function login() {
  try {
    const response = await api.post('/login', {
      email: username.value,
      password: password.value,
    })
    const token = response.data.token
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    router.push('/dashboard')
  } catch (error) {
    username.value = password.value = ''
    console.log(error)
    //router.push('/login')
  }
}
</script>

<style scoped>
.login {
  max-width: 300px;
  margin: auto;
}

.banner {
  position: relative;
  overflow: hidden;
}

.banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/images/back.webp') center/cover no-repeat;
  opacity: 0.4; /* solo el fondo */
  z-index: 0;
}

.banner-text {
  position: relative;
  z-index: 1; /* texto sobre el fondo */
  color: white; /* opcional */
}
</style>
