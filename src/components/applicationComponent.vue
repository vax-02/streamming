<template>

<div class="flex flex-col h-screen bg-gray-900 text-white font-sans">
    <!-- Header superior con Pestañas -->
    <header class="bg-gray-800 border-b border-gray-700 shadow-xl z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between py-4 gap-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-yellow-500/10 rounded-lg">
                <ClipboardDocumentCheckIcon class="h-6 w-6 text-yellow-500" />
            </div>
            <span class="text-xl font-bold tracking-wide">Solicitudes</span>
          </div>
          
          <nav class="flex items-center bg-gray-900/50 p-1 rounded-2xl border border-gray-700 overflow-x-auto custom-scrollbar no-scrollbar">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold whitespace-nowrap',
                currentTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              ]"
            >
              <component :is="tab.icon" class="h-4 w-4" />
              <span class="hidden md:block">{{ tab.name }}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
        <header class="mb-8 pb-4 border-b border-gray-800 flex justify-between items-end">
            <div>
              <h1 class="text-md md:text-2xl font-bold text-white">{{ getTabTitle(currentTab) }}</h1>
            </div>
        </header>

        <!-- Section: Amigos -->
        <section v-if="currentTab === 'amigos'" class="space-y-6">
            <div class="flex justify-between items-center bg-gray-800 p-2 md:p-4 rounded-xl border border-gray-700">
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Buscar en mis amigos..."
                    class="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                />
            </div>
            
             <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
                 <div v-for="n in 4" :key="n" class="bg-gray-800 p-1 md:p-4 rounded-xl border border-gray-700 animate-pulse flex items-center space-x-4">
                     <div class="w-6 h-6 md:w-12 md:h-12 bg-gray-700 rounded-full"></div>
                     <div class="flex-1 space-y-2">
                         <div class="h-4 bg-gray-700 rounded w-1/3"></div>
                         <div class="h-3 bg-gray-700 rounded w-1/2"></div>
                     </div>
                 </div>
             </div>

            <div v-else-if="filteredFriends.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                    v-for="friend in filteredFriends"
                    :key="friend.id"
                    class="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:bg-gray-750 transition-colors shadow-sm"
                >
                    <div class="flex items-center space-x-3 overflow-hidden">
                        <div class="relative">
                            <img :src="friend.avatar" class="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
                            <div v-if="friend.view_online" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800" :class="friend.online ? 'bg-green-500' : 'bg-gray-500'"></div>
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-bold text-white truncate">{{ friend.name }}</h3>
                            <p class="text-xs text-gray-400 truncate">{{ friend.email }}</p>
                            <p class="text-[10px] mt-0.5" :class="friend.online ? 'text-green-400' : 'text-gray-500'">{{ friend.online ? 'En línea' : 'Desconectado' }}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 flex-shrink-0">
                        <button
                            @click="chatFriend(friend.id)"
                            class="p-2 rounded-lg bg-gray-700 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                            title="Chat"
                        >
                            <ChatBubbleLeftIcon class="w-5 h-5" />
                        </button>
                        <button
                             @click="removeFriend(friend.id)"
                            class="p-2 rounded-lg bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                            title="Eliminar amigo"
                        >
                            <TrashIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div v-else class="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <UsersIcon class="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p class="text-gray-400">No se encontraron amigos conexos con tu búsqueda.</p>
            </div>
        </section>

        <!-- Section: Solicitudes (Recibidas) -->
        <section v-if="currentTab === 'solicitudes'" class="space-y-4">
             <div v-if="friendRequests.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="request in friendRequests"
                    :key="request.id"
                    class="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div class="flex items-center space-x-3 w-full sm:w-auto">
                        <img :src="request.avatar" class="w-12 h-12 rounded-full object-cover border border-gray-600" />
                        <div>
                             <h3 class="font-bold text-white">{{ request.name }}</h3>
                             <p class="text-xs text-gray-400">{{ request.email || 'Usuario' }}</p>
                             <span class="text-xs text-blue-400 mt-1 block">Quiere conectar contigo</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2 w-full sm:w-auto">
                         <button
                            @click="acceptRequest(request)"
                            class="flex-1 sm:flex-none flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <CheckIcon class="w-4 h-4" />
                            <span>Aceptar</span>
                          </button>
                           <button
                             @click="declineRequest(request.id)"
                            class="flex-1 sm:flex-none flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <XMarkIcon class="w-4 h-4" />
                            <span>Rechazar</span>
                          </button>
                    </div>
                </div>
             </div>
              <div v-else class="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <InboxIcon class="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p class="text-gray-400">No tienes solicitudes de amistad pendientes.</p>
            </div>
        </section>

         <!-- Section: Nuevos (Explorar) -->
        <section v-if="currentTab === 'nuevos'" class="space-y-6">
             <div class="flex justify-between items-center bg-gray-800 p-2 md:p-4 rounded-xl border border-gray-700">
                <input
                    type="text"
                    v-model="searchQuery2"
                    placeholder="Buscar personas..."
                    class="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                />
            </div>
            
            <div v-if="filteredFriends2.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div
                    v-for="user in filteredFriends2"
                    :key="user.id"
                    class="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:bg-gray-750 transition-colors"
                >
                    <div class="flex items-center space-x-3 overflow-hidden">
                        <img :src="user.avatar" class="w-10 h-10 rounded-full object-cover border border-gray-600" />
                         <div class="min-w-0">
                             <h3 class="font-bold text-white text-sm truncate">{{ user.name }}</h3>
                             <p class="text-xs text-gray-400 truncate">{{ user.email }}</p>
                        </div>
                    </div>
                    
                    <button
                        @click="sendRequest(user.id)"
                        class="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm flex-shrink-0"
                    >
                        <UserPlusIcon class="w-4 h-4" />
                        <span>Añadir</span>
                    </button>
                </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
                <p>No se encontraron resultados para tu búsqueda.</p>
            </div>
        </section>
        
        <!-- Section: Mis Solicitudes (Enviadas) -->
        <section v-if="currentTab === 'solicitudesEnvadas'" class="space-y-4">
            <div v-if="myRequests.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div
                    v-for="req in myRequests"
                    :key="req.id"
                    class="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-center justify-between"
                >
                    <div class="flex items-center space-x-3 overflow-hidden">
                        <img :src="req.avatar" class="w-10 h-10 rounded-full object-cover border border-gray-600 opacity-75" />
                        <div class="min-w-0">
                             <h3 class="font-bold text-gray-300 text-sm truncate">{{ req.name }}</h3>
                             <p class="text-xs text-gray-500 truncate">{{ req.email }}</p>
                        </div>
                    </div>
                    
                    <span 
                        class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border"
                        :class="{
                            'bg-blue-900/50 text-blue-300 border-blue-800': req.status === 1,
                            'bg-green-900/50 text-green-300 border-green-800': req.status === 2,
                            'bg-red-900/50 text-red-300 border-red-800': req.status !== 1 && req.status !== 2
                        }"
                    >
                         {{ req.status === 1 ? 'Enviada' : (req.status === 2 ? 'Aceptada' : 'Rechazada') }}
                    </span>
                 </div>
            </div>
             <div v-else class="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <PaperAirplaneIcon class="w-12 h-12 mx-auto text-gray-600 mb-3 transform rotate-[-45deg]" />
                <p class="text-gray-400">No has enviado ninguna solicitud recientemente.</p>
            </div>
        </section>
        
      </div>
    </div>
    
    <ToastNotification ref="toast" />
  </div>
</template>

<script>
import { 
  ChatBubbleLeftIcon, 
  UserPlusIcon, 
  TrashIcon, 
  ClipboardDocumentCheckIcon, 
  UsersIcon, 
  InboxArrowDownIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
  InboxIcon
} from '@heroicons/vue/24/solid'
import router from '@/router'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'

export default {
  name: 'FriendsComponent',

  components: {
    UserPlusIcon,
    ChatBubbleLeftIcon,
    TrashIcon,
    ClipboardDocumentCheckIcon,
    UsersIcon,
    InboxArrowDownIcon,
    PaperAirplaneIcon,
    CheckIcon,
    XMarkIcon,
    InboxIcon,
    ToastNotification,
  },

  data() {
    return {
      loading :true,
      tabs: [
        { id: 'amigos', name: 'Amigos', icon: 'UsersIcon' },
        { id: 'solicitudes', name: 'Solicitudes', icon: 'InboxArrowDownIcon' },
        { id: 'nuevos', name: 'Nuevos', icon: 'UserPlusIcon' },
        { id: 'solicitudesEnvadas', name: 'Enviadas', icon: 'PaperAirplaneIcon' },
      ],
      currentTab: 'amigos',
      friends: [],
      newFriends: [],
      friendRequests: [],
      myRequests: [],
      searchQuery: '',
      searchQuery2: '',
      selectedFriend: {},
    }
  },

  computed: {
    filteredFriends() {
      const query = this.searchQuery.toLowerCase()
      return this.friends.filter((f) => f.name.toLowerCase().includes(query))
    },
    filteredFriends2() {
      const query = this.searchQuery2.toLowerCase()
      return this.newFriends.filter((f) => f.name.toLowerCase().includes(query))
    },
  },
  mounted() {
    this.loadFriends()
    this.loadRequests()
    this.loadNewFriends()
    this.allMyRequests()
  },
  methods: {
    getTabTitle(id) {
        const titles = {
            'amigos': 'Mis Amigos',
            'solicitudes': 'Solicitudes Recibidas',
            'nuevos': 'Descubrir Personas',
            'solicitudesEnvadas': 'Solicitudes Enviadas'
        }
        return titles[id] || 'Gestor de Amistades';
    },
    async allMyRequests() {
      try {
        const response = await api.get('/myRequests')
        const temp = response.data.data
        this.myRequests = temp.map((u) => ({
          id: u.id,
          name: u.name,
          avatar: (u.visibility != 3) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",

          email: u.email,
          status: u.status_r,
        }))
      } catch (error) {
        console.log('Error al cargar solicitudes:', error)
      }
    },
    async loadFriends() {
      try {
        const response = await api.get('/friends')
        const temp = response.data.data
        console.log("friends",response.data.data)
        this.friends = temp.map((u) => ({
          id: u.id,
          name: u.name,
          avatar: (u.visibility != 3) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",
          email: u.email,
          online: u.online,
          view_online: u.view_online,
          visibility : u.visibility
        }))
        this.loading = false
      } catch (error) {
        
      }
    },
    async loadRequests() {
      try {
        const response = await api.get('/requests')
        const temp = response.data.data
        this.friendRequests = temp.map((u) => ({
          id: u.id,
          name: u.name,
          avatar:(u.visibility == 1) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",
          email: u.email,
        }))
      } catch (error) {
        console.error('Error al cargar solicitudes de amistad:', error)
      }
    },

    async loadNewFriends() {
      try {
        const response = await api.get('/new-friends')
        const temp = response.data.data
        console.log('Nuevos amigos:', temp)
        this.newFriends = temp.map((u) => ({
          id: u.id,
          name: u.name,
          avatar:(u.visibility == 1) ? u.photo : "https://ui-avatars.com/api/?name=?&background=000&color=fff",
          email: u.email,
          online: u.online,
        }))
      } catch (error) {
        console.error('Error al cargar nuevos de amistad:', error)
      }
    },

    async acceptRequest(request) {
      try {
        const response = await api.post(`/requests/accept`, { id: request.id })
        this.loadFriends()
        this.friendRequests = this.friendRequests.filter((r) => r.id !== request.id)
        this.addToast('Solicitud aceptada', 'success')
      } catch (error) {
        this.addToast('Error al aceptar solicitud', 'error')
      }
    },

    async declineRequest(id) {
      try {
        const response = await api.post(`/requests/deny`, { id: id })
        this.friendRequests = this.friendRequests.filter((r) => r.id !== id)
        this.addToast('Solicitud rechazada', 'info')
      } catch (error) {
        this.addToast('Error al rechazar solicitud', 'error')
      }
    },

    async sendRequest(id) {
      try {
        const response = await api.post('/send-request/' + id)
        this.loadNewFriends()
        this.allMyRequests()
        this.addToast('Se envió la solicitud', 'success')
      } catch (error) {
        this.addToast('Error al enviar solicitud', 'error')
      }
    },
    removeFriend(id) {

      try {
        const response = api.delete(`/friend/${id}`)
        if (response.data) {
          alert('Amigo eliminado exitosamente')
          this.loadFriends()
        } else {
          this.addToast('Error al eliminar el amigo', 'error')
        }
      } catch (e) {
        console.log(e.message())
          this.addToast('Error al eliminar el amigo', 'error')
      }
    },
    async chatFriend(id) {
      try {
        const response = await api.post(`/chat/${id}`)
        if (response.data) {
          router.push({
            name: 'chats',
          })
        } else {
          this.addToast('Error al iniciar el chat', 'error')
        }
      } catch (e) {
        //alert('Error al iniciar el chat ' + e)
      }
    },
    addToast(message, type = 'info', duration = 3000) {
      this.$refs.toast.addToast(message, type, duration)
    },
  },
}
</script>

<style scoped>
/* Discord-like color palette tweaks */
.bg-gray-850 {
  background-color: #1e1f22;
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
</style>
