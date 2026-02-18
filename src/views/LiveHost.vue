<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <aside
      v-show="expandirBool"
      class="w-[22%] bg-gray-900 text-white p-4 flex flex-col space-y-5 border-l border-gray-800 shadow-xl"
    >
      <!-- Encabezado -->
      <div class="relative flex items-center justify-between">
        <h2 class="text-lg font-bold tracking-wide">Participantes</h2>
        <div class="relative">
          <button
            @click="showOptionsMenu = !showOptionsMenu"
            class="p-2 rounded-full hover:bg-gray-700 transition"
          >
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>

          <div
            v-if="showOptionsMenu"
            class="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden"
          >
            <button
              @click="handleEndStream"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
            >
              <PowerIcon class="w-4 h-4 text-red-500" />
              <span>Finalizar transmisión</span>
            </button>
            <button
              @click="showShareModal = true"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
            >
              <ShareIcon class="w-4 h-4 text-blue-400" />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sala de espera -->
      <div>
        <h3 class="font-semibold text-sm text-gray-400 mb-2 uppercase tracking-wide">
          Sala de espera
        </h3>
        <div
          v-if="salaEspera.length"
          class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar"
        >
          <div
            v-for="(user, i) in salaEspera"
            :key="i"
            class="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2"
          >
            <span class="font-medium text-sm">{{ user.name }}</span>
            <div class="flex space-x-1">
              <button
                @click="admitir(user)"
                class="bg-green-600 hover:bg-green-700 p-1 rounded"
                title="Admitir"
              >
                <CheckIcon class="w-5 h-5" />
              </button>
              <button
                @click="rechazar(user)"
                class="bg-red-600 hover:bg-red-700 p-1 rounded"
                title="Rechazar"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-500 text-sm">No hay usuarios en espera.</p>
      </div>

      <!-- Lista de participantes -->
      <div class="flex-1 bg-gray-800 rounded-2xl p-4 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm text-gray-300 flex items-center gap-2">
            <UserGroupIcon class="w-5 h-5 text-blue-400" />
            En la reunión
          </h3>
          <span class="text-xs text-gray-400">{{ participantes.length }}</span>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          <div
            v-for="(p, i) in participantes"
            :key="p.idSocket || i"
            class="flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-5 h-5 text-blue-400" />
              <span class="text-sm font-medium">{{ p.name || p.email }}</span>
            </div>

            <div class="flex items-center gap-2">
              <MicrophoneIcon v-if="p.estado === 'Activo'" class="w-5 h-5 text-green-500" />
              <MicrophoneIcon v-else class="w-5 h-5 text-red-500 opacity-60" />

              <div class="relative">
                <button
                  @click="menuAbierto = menuAbierto === i ? null : i"
                  class="p-1 hover:bg-gray-500 rounded-full transition"
                >
                  <EllipsisHorizontalIcon class="w-4 h-4 text-gray-300" />
                </button>

                <div
                  v-if="menuAbierto === i"
                  class="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-28 text-sm py-1 z-10"
                >
                  <button
                    @click="silenciar(p)"
                    class="block w-full text-left px-3 py-1.5 hover:bg-gray-700"
                  >
                    Silenciar
                  </button>
                  <button
                    @click="expulsar(p)"
                    class="block w-full text-left px-3 py-1.5 text-red-400 hover:bg-gray-700"
                  >
                    Expulsar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Panel central: video principal y controles -->

    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video ref="videoRef" autoplay muted class="w-full h-full object-cover rounded-xl"></video>

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
              ref="videoUserRef"
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
          @click="toggleScreenShare"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            pantallaAct ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-700 hover:bg-red-600',
          ]"
        >
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>
      </div>
    </div>

    <div
      v-if="participantes.length > 0"
      class="mt-4 pb-4 px-4 overflow-hidden w-64 border-l border-gray-800"
    >
      <h3
        class="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2"
      >
        <UserGroupIcon class="w-4 h-4 text-blue-400" />
        Activos
      </h3>

      <div class="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar max-h-30 p-1">
        <div
          v-for="p in participantes"
          :key="p.socketId || p.idSocket"
          class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group aspect-video"
        >
          <video
            :id="'remote-video-' + (p.socketId || p.idSocket)"
            autoplay
            playsinline
            class="w-full h-full object-cover bg-black"
          ></video>

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white text-left"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-medium truncate">
                {{ p.name || p.email }}
              </span>
              <div class="flex items-end gap-0.5 h-3">
                <div class="w-1 bg-blue-400 rounded-full h-1"></div>
                <div class="w-1 bg-blue-400 rounded-full h-2"></div>
                <div class="w-1 bg-blue-400 rounded-full h-1.5"></div>
              </div>
            </div>
          </div>

          <div
            v-if="!p.hasVideo"
            class="absolute inset-0 flex items-center justify-center bg-gray-700"
          >
            <UserCircleIcon class="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: chat (Componente extraído) -->
    <ChatStreamComponent
      v-show="expandirBool"
      :room-id="roomId"
      :user-data="userData"
      :is-host="true"
      :is-expanded="expandirBool"
      class="w-[25%]"
    />

    <!-- Modal de confirmación para finalizar stream -->
    <div
      v-if="showEndStreamConfirm"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold text-center">Finalizar Stream</h3>
        <p class="text-center text-gray-300">¿Estás seguro de que deseas finalizar el stream?</p>
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

  <Teleport to="body">
    <div
      v-if="showShareModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[50] p-4"
    >
      <div
        class="bg-gray-800 text-white rounded-xl w-full max-w-lg p-6 relative shadow-lg flex flex-col max-h-[90vh]"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Compartir transmisión</h2>
          <button
            @click="showShareModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            ✖
          </button>
        </div>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium">Enlace de la transmisión</label>
          <div class="flex gap-2">
            <input
              type="text"
              :value="link"
              readonly
              class="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed outline-none"
            />
            <button
              @click="copyLink"
              class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>

        <div class="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
          <h3 class="text-md font-semibold mb-2">Compartir en la aplicación</h3>
          <div class="flex-1 flex flex-col min-h-0">
            <div class="mb-2">
              <input
                type="text"
                :placeholder="`Buscar grupo...`"
                v-model="shareSearch"
                class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
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

        <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
          <button
            @click="showShareModal = false"
            class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
          >
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
</template>

<script>
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
import router from '@/router'

import socket from '@/services/socket.js'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'
import ChatStreamComponent from '@/components/ChatStreamComponent.vue'
import Peer from 'peerjs'
import axios from 'axios'

export default {
  name: 'LiveView',
  components: {
    ToastNotification,
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
  },
  data() {
    return {
      peers: {},
      activeCalls: [],
      localStream: new MediaStream(),
      screenTrack: null,
      pantallaAct: false,

      peerId: null,
      cameraStream: null,

      salaEspera: [],
      roomId: localStorage.getItem('live_id'),
      link: 'no link',

      //share
      shareTab: 'friends',
      shareSearch: '',
      selectedShareTargets: [],
      streamLink: window.location.href,
      friendsList: [], // Estas deberían cargarse de una API o prop
      groupsList: [], // Estas deberían cargarse de una API o prop
      showShareModal: true,

      tiempo: 0,
      startTime: null,
      tiempoFormateado: '00:00',
      intervalo: null,
      participantes: [],
      expandirBool: true,
      showOptionsMenu: false,
      showEndStreamConfirm: false,
      micAct: false,
      camaraAct: false,
      menuAbierto: null,
      userData: JSON.parse(localStorage.getItem('user')),
    }
  },

  async mounted() {
    try {
      await api.put(`/transmissions/${this.roomId}/status`, { status: 1 })
      await this.startMeeting()

      socket.emit('start-stream', { roomId: this.roomId, link: this.link, dataHost: this.userData })
      
      socket.on('stream-started', (data) => {
        this.startTime = Number(data.startTime)
        this.iniciarContador()
      })
      socket.on('pending-request', (data) => {
        this.salaEspera.push(data.viewerData)
      })

      socket.on('left-room', (data) => {
        this.participantes = this.participantes.filter((p) => p.id !== parseInt(data.viewerId))
      })
      
      this.loadGroups()
      this.addToast('Stream iniciado')
    } catch (e) {
      this.addToast('Error al iniciar el stream', 'error')
    }
  },
  computed: {
    filteredGroups() {
      if (!this.shareSearch) return this.groupsList
      return this.groupsList.filter((g) =>
        g.nombre.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },
  },
  methods: {
    //share link
    copyLink() {
      navigator.clipboard.writeText(this.link).then(() => {
        this.addToast('Enlace copiado al portapapeles')
      })
    },
    toggleShareTarget(target) {
      const index = this.selectedShareTargets.findIndex((t) => t.id === target.id)
      if (index > -1) {
        this.selectedShareTargets.splice(index, 1)
      } else {
        this.selectedShareTargets.push(target)
      }
    },

    async sendToSelected() {
      if (this.selectedShareTargets.length === 0) return
      const ids = this.selectedShareTargets.map((t) => t.id)
      try {
        const response = await api.post('/messages/share', {
          ids,
          senderId: this.userData.id,
          message: '<<<' + this.link + '>>>',
        })
        this.addToast('Enlace enviado')
        this.showOptionsMenu = this.showShareModal = false
        this.selectedShareTargets = []
      } catch (error) {
        this.addToast('Error al compartir el enlace', 'error')
      }
    },
    async loadGroups() {
      try {
        const response = await api.get('/groups')
        const temp = response.data.data

        this.groupsList = temp.map((u) => {
          const msgs = u.messages || []
          return {
            id: u.id,
            nombre: u.name,
            foto: u.photo,
          }
        })
      } catch (error) {
        this.addToast('Error al cargar grupos', 'error')
      }
    },
    //meeting
    async startMeeting() {
      return new Promise((resolve, reject) => {
        this.peer = new Peer(undefined, {
          host: 'localhost',
          port: 3001,
          path: '/peerjs',
        })

        this.peer.on('open', async (id) => {
          try {
            this.peerId = id

            const res = await axios.post('http://localhost:3001/api/create-room', {
              name: this.roomId,
              hostPeerId: this.peerId,
            })

            this.link = res.data.roomId

            console.log('Sala creada sin activar cámara ')

            resolve() // 🔥 IMPORTANTE
          } catch (error) {
            reject(error)
          }
        })

        this.peer.on('error', (err) => {
          reject(err)
        })

        this.peer.on('call', (call) => {
          if (this.localStream) {
            call.answer(this.localStream)
          } else {
            call.answer()
          }

          this.activeCalls.push(call)

          call.on('close', () => {
            this.activeCalls = this.activeCalls.filter((c) => c !== call)
          })
        })
      })
    },
    updateTrackForPeers(kind, track) {
      // Iterar sobre llamadas activas (source of truth)
      this.activeCalls.forEach((call) => {
        const pc = call.peerConnection
        if (!pc) return

        try {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === kind)

          if (sender) {
            console.log('Replacing', kind, 'track for call', call.peer)
            sender.replaceTrack(track)
          } else if (track) {
            console.log('Adding', kind, 'track for call', call.peer)
            pc.addTrack(track, this.localStream)
          }
        } catch (err) {
          console.error('updateTrackForPeers error', err)
        }
      })
    },
    async toggleMic() {
      try {
        let audioTrack = this.localStream.getAudioTracks()[0]

        if (!audioTrack) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })

          audioTrack = stream.getAudioTracks()[0]
          this.localStream.addTrack(audioTrack)
          this.updateTrackForPeers('audio', audioTrack)

          this.micAct = true
        } else {
          audioTrack.enabled = !audioTrack.enabled
          this.micAct = audioTrack.enabled
          this.updateTrackForPeers('audio', this.micAct ? audioTrack : null)
        }
      } catch (e) {
        console.error(e)
        this.addToast('Error al acceder al micrófono', 'error')
      }
    },
    async toggleCamara() {
      try {
        let videoTrack = this.localStream.getVideoTracks()[0]

        if (!videoTrack) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          })

          // Guardar stream de cámara para poder reutilizarlo/limpiarlo
          this.cameraStream = stream

          videoTrack = stream.getVideoTracks()[0]
          this.localStream.addTrack(videoTrack)

          this.updateTrackForPeers('video', videoTrack)
          this.camaraAct = true
        } else {
          videoTrack.enabled = !videoTrack.enabled
          this.camaraAct = videoTrack.enabled
          this.updateTrackForPeers('video', this.camaraAct ? videoTrack : null)
        }

        this.$nextTick(() => {
          if (this.$refs.videoRef) this.$refs.videoRef.srcObject = this.localStream
          if (this.$refs.videoUserRef) this.$refs.videoUserRef.srcObject = this.localStream
        })
      } catch (e) {
        console.error(e)
        this.addToast('Error al acceder a la cámara', 'error')
      }
    },

    async toggleScreenShare() {
      if (this.pantallaAct) {
        await this.stopScreenShare()
      } else {
        await this.startScreenShare()
      }
    },
    async startScreenShare() {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // evitar conflictos con mic
        })

        const screenTrack = screenStream.getVideoTracks()[0]
        this.screenTrack = screenTrack

        // Remover track de cámara del localStream si existe, pero no detenerlo
        const cameraTrack = this.localStream.getVideoTracks()[0]
        if (cameraTrack) {
          this.localStream.removeTrack(cameraTrack)
        }

        this.localStream.addTrack(screenTrack)

        this.updateTrackForPeers('video', screenTrack)

        this.pantallaAct = true
        //this.camaraAct = false

        // Mostrar local
        this.$nextTick(() => {
          if (this.$refs.videoRef) this.$refs.videoRef.srcObject = this.localStream

          //if (this.$refs.modalVideoRef) this.$refs.modalVideoRef.srcObject = this.localStream
        })

        // Cuando el usuario deja de compartir desde el navegador
        screenTrack.onended = () => {
          this.stopScreenShare()
        }
      } catch (error) {
        console.error('Error compartiendo pantalla:', error)
        this.pantallaAct = false
      }
    },

    async stopScreenShare() {
      if (!this.screenTrack) return

      this.localStream.removeTrack(this.screenTrack)
      this.screenTrack.stop()
      this.screenTrack = null

      this.pantallaAct = false

      // Opcional: volver a cámara automáticamente
      if (this.camaraAct) {
        let camStream = this.cameraStream
        if (!camStream) {
          camStream = await navigator.mediaDevices.getUserMedia({ video: true })
          this.cameraStream = camStream
        }

        const cameraTrack = camStream.getVideoTracks()[0]
        this.localStream.addTrack(cameraTrack)

        this.updateTrackForPeers('video', cameraTrack)
      } else {
        this.updateTrackForPeers('video', null)
      }

      this.$nextTick(() => {
        if (this.$refs.videoRef) this.$refs.videoRef.srcObject = this.localStream
      })
    },
    handleEndStream() {
      this.showOptionsMenu = false
      this.showEndStreamConfirm = true
    },

    async confirmEndStream() {
      try {
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            track.stop()
            console.log(`Track ${track.kind} detenido`)
          })
          this.localStream = null
        }

        if (this.cameraStream) {
          this.cameraStream.getTracks().forEach((track) => {
            track.stop()
          })
          this.cameraStream = null
        }

        //end stream to socke
        for (const user of this.participantes) {
          socket.emit('expel-viewer', {
            id: user.id,
            socketId: user.socketId,
            roomId: this.roomId,
          })
          if (this.peers[user.socketId]) {
            this.peers[user.socketId].close()
            delete this.peers[user.socketId]
          }
        }
        this.menuAbierto = null
        socket.emit('end-stream', { roomId: this.roomId })
        //end stream db

        this.addToast('Transmisión finalizada con éxito', 'success')
        router.push({ name: 'transmitions' })
      } catch (error) {
        console.error('Error al cerrar el stream:', error)
        this.addToast('Hubo un problema al cerrar la conexión', 'error')
        // Aun con error, redirigimos al usuario
        router.push({ name: 'transmitions' })
      }
    },

    async admitir(user) {
      socket.emit('response-request', {
        roomId: this.roomId,
        viewerData: user,
        response: true,
      })

      this.participantes.push({ ...user, estado: 'Inactivo' })
      this.salaEspera = this.salaEspera.filter((u) => u.socketId !== user.socketId)
    },

    rechazar(user) {
      socket.emit('response-request', {
        roomId: this.roomId,
        viewerData: user,
        response: false,
      })
      this.salaEspera = this.salaEspera.filter((u) => u.socketId !== user.socketId)
    },
    silenciar(p) {
      p.estado = false
      this.menuAbierto = null
    },

    async expulsar(user) {
      if (user.id) {
        try {
          this.participantes = this.participantes.filter((p) => p.id !== user.id)
          socket.emit('expel-viewer', { id: user.id, socketId: user.socketId, roomId: this.roomId })
          this.addToast('Participante eliminado')
        } catch (error) {
          this.addToast('Error al elimnar', 'error')
        }
      }
      this.participantes = this.participantes.filter((p) => p.socketId !== user.socketId)

      // Limpiar la conexión WebRTC
      if (this.peers[user.socketId]) {
        this.peers[user.socketId].close()
        delete this.peers[user.socketId]
      }
      this.menuAbierto = null
    },

    iniciarContador() {
      if (!this.startTime) return
      const startMs = this.startTime < 10000000000 ? this.startTime * 1000 : this.startTime

      if (this.intervalo) clearInterval(this.intervalo)

      const actualizar = () => {
        const ahora = Date.now()
        const diffInMs = ahora - startMs

        const segundosTranscurridos = Math.floor(diffInMs / 1000)

        this.tiempo = segundosTranscurridos > 0 ? segundosTranscurridos : 0
        this.tiempoFormateado = this.formatTime(this.tiempo)
      }
      actualizar()

      this.intervalo = setInterval(actualizar, 1000)
    },

    formatTime(segundosTotal) {
      const horas = Math.floor(segundosTotal / 3600)
      const minutos = Math.floor((segundosTotal % 3600) / 60)
      const segundos = segundosTotal % 60

      const hh = horas > 0 ? `${horas.toString().padStart(2, '0')}:` : ''
      const mm = minutos.toString().padStart(2, '0')
      const ss = segundos.toString().padStart(2, '0')

      return `${hh}${mm}:${ss}`
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
