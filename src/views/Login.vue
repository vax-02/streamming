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

            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Contraseña"
                class="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>

            <button
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-lg font-semibold transition transform hover:scale-105"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>

  <ToastNotification ref="toastRef" />
</template>

<script>
import UserImg from '@/assets/login.png'
import api from '@/services/api'
import router from '@/router' // <-- FALTABA ESTO
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'

export default {
  components: { EyeIcon, EyeSlashIcon, ToastNotification },
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
    }
  },
  methods: {
    async login() {
      try {
        const response = await api.post('/login', {
          email: this.username,
          password: this.password,
        })
        const token = response.data.token
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        this.$refs.toastRef.addToast('Inicio de sesión exitoso', 'success')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } catch (error) {
        this.username = ''
        this.password = ''
        this.$refs.toastRef.addToast('Usuario o contraseña incorrectos', 'error')
        console.log(error)
      }
    },
  },
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

/* Ocultar el icono de ojo por defecto en navegadores como Edge */
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
</style>
