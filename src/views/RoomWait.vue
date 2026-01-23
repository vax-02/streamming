<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-800">
    <div class="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      <!-- Icono -->
      <div class="flex justify-center mb-6">
        <div
          class="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Texto -->
      <h1 class="text-2xl font-semibold mb-2">Esperando autorización</h1>

      <p class="text-gray-400 mb-6">
        {{
          msg === ''
            ? 'El dueño de la reunión debe permitir tu acceso. Por favor, espera un momento.'
            : msg
        }}
      </p>

      <!-- Loader -->
      <div class="flex justify-center gap-2">
        <span class="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></span>
        <span
          class="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.15s]"
        ></span>
        <span class="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
      </div>

      <div class="flex justify-center mt-6">
        <button
          @click="cancelRequest()"
          class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import socket from '@/services/socket.js'

export default {
  name: 'RoomWait',

  data() {
    return {
      msg: '',
      txtBtn: 'Cancelar solicitud',
      userData: JSON.parse(localStorage.getItem('user')),
      roomId: this.$route.params.id,
    }
  },

  mounted() {
    socket.emit('request-join', {
      roomId: this.roomId,
      viewerData: this.userData,
    })

    socket.on('join-accepted', (data) => {
      this.$router.push({
        name: 'live-viewer',
        params: { 
          id: this.roomId, 
          idH: data.hostId, 
          idV: this.userData.id 
        },
        query: { startTime: data.startTime }
      })
    })

    socket.on('join-rejected', () => {
      this.msg = 'Tu solicitud para unirte fue rechazada'
    })
    socket.on("error-room", ()=>{
      this.msg = "La sala NO se encuentra activa"
    })
  },

  beforeUnmount() {
    socket.off('join-accepted')
    socket.off('join-rejected')
  },

  methods: {
    cancelRequest() {
      this.$router.push({ name: 'transmitions' })
    },
  },
}
</script>
