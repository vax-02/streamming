<template>
  <div class="flex flex-col h-full overflow-hidden">
    <aside
      v-show="isExpanded"
      class="w-full h-full bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black"
    >
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold text-center flex-1">Chat en vivo</h2>
        <span class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
          {{ chat.length }} mensajes
        </span>
      </div>

      <!-- Indicador de conexión -->
      <div class="text-xs text-center mb-1">
        <span :class="isConnected ? 'text-green-400' : 'text-red-400'">
          {{ isConnected ? '● Conectado' : '○ Desconectado' }}
        </span>
      </div>

      <div
        ref="chatContainer"
        class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1 custom-scrollbar"
      >
        <div v-if="chat.length === 0" class="text-center text-gray-400 py-4">
          No hay mensajes aún. ¡Sé el primero en escribir!
        </div>

        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <div class="flex items-start gap-2 hover:bg-gray-600/30 p-1 rounded">
              <strong :class="msg.user === 'Tú' ? 'text-blue-400' : 'text-green-300'">
                {{ msg.user }}:
              </strong>
              <span class="text-sm text-gray-200 break-words flex-1">{{ msg.message }}</span>
              <span v-if="msg.timestamp" class="text-xs text-gray-500">
                {{ formatTime(msg.timestamp) }}
              </span>
            </div>
          </template>

          <!-- Encuesta (tu código existente) -->
          <template v-else-if="msg.tipo === 'encuesta'">
            <!-- ... mantén tu código de encuesta ... -->
          </template>

          <!-- Ejercicio (tu código existente) -->
          <template v-else-if="msg.tipo === 'ejercicio'">
            <!-- ... mantén tu código de ejercicio ... -->
          </template>
        </div>
      </div>

      <div class="relative flex items-center space-x-2 mt-2">
        <input
          v-model="mensaje"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 bg-gray-600 text-sm rounded-lg p-1 outline-none text-white focus:ring-1 focus:ring-blue-500"
          @keyup.enter="enviarMensaje"
          :disabled="!isConnected"
        />
        <button
          @click="enviarMensaje"
          class="bg-blue-600 hover:bg-blue-500 p-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!mensaje.trim() || !isConnected"
        >
          <PaperAirplaneIcon class="w-5 h-5 transform -rotate-45 translate-x-0.5" />
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
import {
  PaperAirplaneIcon,
  PlusCircleIcon,
  ChartBarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
} from '@heroicons/vue/24/solid'
import socket from '@/services/socket.js'

export default {
  name: 'ChatStreamComponent',
  components: {
    PaperAirplaneIcon,
    PlusCircleIcon,
    ChartBarIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    ShareIcon,
  },
  props: {
    roomId: {
      type: String,
      required: true,
    },
    userData: {
      type: Object,
      required: true,
    },
    isHost: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      chat: [],
      mensaje: '',
      isConnected: false,
    }
  },
  watch: {
    chat() {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
  },
  mounted() {
    this.connectChat()
    this.isConnected = true
    socket.on("newMessageStream", (data) => {
      console.log("Mensaje recibido:", data)
      this.chat.push(data)
    })
  },
  methods: {
    // ========== CONNECT CHAT =========
    connectChat() {
      const idRoom = 1024 * this.roomId
      console.log('have link', idRoom)
      socket.emit('room-stream', { userId: this.userData.id, room: idRoom })
    },
    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    enviarMensaje() {
      if (!this.mensaje.trim() || !this.isConnected) return
      const msgData = {
        user: this.userData.name || this.userData.email || 'Usuario',
        message: this.mensaje,
        id_chat: 1024 * this.roomId,
        /*timestamp: Date.now(),
        id: Date.now() + Math.random(),*/
      }
      console.log('Enviando mensaje:', msgData)
      socket.emit('sendMessageStream', msgData)
      this.chat.push({ ...msgData, user: 'Tú' })
      this.mensaje = ''
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  },
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
