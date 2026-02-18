<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Panel central: video principal y controles -->
    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal (Host) - OCUPA CASI TODO -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video
          ref="remoteVideo"
          autoplay
          playsinline
          class="w-full h-full object-cover rounded-xl"
        ></video>
        
        <!-- Overlay cuando el host no tiene cámara -->
        <div 
          v-if="!hostVideoEnabled" 
          class="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl"
        >
          <div class="text-center">
            <UserCircleIcon class="w-20 h-20 text-gray-500 mx-auto mb-2" />
            <p class="text-gray-400">Host sin cámara</p>
          </div>
        </div>

        <!-- Tiempo de reunión -->
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
            <EyeIcon class="w-5 h-5" /><span>{{ otherViewers.length + 1 }}</span>
          </span>
        </div>

        <!-- MINIATURA DE TU CÁMARA (si está activa) -->
        <div
          v-if="localVideoEnabled && localStream"
          class="absolute bottom-3 right-3 bg-gray-800 rounded-xl shadow-lg p-1 w-40 h-24 border-2 border-blue-500 cursor-pointer hover:border-blue-400 transition"
          @click="toggleMainView()"
        >
          <video
            ref="localVideo"
            autoplay
            muted
            class="w-full h-full bg-black rounded-lg object-cover"
          ></video>
          <span class="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-1 py-0.5 rounded">
            Tú
          </span>
          
          <!-- Indicador de micrófono -->
          <div class="absolute top-1 right-1">
            <MicrophoneIcon 
              v-if="localAudioEnabled" 
              class="w-3 h-3 text-green-500" 
            />
            <MicrophoneIcon 
              v-else 
              class="w-3 h-3 text-red-500" 
            />
          </div>
        </div>

        <!-- Si no hay cámara, mostrar avatar en miniatura -->
        <div
          v-else
          class="absolute bottom-3 right-3 bg-gray-800 rounded-xl shadow-lg p-1 w-40 h-24 border border-gray-600 flex items-center justify-center"
        >
          <UserCircleIcon class="w-12 h-12 text-gray-400" />
          <span class="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-1 py-0.5 rounded">
            Tú
          </span>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex justify-center items-center space-x-3 mb-2">
        <button
          @click="toggleLocalAudio"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            localAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
          ]"
        >
          <MicrophoneIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="toggleLocalVideo"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            localVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500',
          ]"
        >
          <VideoCameraIcon v-if="localVideoEnabled" class="w-6 h-6 text-white" />
          <VideoCameraSlashIcon v-else class="w-6 h-6 text-white" />
        </button>

        <button
          @click="toggleScreenShare"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            screenStream ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600',
          ]"
          :title="screenStream ? 'Dejar de compartir' : 'Compartir pantalla'"
        >
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="handleEndStream"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
          title="Salir"
        >
          <PowerIcon class="w-6 h-6 text-red-500" />
        </button>
      </div>

      <!-- Panel de debug (opcional) -->
      <div v-if="debugMode" class="mt-4 p-4 bg-gray-800 rounded-lg text-xs font-mono">
        <p>Host video: {{ hostVideoEnabled ? '✅' : '❌' }}</p>
        <p>Host audio: {{ hostAudioEnabled ? '✅' : '❌' }}</p>
        <p>Mi video: {{ localVideoEnabled ? '✅' : '❌' }}</p>
        <p>Mi audio: {{ localAudioEnabled ? '✅' : '❌' }}</p>
        <p>Compartiendo: {{ screenStream ? '✅' : '❌' }}</p>
        <p>Otros viewers: {{ otherViewers.length }}</p>
        <button @click="debugMode = false" class="mt-2 px-2 py-1 bg-gray-700 rounded">Cerrar</button>
      </div>

      <!-- Botón flotante para debug -->
      <button 
        @click="debugMode = !debugMode" 
        class="fixed bottom-4 right-4 bg-gray-700 text-white px-3 py-1 rounded-full text-xs z-50"
      >
        🐞 Debug
      </button>
    </div>

    <!-- Panel derecho: Miniaturas de OTROS participantes (excluyendo host) -->
    <div v-if="otherViewers.length > 0" class="w-80 flex flex-col border-l border-gray-800">
      <div class="p-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <UserGroupIcon class="w-4 h-4 text-blue-400" />
          Otros participantes ({{ otherViewers.length }})
        </h3>
      </div>
      
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <div
          v-for="viewer in otherViewers"
          :key="viewer.id"
          class="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 aspect-video cursor-pointer hover:border-blue-500 transition"
          @click="setMainVideo(viewer)"
        >
          <video
            :ref="'viewerVideo_' + viewer.id"
            autoplay
            playsinline
            class="w-full h-full object-cover bg-black"
          ></video>

          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-white truncate max-w-[100px]">
                {{ viewer.name }}
              </span>
              <MicrophoneIcon 
                v-if="viewer.audioEnabled" 
                class="w-3 h-3 text-green-500 flex-shrink-0" 
              />
              <MicrophoneIcon 
                v-else 
                class="w-3 h-3 text-red-500 flex-shrink-0" 
              />
            </div>
          </div>

          <div
            v-if="!viewer.videoEnabled"
            class="absolute inset-0 flex items-center justify-center bg-gray-700/90"
          >
            <UserCircleIcon class="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: chat (cuando está expandido) -->
    <ChatStreamComponent
      v-if="expandirBool"
      :room-id="roomId"
      :user-data="userData"
      :is-host="false"
      :is-expanded="expandirBool"
      class="w-[25%]"
    />

    <!-- Modal de confirmación para salir -->
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
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  EyeIcon,
  UserGroupIcon,
  PowerIcon,
} from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'
import router from '@/router'
import socket from '@/services/socket.js'
import api from '@/services/api.js'
import ChatStreamComponent from '@/components/ChatStreamComponent.vue'

export default {
  name: 'LiveViewer',
  components: {
    ChatStreamComponent,
    UserCircleIcon,
    MicrophoneIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    ComputerDesktopIcon,
    EyeIcon,
    UserGroupIcon,
    PowerIcon,
    ToastNotification
  },
  data() {
    return {
      // Peer y streams
      peer: null,
      localStream: null,
      screenStream: null,
      call: null,
      
      // Conexión
      roomId: this.$route.params.link, // ID de la sala (link)
      hostPeerId: null,
      myPeerId: null,
      
      // Estado medios viewer
      localAudioEnabled: false,
      localVideoEnabled: false,
      
      // Estado medios host
      hostVideoEnabled: false,
      hostAudioEnabled: false,
      
      // Viewers (otros participantes además del host)
      viewers: [], // { id, call, stream, videoEnabled, audioEnabled, name }
      
      // UI
      isJoining: true,
      isConnected: false,
      participantes: [], // Para compatibilidad
      expandirBool: true,
      showEndStreamConfirm: false,
      debugMode: false,
      
      // Tiempo
      startTime: null,
      tiempo: 0,
      tiempoFormateado: '00:00',
      intervalo: null,
      
      // Usuario
      userData: JSON.parse(localStorage.getItem('user') || '{}'),
      viewerId: null,
      
      // Control de vista principal
      mainVideoSource: 'host', // 'host' o id de otro viewer
    }
  },

  computed: {
    otherViewers() {
      // Filtramos para no mostrar al host (que ya está en video principal)
      return this.viewers.filter(v => v.id !== this.hostPeerId)
    }
  },

  watch: {
    // Cuando cambia el video del host, actualizar la vista principal si corresponde
    hostVideoEnabled() {
      if (this.mainVideoSource === 'host') {
        this.updateMainVideo()
      }
    }
  },

  async mounted() {
    // Configurar socket events
    this.setupSocketEvents()
    
    // Unirse a la reunión
    await this.joinRoom()
  },

  methods: {
    setupSocketEvents() {
      socket.on('viewer-expelled', () => {
        this.addToast('Has sido expulsado de la reunión', 'error')
        setTimeout(() => this.confirmEndStream(), 2000)
      })

      socket.on('join-accepted', (data) => {
        if (data) {
          this.startTime = data.startTime
          this.hostPeerId = data.hostId
          this.iniciarContador()
          this.addToast('Conectado a la reunión', 'success')
        }
      })

      socket.on('meeting-time', ({ startTime }) => {
        console.log('Sincronización de tiempo recibida:', startTime)
        this.startTime = startTime
        this.iniciarContador()
      })

      socket.on('stream-ended', () => {
        this.addToast('La transmisión ha finalizado', 'info')
        setTimeout(() => this.confirmEndStream(), 2000)
      })

      socket.on('left-room', (data) => {
        // Un viewer se fue
        this.viewers = this.viewers.filter(v => v.id !== data.viewerId)
        
        // Si el video principal era de ese viewer, volver al host
        if (this.mainVideoSource === data.viewerId) {
          this.setMainVideo('host')
        }
      })
    },

    async joinRoom() {
      this.isJoining = true
      
      try {
        // 1️⃣ Obtener información de la sala desde el servidor PeerJS
        console.log('🔍 Buscando sala:', this.roomId)
        const res = await axios.get(`http://localhost:3001/api/room/${this.roomId}`)
        this.hostPeerId = res.data.hostPeerId
        console.log('🎯 Host Peer ID:', this.hostPeerId)

        // 2️⃣ Solicitar unirse vía socket
        socket.emit('request-join', { 
          roomId: this.roomId, 
          viewerData: {
            ...this.userData,
            socketId: socket.id
          } 
        })

        // 3️⃣ Obtener stream local del viewer (TU CÁMARA)
        console.log('🎥 Solicitando tu cámara y micrófono...')
        
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320, max: 320 }, // Más pequeña para la miniatura
              height: { ideal: 240, max: 240 },
              frameRate: { ideal: 15, max: 30 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
          
          this.localVideoEnabled = true
          this.localAudioEnabled = true
          
        } catch (err) {
          console.warn('Fallo configuración, intentando solo audio:', err)
          try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            })
            this.localVideoEnabled = false
            this.localAudioEnabled = true
          } catch (audioErr) {
            console.error('No se pudo obtener ningún medio:', audioErr)
            this.localStream = new MediaStream()
            this.localVideoEnabled = false
            this.localAudioEnabled = false
          }
        }

        // Mostrar TU video local en la miniatura
        if (this.localVideoEnabled && this.$refs.localVideo) {
          this.$refs.localVideo.srcObject = this.localStream
          await this.$refs.localVideo.play().catch(e => console.warn('Error play local:', e))
        }

        // 4️⃣ Crear peer para el viewer
        this.peer = new Peer(undefined, {
          host: 'localhost',
          port: 3001,
          path: '/peerjs',
          debug: 3
        })

        this.peer.on('open', (id) => {
          this.myPeerId = id
          console.log('🔑 Mi Peer ID:', id)
          
          // 5️⃣ Llamar al host con TU stream
          console.log('📞 Llamando al host...')
          this.call = this.peer.call(this.hostPeerId, this.localStream, {
            metadata: {
              name: this.userData.name || this.userData.email,
              socketId: socket.id
            }
          })

          // 6️⃣ Recibir stream del host (LO QUE SE VE EN GRANDE)
          this.call.on('stream', (remoteStream) => {
            console.log('✅ Stream del host recibido')
            
            this.hostVideoEnabled = remoteStream.getVideoTracks().length > 0
            this.hostAudioEnabled = remoteStream.getAudioTracks().length > 0
            
            // Asignar al elemento video principal (GRANDE)
            this.updateMainVideo()
          })

          // Monitorear tracks del host
          this.call.on('track', (track, stream) => {
            console.log('Track del host:', track.kind, track.enabled)
            if (track.kind === 'video') {
              this.hostVideoEnabled = track.enabled
              this.updateMainVideo()
            } else if (track.kind === 'audio') {
              this.hostAudioEnabled = track.enabled
            }
          })

          this.call.on('error', (err) => {
            console.error('Error en llamada:', err)
            this.addToast('Error de conexión con el host', 'error')
          })

          this.call.on('close', () => {
            console.log('Llamada cerrada')
            this.isConnected = false
          })
        })

        this.peer.on('error', (error) => {
          console.error('Error en Peer:', error)
          this.addToast(`Error de conexión: ${error.type}`, 'error')
        })

        // 7️⃣ Escuchar llamadas de otros viewers (para mesh networking)
        this.peer.on('call', (call) => {
          console.log('📞 Conexión de otro viewer:', call.peer)
          
          // Responder con nuestro stream
          call.answer(this.localStream)
          
          const viewer = {
            id: call.peer,
            call: call,
            stream: null,
            videoEnabled: true,
            audioEnabled: true,
            name: call.metadata?.name || 'Viewer'
          }
          
          call.on('stream', (remoteStream) => {
            viewer.stream = remoteStream
            viewer.videoEnabled = remoteStream.getVideoTracks().length > 0
            viewer.audioEnabled = remoteStream.getAudioTracks().length > 0
            
            this.$nextTick(() => {
              const videoRef = this.$refs['viewerVideo_' + viewer.id]
              if (videoRef && videoRef[0]) {
                videoRef[0].srcObject = remoteStream
                videoRef[0].play().catch(e => console.warn('Error play viewer:', e))
              }
            })
          })
          
          call.on('track', (track) => {
            if (track.kind === 'video') {
              viewer.videoEnabled = track.enabled
            } else if (track.kind === 'audio') {
              viewer.audioEnabled = track.enabled
            }
          })
          
          call.on('close', () => {
            this.viewers = this.viewers.filter(v => v.id !== call.peer)
          })
          
          this.viewers.push(viewer)
        })

        // Una vez que el peer está listo, indicamos que estamos conectados
        this.isConnected = true
        this.isJoining = false

      } catch (error) {
        console.error('Error al unirse:', error)
        this.handleMediaError(error)
        this.isJoining = false
      }
    },

    // Actualizar el video principal según la fuente seleccionada
    updateMainVideo() {
      if (this.mainVideoSource === 'host') {
        // Mostrar stream del host (lo que recibimos en la llamada principal)
        if (this.call && this.call.remoteStream) {
          this.$refs.remoteVideo.srcObject = this.call.remoteStream
        }
      } else {
        // Mostrar stream de otro viewer
        const viewer = this.viewers.find(v => v.id === this.mainVideoSource)
        if (viewer?.stream) {
          this.$refs.remoteVideo.srcObject = viewer.stream
        }
      }
      
      // Forzar reproducción
      this.$refs.remoteVideo.play().catch(e => console.warn('Error play remote:', e))
    },

    // Cambiar el video principal para ver a otro participante
    setMainVideo(viewer) {
      if (viewer === 'host') {
        this.mainVideoSource = 'host'
        this.updateMainVideo()
      } else {
        this.mainVideoSource = viewer.id
        if (viewer.stream) {
          this.$refs.remoteVideo.srcObject = viewer.stream
          this.$refs.remoteVideo.play().catch(e => console.warn('Error play remote:', e))
        }
      }
    },

    // Alternar entre tu cámara y el host (útil para verificar)
    toggleMainView() {
      if (this.mainVideoSource === 'host') {
        // Cambiar a tu propia cámara (por si quieres ver cómo te ven)
        if (this.localStream) {
          this.$refs.remoteVideo.srcObject = this.localStream
          this.mainVideoSource = 'self'
        }
      } else {
        // Volver al host
        this.mainVideoSource = 'host'
        this.updateMainVideo()
      }
    },

    toggleLocalAudio() {
      if (this.localStream) {
        this.localAudioEnabled = !this.localAudioEnabled
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = this.localAudioEnabled
        })
        console.log('🎤 Audio:', this.localAudioEnabled ? 'activado' : 'desactivado')
      }
    },

    toggleLocalVideo() {
      if (!this.localStream) return
      
      if (this.localVideoEnabled) {
        // Apagar video
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = false
        })
        this.localVideoEnabled = false
        
        // Si está compartiendo pantalla, detener
        if (this.screenStream) {
          this.stopScreenShare()
        }
      } else {
        // Encender video
        if (this.localStream.getVideoTracks().length === 0) {
          // No hay track de video, hay que crearlo
          navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 320, max: 320 },
              height: { ideal: 240, max: 240 }
            } 
          })
            .then(stream => {
              const videoTrack = stream.getVideoTracks()[0]
              this.localStream.addTrack(videoTrack)
              this.localVideoEnabled = true
              
              // Reemplazar track en la llamada
              this.replaceVideoTrack(videoTrack)
              
              // Mostrar localmente
              if (this.$refs.localVideo) {
                this.$refs.localVideo.srcObject = this.localStream
              }
            })
            .catch(err => {
              console.error('Error al activar cámara:', err)
              this.addToast('No se pudo activar la cámara', 'error')
            })
        } else {
          // Ya hay track, solo habilitar
          this.localStream.getVideoTracks().forEach(track => {
            track.enabled = true
          })
          this.localVideoEnabled = true
        }
      }
    },

    async toggleScreenShare() {
      if (this.screenStream) {
        await this.stopScreenShare()
      } else {
        await this.startScreenShare()
      }
    },

    async startScreenShare() {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })

        const screenTrack = this.screenStream.getVideoTracks()[0]

        // Reemplazar track en la llamada al host
        await this.replaceVideoTrack(screenTrack)

        // Mostrar pantalla localmente en la miniatura
        if (this.$refs.localVideo) {
          this.$refs.localVideo.srcObject = this.screenStream
        }

        screenTrack.onended = () => {
          this.stopScreenShare()
        }

      } catch (error) {
        console.error('Error compartiendo pantalla:', error)
        this.screenStream = null
      }
    },

    async stopScreenShare() {
      if (this.screenStream && this.localStream) {
        // Volver a cámara si estaba activa
        if (this.localVideoEnabled) {
          const videoTrack = this.localStream.getVideoTracks()[0]
          if (videoTrack) {
            await this.replaceVideoTrack(videoTrack)
            if (this.$refs.localVideo) {
              this.$refs.localVideo.srcObject = this.localStream
            }
          }
        }

        this.screenStream.getTracks().forEach(track => track.stop())
        this.screenStream = null
      }
    },

    async replaceVideoTrack(newTrack) {
      if (this.call && this.call.peerConnection) {
        const senders = this.call.peerConnection.getSenders()
        const videoSender = senders.find(s => s.track && s.track.kind === 'video')

        if (videoSender) {
          try {
            await videoSender.replaceTrack(newTrack)
            console.log('Track de video reemplazado')
          } catch (err) {
            console.error('Error reemplazando track:', err)
          }
        }
      }
    },

    handleMediaError(error) {
      if (error.name === 'NotAllowedError') {
        this.addToast('Permiso denegado. Por favor, permite el acceso en la URL del navegador', 'error')
      } else if (error.name === 'NotFoundError') {
        this.addToast('No se encontró cámara/micrófono', 'error')
      } else if (error.name === 'NotReadableError') {
        this.addToast('El dispositivo está siendo usado por otra aplicación', 'error')
      } else {
        this.addToast(`Error: ${error.message}`, 'error')
      }
    },

    handleEndStream() {
      this.showEndStreamConfirm = true
    },

    async confirmEndStream() {
      // Notificar al host que nos vamos
      socket.emit('leave-room', { 
        roomId: this.roomId, 
        viewerId: this.userData.id 
      })

      // Limpiar recursos
      if (this.localStream) {
        this.localStream.getTracks().forEach(t => t.stop())
      }
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(t => t.stop())
      }
      if (this.peer) {
        this.peer.destroy()
      }
      if (this.intervalo) {
        clearInterval(this.intervalo)
      }

      router.push({ name: 'transmitions' })
    },

    iniciarContador() {
      if (!this.startTime) return
      if (this.intervalo) clearInterval(this.intervalo)
      
      const startMs = this.startTime < 10000000000 ? this.startTime * 1000 : this.startTime
      
      this.intervalo = setInterval(() => {
        const ahora = Date.now()
        const diff = Math.floor((ahora - startMs) / 1000)
        this.tiempo = diff > 0 ? diff : 0
        this.tiempoFormateado = this.formatTime(this.tiempo)
      }, 1000)
    },

    formatTime(segundos) {
      const horas = Math.floor(segundos / 3600)
      const minutos = Math.floor((segundos % 3600) / 60)
      const seg = segundos % 60
      
      if (horas > 0) {
        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
      }
      return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`
    },

    addToast(message, type = 'info', duration = 3000) {
      this.$refs.toastRef?.addToast(message, type, duration)
    }
  },

  beforeDestroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop())
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop())
    }
    if (this.peer) {
      this.peer.destroy()
    }
    if (this.intervalo) {
      clearInterval(this.intervalo)
    }
    
    // Desconectar sockets
    socket.off('viewer-expelled')
    socket.off('join-accepted')
    socket.off('meeting-time')
    socket.off('stream-ended')
    socket.off('left-room')
  }
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
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Asegurar que el video se vea bien */
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>