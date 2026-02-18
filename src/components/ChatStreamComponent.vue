<template>
  <div class="flex flex-col h-full overflow-hidden">
    <aside v-show="isExpanded" class="w-full h-full bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black">
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

      <div ref="chatContainer" class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1 custom-scrollbar">
        <div v-if="chat.length === 0" class="text-center text-gray-400 py-4">
          No hay mensajes aún. ¡Sé el primero en escribir!
        </div>
        
        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <div class="flex items-start gap-2 hover:bg-gray-600/30 p-1 rounded">
              <strong :class="msg.usuario === 'Tú' ? 'text-blue-400' : 'text-gray-300'">
                {{ msg.usuario }}:
              </strong>
              <span class="text-gray-200 break-words flex-1">{{ msg.mensaje }}</span>
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
          class="flex-1 bg-gray-600 rounded-lg px-3 py-2 outline-none text-white focus:ring-1 focus:ring-blue-500"
          @keyup.enter="enviarMensaje"
          :disabled="!isConnected"
        />
        <button 
          @click="enviarMensaje"
          class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!mensaje.trim() || !isConnected"
        >
          Enviar
        </button>
      </div>
    </aside>
  </div>
</template>

<script>
import {
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
    this.setupSocketListeners()
    
    // Unirse a la sala específica
    if (this.roomId) {
      socket.emit('join-room', this.roomId)
    }
  },
  methods: {
    setupSocketListeners() {
      socket.on('connect', () => {
        this.isConnected = true
        // Re-unirse a la sala al reconectar
        if (this.roomId) {
          socket.emit('join-room', this.roomId)
        }
      })

      socket.on('disconnect', () => {
        this.isConnected = false
      })

      socket.on('chat-message', (data) => {
        // Solo agregar si no es un mensaje propio (para evitar duplicados)
        if (data.usuario !== (this.userData.name || this.userData.email)) {
          this.chat.push(data)
        }
      })

      socket.on('new-poll', (encuesta) => {
        this.chat.push(encuesta)
      })

      socket.on('poll-voted', ({ id, idx }) => {
        const m = this.chat.find((c) => c.id === id)
        if (m && m.tipo === 'encuesta') {
          m.votos[idx] = (m.votos[idx] || 0) + 1
          this.chat = [...this.chat]
        }
      })

      // Estado inicial de conexión
      this.isConnected = socket.connected
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
        usuario: this.userData.name || this.userData.email || 'Usuario',
        mensaje: this.mensaje,
        roomId: this.roomId,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      }

      // Emitir a todos en la sala (incluyendo al remitente)
      socket.emit('chat-message', msgData)
      
      // Agregar localmente (el servidor también reenviará)
      this.chat.push({ ...msgData, usuario: 'Tú' })
      
      this.mensaje = ''
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  },
  beforeDestroy() {
    // Limpiar listeners
    socket.off('connect')
    socket.off('disconnect')
    socket.off('chat-message')
    socket.off('new-poll')
    socket.off('poll-voted')
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