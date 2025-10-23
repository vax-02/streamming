<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Lista lateral de chats -->
    <aside class="w-[25%] bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
      <h2 class="text-lg font-bold mb-4 text-center">Grupos</h2>
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="seleccionarChat(chat)"
        class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition"
        :class="{ 'bg-purple-700': chatSeleccionado && chatSeleccionado.id === chat.id }"
      >
        <img :src="chat.foto" alt="perfil" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex flex-col">
          <span class="font-semibold">{{ chat.nombre }}</span>
          <span class="text-xs text-gray-300 truncate">{{ chat.mensaje }}</span>
        </div>
        <span v-if="chat.nuevos > 0" class="ml-auto bg-purple-500 text-xs px-2 py-1 rounded-full">
          {{ chat.nuevos }}
        </span>
      </div>
    </aside>

    <!-- Panel de conversación -->
    <div class="flex-1 flex flex-col bg-gray-900">
      <template v-if="chatSeleccionado">
        <!-- Header del chat -->
        <div class="flex items-center justify-between bg-gray-800 p-4 border-b border-gray-700">
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
            <button class="hover:text-purple-400">📞</button>
            <button class="hover:text-purple-400">🎥</button>
            <button class="hover:text-purple-400">⚙️</button>
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
                msg.enviado ? 'bg-purple-600 ml-auto' : 'bg-gray-700',
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
            class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full"
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
            Seleccione un <span class="text-blue-400">Grupo</span> para iniciar conversación
          </h1>

          <!-- Subtexto -->
          <p class="mt-3 text-gray-400 max-w-md animate-fade-in delay-200">
            Elija una conversación del panel lateral o cree un nuevo chat para comenzar.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const chats = ref([
  {
    id: 1,
    nombre: 'Mat 1207 - Grupo A',
    mensaje: '¿Revisaste el proyecto?',
    nuevos: 2,
    foto: 'https://randomuser.me/api/portraits/women/65.jpg',
    mensajes: [
      { texto: 'Hola 😄', enviado: false },
      { texto: '¿Revisaste el proyecto?', enviado: false },
      { texto: 'Sí, te paso el link ahora.', enviado: true },
    ],
  },
  {
    id: 2,
    nombre: 'Qmc 1305 - Grupo B',
    mensaje: 'Nos vemos mañana',
    nuevos: 0,
    foto: 'https://randomuser.me/api/portraits/men/45.jpg',
    mensajes: [
      { texto: '¿A qué hora la reunión?', enviado: false },
      { texto: 'A las 9 en punto.', enviado: true },
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
</script>

<style scoped>
/* Scroll suave */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #6b21a8;
  border-radius: 4px;
}
</style>
