<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <aside class="w-[15%] bg-gray-800 p-4 flex flex-col space-y-4">
      <h2 class="text-lg font-bold mb-4 text-center">Opciones</h2>
      <router-link
        :to="{ name: 'profile' }"
        class="p-2 rounded-md text-center font-semibold"
         active-class="bg-blue-600 text-white"
  exact-active-class="bg-blue-500 text-white"
        >Perfil</router-link
      >
      <router-link
        :to="{ name: 'security' }"
        class="p-2 rounded-md hover:bg-blue-600 text-center transition"
        active-class="bg-blue-600 text-white"
  exact-active-class="bg-blue-500 text-white"
        >Seguridad y Privacidad</router-link
      >

      <router-link
        :to="{ name: 'notifications' }"
        class="p-2 rounded-md hover:bg-blue-600 text-center transition"
        active-class="bg-blue-600 text-white"
  exact-active-class="bg-blue-500 text-white"
        >Reproduccion y contenido</router-link
      >
    </aside>

    <div class="flex-1 bg-gray-900 overflow-y-auto">

    <router-view />
    <div v-if="$route.name === 'settings'">
      <div
            class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
          >
            <!-- Logo animado -->
            <div class="relative">
              <!-- Círculo brillante animado -->
              <div
                class="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-40 animate-ping"
              ></div>

              <!-- Logo -->
              <img
                :src="Logo"
                alt="Logo"
                class="relative w-20 h-20 object-contain animate-bounce"
              />
            </div>

            <!-- Título -->
            <h1 class="mt-6 text-3xl font-semibold tracking-wide animate-fade-in">
              Configuración de <span class="text-blue-400">EduStream</span>
            </h1>

            <!-- Subtexto -->
            <p class="mt-3 text-gray-400 animate-fade-in delay-200 text-center max-w-md">
              Personaliza tu experiencia, ajusta tus preferencias y administra tu cuenta fácilmente.
            </p>

            <!-- Línea decorativa -->
            <div
              class="mt-8 h-[2px] w-32 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse rounded-full"
            ></div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Logo from '@/assets/logo.png'

const usuario = ref({
  nombre: 'Ana López',
  profesion: 'Ingeniera de Software',
  especialidad: 'Desarrollo Web',
  rol: 'docente',
  correo: 'ana.lopez@correo.com',
  foto: 'https://randomuser.me/api/portraits/women/65.jpg',
})

const vistaPrevia = ref(null)

function cargarFoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      vistaPrevia.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function guardarCambios() {
  alert('✅ Cambios guardados correctamente')
}
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
