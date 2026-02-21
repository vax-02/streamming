<template>
  <div class="flex h-screen bg-gray-800 text-white font-sans overflow-hidden">
    <!-- Sidebar de Chats -->
    <aside class="w-full md:w-80 bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg z-20"
      :class="[chatSeleccionado ? 'hidden md:flex' : 'flex']">
      <div class="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-bold tracking-wide flex items-center space-x-2">
          <ChatBubbleLeftRightIcon class="h-6 w-6 text-purple-500" />
          <span>Chats</span>
        </h2>
        <button @click="addChatModal = true"
          class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
          title="Nuevo Chat">
          <PlusIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Lista de Chats -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
        <div v-for="chat in chats" :key="chat.id" @click="seleccionarChat(chat)"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group"
          :class="[
            chatSeleccionado && chatSeleccionado.id === chat.id
              ? 'bg-gray-700 text-white border-l-4 border-blue-500 shadow-md'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-l-4 border-transparent'
          ]">
          <div class="relative">
            <img :src="chat.foto" alt="perfil"
              class="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-gray-500 transition-colors" />
            <span v-if="chat.online"
              class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline">
              <span class="font-semibold text-sm truncate">{{ chat.nombre }}</span>
              <span v-if="chat.lastTime" class="text-xs text-gray-500">{{ chat.lastTime }}</span>
            </div>
            <p class="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">{{ chat.mensaje }}</p>
          </div>

          <span v-if="chat.nuevos > 0"
            class="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            {{ chat.nuevos }}
          </span>
        </div>

        <div v-if="chats.length === 0" class="text-center py-10 px-4 text-gray-500">
          <p>No tienes chats activos.</p>
          <button @click="addChatModal = true" class="text-blue-400 text-sm hover:underline mt-2">Iniciar uno
            nuevo</button>
        </div>
      </nav>
    </aside>

    <!-- Área principal de Chat -->
    <div class="flex-1 flex flex-col bg-gray-900 min-w-0 relative"
      :class="[chatSeleccionado ? 'flex' : 'hidden md:flex']">
      <!-- Chat seleccionado -->
      <template v-if="chatSeleccionado">
        <!-- Header del Chat -->
        <header class="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-sm z-10">
          <div class="flex items-center space-x-4">
            <button @click="chatSeleccionado = null"
              class="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition">
              <ChevronLeftIcon class="h-6 w-6" />
            </button>

            <div class="flex items-center space-x-3 cursor-pointer group" @click="mostrarPerfil = !mostrarPerfil">
              <div class="relative">
                <img :src="chatSeleccionado.foto" alt="perfil"
                  class="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all" />
                <span v-if="chatSeleccionado.online"
                  class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">{{
                  chatSeleccionado.nombre }}</h2>
                <p class="text-xs text-green-400 font-medium" v-if="chatSeleccionado.online">En línea</p>
                <p class="text-xs text-gray-500" v-else>Desconectado</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button @click="makeCall" class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
              title="Llamada">
              <PhoneIcon class="w-5 h-5" />
            </button>
            <button @click="mostrarPerfil = !mostrarPerfil"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition" title="Info">
              <InformationCircleIcon class="w-5 h-5" />
            </button>
          </div>
        </header>

        <!-- Historial de mensajes -->
        <div ref="messagesContainer"
          class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-br from-gray-900 to-gray-800/50">
          <div v-for="(group, dateIndex) in groupedMessages" :key="dateIndex">
            <!-- Date Divider -->
            <div class="flex justify-center mb-4">
              <span class="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-700">
                {{ group.dateLabel }}
              </span>
            </div>

            <!-- Messages in this group -->
            <div class="space-y-2">
              <div v-for="(msg, i) in group.messages" :key="i" class="flex flex-col"
                :class="msg.sender_id == userData.id ? 'items-end' : 'items-start'">
                <div :class="[
                  'px-4 py-2.5 rounded-2xl text-sm max-w-[75%] shadow-md break-words relative group',
                  msg.sender_id == userData.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none',
                ]">
                  {{ msg.message }}
                </div>
                <span class="text-[10px] text-gray-500 mt-1 px-1">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="p-4 bg-gray-800 border-t border-gray-700">
          <div
            class="flex items-center space-x-2 bg-gray-900 p-1.5 rounded-xl border border-gray-600 focus-within:border-blue-500 transition-colors">
            <input v-model="nuevoMensaje" type="text" placeholder="Escribe un mensaje..."
              class="flex-1 bg-transparent text-white px-2 py-1 outline-none placeholder-gray-500 text-sm"
              @keyup.enter="sendMessage(chatSeleccionado.id)" />

            <button @click="sendMessage(chatSeleccionado.id)"
              class="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!nuevoMensaje.trim()">
              <PaperAirplaneIcon class="w-5 h-5 transform -rotate-45 translate-x-0.5" />
            </button>
          </div>
        </div>
      </template>

      <!-- Vista inicial cuando no hay chat seleccionado -->
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-900">
          <div class="bg-gray-800 p-6 rounded-full mb-6 relative">
            <ChatBubbleBottomCenterTextIcon class="w-20 h-20 text-gray-700" />
            <div class="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">Tus Mensajes</h3>
          <p class="max-w-md text-gray-400">Selecciona un chat de la lista para comenzar a enviar mensajes o inicia una
            nueva conversación.</p>
          <button @click="addChatModal = true"
            class="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-transform hover:-translate-y-1">
            Iniciar Nueva Conversación
          </button>
        </div>
      </template>
    </div>

    <!-- Modal: Agregar Chat -->
    <div v-if="addChatModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" @click="addChatModal = false"></div>

      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white">Iniciar nuevo chat</h3>
            <button @click="addChatModal = false" class="text-gray-400 hover:text-white transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="relative mb-4">
            <MagnifyingGlassIcon class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Buscar por nombre o correo..."
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              v-model="searchContact" />
          </div>

          <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sugerencias</h4>
          <div class="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
            <div v-for="contacto in filteredContacts" :key="contacto.email"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors group"
              @click="startChat(contacto)">
              <div class="flex items-center space-x-3">
                <img
                  :src="contacto.photo"
                  class="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              </img>
                <div>
                  <p class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{{ contacto.nombre
                  }}
                  </p>
                  <p class="text-xs text-gray-400">{{ contacto.email }}</p>
                </div>
              </div>
              <PlusIcon class="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <div v-if="filteredContacts.length === 0" class="text-gray-500 text-center py-4 text-sm">
              No se encontraron coincidencias.
            </div>
          </div>

          <div class="flex justify-end pt-4 mt-2 border-t border-gray-700">
            <button @click="addChatModal = false"
              class="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel lateral derecho de perfil -->
    <transition name="slide">
      <div v-if="mostrarPerfil && chatSeleccionado"
        class="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 p-6 flex flex-col z-30 shadow-2xl">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-lg font-bold text-white">Info. del Contacto</h3>
          <button @click="mostrarPerfil = false" class="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex flex-col items-center mb-8">
          <div class="relative mb-4">
            <img :src="chatSeleccionado.foto" alt="perfil"
              class="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-xl" />
            <span v-if="chatSeleccionado.online"
              class="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-gray-800 rounded-full"></span>
          </div>

          <h2 class="text-2xl font-bold text-white mb-1">{{ chatSeleccionado.nombre }}</h2>
          <p class="text-sm" :class="chatSeleccionado.online ? 'text-green-400' : 'text-gray-500'">
            {{ chatSeleccionado.online ? 'En Línea' : 'Última vez hoy' }}
          </p>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-700/50 p-4 rounded-xl">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo Electrónico</h4>
            <div class="flex items-center space-x-2 text-gray-300">
              <EnvelopeIcon class="w-5 h-5 text-gray-400" />
              <span>{{ chatSeleccionado.email }}</span>
            </div>
          </div>

        </div>
      </div>
    </transition>

    <!-- Backdrop for Profile Sidebar -->
    <div v-if="mostrarPerfil && chatSeleccionado" class="fixed inset-0 bg-black/50 z-20 md:hidden"
      @click="mostrarPerfil = false"></div>

    <ToastNotification ref="toastRef" />
  </div>
</template>

<script>
import socket from '@/services/socket.js'
import {
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EnvelopeIcon,
  NoSymbolIcon
} from '@heroicons/vue/24/solid'
import bannerMessages from '@/layouts/bannerMessages.vue'
import router from '@/router'
import { useRoute } from 'vue-router'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'

export default {
  components: {
    PhoneIcon,
    VideoCameraIcon,
    InformationCircleIcon,
    ToastNotification,
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleBottomCenterTextIcon,
    ChevronLeftIcon,
    PaperAirplaneIcon,
    PaperClipIcon,
    EnvelopeIcon,
    NoSymbolIcon
  },

  data() {
    return {
      userData: JSON.parse(localStorage.getItem('user')) || {},
      chats: [],

      chatSeleccionado: null,
      nuevoMensaje: '',
      mostrarPerfil: false,

      addChatModal: false,
      searchContact: '',
      friends: [],
    }
  },

  computed: {
    filteredContacts() {
      if (!this.searchContact) return this.friends
      const q = this.searchContact.toLowerCase()

      return this.friends.filter(
        (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      )
    },
    // Compute grouped messages by date
    groupedMessages() {
      if (!this.chatSeleccionado || !this.chatSeleccionado.mensajes) return [];

      const groups = {};

      this.chatSeleccionado.mensajes.forEach(msg => {
        const date = msg.created_at ? new Date(msg.created_at) : new Date();
        const dateString = date.toDateString();

        if (!groups[dateString]) {
          groups[dateString] = {
            dateLabel: this.getFriendlyDateLabel(date),
            messages: []
          };
        }
        groups[dateString].messages.push(msg);
      });

      return Object.values(groups);
    }
  },

  mounted() {
    const route = useRoute()
    this.handleOpenContactQuery(route.query)

    this.connectToUserChats()
    this.loadChats()
    this.loadFriends()
  },

  updated() {
    // Auto-scroll when view updates (e.g. new message)
    if (this.chatSeleccionado) {
      //  this.scrollToBottom() // Moved to watcher/method specific calls to avoid aggressive scrolling if reading history
    }
  },

  methods: {
    getFriendlyDateLabel(date) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    async connectToUserChats() {
      try {
        const response = await api.get('/rooms')
        const rooms = response.data.rooms
        // ... (existing logic)
        if (rooms && rooms.length > 0) {
          if (!socket.connected) {
            socket.connect()
          }

          socket.emit('initial room connection', {
            userId: this.userData.id,
            rooms: rooms,
          })

          socket.on('newMessage', (dataMessage) => {
            console.log('Nuevo mensaje recibido', dataMessage.message, dataMessage.id_chat)
            const chat = this.chats.find((c) => c.id === dataMessage.id_chat)
            if (chat) {
              chat.mensajes.push({
                message: dataMessage.message,
                sender_id: dataMessage.sender_id,
                recibido: true,
                created_at: new Date().toISOString() // Ensure date exists for sorting
              })
              // Actualizar el último mensaje en la lista
              chat.mensaje = dataMessage.message

              if (this.chatSeleccionado?.id !== chat.id) {
                chat.nuevos = (chat.nuevos || 0) + 1
              } else {
                this.scrollToBottom();
              }
            }
          })
        }
      } catch (error) {
        console.error('Error al obtener y conectar a las salas:', error)
        this.addToast('Error al conectar con los chats', 'error')
      }
    },
    async loadChats() {
      try {
        const response = await api.get('/chats')
        const temp = response.data.data
        this.chats = temp.map((u) => {
          const msgs = u.messages || []
          return {
            id: u.chat_id, // This remains the chat id for messages
            friendId: u.friend_id, // New friend id for signaling
            email: u.email,
            online: u.online,
            nombre: u.name,
            mensaje: msgs.length > 0 ? msgs[msgs.length - 1].message : 'Sin mensajes',
            nuevos: 0,
            foto: (u.visibility != 3) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",
            // Ensure messages have a date if missing, for the demo
            mensajes: msgs.map(m => ({ ...m, created_at: m.created_at || new Date().toISOString() })),
          }
        })

        console.log("los asdasdasd",this.chats  )
      } catch (error) {
        console.error('Error al cargar los chats:', error)
        this.chats = [
          {
            id: 1,
            email: 'demo@demo.com',
            online: true,
            nombre: 'Usuario Demo',
            mensaje: 'Hola, ¿cómo estás?',
            nuevos: 1,
            foto: 'https://i.pravatar.cc/150?u=1',
            mensajes: [
              { message: 'Hola', sender_id: 99, created_at: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
              { message: '¿Todo bien?', sender_id: 99, created_at: new Date().toISOString() } // Today
            ]
          }
        ]
      }
    },
    async loadFriends() {
      try {
        const response = await api.get('/listNewChat')
        this.friends = response.data.data.map((u) => ({
          id: u.id,
          nombre: u.name,
          email: u.email,
          photo: (u.visibility != 3) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",
        }))
        console.log('Amigos cargados para chatear:', this.friends)
      } catch (error) {
        console.error('Error al cargar amigos para chatear:', error.message)
      }
    },
    addToast(message, type) {
      if (this.$refs.toastRef) this.$refs.toastRef.addToast(message, type)
    },
    seleccionarChat(chat) {
      this.chatSeleccionado = chat
      this.mostrarPerfil = false;
      chat.nuevos = 0;
      this.scrollToBottom();
    },

    sendMessage(id) {
      if (!this.nuevoMensaje.trim()) return
      socket.emit('sendMessage', {
        id_chat: id,
        senderId: this.userData.id,
        message: this.nuevoMensaje,
      })

      if (this.chatSeleccionado && this.chatSeleccionado.mensajes) {
        this.chatSeleccionado.mensajes.push({
          message: this.nuevoMensaje,
          sender_id: this.userData.id,
          created_at: new Date().toISOString()
        })
        // Actualizar el último mensaje en la lista
        this.chatSeleccionado.mensaje = this.nuevoMensaje

        this.scrollToBottom();
      }
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
      router.replace({ name: 'chats' }).catch(() => { })
    },

    async startChat(contacto) {
      const existente = this.chats.find(
        (c) => c.email === contacto.email || c.nombre === contacto.nombre,
      )

      if (existente) {
        this.chatSeleccionado = existente
        this.addChatModal = false
        this.scrollToBottom();
        return
      }

      try {
        const response = await api.post(`/chat/${contacto.id}`)
        if (response.data) {
          this.connectToUserChats()
          this.loadChats()
        }
      } catch (e) {
        console.error(e);
        this.addToast('Error al iniciar chat (Simulado)', 'error')
      }
      this.addChatModal = false
    },

    makeCall() {
      if (!this.chatSeleccionado) return;
      router.push({
        name: 'call',
        params: { id: this.chatSeleccionado.friendId }, // Use the friend's user ID
        query: {
          name: this.chatSeleccionado.nombre,
          photo: this.chatSeleccionado.foto,
          incoming: 'false'
        }
      })
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
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
