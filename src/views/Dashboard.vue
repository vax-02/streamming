<template>
  <div class="flex h-screen bg-gray-800 text-gray-200">
    <main class="flex-1 overflow-y-auto p-8 space-y-12">
      <section id="panel" class="space-y-6">
        <header class="flex items-center justify-between">
          <h2 class="text-3xl font-bold tracking-tight text-white">Panel de control</h2>
        </header>
        
        <div class="w-full flex justify-center bg-red">
          <DashboardPanel
            :hourly-data="hourlyMessages"
            v-if="hourlyMessages && hourlyMessages.length > 0"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
          <!-- Active Users Card -->
          <div
            class="bg-gray-900 border border-gray-700/50 p-2 md:p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 ease-out shadow-lg hover:shadow-xl"
          >
            <div
              class="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-800 mb-4"
            >
              <UserGroupIcon class="w-6 h-6 text-green-500" />
            </div>
            <p class="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
              Usuarios activos
            </p>
            <h3 class="text-2xl md:text-3xl font-extrabold text-white mt-1">{{ usersActive }}</h3>
          </div>

          <!-- Live Streams Card -->
          <div
            class="bg-gray-900 border border-gray-700/50 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 ease-out shadow-lg hover:shadow-xl"
          >
            <div
              class="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-800 mb-4"
            >
              <VideoCameraIcon class="w-6 h-6 text-red-500" />
            </div>
            <p class="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
              Streams en Vivo
            </p>
            <h3 class="text-2xl md:text-3xl font-extrabold text-white mt-1">{{ streamsActive }}</h3>
          </div>

          <!-- Messages Card -->
          <div
            class="bg-gray-900 border border-gray-700/50 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 ease-out shadow-lg hover:shadow-xl"
          >
            <div
              class="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-800 mb-4"
            >
              <ChatBubbleLeftIcon class="w-6 h-6 text-blue-400" />
            </div>
            <p class="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Mensajes de Hoy</p>
            <h3 class="text-2xl md:text-3xl font-extrabold text-white mt-1">{{ cantMessageToday }}</h3>
          </div>

          <!-- Groups Card -->
          <div
            class="bg-gray-900 border border-gray-700/50 p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300 ease-out shadow-lg hover:shadow-xl"
          >
            <div
              class="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-gray-800 mb-4"
            >
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-green-400" />
            </div>
            <p class="text-sm font-medium text-gray-400 uppercase tracking-wider">Grupos Activos</p>
            <h3 class="text-3xl font-extrabold text-white mt-1">{{ groupsActive }}</h3>
          </div>
        </div>
      </section>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Live Streams Section -->
        <section id="streams" class="lg:col-span-2 space-y-6">
          <h2 class="text-2xl font-bold text-white mb-4">Transmisiones en Vivo</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
            <div
              v-for="(stream, index) in streamsInLive"
              :key="index"
              @click="confirmJoinStream(stream)"
              class="group bg-gray-900 border border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95"
            >
              <div class="relative aspect-video bg-gray-700 overflow-hidden">
                <div
                  class="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform duration-500"
                >
                  <VideoCameraIcon class="w-12 h-12 opacity-50" />
                </div>
                <div
                  class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse"
                >
                  EN VIVO
                </div>
              </div>
              <div class="p-5">
                <h3
                  class="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors"
                >
                  {{ stream.name }}
                </h3>
                <p class="text-sm text-gray-400 flex items-center">
                  <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {{ 'Host: ' + stream.user }}
                </p>
              </div>
            </div>

            <div
              v-if="streamsInLive.length === 0"
              class="col-span-full flex flex-col items-center justify-center py-6 text-gray-500 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700"
            >
              <VideoCameraIcon class="w-10 h-10 mb-2 opacity-40" />
              <p class="text-base font-medium">No hay transmisiones en vivo disponibles</p>
            </div>
          </div>
        </section>

        <!-- Groups Section -->
        <section id="grupos" class="lg:col-span-2 space-y-6">
          <h2 class="text-2xl font-bold text-white mb-4">Grupos</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="group in allGroups"
              :key="group.id"
              @click="openGroupDetail(group.id)"
              class="bg-gray-900 border border-gray-700/50 p-5 rounded-2xl flex items-center gap-4 hover:bg-gray-800 transition-all cursor-pointer group active:scale-95 shadow-sm hover:shadow-xl"
            >
              <div
                class="w-16 h-16 rounded-2xl overflow-hidden bg-blue-600/10 flex-shrink-0 border border-gray-700/50"
              >
                <img
                  :src="group.photo || getGroupAvatar(group.name)"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate"
                >
                  {{ group.name }}
                </h3>
                <p class="text-sm text-gray-400 mt-1 truncate">{{ group.description }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="block text-2xl font-bold text-white">{{ group.memberCount }}</span>
                <span class="text-[10px] text-gray-500 uppercase font-bold tracking-tighter"
                  >Miembros</span
                >
              </div>
            </div>

            <div
              v-if="allGroups.length === 0"
              class="col-span-full flex flex-col items-center justify-center py-6 text-gray-500 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700"
            >
              <ChatBubbleLeftRightIcon class="w-10 h-10 mb-2 opacity-40" />
              <p class="text-base font-medium">No hay grupos disponibles</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Group Detail Modal -->
    <Transition name="modal">
      <div
        v-show="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div
          class="bg-gray-900 border border-gray-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          <!-- Modal Header -->
          <header
            class="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl overflow-hidden bg-blue-600/20 flex items-center justify-center text-blue-400 text-2xl flex-shrink-0 border border-blue-500/20"
              >
                <img
                  :src="selectedGroupData?.photo || getGroupAvatar(selectedGroupData?.name)"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="min-w-0">
                <h2 class="text-2xl font-bold text-white truncate">
                  {{ selectedGroupData?.name }}
                </h2>
                <p class="text-sm text-gray-400 truncate">{{ selectedGroupData?.description }}</p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <XMarkIcon class="w-8 h-8" />
            </button>
          </header>

          <div class="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
            <!-- Loading Overlay -->
            <div
              v-if="loadingGroupDetails"
              class="absolute inset-0 z-10 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div
                class="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"
              ></div>
              <p class="text-blue-400 font-medium animate-pulse">Cargando detalles...</p>
            </div>

            <!-- Messages Column -->
            <div class="flex-1 p-6 overflow-y-auto border-r border-gray-800 space-y-4">
              <h3 class="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                <ChatBubbleLeftRightIcon class="w-5 h-5 text-blue-400" />
                Mensajes del grupo
              </h3>

              <div
                v-if="
                  !loadingGroupDetails &&
                  (!selectedGroupData?.messages || selectedGroupData.messages.length === 0)
                "
                class="h-64 flex flex-col items-center justify-center text-gray-500 italic"
              >
                <ChatBubbleBottomCenterTextIcon class="w-12 h-12 mb-2 opacity-20" />
                No hay mensajes aún
              </div>

              <div v-for="(group, date) in groupedMessages" :key="date" class="space-y-4">
                <div class="flex items-center gap-4 my-6">
                  <div class="flex-1 h-px bg-gray-800"></div>
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{
                    date
                  }}</span>
                  <div class="flex-1 h-px bg-gray-800"></div>
                </div>

                <div
                  v-for="msg in group"
                  :key="msg.id"
                  class="flex gap-4 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30 hover:bg-gray-800/60 transition-colors"
                >
                  <img
                    :src="msg.userPhoto || 'https://via.placeholder.com/40'"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <div class="flex items-baseline justify-between mb-1">
                      <span class="font-bold text-white text-sm">{{ msg.userName }}</span>
                      <span class="text-[10px] text-gray-500">{{
                        formatDate(msg.created_at)
                      }}</span>
                    </div>
                    <p class="text-gray-300 text-sm leading-relaxed">{{ msg.message }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Members Column -->
            <div class="w-full lg:w-72 p-6 overflow-y-auto bg-gray-900/30">
              <h3 class="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <UserGroupIcon class="w-5 h-5 text-green-400" />
                Miembros ({{ selectedGroupData?.members?.length || 0 }})
              </h3>
              <div class="space-y-3">
                <div
                  v-for="member in selectedGroupData?.members"
                  :key="member.id"
                  class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <img
                    :src="member.photo || 'https://via.placeholder.com/32'"
                    class="w-8 h-8 rounded-full border border-gray-700 object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 overflow-hidden">
                      <span class="text-sm font-medium text-gray-300 truncate">{{
                        member.name
                      }}</span>
                      <span
                        v-if="member.admin"
                        class="px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-[9px] font-bold uppercase border border-yellow-500/20 whitespace-nowrap"
                      >
                        Admin
                      </span>
                    </div>
                    <p v-if="member.admin" class="text-[10px] text-gray-500 truncate lowercase">
                      {{ member.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Stream Confirmation Modal -->
    <Transition name="modal">
      <div
        v-show="showStreamModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <div
          class="bg-gray-900 border border-gray-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
        >
          <div
            class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <VideoCameraIcon class="w-10 h-10 text-blue-500 font-bold" />
          </div>

          <h3 class="text-2xl font-bold text-white mb-2">¿Ingresar a la reunión?</h3>
          <p class="text-gray-400 mb-8 leading-relaxed">
            Estás a punto de unirte a
            <span class="text-white font-semibold">"{{ selectedStream?.name }}"</span>. ¿Deseas
            continuar?
          </p>

          <div class="grid grid-cols-2 gap-4">
            <button
              @click="showStreamModal = false"
              class="px-6 py-3 rounded-2xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-all border border-gray-700"
            >
              Cancelar
            </button>
            <button
              @click="joinStream(selectedStream.id)"
              class="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
            >
              Unirse ahora
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script>
import socket from '@/services/socket.js'
import api from '@/services/api.js'
import DashboardPanel from '@/views/DashboardPanel.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import {
  VideoCameraIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/vue/24/solid'
export default {
  components: {
    MainLayout,
    DashboardPanel,
    VideoCameraIcon,
    UserGroupIcon,
    ChatBubbleLeftIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    ChatBubbleBottomCenterTextIcon,
  },

  async mounted() {
    socket.on('update-connections', () => {
      this.activeUsers()
    })
    socket.on('update-in-transmision', () => {
      this.activeStreams()
    })
    socket.on('update-report-messages', () => {
      this.messageToday()
    })
    socket.on('update-report-groups', () => {
      this.fetchActiveGroups()
      this.fetchAllGroups()
    })

    this.activeUsers()
    this.activeStreams()
    this.messageToday()
    this.fetchActiveGroups()
    this.fetchAllGroups()

    // Nuevos listeners
    socket.on('update-hourly-stats', () => {
      this.fetchHourlyStats()
    })

    // Cargar datos iniciales
    await this.fetchHourlyStats()
    console.log('Datos iniciales de horas:', this.hourlyMessages)
  },
  data() {
    return {
      hourlyMessages: [],

      usersActive: 0,
      streamsActive: 0,
      cantMessageToday: 0,
      groupsActive: 0,
      streamsInLive: [],
      allGroups: [],
      showModal: false,
      selectedGroupData: null,
      loadingGroupDetails: false,
      showStreamModal: false,
      selectedStream: null,
    }
  },
  computed: {
    groupedMessages() {
      if (!this.selectedGroupData?.messages) return {}

      const groups = {}
      this.selectedGroupData.messages.forEach((msg) => {
        const dateKey = this.getDateKey(msg.created_at)
        if (!groups[dateKey]) groups[dateKey] = []
        groups[dateKey].push(msg)
      })
      return groups
    },
  },
  methods: {
    async fetchHourlyStats() {
      try {
        const response = await api.get('/report/messages/hourly')
        this.hourlyMessages = response.data.data || []
      } catch (error) {
        console.error('Error fetching hourly stats:', error)
        // Datos de ejemplo para desarrollo
        this.hourlyMessages = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50),
        }))
      }
    },

    confirmJoinStream(stream) {
      this.selectedStream = stream
      this.showStreamModal = true
    },
    joinStream(id) {
      this.showStreamModal = false
      this.$router.push({
        name: 'request-live',
        params: { id: id },
      })
    },
    getGroupAvatar(name) {
      if (!name) return ''
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`
    },
    getDateKey(dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer'
      } else {
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        })
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    async fetchActiveGroups() {
      try {
        const response = await api.get('/report/groups/active')
        this.groupsActive = response.data.data.cant
      } catch (error) {
        console.error('Error fetching active groups:', error)
      }
    },
    async fetchAllGroups() {
      try {
        const response = await api.get('/all-groups')
        this.allGroups = response.data.data
      } catch (error) {
        console.error('Error fetching all groups:', error)
      }
    },
    async openGroupDetail(groupId) {
      // Find basic info immediately
      const basicInfo = this.allGroups.find((g) => g.id === groupId)

      // Initialize with basic info and show modal instantly
      this.selectedGroupData = {
        name: basicInfo?.name || 'Cargando...',
        description: basicInfo?.description || '',
        photo: basicInfo?.photo || null,
        messages: [],
        members: [],
      }
      this.showModal = true
      this.loadingGroupDetails = true

      try {
        const response = await api.get(`/group-details/${groupId}`)
        // Update with full data
        this.selectedGroupData = {
          ...this.selectedGroupData,
          ...response.data.data,
        }
      } catch (error) {
        console.error('Error fetching group details:', error)
      } finally {
        this.loadingGroupDetails = false
      }
    },
    closeModal() {
      this.showModal = false
      this.selectedGroupData = null
    },
    async activeUsers() {
      try {
        const response = await api.get('/report/user/active')
        this.usersActive = response.data.data.active_user_count
      } catch (error) {
        console.error('Error fetching active users:', error)
        return 0
      }
    },
    async activeStreams() {
      try {
        const response = await api.get('/report/transmision/active')
        this.streamsInLive = response.data.data
        console.log(this.streamsInLive)
        this.streamsActive = response.data.count
      } catch (error) {
        console.error('Error fetching active users:', error)
        return 0
      }
    },
    async messageToday() {
      try {
        const response = await api.get('/report/messages')
        this.cantMessageToday = response.data.data.cant
      } catch (error) {
        console.log('error', error)
        return 0
      }
    },
  },
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-gray-900 {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .bg-gray-900 {
  transform: scale(0.9) translateY(20px);
}

/* Custom scrollbar for premium feel */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
