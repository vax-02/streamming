<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Sidebar -->
    <aside class="w-48 bg-gray-850 border-r border-gray-800 flex flex-col">
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

    <!-- Contenido principal -->
    <main class="flex-1 p-6 overflow-y-auto">
      <!-- Sección: Lista de amigos -->
      <section v-if="currentTab === 'amigos'">
        <h2 class="text-2xl font-semibold mb-4">Tus amigos</h2>

        <div v-if="friends.length" class="space-y-3">
          <div
            v-for="friend in friends"
            :key="friend.id"
            class="flex items-center justify-between bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition"
          >
            <div class="flex items-center gap-3">
              <img
                :src="friend.avatar"
                alt="avatar"
                class="w-10 h-10 rounded-full border border-gray-600"
              />
              <div>
                <p class="font-medium">{{ friend.name }}</p>
                <p
                  class="text-xs"
                  :class="friend.online ? 'text-green-400' : 'text-gray-400'"
                >
                  {{ friend.online ? 'En línea' : 'Desconectado' }}
                </p>
              </div>
            </div>
            <button
              class="text-red-400 hover:text-red-500 text-sm"
              @click="removeFriend(friend.id)"
            >
              Eliminar
            </button>
          </div>
        </div>

        <p v-else class="text-gray-400">Aún no tienes amigos agregados 😅</p>
      </section>

      <!-- Sección: Solicitudes de amistad -->
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
                <p class="text-xs text-gray-400">
                  {{ request.mutualFriends }} amigos en común
                </p>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
  },
  {
    id: 2,
    name: 'José Martínez',
    avatar: 'https://i.pravatar.cc/100?img=15',
    online: false,
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

/* ✅ Aceptar solicitud */
const acceptRequest = (request) => {
  friendRequests.value = friendRequests.value.filter((r) => r.id !== request.id)
  friends.value.push({
    id: request.id,
    name: request.name,
    avatar: request.avatar,
    online: true,
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
