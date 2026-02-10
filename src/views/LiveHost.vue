<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <aside v-show="expandirBool"
      class="w-[22%] bg-gray-900 text-white p-4 flex flex-col space-y-5 border-l border-gray-800 shadow-xl">
      <!-- Encabezado -->
      <div class="relative flex items-center justify-between">
        <h2 class="text-lg font-bold tracking-wide">Participantes</h2>
        <div class="relative">
          <button @click="showOptionsMenu = !showOptionsMenu" class="p-2 rounded-full hover:bg-gray-700 transition">
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>

          <div v-if="showOptionsMenu"
            class="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            <button @click="handleEndStream"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2">
              <PowerIcon class="w-4 h-4 text-red-500" />
              <span>Finalizar transmisión</span>
            </button>
            <button @click="openShareModal"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2">
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
        <div v-if="salaEspera.length" class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          <div v-for="(user, i) in salaEspera" :key="i"
            class="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2">
            <span class="font-medium text-sm">{{ user.name }}</span>
            <div class="flex space-x-1">
              <button @click="admitir(user)" class="bg-green-600 hover:bg-green-700 p-1 rounded" title="Admitir">
                <CheckIcon class="w-5 h-5" />
              </button>
              <button @click="rechazar(user)" class="bg-red-600 hover:bg-red-700 p-1 rounded" title="Rechazar">
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
          <div v-for="(p, i) in participantes" :key="p.idSocket || i"
            class="flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg">
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-5 h-5 text-blue-400" />
              <span class="text-sm font-medium">{{ p.name || p.email }}</span>
            </div>

            <div class="flex items-center gap-2">
              <MicrophoneIcon v-if="p.estado === 'Activo'" class="w-5 h-5 text-green-500" />
              <MicrophoneIcon v-else class="w-5 h-5 text-red-500 opacity-60" />

              <div class="relative">
                <button @click="menuAbierto = menuAbierto === i ? null : i"
                  class="p-1 hover:bg-gray-500 rounded-full transition">
                  <EllipsisHorizontalIcon class="w-4 h-4 text-gray-300" />
                </button>

                <div v-if="menuAbierto === i"
                  class="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-28 text-sm py-1 z-10">
                  <button @click="silenciar(p)" class="block w-full text-left px-3 py-1.5 hover:bg-gray-700">
                    Silenciar
                  </button>
                  <button @click="expulsar(p)"
                    class="block w-full text-left px-3 py-1.5 text-red-400 hover:bg-gray-700">
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
          class="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-full flex items-center space-x-2 text-sm font-semibold">
          <span>{{ tiempoFormateado }}</span>
        </div>

        <!-- Contador de participantes -->
        <div class="absolute top-3 right-3 bg-blue-600 px-3 py-1 rounded-full flex space-x-2 text-sm font-semibold">
          <span class="flex items-center space-x-1">
            <EyeIcon class="w-5 h-5" /><span>{{ participantes.length }}</span>
          </span>
        </div>

        <!--  Tarjeta del perfil actual (mini video o imagen) -->
        <div
          class="absolute bottom-3 right-3 bg-gray-800 rounded-xl shadow-lg p-2 flex flex-col items-center w-40 h-28 border border-gray-600">
          <!-- Imagen o video del usuario -->
          <div class="relative w-full h-full rounded-lg overflow-hidden">
            <video v-if="camaraAct" ref="modalVideoRef" autoplay muted
              class="w-full h-full bg-black rounded-lg"></video>
            <div v-else
              class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg">
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
        <button @click="toggleMic" :class="[
          'p-3 rounded-full transition-all duration-200',
          micAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
        ]">
          <MicrophoneIcon class="w-6 h-6 text-white" />
        </button>

        <button @click="toggleCamara" :class="[
          'p-3 rounded-full transition-all duration-200',
          camaraAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
        ]">
          <template v-if="camaraAct">
            <VideoCameraIcon class="w-6 h-6 text-white" />
          </template>
          <template v-else>
            <VideoCameraSlashIcon class="w-6 h-6 text-white" />
          </template>
        </button>

        <button @click="toggleScreenShare" :class="[
          'p-3 rounded-full transition-all duration-200',
          pantallaAct ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600',
        ]">
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200">
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>

      </div>
    </div>

    <div v-if="participantes.length > 0" class="mt-4 pb-4 px-4 overflow-hidden w-64 border-l border-gray-800">
      <h3 class="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
        <UserGroupIcon class="w-4 h-4 text-blue-400" />
        Activos
      </h3>
<<<<<<< HEAD

      <div class="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar max-h-30 p-1">
        <div v-for="p in participantes" :key="p.socketId || p.idSocket"
          class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group aspect-video">
          <video :id="'remote-video-' + (p.socketId || p.idSocket)" autoplay playsinline
            class="w-full h-full object-cover bg-black"></video>

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white text-left">
=======
      <div class="flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[calc(100vh-250px)] p-1">
        <div v-for="p in participantes" :key="p.socketId" class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group aspect-video w-full shrink-0">
          <video
            :id="'remote-video-' + p.socketId"
            autoplay
            playsinline
            class="w-full h-full object-cover bg-black"
          ></video>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white text-left">
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
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

          <div v-if="!p.hasVideo" class="absolute inset-0 flex items-center justify-center bg-gray-700">
<<<<<<< HEAD
            <UserCircleIcon class="w-12 h-12 text-gray-500" />
=======
             <UserCircleIcon class="w-10 h-10 text-gray-500" />
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
          </div>
        </div>
      </div>
    </div>


    <!-- Panel derecho: chat (Componente extraído) -->
    <ChatStreamComponent v-show="expandirBool" :room-id="roomId" :user-data="userData" :is-host="true"
      :is-expanded="expandirBool" class="w-[25%]" />

    <!-- Modal de confirmación para finalizar stream -->
    <div v-if="showEndStreamConfirm" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold text-center">Finalizar Stream</h3>
        <p class="text-center text-gray-300">¿Estás seguro de que deseas finalizar el stream?</p>
        <div class="flex justify-center space-x-4 pt-2">
          <button @click="showEndStreamConfirm = false" class="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg">
            No
          </button>
          <button @click="confirmEndStream" class="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg">
            Sí
          </button>
        </div>
      </div>
    </div>
  </div>

  <ToastNotification ref="toastRef" />

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
      servers: {
        iceServers: [
          {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          },
        ],
      }
      ,

      peers: {},
      candidateBuffers: {},
      localStream: null,
      cameraStream: null,
      salaEspera: [],
      roomId: localStorage.getItem('live_id'),

      tiempo: 0,
      startTime: null,
      tiempoFormateado: '00:00',
      intervalo: null,

      audioContext: null,
      audioAnalyser: null,
      audioStream: null,
      audioSource: null,
      animationFrameId: null,
      videoStream: null,

      participantes: [],
      expandirBool: true,
      showOptionsMenu: false,
      showEndStreamConfirm: false,

      miniVideoRef: null,
      modalVideoRef: null,

      pc: null,
      stream: null,

      micAct: false,
      camaraAct: false,
      pantallaAct: false,
      grabando: false,
      audioLevel: 0,

      menuAbierto: null,
      userData: JSON.parse(localStorage.getItem('user')),
      analyzers: {},
    }
  },


  async mounted() {
    try {
      await api.put(`/transmissions/${this.roomId}/status`, { status: 1 });
    } catch (e) {
      console.log("Error starting stream status:", e);
    }
    
    // Inicializar captura de audio y video automáticamente
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      this.localStream = stream
      this.cameraStream = stream
      this.camaraAct = true
      this.micAct = true
      
      // Mostrar el stream local en el video principal
      if (this.$refs.videoRef) {
        this.$nextTick(() => {
          this.$refs.videoRef.srcObject = this.localStream
        })
      }
      
      // Mostrar también en el modal (picture-in-picture)
      if (this.$refs.modalVideoRef) {
        this.$nextTick(() => {
          this.$refs.modalVideoRef.srcObject = this.localStream
        })
      }
    } catch (err) {
      console.warn('Advertencia: No se pudo acceder a cámara/micrófono automáticamente', err)
      // Continuar incluso si no se pueden capturar los dispositivos
    }
    
    socket.emit('start-stream', { roomId: this.roomId, hostData: this.userData })

    socket.on('stream-started', ({ startTime }) => {
      this.startTime = startTime;
      this.iniciarContador();
    });

    socket.on('host-reconnected', ({ startTime }) => {
      this.startTime = startTime;
      this.iniciarContador();
      this.addToast("Sesión de host restaurada");
    });

    socket.on('meeting-time', ({ startTime }) => {
      this.startTime = startTime;
      this.iniciarContador();
    });

    socket.on('pending-request', (data) => {
      const viewer = data.viewerData || data
      if (viewer.id && !this.salaEspera.some((u) => u.id === viewer.id)) {
        this.salaEspera.push(viewer)
      }
    })

    // Listener para nuevos viewers listos (dispara la Offer inicial)
    socket.on('viewer-joined', ({ viewerData }) => {
      this.addToast(`Participante ${viewerData.name} se unió`);
      this.createOfferForViewer(viewerData);
    });

    socket.on('viewer-left', ({ viewerId }) => {
      // viewerId es el socketId
      const pIndex = this.participantes.findIndex(p => p.socketId === viewerId);
      if (pIndex !== -1) {
        this.addToast(`${this.participantes[pIndex].name} salió`);
        this.participantes.splice(pIndex, 1);
      }

      // Limpiar conexión WebRTC
      if (this.peers[viewerId]) {
        this.peers[viewerId].close();
        delete this.peers[viewerId];
      }
      if (this.candidateBuffers[viewerId]) {
        delete this.candidateBuffers[viewerId];
      }
    });

<<<<<<< HEAD

    this._handleSignalBound = this._handleSignal.bind(this)
    socket.removeAllListeners('signal')
=======
    
    // this.iniciarContador(); - Se inicia vía socket events ahora
        
    this._handleSignalBound = this.handleSignal.bind(this)
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
    socket.on('signal', this._handleSignalBound)
  },


  beforeUnmount() {
    socket.off("host-reconnected")
    socket.off("pending-request")
    socket.off("viewer-joined")
    if (this._handleSignalBound) {
      socket.off("signal", this._handleSignalBound)
    }
  },

  methods: {
    async updateTrackForPeers(kind, track, stream) {
      for (const pc of Object.values(this.peers)) {
        const sender = pc.getSenders().find(s => s.track?.kind === kind);
        if (sender && track) {
          await sender.replaceTrack(track);
        } else if (track) {
          pc.addTrack(track, stream);
        } else if (sender && !track) {
          // Si el track se detuvo, removemos o silenciamos
          // replaceTrack(null) es lo más común para WebRTC dinámico
          await sender.replaceTrack(null);
        }
      }
    },


    async toggleScreenShare() {
      this.pantallaAct = !this.pantallaAct
      if (this.pantallaAct) {
        await this.startScreenShare()
      } else {
        await this.stopScreenShare()
      }
    },

    async startScreenShare() {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        screenStream.getVideoTracks()[0].onended = () => {
          this.stopScreenShare()
        }

        // Al compartir pantalla:
        // 1. El video principal muestra la pantalla
        this.localStream = screenStream
        this.$refs.videoRef.srcObject = this.localStream

        // 2. Si la cámara está activa, nos aseguramos que se vea en el modal (PiP)
        if (this.cameraStream && this.camaraAct) {
          this.$nextTick(() => {
            if (this.$refs.modalVideoRef) {
              this.$refs.modalVideoRef.srcObject = this.cameraStream;
            }
          });
        }

        await this.replaceStreamForAllPeers(screenStream)
      } catch (err) {
        console.error('Error al compartir pantalla:', err)
        this.pantallaAct = false
      }
    },

    async stopScreenShare() {
      if (this.localStream && this.localStream.id !== this.cameraStream.id) {
        this.localStream.getTracks().forEach((track) => track.stop())
      }
      this.localStream = this.cameraStream
      this.$refs.videoRef.srcObject = this.localStream

      // Restaurar cámara en el video principal
      if (this.camaraAct) {
        this.$nextTick(() => {
          if (this.$refs.modalVideoRef) {
            this.$refs.modalVideoRef.srcObject = this.cameraStream;
          }
        });
      }

      this.pantallaAct = false
      await this.replaceStreamForAllPeers(this.cameraStream)
    },

    async replaceStreamForAllPeers(newStream) {
      const videoTrack = newStream ? newStream.getVideoTracks()[0] : null;
      const audioTrack = newStream ? newStream.getAudioTracks()[0] : null;

      for (const pc of Object.values(this.peers)) {
        // Encontrar senders para reemplazo
        const videoSender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (videoSender && videoTrack) {
          await videoSender.replaceTrack(videoTrack);
        } else if (videoTrack) {
          pc.addTrack(videoTrack, newStream);
        }

        const audioSender = pc.getSenders().find((s) => s.track && s.track.kind === 'audio');
        if (audioSender && audioTrack) {
          await audioSender.replaceTrack(audioTrack);
        } else if (audioTrack) {
          pc.addTrack(audioTrack, newStream);
        }
      }
    },


    _handleSignal(data) {
      this.handleSignal(data)
    },

    async handleSignal({ from, data }) {
      const pc = this.peers[from]
      if (!pc) return

      try {
        // ✅ ANSWER
        if (data.type === 'answer') {
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          )

          // aplicar ICE que llegaron antes del answer
          const buffered = this.candidateBuffers[from]
          if (buffered?.length) {
            for (const candidate of buffered) {
              await pc.addIceCandidate(candidate)
            }
            this.candidateBuffers[from] = []
          }
        }

        // ✅ ICE
        else if (data.type === 'ice') {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(data.candidate)
          } else {
            this.candidateBuffers[from].push(data.candidate)
            console.log(`ICE bufferizado de ${from}`)
          }
        }

        // 🚫 NO otros casos
      } catch (e) {
        console.error('Error al procesar señal en Host:', e, data)
      }
    },
    handleEndStream() {
      this.showOptionsMenu = false
      this.showEndStreamConfirm = true
    },

    async toggleMic() {
      if (!this.localStream) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          this.micAct = true
        } catch (e) {
          this.addToast('Error al acceder al micrófono', 'error')
          return
        }
      } else {
        const audioTrack = this.localStream.getAudioTracks()[0]
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled
          this.micAct = audioTrack.enabled
        } else {
          // Si el stream existe pero no tiene audio (ej: solo cámara), pedimos audio
          const newStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const [track] = newStream.getAudioTracks()
          this.localStream.addTrack(track)
          this.micAct = true
        }
      }
      await this.updateTrackForPeers('audio', this.micAct ? this.localStream.getAudioTracks()[0] : null, this.localStream)
    },

    async toggleCamara() {
      if (!this.localStream || !this.localStream.getVideoTracks().length) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          const [videoTrack] = stream.getVideoTracks()

          if (!this.localStream) {
            this.localStream = stream
          } else {
            this.localStream.addTrack(videoTrack)
          }

          this.cameraStream = this.localStream
          this.camaraAct = true
        } catch (e) {
          this.addToast('Error al acceder a la cámara', 'error')
          return
        }
      } else {
        const videoTrack = this.localStream.getVideoTracks()[0]
        videoTrack.enabled = !videoTrack.enabled
        this.camaraAct = videoTrack.enabled
      }

      if (this.$refs.videoRef) this.$refs.videoRef.srcObject = this.localStream
      if (this.camaraAct && this.$refs.modalVideoRef) this.$refs.modalVideoRef.srcObject = this.localStream

      await this.updateTrackForPeers('video', this.camaraAct ? this.localStream.getVideoTracks()[0] : null, this.localStream)
    },

    async confirmEndStream() {
      this.showEndStreamConfirm = false;
      socket.emit('stop-stream', { roomId: this.roomId });
      socket.emit('in-transmision');
      try {
        await api.put(`/transmissions/${this.roomId}/status`, { status: 2 });
      } catch (e) {
        console.error("Error closing stream status:", e);
      }

      // Detener tracks locales
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop());
      }
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(t => t.stop());
      }

      // Cerrar WebRTC
      Object.values(this.peers).forEach(pc => pc.close());
      this.peers = {};

      router.push({ name: 'transmitions' });
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
          await api.delete(`/transmissions/${this.roomId}/participants/${user.id}`)
        } catch (error) {
          console.error('Error al eliminar participante del backend:', error)
        }
      }

      // Notificar al servidor para que desconecte al usuario
      socket.emit('expel-viewer', { viewerId: user.socketId, roomId: this.roomId })

      // Eliminarlo de la lista local inmediatamente
      this.participantes = this.participantes.filter((p) => p.socketId !== user.socketId)

      // Limpiar la conexión WebRTC
      if (this.peers[user.socketId]) {
        this.peers[user.socketId].close()
        delete this.peers[user.socketId]
      }
      this.menuAbierto = null
    },

    //SECCION webRTC
    async createOfferForViewer(viewerData) {
      const viewerSocketId = viewerData.socketId;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      this.peers[viewerSocketId] = pc;
      this.candidateBuffers[viewerSocketId] = [];
<<<<<<< HEAD

      // VIDEO (cámara o pantalla)
=======
      
      // 1. Agregar tracks actuales del owner si existen
      // Es mejor usar addTrack con el stream para asegurar la asociación en el viewer
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream);
        });
<<<<<<< HEAD
      }
      // AUDIO siempre desde mic
      if (this.cameraStream) {
        this.cameraStream.getAudioTracks().forEach(track => {
=======
      } else if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => {
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
          pc.addTrack(track, this.cameraStream);
        });
      }

<<<<<<< HEAD
      pc.onicecandidate = e => {
        if (e.candidate) {
          socket.emit('signal', {
            targetId: viewerSocketId,
            data: { type: 'ice', candidate: e.candidate }
          });
        }
      };

      //. RECIBIR audio del viewer
      pc.ontrack = e => {
        if (e.track.kind === 'audio') {
          const audio = document.createElement('audio');
          audio.srcObject = new MediaStream([e.track]);
          audio.autoplay = true;
          audio.style.display = 'none';
          document.body.appendChild(audio);

          this.setupParticipantAnalyzer(viewerSocketId, e.track);
        }

        if (e.track.kind === 'video') {
          const video = document.getElementById(`remote-video-${viewerSocketId}`);
          if (video) video.srcObject = e.streams[0];
=======
      // 2. Preparar transceivers para recibir del Viewer
      // Usamos addTransceiver para asegurar que el host esté listo para recibir video/audio
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });

      // 2. Manejo de ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('signal', { targetId: viewerSocketId, data: event.candidate });
        }
      };

      // 3. RECIBIR audio del viewer
      pc.ontrack = (event) => {
        console.log(`Track recibido de: ${viewerData.name}`, event.track.kind);
        if (event.track.kind === 'audio') {
          const remoteAudio = document.createElement('audio');
          remoteAudio.srcObject = new MediaStream([event.track]);
          remoteAudio.autoplay = true;
          pc._remoteAudio = remoteAudio;
          
          // Audio Spectrum for Participant
          this.setupParticipantAnalyzer(viewerSocketId, event.track);
          
          // Debug: attach to body if hidden
          remoteAudio.style.display = 'none';
          document.body.appendChild(remoteAudio);
        } else if (event.track.kind === 'video') {
           const remoteVideo = document.getElementById(`remote-video-${viewerSocketId}`);
           if (remoteVideo) remoteVideo.srcObject = new MediaStream([event.track]);
           const p = this.participantes.find(part => part.socketId === viewerSocketId);
           if (p) p.hasVideo = true;
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
        }
      };

      // 4. Crear Offer
      try {

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('signal', {
          targetId: viewerSocketId,
          data: { type: 'offer', sdp: offer }
        });
        console.log(`Offer enviada a ${viewerData.name}`);
      } catch (error) {
        console.error('Error al crear offer:', error);
      }
    },

    iniciarContador() {
      if (!this.startTime) return;
      if (this.intervalo) clearInterval(this.intervalo);
      this.intervalo = setInterval(() => {
        const ahora = Date.now();
        const diff = Math.floor((ahora - this.startTime) / 1000);
        this.tiempo = diff > 0 ? diff : 0;
        this.tiempoFormateado = this.formatTime(this.tiempo);
      }, 1000);
    },


    formatTime(segundos) {
      const min = Math.floor(segundos / 60)
        .toString()
        .padStart(2, '0')
      const seg = (segundos % 60).toString().padStart(2, '0')
      return `${min}:${seg}`
    },

    setupParticipantAnalyzer(socketId, track) {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const source = this.audioContext.createMediaStreamSource(new MediaStream([track]));
      const analyzer = this.audioContext.createAnalyser();
      analyzer.fftSize = 32;
      source.connect(analyzer);
      this.analyzers[socketId] = analyzer;
    },

    addToast(message, type = 'info', duration = 3000) {
      // Llamamos al método del componente hijo usando la referencia
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
