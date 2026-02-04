<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Panel de chat -->
    <aside
      v-show="isExpanded"
      class="w-full h-full bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black"
    >
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-bold text-center flex-1">Chat en vivo</h2>
      </div>

      <div ref="chatContainer" class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1 custom-scrollbar">
        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <strong :class="msg.usuario === 'Tú' ? 'text-blue-400' : 'text-gray-300'">{{ msg.usuario }}:</strong> {{ msg.mensaje }}
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
                  <button
                    @click="votePoll(msg.id, idx)"
                    :class="[
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
                    ]"
                    :disabled="!msg.multiple && votedPolls[msg.id] !== undefined"
                  >
                    <div
                      class="w-4 h-4 border-2 flex-shrink-0"
                      :class="[
                        msg.multiple ? 'rounded-sm' : 'rounded-full',
                        (
                          msg.multiple
                            ? (votedPolls[msg.id] || []).includes(idx)
                            : votedPolls[msg.id] === idx
                        )
                          ? 'bg-blue-500 border-blue-400'
                          : 'border-gray-500',
                      ]"
                    ></div>

                    <div class="flex justify-between items-center w-full">
                      <span>{{ opcion }}</span>
                      <span
                        v-if="
                          msg.multiple
                            ? (votedPolls[msg.id] || []).includes(idx)
                            : votedPolls[msg.id] === idx
                        "
                        class="text-green-400"
                      >
                        <CheckIcon class="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                  <div v-if="votedPolls[msg.id] !== undefined || isHost" class="mt-1 flex items-center gap-2">
                    <div class="w-full bg-gray-600 rounded-full h-1.5">
                      <div
                        class="bg-blue-500 h-1.5 rounded-full"
                        :style="{
                          width: `${(msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100}%`,
                        }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-400"
                      >{{
                        Math.round(
                          (msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100,
                        )
                      }}%</span
                    >
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
                    <div
                      v-if="block.responses && block.responses.length > 0"
                      class="border-t border-gray-600/50 pt-2 space-y-2"
                    >
                      <div v-for="(response, rIdx) in block.responses" :key="rIdx" class="text-xs">
                        <strong class="text-blue-300">{{ response.user }}:</strong>
                        <span class="text-gray-300">{{ response.text }}</span>
                      </div>
                    </div>
                  </div>
                  <img
                    v-if="block.type === 'image'"
                    :src="block.src"
                    class="max-w-full rounded-md mt-2 mx-auto"
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="relative flex items-center space-x-2 mt-2">
        <input
          v-model="mensaje"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 bg-gray-600 rounded-lg px-2 py-1 outline-none text-white focus:ring-1 focus:ring-blue-500"
          @keyup.enter="enviarMensaje"
        />
        <button
          @click="enviarMensaje"
          class="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-sm transition-colors"
        >
          Enviar
        </button>
      </div>
    </aside>


    <!-- Modal: Compartir -->
    <Teleport to="body">
      <div v-if="showShareModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
        <div class="bg-gray-800 text-white rounded-xl w-full max-w-lg p-6 relative shadow-lg flex flex-col max-h-[90vh]">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Compartir transmisión</h2>
            <button @click="showShareModal = false" class="text-gray-400 hover:text-white transition-colors">✖</button>
          </div>

          <div class="mb-4">
            <label class="block mb-2 text-sm font-medium">Enlace de la transmisión</label>
            <div class="flex gap-2">
              <input
                type="text"
                :value="streamLink"
                readonly
                class="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed outline-none"
              />
              <button @click="copyLink" class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                Copiar
              </button>
            </div>
          </div>

          <div class="flex justify-center mb-4">
            <button
              @click="shareOnWhatsApp"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004 1.559 2.563-1.56 1.559-3.808 1.001 1.002-3.807z" />
              </svg>
              WhatsApp
            </button>
          </div>

          <div class="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
            <h3 class="text-md font-semibold mb-2">Compartir en la aplicación</h3>
            <div class="flex border-b border-gray-700 mb-2">
              <button
                @click="shareTab = 'friends'"
                :class="['px-4 py-2 text-sm transition-colors', shareTab === 'friends' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400']"
              >
                Amigos
              </button>
              <button
                @click="shareTab = 'groups'"
                :class="['px-4 py-2 text-sm transition-colors', shareTab === 'groups' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400']"
              >
                Grupos
              </button>
            </div>

            <div class="flex-1 flex flex-col min-h-0">
              <div class="mb-2">
                <input
                  type="text"
                  :placeholder="`Buscar ${shareTab === 'friends' ? 'amigo' : 'grupo'}...`"
                  v-model="shareSearch"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div v-if="shareTab === 'friends'">
                  <div
                    v-for="item in filteredFriends"
                    :key="item.id"
                    class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                    @click="toggleShareTarget(item)"
                  >
                    <div class="flex items-center gap-3">
                      <img :src="item.avatar" class="w-8 h-8 rounded-full object-cover" />
                      <span>{{ item.name }}</span>
                    </div>
                    <input
                      type="checkbox"
                      :checked="selectedShareTargets.some((t) => t.id === item.id)"
                      class="pointer-events-none rounded"
                    />
                  </div>
                </div>

                <div v-if="shareTab === 'groups'">
                  <div
                    v-for="item in filteredGroups"
                    :key="item.id"
                    class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                    @click="toggleShareTarget(item)"
                  >
                    <div class="flex items-center gap-3">
                      <img :src="item.foto" class="w-8 h-8 rounded-full object-cover" />
                      <span>{{ item.nombre }}</span>
                    </div>
                    <input
                      type="checkbox"
                      :checked="selectedShareTargets.some((t) => t.id === item.id)"
                      class="pointer-events-none rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
            <button @click="showShareModal = false" class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button
              @click="sendToSelected"
              :disabled="selectedShareTargets.length === 0"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
      shareTab: 'friends',
      shareSearch: '',
      selectedShareTargets: [],
      streamLink: window.location.href,
      friendsList: [], // Estas deberían cargarse de una API o prop
      groupsList: [], // Estas deberían cargarse de una API o prop
    }
  },
  computed: {
    filteredFriends() {
      if (!this.shareSearch) return this.friendsList
      return this.friendsList.filter((f) =>
        f.name.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },
    filteredGroups() {
      if (!this.shareSearch) return this.groupsList
      return this.groupsList.filter((g) =>
        g.nombre.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },
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
    // Inicializar listas de prueba si es necesario (o cargarlas)
    this.loadShareData()
  },
  beforeUnmount() {
    this.cleanupSocketListeners()
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
    copyLink() {
      navigator.clipboard.writeText(this.streamLink).then(() => {
        alert('Enlace copiado al portapapeles')
      })
    },
    shareOnWhatsApp() {
      const message = `¡Únete a mi transmisión en vivo! ${this.streamLink}`
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    },

    toggleShareTarget(target) {
      const index = this.selectedShareTargets.findIndex((t) => t.id === target.id)
      if (index > -1) {
        this.selectedShareTargets.splice(index, 1)
      } else {
        this.selectedShareTargets.push(target)
      }
    },

    sendToSelected() {
      if (this.selectedShareTargets.length === 0) return
      const targetNames = this.selectedShareTargets.map((t) => t.name || t.nombre).join(', ')
      alert(`Enlace enviado a: ${targetNames}`)
      this.showShareModal = false
      this.selectedShareTargets = []
    },

    loadShareData() {
      // Estos datos deberían venir de una API real en el futuro
      this.friendsList = [
        { id: 'f1', name: 'Laura García', avatar: 'https://i.pravatar.cc/100?img=6' },
        { id: 'f2', name: 'José Martínez', avatar: 'https://i.pravatar.cc/100?img=15' },
      ]
      this.groupsList = [
        { id: 'g1', nombre: 'LIN - 3', foto: 'https://ui-avatars.com/api/?name=LIN' },
        { id: 'g2', nombre: 'WEB - 1', foto: 'https://ui-avatars.com/api/?name=WEB' },
      ]
    }
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
