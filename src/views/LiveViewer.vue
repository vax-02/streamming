<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Panel central: video principal y controles -->

    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video
          ref="remoteVideo"
          autoplay
          playsinline
          class="w-full h-full object-cover rounded-xl"
        ></video>
        <div
          class="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-full flex items-center space-x-2 text-sm font-semibold"
        >
          <span>{{ tiempoFormateado }}</span>
        </div>

        <!-- Contador de participantes -->
        <div
          class="absolute top-3 right-3 bg-blue-600 px-3 py-1 rounded-full flex space-x-2 text-sm font-semibold"
        >
          <span class="flex items-center space-x-1">
            <EyeIcon class="w-5 h-5" /><span>{{ participantes.length }}</span>
          </span>
        </div>

        <!--  Tarjeta del perfil actual (mini video o imagen) -->
        <div
          class="absolute bottom-3 right-3 bg-gray-800 rounded-xl shadow-lg p-2 flex flex-col items-center w-40 h-28 border border-gray-600"
        >
          <!-- Imagen o video del usuario -->
          <div class="relative w-full h-full rounded-lg overflow-hidden">
            <video
              v-if="camaraAct"
              ref="modalVideoRef"
              autoplay
              muted
              class="w-full h-full bg-black rounded-lg"
            ></video>
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
            >
              <UserCircleIcon class="w-14 h-14 text-white-400" />
            </div>
          </div>

          <!-- Nombre -->
          <span class="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
            Tú
          </span>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex justify-center items-center space-x-3 mb-2">
        <button
          @click="toggleMic"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            micAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
          ]"
        >
          <MicrophoneIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="toggleCamara"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            camaraAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
          ]"
        >
          <template v-if="camaraAct">
            <VideoCameraIcon class="w-6 h-6 text-white" />
          </template>
          <template v-else>
            <VideoCameraSlashIcon class="w-6 h-6 text-white" />
          </template>
        </button>

        <button
          @click="handleEndStream"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
          title="Salir"
        >
          <PowerIcon class="w-6 h-6 text-red-500" />
        </button>
      </div>
    </div>

    <!-- Cuadrícula de Participantes (Abajo del video principal) -->
    <div v-if="participantes.length > 0" class="mt-4 pb-4 px-4 overflow-hidden">
      <h3
        class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2"
      >
        <UserGroupIcon class="w-4 h-4 text-blue-400" />
        Participantes Activos
      </h3>
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto custom-scrollbar max-h-60 p-1"
      >
        <div
          v-for="p in participantes"
          :key="p.socketId || p.idSocket"
          class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group aspect-video"
        >
          <!-- Video del participante -->
          <video
            :id="'remote-video-' + (p.socketId || p.idSocket)"
            autoplay
            playsinline
            class="w-full h-full object-cover bg-black"
          ></video>

          <!-- Overlay con nombre y estado -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white text-left"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-medium truncate">{{ p.name || p.email }}</span>

              <!-- Indicador de Audio (Visual Simplificado) -->
              <div class="flex items-end gap-0.5 h-3">
                <div class="w-1 bg-blue-400 rounded-full h-1"></div>
                <div class="w-1 bg-blue-400 rounded-full h-2"></div>
                <div class="w-1 bg-blue-400 rounded-full h-1.5"></div>
              </div>
            </div>
          </div>

          <!-- Avatar si no hay video -->
          <div
            v-if="!p.hasVideo"
            class="absolute inset-0 flex items-center justify-center bg-gray-700"
          >
            <UserCircleIcon class="w-12 h-12 text-gray-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: chat (Componente extraído) -->
    <ChatStreamComponent
      v-show="expandirBool"
      :room-id="roomId"
      :user-data="userData"
      :is-host="false"
      :is-expanded="expandirBool"
      class="w-[25%]"
    />

    <!-- Modal de confirmación para finalizar stream -->
    <div
      v-if="showEndStreamConfirm"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold text-center">Salir de la reunión</h3>
        <p class="text-center text-gray-300">¿Estás seguro de que deseas salir?</p>
        <div class="flex justify-center space-x-4 pt-2">
          <button
            @click="showEndStreamConfirm = false"
            class="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg"
          >
            No
          </button>
          <button
            @click="confirmEndStream"
            class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg"
          >
            Sí
          </button>
        </div>
      </div>
    </div>
  </div>
  <ToastNotification ref="toastRef" />
</template>

<script>
import Peer from 'peerjs'
import axios from 'axios'
import {
  UserCircleIcon,
  EllipsisHorizontalIcon,
  MicrophoneIcon,
  PlusCircleIcon,
  ChartBarIcon,
  PencilSquareIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  UserGroupIcon,
  ShareIcon,
  PowerIcon,
} from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'

import router from '@/router'
import socket from '@/services/socket.js'
import api from '@/services/api.js'
import ChatStreamComponent from '@/components/ChatStreamComponent.vue'

export default {
  name: 'LiveView',
  components: {
    ChatStreamComponent,
    UserCircleIcon,
    EllipsisHorizontalIcon,
    MicrophoneIcon,
    PlusCircleIcon,
    ChartBarIcon,
    PencilSquareIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    ComputerDesktopIcon,
    ArrowsPointingOutIcon,
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    UserGroupIcon,
    ShareIcon,
    PowerIcon,
    ToastNotification
  },
  data() {
    return {
      peer: null,
      roomId: '',
      hostPeerId: null,

      userData: JSON.parse(localStorage.getItem('user')),

      viewerId: null,

      // ID del Host, necesario para enviar la Answer y los ICE candidates
      hostId: null,

      startTime: null,
      tiempo: 0,
      tiempoFormateado: '00:00',
      intervalo: null,

      videoStream: null,

      participantes: [],
      expandirBool: true,
      showEndStreamConfirm: false,

      modalVideoRef: null,

      stream: null,

      micAct: false,
      camaraAct: false,

      link: this.$route.params.link,

    }
  },
  mounted() {
    //expulsion
    socket.on('viewer-expelled', () => {
      router.push({ name: 'transmitions' })
    })

    socket.on('join-accepted', (data) => {
      if (data) {
        this.startTime = data.startTime
        this.hostId = data.hostId
        this.iniciarContador()
      }
    })

    socket.on('meeting-time', ({ startTime }) => {
      console.log('Sincronización de tiempo recibida:', startTime)
      this.startTime = startTime
      this.iniciarContador()
    })

    socket.on('stream-ended', () => {
      alert('La transmisión ha finalizado')
      setTimeout(() => this.confirmEndStream(), 2000)
    })

    // Si venimos de RoomWait, ya tenemos startTime en el query y hostId en params
    if (this.$route.query.startTime) {
      this.startTime = parseInt(this.$route.query.startTime)
      this.iniciarContador()
    } else {
      // Si entramos directo, solicitamos unirse
      socket.emit('request-join', { roomId: this.roomId, viewerData: this.userData })
    }

    // Siempre solicitar el tiempo actual para asegurar sincronización
    socket.emit('get-meeting-time', { roomId: this.roomId })

    this.joinRoom();
  },

  methods: {

    async joinRoom() {
      // 1️⃣ Obtener datos de sala
      const res = await axios.get(`http://localhost:3001/api/room/${this.link}`)

      this.hostPeerId = res.data.hostPeerId

      // 2️⃣ Crear peer viewer
      this.peer = new Peer(undefined, {
        host: 'localhost',
        port: 3001,
        path: '/peerjs',
      })

      this.peer.on('open', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        // 3️⃣ Llamar al host
        const call = this.peer.call(this.hostPeerId, stream)

        call.on('stream', (remoteStream) => {
          this.$refs.remoteVideo.srcObject = remoteStream
        })
      })
    },
    toggleMic() {
      this.micAct = !this.micAct
      if (this.micAct) {
        this.startVideo()
      } else {
        this.stopVideo()
      }
    },
    toggleCamara() {
      this.camaraAct = !this.camaraAct
      if (this.camaraAct) {
        this.startVideo()
      } else {
        this.stopVideo()
      }
    },
    startVideo() {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: this.micAct })
        .then((stream) => {
          this.videoStream = stream
          this.$refs.modalVideoRef.srcObject = stream
          // Aquí podrías agregar lógica para enviar el nuevo stream al host si es necesario
        })
        .catch((err) => {
          console.error('Error al acceder a la cámara:', err)
          this.addToast('No se pudo acceder a la cámara', 'error')
          this.camaraAct = false
        })
    },
    handleEndStream() {
      this.showEndStreamConfirm = true
    },

    iniciarContador() {
      if (!this.startTime) return
      if (this.intervalo) clearInterval(this.intervalo)
      this.intervalo = setInterval(() => {
        const ahora = Date.now()
        const diff = Math.floor((ahora - this.startTime) / 1000)
        this.tiempo = diff > 0 ? diff : 0
        this.tiempoFormateado = this.formatTime(this.tiempo)
      }, 1000)
    },

    terminarReunion() {
      if (this.intervalo) clearInterval(this.intervalo)
      this.tiempo = 0
      this.tiempoFormateado = this.formatTime(this.tiempo)
    },
    async confirmEndStream() {
      socket.emit('leave-room', { roomId: this.roomId, viewerId: this.viewerId })
      router.push({ name: 'transmitions' })
    },
    formatTime(segundos) {
      const min = Math.floor(segundos / 60)
        .toString()
        .padStart(2, '0')
      const seg = (segundos % 60).toString().padStart(2, '0')
      return `${min}:${seg}`
    },

    addToast(message, type = 'info', duration = 3000) {
      this.$refs.toastRef.addToast(message, type, duration)
    },
  },
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background: #000000;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
  /* bg-gray-800 */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  /* bg-gray-600 */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
  /* bg-gray-500 */
}
</style>
