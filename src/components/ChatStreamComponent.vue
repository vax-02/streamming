<template>
  <div class="flex flex-col h-full overflow-hidden">
    <aside v-show="isExpanded" class="w-full h-full bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold text-center flex-1">Chat en vivo</h2>
      </div>

      <div ref="chatContainer" class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1 custom-scrollbar">
        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <strong :class="msg.usuario === 'Tú' ? 'text-blue-400' : 'text-gray-300'">{{ msg.usuario }}:</strong> {{
              msg.mensaje }}
          </template>

          <!-- Encuesta -->
          <template v-else-if="msg.tipo === 'encuesta' && Array.isArray(msg.opciones)">
            <div class="bg-gray-800 p-3 rounded-lg my-2 border border-gray-600">
              <div class="font-semibold mb-3">
                <ChartBarIcon class="w-5 h-5 inline-block mr-2 text-blue-400" />
                {{ msg.pregunta }}
              </div>
              <div class="space-y-2">
                <div v-for="(opcion, idx) in msg.opciones" :key="idx">
                  <button @click="votePoll(msg.id, idx)" :class="[
                    'w-full text-left p-2 rounded-md border transition-all flex items-center gap-3',
                    msg.multiple
                      ? (votedPolls[msg.id] || []).includes(idx)
                        ? 'bg-blue-700 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : votedPolls[msg.id] === idx
                        ? 'bg-blue-700 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600',
                    !msg.multiple && votedPolls[msg.id] !== undefined
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer',
                  ]" :disabled="!msg.multiple && votedPolls[msg.id] !== undefined">
                    <div class="w-4 h-4 border-2 flex-shrink-0" :class="[
                      msg.multiple ? 'rounded-sm' : 'rounded-full',
                      (
                        msg.multiple
                          ? (votedPolls[msg.id] || []).includes(idx)
                          : votedPolls[msg.id] === idx
                      )
                        ? 'bg-blue-500 border-blue-400'
                        : 'border-gray-500',
                    ]"></div>

                    <div class="flex justify-between items-center w-full">
                      <span>{{ opcion }}</span>
                      <span v-if="
                        msg.multiple
                          ? (votedPolls[msg.id] || []).includes(idx)
                          : votedPolls[msg.id] === idx
                      " class="text-green-400">
                        <CheckIcon class="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                  <div v-if="votedPolls[msg.id] !== undefined || isHost" class="mt-1 flex items-center gap-2">
                    <div class="w-full bg-gray-600 rounded-full h-1.5">
                      <div class="bg-blue-500 h-1.5 rounded-full" :style="{
                        width: `${(msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100}%`,
                      }"></div>
                    </div>
                    <span class="text-xs text-gray-400">{{
                      Math.round(
                        (msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100,
                      )
                    }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Ejercicio -->
          <template v-else-if="msg.tipo === 'ejercicio'">
            <div class="bg-gray-800 rounded-lg my-2 overflow-hidden border border-gray-600">
              <div class="bg-gray-900/50 p-3 border-b border-gray-700">
                <div class="font-semibold text-base">
                  <PencilSquareIcon class="w-5 h-5 inline-block mr-2 text-yellow-400" />
                  Ejercicio: {{ msg.title }}
                </div>
              </div>
              <div class="p-3 space-y-3">
                <div v-for="(block, blockIdx) in msg.content" :key="blockIdx">
                  <div v-if="block.type === 'text'" class="bg-gray-700/50 p-3 rounded-md space-y-3">
                    <p class="text-gray-200 whitespace-pre-wrap">{{ block.question }}</p>
                    <div v-if="block.responses && block.responses.length > 0"
                      class="border-t border-gray-600/50 pt-2 space-y-2">
                      <div v-for="(response, rIdx) in block.responses" :key="rIdx" class="text-xs">
                        <strong class="text-blue-300">{{ response.user }}:</strong>
                        <span class="text-gray-300">{{ response.text }}</span>
                      </div>
                    </div>
                  </div>
                  <img v-if="block.type === 'image'" :src="block.src" class="max-w-full rounded-md mt-2 mx-auto" />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="relative flex items-center space-x-2 mt-2">
        <input v-model="mensaje" type="text" placeholder="Escribe un mensaje..."
          class="flex-1 bg-gray-600 rounded-lg px-2 py-1 outline-none text-white focus:ring-1 focus:ring-blue-500"
          @keyup.enter="enviarMensaje" />
        <button @click="enviarMensaje"
          class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-sm transition-colors">
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
  },
  methods: {
    setupSocketListeners() {
      socket.on('chat-message', (data) => {
        this.chat.push(data)
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
    },

    scrollToBottom() {
      const container = this.$refs.chatContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    enviarMensaje() {
      if (!this.mensaje.trim()) return
      const msgData = {
        usuario: this.userData.name || this.userData.email || 'Usuario',
        mensaje: this.mensaje,
        roomId: this.roomId,
        id: Date.now()
      }

      socket.emit('chat-message', msgData)
      this.chat.push({ ...msgData, usuario: 'Tú' })
      this.mensaje = ''
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
