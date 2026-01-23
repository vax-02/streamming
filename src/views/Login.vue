<template>
  <div class="min-h-screen bg-gray-900 banner text-white flex flex-col relative">
    <!-- Overlay for better text readability -->
    <div class="absolute inset-0 bg-black/60 z-0"></div>

    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8 bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
        <div class="flex flex-col items-center">
          <div class="relative">
             <div class="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 blur opacity-75"></div>
            <img
              :src="UserImg"
              alt="user"
              class="relative w-20 h-20 object-contain rounded-full border-3 border-white/20 shadow-lg bg-gray-800 p-1"
            />
          </div>
          <h2 class="mt-6 text-3xl font-bold tracking-tight text-white">Bienvenido</h2>
          <p class="mt-2 text-sm text-gray-400">Ingresa tus credenciales para acceder</p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="login">
          
           <!-- Error Alert -->
          <div v-if="errorMessage" class="rounded-md bg-red-500/10 p-4 border border-red-500/20 animate-fade-in">
            <div class="flex">
              <div class="flex-shrink-0">
                <ExclamationCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-400">Error de inicio de sesión</h3>
              </div>
            </div>
          </div>

          <div class="space-y-4 rounded-md shadow-sm">
            <div>
              <label for="email-address" class="sr-only">Correo electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="username"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Correo electrónico"
                />
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  v-model="password"
                  class="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg leading-5 bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Contraseña"
                />
                 <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none">
                  <EyeIcon v-if="!showPassword" class="h-5 w-5" aria-hidden="true" />
                  <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
            >
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                 <ArrowRightOnRectangleIcon v-if="!isLoading" class="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                 <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              </span>
              {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>

</template>

<script>
import api from '@/services/api'
import router from '@/router'
import socket from '@/services/socket.js'

import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/solid'

export default {
  components: { 
    EyeIcon, 
    EyeSlashIcon, 
    EnvelopeIcon, 
    LockClosedIcon, 
    ArrowRightOnRectangleIcon,
    ExclamationCircleIcon,
  },
  data() {
    return {
      UserImg: '/images/user-default.png',
      username: '',
      password: '',
      showPassword: false,
      isLoading: false,
      errorMessage: false,
    }
  },
  methods: {
    async login() {
      this.isLoading = true;
      
      try {
        const response = await api.post('/login', {
          email: this.username,
          password: this.password,
        })
        const token = response.data.token
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        if (response.token || token) {
             socket.auth = {
              token : response.token || token
            }
            socket.connect()
            socket.emit("online-offline")
        }
        router.push('/dashboard')
      } catch (error) {
        console.error(error)
        if (error.response && error.response.data && error.response.data.message) {
            this.errorMessage = true;
        } else if (error.message) {
             this.errorMessage = true
        } else {
            this.errorMessage = true
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
}
</script>

<style scoped>
.banner {
  background: url('/images/back.webp') center/cover no-repeat;
}

/* Custom animation for error alert */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
