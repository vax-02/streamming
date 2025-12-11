<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Lista lateral de Grupos -->
    <div
      class="w-full md:w-[35%] lg:w-[25%] bg-gray-800 p-4 flex flex-col h-full space-y-4 overflow-y-auto"
      :class="[grupoSeleccionado ? 'hidden md:flex' : 'flex']"
    >
      <h2 class="text-lg font-bold mb-4 text-center">Grupos</h2>
      <div class="flex-1 flex flex-col space-y-2">
        <div
          v-for="chat in Grupos"
          :key="chat.id"
          @click="seleccionarChat(chat)"
          class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          :class="{ 'bg-blue-700': grupoSeleccionado && grupoSeleccionado.id === chat.id }"
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

      <!-- Botón flotante -->
      <div class="mt-auto flex justify-center">
        <button
          @click="addChatModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center"
          title="Agregar Grupo"
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

    <!-- Panel de conversación -->
    <div
      class="flex-1 flex flex-col bg-gray-900 transition-transform duration-300 w-full md:w-auto"
      :class="[grupoSeleccionado ? 'flex' : 'hidden md:flex']"
    >
      <template v-if="grupoSeleccionado">
        <!-- Header del chat -->
        <div class="flex items-center justify-between bg-gray-800 p-2 border-b border-gray-700">
          <button
            @click="grupoSeleccionado = null"
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
              :src="grupoSeleccionado.foto"
              alt="perfil"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ grupoSeleccionado.nombre }}</h2>
            </div>
          </div>
        </div>

        <!-- Historial de mensajes -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="(msg, i) in grupoSeleccionado.mensajes"
            :key="i"
            :class="msg.enviado ? 'text-right' : 'text-left'"
          >
            <!-- Nombre del remitente -->
            <p class="text-xs text-gray-400 mb-1">
              {{ msg.remitente }}
            </p>

            <!-- Mensaje -->
            <div
              :class="[
                'inline-block px-3 py-2 rounded-xl text-sm max-w-[70%] relative',
                msg.enviado ? 'bg-blue-600 ml-auto' : 'bg-gray-700',
              ]"
            >
              {{ msg.texto }}

              <!-- Estado del mensaje -->
              <span
                v-if="msg.enviado"
                class="absolute bottom-1 right-2 text-[10px] text-gray-200 flex items-center space-x-1"
              >
                <svg
                  v-if="msg.visto"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{{ msg.visto ? 'Visto' : 'Enviado' }}</span>
              </span>
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
      <template v-else>
        <banner-messages tipo="grupo" />
      </template>
    </div>
  </div>
</template>

<script>
import { UserPlusIcon, CalendarDaysIcon, UserMinusIcon } from '@heroicons/vue/24/solid'
import bannerMessages from '@/layouts/bannerMessages.vue'
import { onMounted, onUpdated, ref } from 'vue'

export default {
  components: { UserPlusIcon, CalendarDaysIcon, UserMinusIcon, bannerMessages },
  data() {
    return {
      Grupos: [
        {
          id: 1,
          nombre: 'LIN - 3',
          mensaje: '...',
          nuevos: 1,
          foto: 'https://randomuser.me/api/portraits/men/70.jpg',
          mensajes: [
            { texto: 'Hola 😄', enviado: false, remitente: 'María', visto: false },
            { texto: '¿Revisaste el proyecto?', enviado: false, remitente: 'María', visto: false },
            {
              texto: 'Sí, te paso el link ahora.',
              enviado: true,
              remitente: 'Javier',
              visto: true,
            },
          ],
        },
      ],
      grupoSeleccionado: null,
      nuevoMensaje: '',
      mostrarPerfil: false,
      addChatModal: false,
    }
  },
  mounted() {
    this.scrollToBottom()
  },
  updated() {
    this.scrollToBottom()
  },
  methods: {
    seleccionarChat(chat) {
      this.grupoSeleccionado = chat
    },
    enviarMensaje() {
      if (!this.nuevoMensaje.trim()) return
      this.grupoSeleccionado.mensajes.push({
        texto: this.nuevoMensaje,
        enviado: true,
      })
      this.nuevoMensaje = ''
      // Aquí podrías emitir el mensaje al backend via socket
    },
    scrollToBottom() {
      const container = this.$refs.scrollContainer
      if (container) container.scrollTop = container.scrollHeight
    },
  },
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #c9aedf;
  border-radius: 4px;
}
</style>
