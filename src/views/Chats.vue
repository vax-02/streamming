<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Sidebar de Chats -->
    <div
      class="w-full md:w-[35%] lg:w-[25%] bg-gray-800 p-4 flex flex-col h-full space-y-4 overflow-y-auto"
      :class="[chatSeleccionado && 'hidden md:flex', !chatSeleccionado && 'flex']"
    >
      <h2 class="text-lg font-bold mb-4 text-center">Chats</h2>

      <!-- Lista de Chats -->
      <div class="flex-1 flex flex-col space-y-2">
        <div
          v-for="chat in chats"
          :key="chat.id"
          @click="seleccionarChat(chat)"
          class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-600 transition"
          :class="{ 'bg-gray-500': chatSeleccionado && chatSeleccionado.id === chat.id }"
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
      </div>

      <!-- Botón Agregar Chat al final -->
      <div class="mt-auto flex justify-center">
        <button
          @click="addChatModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center"
          title="Agregar chat"
        >
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
    </div>

    <!-- Área principal de Chat -->
    <div
      class="flex-1 flex flex-col bg-gray-900 transition-transform duration-300 w-full md:w-auto"
      :class="[chatSeleccionado && 'flex', !chatSeleccionado && 'hidden md:flex']"
    >
      <!-- Chat seleccionado -->
      <template v-if="chatSeleccionado">
        <!-- Header del Chat -->
        <div class="flex items-center justify-between bg-gray-800 p-2 border-b border-gray-700">
          <button
            @click="chatSeleccionado = null"
            class="md:hidden p-2 text-gray-300 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            class="flex items-center space-x-3 hover:bg-gray-600 px-5 cursor-pointer"
            @click="mostrarPerfil = !mostrarPerfil"
          >
            <img
              :src="chatSeleccionado.foto"
              alt="perfil"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ chatSeleccionado.nombre }}</h2>
              <p class="text-xs text-green-400">En línea</p>
            </div>
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
            @keyup.enter="sendMessage(chatSeleccionado.id)"
          />
          <button @click="sendMessage" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full">
            >
          </button>
        </div>
      </template>

      <!-- Vista inicial cuando no hay chat seleccionado -->
      <template v-else>
        <banner-messages tipo="chat" />
      </template>
    </div>

    <!-- Modal: Agregar Chat -->
    <div
      v-if="addChatModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
        <!-- Header Modal -->
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
          </li>
          <li v-if="filteredContacts.length === 0" class="text-gray-400 text-center py-4">
            No se encontraron contactos
          </li>
        </ul>

        <!-- Footer Modal -->
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
        class="w-full sm:w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col absolute right-0 top-0 bottom-0 z-40"
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

        <div class="text-gray-300">
          <p><strong>Email:</strong> juan@example.com</p>
          <p><strong>Teléfono:</strong> +123456789</p>
          <p><strong>Estado:</strong> Disponible</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { io } from 'socket.io-client'
const socket = io('http://localhost:3001') // Conecta al servidor

import { PhoneIcon, VideoCameraIcon, UserIcon } from '@heroicons/vue/24/solid'
import bannerMessages from '@/layouts/bannerMessages.vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import api from '@/services/api.js'

export default {
  components: { PhoneIcon, VideoCameraIcon, bannerMessages },

  data() {
    return {
      userData: JSON.parse(localStorage.getItem('user')),
      chats: [],

      chatSeleccionado: null,
      nuevoMensaje: '',
      mostrarPerfil: false,

      addChatModal: false,
      searchContact: '',
      contactos: [{ nombre: 'Ana López', email: 'ana@example.com' }],
    }
  },

  computed: {
    filteredContacts() {
      if (!this.searchContact) return this.contactos
      const q = this.searchContact.toLowerCase()

      return this.contactos.filter(
        (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      )
    },
  },

  mounted() {
    //socket.emit('joinChat', 4)
    const route = useRoute()
    this.handleOpenContactQuery(route.query)
    this.loadChats()
    this.connectToUserChats()
  },
  methods: {
    async connectToUserChats() {
      try {
        const response = await api.get('/rooms')
        const rooms = response.data.rooms

        if (rooms && rooms.length > 0) {
          if (!socket.connected) {
            socket.connect()
          }

          socket.emit('initial room connection', {
            userId: this.userData.id,
            rooms: rooms,
          })

          console.log("Emitido 'initial room connections' con las salas:", rooms)
        }
      } catch (error) {
        console.error('Error al obtener y conectar a las salas:', error)
      }
    },
    async loadChats() {
      try {
        const response = await api.get('/chats')
        const temp = response.data.data
        this.chats = temp.map((u) => ({
          id: u.id,
          nombre: u.name,
          mensaje: '¿Revisaste el proyecto?',
          nuevos: 2,
          foto: u.photo,
          mensajes: [
            { texto: 'Hola 😄', enviado: false },
            { texto: '¿Revisaste el proyecto?', enviado: false },
            { texto: 'Sí, te paso el link ahora.', enviado: true },
          ],
        }))
      } catch (error) {
        console.log('Error al cargar solicitudes:', error)
      }
    },
    seleccionarChat(chat) {
      this.chatSeleccionado = chat
    },

    sendMessage(id) {
      if (!this.nuevoMensaje.trim()) return
      socket.emit('sendMessage', {
        id_chat: id,
        senderId: this.userData.id, 
        message: this.nuevoMensaje,
      })

      this.chatSeleccionado.mensajes.push({
        texto: this.nuevoMensaje,
        enviado: true,
      })
      this.nuevoMensaje = ''
    },

    // Manejar query ?openName=&openEmail=&openAvatar=
    handleOpenContactQuery(q) {
      if (!q.openName && !q.openEmail) return

      const contacto = {
        nombre: q.openName || q.openEmail,
        email: q.openEmail,
        foto: q.openAvatar,
      }

      this.startChat(contacto)

      // limpiar query
      router.replace({ name: 'chats' }).catch(() => {})
    },

    startChat(contacto) {
      const existente = this.chats.find(
        (c) => c.email === contacto.email || c.nombre === contacto.nombre,
      )

      if (existente) {
        this.chatSeleccionado = existente
        this.addChatModal = false
        return
      }

      const nextId = Math.max(0, ...this.chats.map((c) => c.id)) + 1

      const nuevoChat = {
        id: nextId,
        nombre: contacto.nombre,
        mensaje: '',
        nuevos: 0,
        foto:
          contacto.foto ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            contacto.nombre,
          )}&background=1f2937&color=fff`,
        mensajes: [],
        email: contacto.email,
      }

      this.chats.push(nuevoChat)
      this.chatSeleccionado = nuevoChat
      this.addChatModal = false
    },
  },

  watch: {
    '$route.query'(q) {
      this.handleOpenContactQuery(q)
    },
  },
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
