<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Panel central: video principal y controles -->

    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover rounded-xl"></video>
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

<<<<<<< HEAD
        <button @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200">
=======
        <button
          @click="toggleScreenShare"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            pantallaAct ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600',
          ]"
          title="Compartir pantalla"
        >
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>

        <button @click="handleEndStream"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200" title="Salir">
          <PowerIcon class="w-6 h-6 text-red-500" />
        </button>
      </div>
    </div>

    <!-- Cuadrícula de Participantes (Abajo del video principal) -->
    <div v-if="participantes.length > 0" class="mt-4 pb-4 px-4 overflow-hidden">
      <h3 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
        <UserGroupIcon class="w-4 h-4 text-blue-400" />
        Participantes Activos
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto custom-scrollbar max-h-60 p-1">
        <div v-for="p in participantes" :key="p.socketId || p.idSocket"
          class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg group aspect-video">
          <!-- Video del participante -->
          <video :id="'remote-video-' + (p.socketId || p.idSocket)" autoplay playsinline
            class="w-full h-full object-cover bg-black"></video>

          <!-- Overlay con nombre y estado -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white text-left">
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
          <div v-if="!p.hasVideo" class="absolute inset-0 flex items-center justify-center bg-gray-700">
            <UserCircleIcon class="w-12 h-12 text-gray-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: chat (Componente extraído) -->
    <ChatStreamComponent v-show="expandirBool" :room-id="roomId" :user-data="userData" :is-host="false"
      :is-expanded="expandirBool" class="w-[25%]" />

    <!-- Modal de confirmación para finalizar stream -->
    <div v-if="showEndStreamConfirm" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold text-center">Salir de la reunión</h3>
        <p class="text-center text-gray-300">¿Estás seguro de que deseas salir?</p>
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
  },
  data() {
    return {
      servers: {
        iceServers: [
          {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          },
        ],
      },

      userData: JSON.parse(localStorage.getItem('user')),

      viewerId: null,
      pc: null,
      // ID del Host, necesario para enviar la Answer y los ICE candidates
      hostId: null,
      candidateBuffer: [],

      startTime: null,
      tiempo: 0,
      tiempoFormateado: '00:00',
      intervalo: null,

      audioContext: null,
      audioAnalyser: null,
      audioStream: null,
      audioSource: null,
      animationFrameId: null,
      videoStream: null,

      salaEspera: [],
      participantes: [],
      expandirBool: true,
      showOptionsMenu: false,
      showEndStreamConfirm: false,

      miniVideoRef: null,
      modalVideoRef: null,

      pc: null,
      localStream: null,
      stream: null,
      remoteStream: null,
      screenStream: null,
      candidateBuffer: [],

      micAct: false,
      camaraAct: false,
      pantallaAct: false,
      grabando: false,
      audioLevel: 0,

      micList: [
        { deviceId: 'mic1', label: 'Micrófono 1' },
        { deviceId: 'mic2', label: 'Micrófono 2' },
      ],
      speakerList: [
        { deviceId: 'spk1', label: 'Altavoz 1' },
        { deviceId: 'spk2', label: 'Altavoz 2' },
      ],
      camList: [
        { deviceId: 'cam1', label: 'Cámara 1' },
        { deviceId: 'cam2', label: 'Cámara 2' },
      ],

      selectedMic: 'mic1',
      selectedSpeaker: 'spk1',
      selectedCam: 'cam1',
      cameraResolution: 'medium',
      micVolume: 80,
      speakerVolume: 80,
      fileInput: null,

      menuAbierto: null,
      roomId: this.$route.params.id,
      hostId: this.$route.params.idH,

      viewerId: this.$route.params.idV,
      analyzers: {},
    }
  },
  mounted() {
    this._handleSignalBound = this._handleSignal.bind(this)
    socket.removeAllListeners('signal')
    socket.on('signal', this._handleSignalBound)

    socket.on('join-accepted', (data) => {
      console.log("JOIN ACCEPTED (Direct)", data);
      if (data) {
        this.startTime = data.startTime;
        this.hostId = data.hostId;
        this.iniciarContador();
      }
      this.initViewer();
    });

    socket.on('meeting-time', ({ startTime }) => {
      console.log("Sincronización de tiempo recibida:", startTime);
      this.startTime = startTime;
      this.iniciarContador();
    });

    socket.on('stream-ended', () => {
      alert('La transmisión ha finalizado');
      setTimeout(() => this.confirmEndStream(), 2000);
    });

    socket.on('expelled', () => {
      alert('Has sido expulsado de la reunión');
      this.confirmEndStream();
    });

    // Si venimos de RoomWait, ya tenemos startTime en el query y hostId en params
    if (this.$route.query.startTime) {
      this.startTime = parseInt(this.$route.query.startTime);
      this.iniciarContador();
      this.initViewer();
    } else {
      // Si entramos directo, solicitamos unirse
      socket.emit('request-join', { roomId: this.roomId, viewerData: this.userData });
    }

    // Siempre solicitar el tiempo actual para asegurar sincronización
    socket.emit('get-meeting-time', { roomId: this.roomId });
  },

  beforeUnmount() {
    if (this._handleSignalBound) {
      socket.off('signal', this._handleSignalBound)
    }
  },

  methods: {
    initViewer() {
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

<<<<<<< HEAD
      this.remoteStream = new MediaStream();

      this.pc.ontrack = e => {
        e.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track);
=======
      // No agregamos transceivers manualmente aquí para evitar conflictos con el Offer del Host
      // En vez de eso, responderemos a los transceivers que el Host envíe.

      this.pc.ontrack = (event) => {
        console.log('Track recibido en Viewer:', event.track.kind, event.streams)
        
        // El video principal (el del host) siempre irá al videoRef
        if (event.track.kind === 'video') {
          if (this.$refs.videoRef) {
            this.$refs.videoRef.srcObject = event.streams[0] || new MediaStream([event.track])
          }
        } else if (event.track.kind === 'audio') {
          // Si el audio es del host, se reproduce automáticamente si el stream es el mismo
          // Si no, podrías necesitar un elemento audio separado para el host si no viene en el mismo stream
          const remoteAudio = document.createElement('audio')
          remoteAudio.srcObject = event.streams[0] || new MediaStream([event.track])
          remoteAudio.autoplay = true
          remoteAudio.style.display = 'none'
          document.body.appendChild(remoteAudio)
        }
      }

      this.pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('signal', { targetId: this.hostId, data: e.candidate })
        }
      }
    },

    _handleSignal(data) {
      this.handleSignal(data)
    },

    //SIGAL webRTC
    async handleSignal({ from, data }) {
      this.hostId = from
      //1. Si PC no está inicializada, ¡INICIALIZARLA AHORA!
      if (!this.pc) {
        console.log('PC no inicializada al recibir señal. Inicializando ahora...')
        this.initViewer()
      }

      // 2️⃣ Revisar tipo de señal
      if (data.type === 'offer') {
        console.log('Offer recibida. Generando Answer...')
        await this.pc.setRemoteDescription(new RTCSessionDescription(data))
        
        // Procesar candidatos acumulados
        this.candidateBuffer.forEach(candidate => {
          this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
        });
      };

      this.pc.onicecandidate = e => {
        if (e.candidate) {
          socket.emit('signal', {
            targetId: this.hostId,
            data: { type: 'ice', candidate: e.candidate }
          });
        }
      };
    }
    ,

    async _handleSignal({ from, data }) {
      if (!this.pc) return;

      if (data.type === 'offer') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        socket.emit('signal', {
          targetId: from,
          data: { type: 'answer', sdp: answer }
        });
      }

      if (data.type === 'answer') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }

      if (data.type === 'ice') {
        if (this.pc.remoteDescription) {
          await this.pc.addIceCandidate(data.candidate);
        } else {
          this._iceBuffer = this._iceBuffer || [];
          this._iceBuffer.push(data.candidate);
        }
      }
    }
    ,

    handleEndStream() {
      this.showOptionsMenu = false
      this.showEndStreamConfirm = true
    },

    visualize() {
      if (!this.audioAnalyser) return

      const bufferLength = this.audioAnalyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      this.audioAnalyser.getByteFrequencyData(dataArray)

      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      const level = Math.min(100, (average / 128) * 100 * 1.5)
      this.audioLevel = level

      this.animationFrameId = requestAnimationFrame(this.visualize)
    },
    stopVisualization() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
      }
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop())
      }
      if (this.audioContext) {
        this.audioContext.close().catch(() => { })
      }
      this.audioLevel = 0
    },

    async toggleMic() {
      this.micAct = !this.micAct
      if (this.micAct) {
        try {
<<<<<<< HEAD
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true })

=======
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const audioTrack = stream.getAudioTracks()[0]
          
          if (!this.localStream) {
            this.localStream = stream
          } else {
            // Si ya hay un stream (ej: de video), le agregamos este audio track
            this.localStream.addTrack(audioTrack)
          }
          
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
          // Enviar audio al host
          if (this.pc) {
            // Buscamos un transceiver de audio existente o un sender
            let transceiver = this.pc.getTransceivers().find(t => t.receiver.track.kind === 'audio')
            if (transceiver) {
              transceiver.direction = 'sendrecv'
              await transceiver.sender.replaceTrack(audioTrack)
            } else {
              this.pc.addTrack(audioTrack, this.localStream)
            }
          }

          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          this.audioSource = this.audioContext.createMediaStreamSource(new MediaStream([audioTrack]))
          this.audioAnalyser = this.audioContext.createAnalyser()
          this.audioAnalyser.fftSize = 256
          this.audioSource.connect(this.audioAnalyser)
          this.visualize()
        } catch (err) {
          console.error('Error al acceder al micrófono:', err)
          this.micAct = false
        }
      } else {
        if (this.localStream) {
          const audioTrack = this.localStream.getAudioTracks()[0]
          if (audioTrack) audioTrack.stop()
        }
        if (this.pc) {
<<<<<<< HEAD
          const sender = this.pc.getSenders().find(s => s.track && s.track.kind === 'audio');
          if (sender) await sender.replaceTrack(null);

          const transceiver = this.pc.getTransceivers().find(t => t.receiver.track.kind === 'audio' || t.sender.track?.kind === 'audio');
          if (transceiver) {
            transceiver.direction = 'recvonly';
          }
=======
          const sender = this.pc.getSenders().find(s => s.track && s.track.kind === 'audio')
          if (sender) await sender.replaceTrack(null)
          const transceiver = this.pc.getTransceivers().find(t => t.receiver.track.kind === 'audio' || (t.sender.track && t.sender.track.kind === 'audio'))
          if (transceiver) transceiver.direction = 'recvonly'
>>>>>>> ef7995eb42b9a384f32a04fbf92dff996bc184c9
        }
        this.stopVisualization()
      }
    },

    formatTime(segundos) {
      const min = Math.floor(segundos / 60)
        .toString()
        .padStart(2, '0')
      const sec = (segundos % 60).toString().padStart(2, '0')
      return `${min}:${sec}`
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

    terminarReunion() {
      if (this.intervalo) clearInterval(this.intervalo);
      this.tiempo = 0;
      this.tiempoFormateado = this.formatTime(this.tiempo);
    },
    async toggleCamara() {
      this.camaraAct = !this.camaraAct
      if (this.camaraAct) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          const videoTrack = stream.getVideoTracks()[0]
          
          if (!this.localStream) {
            this.localStream = stream
          } else {
            this.localStream.addTrack(videoTrack)
          }

          await this.$nextTick()
          if (this.$refs.modalVideoRef) {
            this.$refs.modalVideoRef.srcObject = this.localStream
          }

          // Enviar video al host
          if (this.pc) {
            let transceiver = this.pc.getTransceivers().find(t => t.receiver.track.kind === 'video')
            if (transceiver) {
              transceiver.direction = 'sendrecv'
              await transceiver.sender.replaceTrack(videoTrack)
            } else {
              this.pc.addTrack(videoTrack, this.localStream)
            }
          }
        } catch (err) {
          console.error('Error al acceder a la cámara:', err)
          this.camaraAct = false
        }
      } else {
        if (this.localStream) {
          const videoTrack = this.localStream.getVideoTracks()[0]
          if (videoTrack) videoTrack.stop()
        }
        if (this.pc) {
          const sender = this.pc.getSenders().find(s => s.track && s.track.kind === 'video')
          if (sender) await sender.replaceTrack(null)
          const transceiver = this.pc.getTransceivers().find(t => t.receiver.track.kind === 'video' || (t.sender.track && t.sender.track.kind === 'video'))
          if (transceiver) transceiver.direction = 'recvonly'
        }
        if (this.$refs.modalVideoRef) {
          this.$refs.modalVideoRef.srcObject = null
        }
      }
    },

    async confirmEndStream() {
      router.push({ name: 'transmitions' })
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

        // Cuando el usuario deja de compartir desde el navegador, detener el toggle
        screenStream.getVideoTracks()[0].onended = () => {
          this.stopScreenShare()
        }

        // El video del modal muestra la pantalla compartida
        if (this.$refs.modalVideoRef) {
          this.$refs.modalVideoRef.srcObject = screenStream
        }

        // Obtener el track de video de la pantalla
        const screenVideoTrack = screenStream.getVideoTracks()[0]
        const screenAudioTrack = screenStream.getAudioTracks()[0]

        // Reemplazar el track de video en la conexión WebRTC
        if (this.pc) {
          const videoSender = this.pc.getSenders().find(s => s.track && s.track.kind === 'video')
          if (videoSender && screenVideoTrack) {
            await videoSender.replaceTrack(screenVideoTrack)
          } else if (screenVideoTrack) {
            this.pc.addTrack(screenVideoTrack, screenStream)
          }

          // Si hay audio en la pantalla compartida, también enviarlo
          if (screenAudioTrack) {
            const audioSender = this.pc.getSenders().find(s => s.track && s.track.kind === 'audio')
            if (audioSender) {
              await audioSender.replaceTrack(screenAudioTrack)
            } else {
              this.pc.addTrack(screenAudioTrack, screenStream)
            }
          }
        }

        this.screenStream = screenStream
      } catch (err) {
        console.error('Error al compartir pantalla:', err)
        this.pantallaAct = false
      }
    },

    async stopScreenShare() {
      try {
        // Detener todos los tracks de la pantalla compartida
        if (this.screenStream) {
          this.screenStream.getTracks().forEach(track => track.stop())
          this.screenStream = null
        }

        // Restaurar a la cámara local si estaba activa
        if (this.camaraAct && this.localStream) {
          const videoTrack = this.localStream.getVideoTracks()[0]
          const audioTrack = this.localStream.getAudioTracks()[0]

          if (this.pc) {
            const videoSender = this.pc.getSenders().find(s => s.track && s.track.kind === 'video')
            if (videoSender && videoTrack) {
              await videoSender.replaceTrack(videoTrack)
            }

            const audioSender = this.pc.getSenders().find(s => s.track && s.track.kind === 'audio')
            if (audioSender && audioTrack) {
              await audioSender.replaceTrack(audioTrack)
            }
          }

          // Restaurar el video del modal
          if (this.$refs.modalVideoRef) {
            this.$refs.modalVideoRef.srcObject = this.localStream
          }
        } else if (this.$refs.modalVideoRef) {
          // Si no hay cámara, limpiar el modal
          this.$refs.modalVideoRef.srcObject = null
        }

        this.pantallaAct = false
      } catch (err) {
        console.error('Error al detener compartir pantalla:', err)
        this.pantallaAct = false
      }
    },
    async admitir(user) {
      try {
        await api.post(`/transmissions/${this.roomId}/participants`, { id_user: user.id })
        this.participantes.push({ name: user.name, email: user.email, estado: 'Activo' })
        this.salaEspera = this.salaEspera.filter((u) => u.id !== user.id)
      } catch (error) {
        console.error('Error al admitir usuario:', error)
      }
    },

    rechazar(user) {
      socket.emit('response-request', {
        roomId: this.roomId,
        viewerId: user.idSocket,
        response: false,
      })
      this.salaEspera = this.salaEspera.filter((u) => u.id !== user.id)
    },
    silenciar(p) {
      p.estado = false
      this.menuAbierto = null
    },
    expulsar(p) {
      this.participantes = this.participantes.filter((part) => part.nombre !== p.nombre)
      this.menuAbierto = null
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
