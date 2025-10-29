<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Lista lateral de chats -->
    <div class="w-[25%] bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
      <h2 class="text-lg font-bold mb-4 text-center">Chats</h2>
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="seleccionarChat(chat)"
        class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
        :class="{ 'bg-blue-700': chatSeleccionado && chatSeleccionado.id === chat.id }"
      >
        <img :src="chat.foto" alt="perfil" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex flex-col">
          <span class="font-semibold">{{ chat.nombre }}</span>
          <span class="text-xs text-gray-300 truncate">{{ chat.mensaje }}</span>
        </div>
        <span v-if="chat.nuevos > 0" class="ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full">
          {{ chat.nuevos }}
        </span>
      </div>

      <!-- Botón flotante -->
      <button
        @click="addChatModal = true"
        class="absolute bottom-4 right-100 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none"
        title="Agregar chat"
      >
        <!-- Icono + (puedes cambiarlo por un SVG) -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Panel de conversación -->

    <div class="flex-1 flex flex-col bg-gray-900">
      <router-view v-if="$route.name === 'calling'"></router-view>

      <template v-else-if="chatSeleccionado">
        <!-- Header del chat -->
        <div
          class="flex items-center justify-between bg-gray-800 p-4 border-b border-gray-700 cursor-pointer"
          @click="mostrarPerfil = !mostrarPerfil"
        >
          <div class="flex items-center space-x-3">
            <img
              :src="chatSeleccionado.foto"
              alt="perfil"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ chatSeleccionado.nombre }}</h2>
              <p class="text-xs text-gray-400">En línea</p>
            </div>
          </div>

          <div class="flex items-center space-x-4 text-gray-300">
            <router-link :to="{ name: 'calling' }" class="hover:text-blue-400">
              <PhoneIcon class="w-6 h-6 text-green-500" />
            </router-link>
            <button class="hover:text-blue-400">
              <VideoCameraIcon class="w-6 h-6 text-blue-500" />
            </button>
          </div>
        </div>

        <!-- Historial de mensajes -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="(msg, i) in chatSeleccionado.mensajes"
            :key="i"
            :class="msg.enviado ? 'text-right' : 'text-left'"
          >
            <div
              :class="[
                'inline-block px-3 py-2 rounded-xl text-sm max-w-[70%]',
                msg.enviado ? 'bg-blue-600 ml-auto' : 'bg-gray-700',
              ]"
            >
              {{ msg.texto }}
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="p-4 bg-gray-800 flex items-center space-x-3 border-t border-gray-700">
          <input
            v-model="nuevoMensaje"
            type="text"
            placeholder="Escribe un mensaje..."
            class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full outline-none"
            @keyup.enter="enviarMensaje"
          />
          <button
            @click="enviarMensaje"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full"
          >
            ➤
          </button>
        </div>
      </template>
      <!-- Vista inicial -->
      <template v-else>
        <div
          class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white text-center px-6"
        >
          <!-- Ícono animado o logo -->
          <div class="relative mb-6">
            <!-- Círculo de resplandor -->
            <div
              class="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-30 animate-ping"
            ></div>

            <!-- Ícono de chat -->
            <div
              class="relative w-24 h-24 flex items-center justify-center bg-blue-500 rounded-full shadow-lg animate-fade-in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4.5 1.2 1.2-4.5A8.96 8.96 0 013 12C3 7.582 7.03 4 12 4s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>

          <!-- Título -->
          <h1 class="text-2xl md:text-3xl font-semibold tracking-wide animate-fade-in">
            Seleccione un <span class="text-blue-400">chat</span> para iniciar conversación
          </h1>

          <!-- Subtexto -->
          <p class="mt-3 text-gray-400 max-w-md animate-fade-in delay-200">
            Elija una conversación del panel lateral o cree un nuevo chat para comenzar.
          </p>
        </div>
      </template>
    </div>
  </div>

  <div
    v-if="addChatModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <!-- Modal -->
    <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
        <h2 class="text-lg font-semibold">Iniciar nuevo chat</h2>
        <button
          @click="addChatModal = false"
          class="text-gray-400 hover:text-white text-xl font-bold"
        >
          ✖
        </button>
      </div>

      <!-- Input de búsqueda -->
      <div class="px-6 py-4">
        <div class="relative">
          <input
            type="text"
            placeholder="Buscar contacto..."
            class="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            v-model="searchContact"
          />
          <svg
            class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.65 13.65z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Lista de contactos -->
      <ul class="max-h-64 overflow-y-auto px-6 space-y-1">
        <li
          v-for="contacto in filteredContacts"
          :key="contacto.email"
          class="flex items-center justify-between p-2 rounded-lg hover:bg-blue-600 cursor-pointer"
          @click="startChat(contacto)"
        >
          <div class="flex items-center space-x-3">
            <div
              class="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            >
              {{ contacto.nombre.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium">{{ contacto.nombre }}</p>
              <p class="text-xs text-gray-300">{{ contacto.email }}</p>
            </div>
          </div>
          <button class="text-gray-300 hover:text-white text-sm font-semibold">Agregar</button>
        </li>
        <li v-if="filteredContacts.length === 0" class="text-gray-400 text-center py-4">
          No se encontraron contactos
        </li>
      </ul>

      <!-- Footer -->
      <div class="flex justify-end px-6 py-4 border-t border-gray-700">
        <button
          @click="addChatModal = false"
          class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- Panel lateral derecho de perfil -->
  <transition name="slide">
    <div
      v-if="mostrarPerfil"
      class="w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col absolute right-0 top-0 bottom-0 z-20"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Perfil</h3>
        <button @click="mostrarPerfil = false" class="text-gray-400 hover:text-white">✖</button>
      </div>
      <img
        :src="chatSeleccionado.foto"
        alt="perfil"
        class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
      />
      <h2 class="text-center text-xl font-semibold mb-1">{{ chatSeleccionado.nombre }}</h2>
      <p class="text-center text-gray-400 mb-4">En línea</p>
      <!-- Aquí puedes agregar más info de perfil -->
      <div class="text-gray-300">
        <p><strong>Email:</strong> juan@example.com</p>
        <p><strong>Teléfono:</strong> +123456789</p>
        <p><strong>Estado:</strong> Disponible</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { PhoneIcon, VideoCameraIcon } from '@heroicons/vue/24/solid'
import router from '@/router'

const chats = ref([
  {
    id: 1,
    nombre: 'Juan Pérez',
    mensaje: '¿Revisaste el proyecto?',
    nuevos: 2,
    foto: 'https://randomuser.me/api/portraits/men/70.jpg',
    mensajes: [
      { texto: 'Hola 😄', enviado: false },
      { texto: '¿Revisaste el proyecto?', enviado: false },
      { texto: 'Sí, te paso el link ahora.', enviado: true },
    ],
  },
  {
    id: 2,
    nombre: 'Javier',
    mensaje: '¿Revisaste el proyecto?',
    nuevos: 2,
    foto: 'https://randomuser.me/api/portraits/men/66.jpg',
    mensajes: [
      { texto: 'Hola 😄', enviado: false },
      { texto: '¿Revisaste el proyecto?', enviado: false },
      { texto: 'Sí, te paso el link ahora.', enviado: true },
    ],
  },
])

const chatSeleccionado = ref(null)
const nuevoMensaje = ref('')

function seleccionarChat(chat) {
  chatSeleccionado.value = chat
}

function enviarMensaje() {
  if (!nuevoMensaje.value.trim()) return
  chatSeleccionado.value.mensajes.push({
    texto: nuevoMensaje.value,
    enviado: true,
  })
  nuevoMensaje.value = ''
}
const mostrarPerfil = ref(false)

import { ref, computed } from 'vue'

const addChatModal = ref(true)
const searchContact = ref('')

const contactos = ref([
  { nombre: 'Ana López', email: 'ana@example.com' },
  { nombre: 'Carlos Pérez', email: 'carlos@example.com' },
  { nombre: 'María Gómez', email: 'maria@example.com' },
  { nombre: 'Juan Díaz', email: 'juan@example.com' },
])

// Filtrar contactos según búsqueda
const filteredContacts = computed(() => {
  if (!searchContact.value) return contactos.value
  return contactos.value.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchContact.value.toLowerCase()) ||
      c.email.toLowerCase().includes(searchContact.value.toLowerCase()),
  )
})

// Función para iniciar chat
function startChat(contacto) {
  alert(`Iniciando chat con ${contacto.nombre}`)
  addChatModal.value = false
}
</script>

<style scoped>
/* Scroll suave */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #c9aedf;
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
  animation: fade-in 1s ease-out forwards;
}
.animate-fade-in.delay-200 {
  animation-delay: 0.2s;
}
/* Animación de entrada del panel lateral */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
