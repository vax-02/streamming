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
            'text-left px-4 py-2 hover:bg-gray-800 transition',
            currentTab === tab.id ? 'bg-gray-800 text-blue-400' : 'text-gray-300',
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

        <div v-if="filteredFriends.length" class="space-y-3">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            class="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div class="flex items-center gap-3">
              <!-- 🔹 Clic en la foto abre el modal -->
              <img
                :src="friend.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600 cursor-pointer hover:scale-105 transition"
                @click="openProfile(friend)"
              />
              <div>
                <p class="font-medium">{{ friend.name }}</p>
                <p class="text-xs" :class="friend.online ? 'text-green-400' : 'text-gray-400'">
                  {{ friend.online ? 'En línea' : 'Desconectado' }}
                </p>
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

        <p v-else class="text-gray-400">No se encontraron amigos 😅</p>
      </section>

      <!-- 📨 Sección: Solicitudes de amistad -->
      <section v-if="currentTab === 'solicitudes'">
        <h2 class="text-2xl font-semibold mb-4">Solicitudes de amistad</h2>

        <div v-if="friendRequests.length" class="space-y-3">
          <div
            v-for="request in friendRequests"
            :key="request.id"
            class="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div class="flex items-center gap-3">
              <img
                :src="request.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600"
              />
              <div>
                <p class="font-medium">{{ request.name }}</p>
                <p class="text-xs text-gray-400">{{ request.mutualFriends }} amigos en común</p>
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
    </main>

    <!-- 🟦 Modal de información del perfil -->
    <div
      v-if="showProfileModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg shadow-lg w-80 p-6 relative">
        <!-- Botón cerrar -->
        <button
          class="absolute top-2 right-3 text-gray-400 hover:text-white"
          @click="showProfileModal = false"
        >
          ✕
        </button>

        <div class="flex flex-col items-center">
          <img
            :src="selectedFriend.avatar"
            alt="avatar"
            class="w-20 h-20 rounded-full border-2 border-blue-400 mb-3"
          />
          <h3 class="text-xl font-semibold">{{ selectedFriend.name }}</h3>
          <p
            class="text-sm mb-4"
            :class="selectedFriend.online ? 'text-green-400' : 'text-gray-400'"
          >
            {{ selectedFriend.online ? 'En línea' : 'Desconectado' }}
          </p>

          <div class="text-sm text-gray-300 space-y-2 w-full">
            <p>
              <span class="font-semibold">Correo:</span>
              {{ selectedFriend.email || 'No disponible' }}
            </p>
            <p>
              <span class="font-semibold">Ciudad:</span>
              {{ selectedFriend.city || 'No especificada' }}
            </p>
            <p><span class="font-semibold">Desde:</span> {{ selectedFriend.since || '2024' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {  TrashIcon, ChatBubbleLeftIcon  } from '@heroicons/vue/24/outline'
import router from '@/router'

/* 🔹 Tabs del sidebar */
const tabs = [
  { id: 'amigos', name: 'Amigos' },
  { id: 'solicitudes', name: 'Solicitudes' },
]

const currentTab = ref('amigos')

/* 👥 Datos simulados */
const friends = ref([
  {
    id: 1,
    name: 'Laura García',
    avatar: 'https://i.pravatar.cc/100?img=6',
    online: true,
    email: 'laura.garcia@email.com',
    city: 'Madrid',
    since: '2023',
  },
  {
    id: 2,
    name: 'José Martínez',
    avatar: 'https://i.pravatar.cc/100?img=15',
    online: false,
    email: 'jose.martinez@email.com',
    city: 'Buenos Aires',
    since: '2022',
  },
  {
    id: 3,
    name: 'Sofía Fernández',
    avatar: 'https://i.pravatar.cc/100?img=12',
    online: true,
    email: 'sofia.fernandez@email.com',
    city: 'La Paz',
    since: '2024',
  },
])

const friendRequests = ref([
  {
    id: 1,
    name: 'Ana López',
    avatar: 'https://i.pravatar.cc/100?img=5',
    mutualFriends: 3,
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    avatar: 'https://i.pravatar.cc/100?img=8',
    mutualFriends: 1,
  },
])

/* 🔎 Buscador */
const searchQuery = ref('')
const filteredFriends = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return friends.value.filter((f) => f.name.toLowerCase().includes(query))
})

/* ✅ Aceptar solicitud */
const acceptRequest = (request) => {
  friendRequests.value = friendRequests.value.filter((r) => r.id !== request.id)
  friends.value.push({
    id: request.id,
    name: request.name,
    avatar: request.avatar,
    online: true,
    email: 'nuevo.amigo@email.com',
    city: 'Ciudad desconocida',
    since: '2025',
  })
}

/* ❌ Rechazar solicitud */
const declineRequest = (id) => {
  friendRequests.value = friendRequests.value.filter((r) => r.id !== id)
}

/* 🗑️ Eliminar amigo */
const removeFriend = (id) => {
  friends.value = friends.value.filter((f) => f.id !== id)
}

/* 👤 Modal de perfil */
const showProfileModal = ref(false)
const selectedFriend = ref({})

const openProfile = (friend) => {
  selectedFriend.value = friend
  showProfileModal.value = true
}

// Abrir chat con un amigo: navega a la vista de chats pasando datos por query
function chatFriend(id) {
  const friend = friends.value.find((f) => f.id === id)
  if (!friend) return
  router.push({
    name: 'chats',
    query: {
      openName: friend.name,
      openEmail: friend.email,
      openAvatar: friend.avatar,
    },
  })
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
