<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Sidebar -->
    <aside class="w-48 bg-gray-800 border-r border-gray-800 flex flex-col">
      <h2 class="text-lg font-bold p-4 border-b border-gray-800">Amigos</h2>
      <nav class="flex flex-col">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          :class="[
            'text-left px-4 py-2 transition-all duration-200 border-l-4',
            currentTab === tab.id
              ? 'bg-gray-700 text-white border-blue-500'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent',
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </aside>

    <main class="flex-1 p-6 overflow-y-auto">
      <section v-if="currentTab === 'amigos'">
        <h2 class="text-2xl font-semibold mb-4">Tus amigos</h2>

        <div class="mb-4">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar amigo..."
            class="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
       
        <div v-if="loading" v-for="n in 5" :key="n" class="flex items-center justify-between bg-gray-800 p-3 rounded-lg m-3 ">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
        <div class="flex flex-col gap-1">
          <div class="h-4 w-32 bg-gray-700 rounded animate-pulse"></div> <!-- Nombre -->
          <div class="h-3 w-48 bg-gray-700 rounded animate-pulse"></div> <!-- Email -->
        </div>
      </div>
      <div class="flex gap-2">
        <div class="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div> <!-- Trash -->
      </div>
    </div>
    
    <div v-if="filteredFriends.length" >
        <div
        v-for="friend in filteredFriends"
        :key="friend.id"
        class="flex items-center justify-between bg-gray-800 p-2 rounded-lg m-3 hover:bg-gray-700 transition">          
            <div class="flex items-center gap-3">
              <div>

                <img
                :src="friend.avatar"
                alt="X"
                class="w-10 h-10 rounded-full border border-gray-600 cursor-pointer hover:scale-105 transition"
                />
              
                <div v-if="friend.view_online">
                  <p class="text-xs" :class="friend.online ? 'text-green-400' : 'text-gray-400'">
                    {{ friend.online ? 'En línea' : 'Inactivo' }}
                  </p>
                </div>
                <div v-else>
                  <p class="text-xs text-gray-400 text-center">
                    ---
                  </p>
                </div>
              </div>
              <div>
                <p class="font-medium font-bold">{{ friend.email }}</p>
                <span class="text-xs text-gray-300">
                  {{ friend.name }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="text-green-400 hover:text-green-500 text-sm"
                @click="chatFriend(friend.id)"
              >
                <ChatBubbleLeftIcon class="h-6 w-6 text-green-700" />
              </button>

              <button
                class="text-red-400 hover:text-red-500 text-sm"
                @click="removeFriend(friend.id)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-400">No se encontraron amigos</p>
      </section>

      <section v-if="currentTab === 'solicitudes'">
        <h2 class="text-2xl font-semibold mb-4">Solicitudes de amistad</h2>
        <div v-if="friendRequests.length" class="space-y-3">
          <div
            v-for="request in friendRequests"
            :key="request.id"class="flex items-center justify-between bg-gray-800 p-3 rounded-lg m-3 hover:bg-gray-700 transition
hover:bg-gray-700 transition">
            <div class="flex items-center gap-3">
              <img
                :src="request.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600"
              />
              <div>
                <p class="font-medium">{{ request.name }}</p>
                <span> correo: {{ request.email || 'No disponible' }} </span>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="acceptRequest(request)"
                class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
              >
                Aceptar
              </button>
              <button
                @click="declineRequest(request.id)"
                class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-400">No tienes solicitudes pendientes 💤</p>
      </section>

      <section v-if="currentTab === 'nuevos'">
        <h2 class="text-2xl font-semibold mb-4">Nuevos amigos</h2>

        <div class="mb-4">
          <input
            type="text"
            v-model="searchQuery2"
            placeholder="Buscar amigo..."
            class="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="filteredFriends2.length" class="space-y-3">
          <div
            v-for="newFriends in filteredFriends2"
            :key="newFriends.id"
            class="flex items-center justify-between bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition"
          >
            <div class="flex items-center gap-3">
              <!-- 🔹 Clic en la foto abre el modal -->
              <img
                :src="newFriends.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600 cursor-pointer hover:scale-105 transition"
              />
              <div>
                <p class="font-medium">{{ newFriends.name }}</p>
                <span> {{ newFriends.email || 'No disponible' }} </span>
              </div>
            </div>

            <div class="flex gap-2 text-center">
              <button
                class="text-blue-400 hover:text-blue-500 text-sm flex items-center justify-center gap-1"
                @click="sendRequest(newFriends.id)"
              >
                <UserPlusIcon class="w-5 h-5" />
                <span>Enviar solicitud</span>
              </button>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-400">No se encontro</p>
      </section>

      <section v-if="currentTab === 'solicitudesEnvadas'">
        <h2 class="text-2xl font-semibold mb-4">Mis solicitudes</h2>
        <div v-if="myRequests.length" class="space-y-3">
          <div
            v-for="friend in myRequests"
            :key="friend.id"
            class="flex items-center justify-between bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition"
          >
            <div class="flex items-center gap-3">
              <img
                :src="friend.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600 cursor-pointer hover:scale-105 transition"
              />
              <div>
                <p class="font-medium">{{ friend.name }}</p>
                <span> correo: {{ friend.email || 'No disponible' }} </span>
              </div>
            </div>

            <div class="flex gap-2 text-center">
              <button
                class="text-blue-400 hover:text-blue-500 text-sm flex items-center justify-center gap-1"
              >
                <div class="flex items-center justify-center gap-2">
                  <UserPlusIcon
                    class="w-5 h-5"
                    :class="{
                      'text-blue-500': friend.status === 1, // Solicitud enviada
                      'text-green-500': friend.status === 2, // Aceptada
                      'text-red-500': friend.status !== 1 && friend.status !== 2, // Rechazada u otro estado
                    }"
                  />

                  <p v-if="friend.status === 1" class="text-blue-500">S. Enviada</p>
                  <p v-else-if="friend.status === 2" class="text-green-500">S. Aceptada</p>
                  <p v-else class="text-red-500">Rechazada</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-400">No se encontro</p>
      </section>
    </main>
    <ToastNotification ref="toast" />
  </div>
</template>

<script>
import { ChatBubbleLeftIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import router from '@/router'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'

export default {
  name: 'FriendsComponent',

  components: {
    UserPlusIcon,
    ChatBubbleLeftIcon,
    ToastNotification,
  },

  data() {
    return {
      loading :true,
      tabs: [
        { id: 'amigos', name: 'Amigos' },
        { id: 'solicitudes', name: 'Solicitudes' },
        { id: 'nuevos', name: 'Nuevos' },
        { id: 'solicitudesEnvadas', name: 'Mis solicitudes' },
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
        const response = api.delete(`friend/${id}`)
        if (response.data) {
          alert('Amigo eliminado exitosamente')
          this.loadFriends()
        } else {
          alert('Error al eliminar el amigo')
        }
      } catch (e) {
        alert('Error al eliminar amigo ' + e)
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
