<template>
  <div class="container">
    <h2>Crear Reunión</h2>

    <!-- Pantalla de creación -->
    <div v-show="!roomId" class="create-room">
      <input v-model="roomName" placeholder="Nombre de la reunión" />
      <button @click="startMeeting" :disabled="isStarting">
        {{ isStarting ? 'Creando...' : 'Crear' }}
      </button>
    </div>

    <!-- Sala de reunión -->
    <div v-show="roomId" class="meeting-room">
      <div class="room-info">
        <h3>{{ roomName }}</h3>
        <p>ID: <strong>{{ roomId }}</strong></p>
        <p>Comparte este ID con los participantes</p>
      </div>

      <!-- Grid de videos -->
      <div class="videos-grid">
        <!-- Video local (host) -->
        <div class="video-wrapper local">
          <video ref="localVideo" autoplay playsinline muted class="video"></video>
          <div class="video-label">Host (Tú)</div>
          <div class="video-status" v-show="!videoEnabled">🚫 Cámara apagada</div>
        </div>

        <!-- Videos de viewers -->
        <div 
          v-for="(viewer, index) in viewers" 
          :key="viewer.id" 
          class="video-wrapper remote"
        >
          <video 
            :ref="'viewerVideo_' + viewer.id" 
            autoplay 
            playsinline 
            class="video"
          ></video>
          <div class="video-label">Viewer {{ index + 1 }}</div>
          <div class="video-status" v-show="!viewer.videoEnabled">🚫 Cámara apagada</div>
        </div>
      </div>

      <!-- Controles -->
      <div class="controls">
        <button @click="toggleAudio" :class="{ 'btn-danger': !audioEnabled }">
          {{ audioEnabled ? '🎤 Micrófono' : '🔇 Micrófono apagado' }}
        </button>

        <button @click="toggleVideo" :class="{ 'btn-danger': !videoEnabled }">
          {{ videoEnabled ? '📷 Cámara' : '🚫 Cámara apagada' }}
        </button>

        <button @click="shareScreen" v-show="!screenStream" class="btn-success">
          🖥️ Compartir pantalla
        </button>

        <button @click="stopScreenShare" v-show="screenStream" class="btn-warning">
          📹 Volver a cámara
        </button>

        <button @click="showViewers" class="btn-info">
          👥 Viewers: {{ viewers.length }}
        </button>
      </div>

      <!-- Panel de debug -->
      <div v-show="debugMode" class="debug-panel">
        <h4>🔧 Debug Host</h4>
        <p>Video local activo: {{ hasLocalVideo ? '✅' : '❌' }}</p>
        <p>Audio local activo: {{ hasLocalAudio ? '✅' : '❌' }}</p>
        <p>Viewers conectados: {{ viewers.length }}</p>
        <p>Peer ID: {{ peerId }}</p>
        <button @click="checkConnections" class="btn-small">Ver conexiones</button>
        <button @click="debugMode = false" class="btn-small">Cerrar</button>
      </div>

      <button @click="debugMode = !debugMode" class="debug-toggle">
        {{ debugMode ? '🔍 Ocultar debug' : '🔍 Mostrar debug' }}
      </button>
    </div>
  </div>
</template>

<script>
import Peer from 'peerjs'
import axios from 'axios'

export default {
  data() {
    return {
      // Peer y streams
      peer: null,
      localStream: null,
      screenStream: null,
      
      // Estado de la sala
      roomName: '',
      roomId: null,
      peerId: null,
      
      // Estado de medios
      audioEnabled: true,
      videoEnabled: true,
      
      // Viewers conectados
      viewers: [], // { id, call, stream, videoEnabled }
      
      // UI
      isStarting: false,
      debugMode: false,
    }
  },

  computed: {
    hasLocalVideo() {
      return this.localStream?.getVideoTracks().some(t => t.enabled) || false
    },
    hasLocalAudio() {
      return this.localStream?.getAudioTracks().some(t => t.enabled) || false
    }
  },

  methods: {
    async startMeeting() {
      this.isStarting = true
      
      try {
        // 1️⃣ Obtener stream local con configuraciones compatibles
        console.log('🎥 Solicitando cámara y micrófono...')
        
        // Intentar con configuración estándar primero
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 640 },
              height: { ideal: 480, max: 480 },
              frameRate: { ideal: 15, max: 30 }
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
        } catch (err) {
          console.warn('Fallo configuración HD, intentando básica:', err)
          // Si falla, intentar con configuración básica
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
        }

        // Verificar tracks
        console.log('✅ Stream obtenido:', {
          video: this.localStream.getVideoTracks().length,
          audio: this.localStream.getAudioTracks().length
        })

        // Mostrar video local
        this.$refs.localVideo.srcObject = this.localStream
        await this.$refs.localVideo.play()

        // 2️⃣ Crear Peer
        this.peer = new Peer(undefined, {
          host: 'localhost',
          port: 3001,
          path: '/peerjs',
          debug: 3
        })

        // 3️⃣ Manejar llamadas entrantes de viewers
        this.peer.on('call', (call) => {
          console.log('📞 Nuevo viewer conectándose:', call.peer)
          
          // Responder con nuestro stream (video + audio)
          call.answer(this.localStream)
          
          // Crear objeto viewer
          const viewer = {
            id: call.peer,
            call: call,
            stream: null,
            videoEnabled: true
          }
          
          // Recibir stream del viewer
          call.on('stream', (remoteStream) => {
            console.log('📹 Recibiendo stream del viewer:', call.peer)
            
            viewer.stream = remoteStream
            
            // Verificar si tiene video
            const hasVideo = remoteStream.getVideoTracks().length > 0
            viewer.videoEnabled = hasVideo
            
            // Asignar al elemento video correspondiente
            this.$nextTick(() => {
              const videoRef = this.$refs['viewerVideo_' + viewer.id]
              if (videoRef && videoRef[0]) {
                videoRef[0].srcObject = remoteStream
                videoRef[0].play().catch(e => console.warn('Error play viewer:', e))
              }
            })
          })
          
          // Monitorear cambios en tracks del viewer
          call.on('track', (track, stream) => {
            console.log('Track del viewer:', track.kind, track.enabled)
            if (track.kind === 'video') {
              viewer.videoEnabled = track.enabled
            }
          })
          
          // Cuando el viewer se desconecta
          call.on('close', () => {
            console.log('👋 Viewer desconectado:', call.peer)
            this.viewers = this.viewers.filter(v => v.id !== call.peer)
          })
          
          call.on('error', (err) => {
            console.error('Error con viewer:', call.peer, err)
          })
          
          // Agregar a la lista
          this.viewers.push(viewer)
        })

        // 4️⃣ Cuando el peer esté listo, crear sala
        this.peer.on('open', async (id) => {
          this.peerId = id
          console.log('🔑 Peer ID:', id)

          try {
            const res = await axios.post('http://localhost:3001/api/create-room', {
              name: this.roomName || 'Sala sin nombre',
              hostPeerId: this.peerId
            })

            this.roomId = res.data.roomId
            console.log('✅ Sala creada con ID:', this.roomId)
          } catch (error) {
            console.error('Error creando sala:', error)
            alert('Error al crear la sala')
          }
        })

        this.peer.on('error', (error) => {
          console.error('Error en Peer:', error)
        })

      } catch (error) {
        console.error('Error específico:', error.name, error.message)
        this.handleMediaError(error)
      } finally {
        this.isStarting = false
      }
    },

    handleMediaError(error) {
      if (error.name === 'NotAllowedError') {
        alert('Permiso denegado. Por favor, permite el acceso en la URL del navegador')
      } else if (error.name === 'NotFoundError') {
        alert('No se encontró cámara/micrófono')
      } else if (error.name === 'NotReadableError') {
        alert('El dispositivo está siendo usado por otra aplicación')
      } else {
        alert(`Error: ${error.message}`)
      }
    },

    toggleAudio() {
      if (this.localStream) {
        this.audioEnabled = !this.audioEnabled
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = this.audioEnabled
        })
        console.log('🎤 Audio:', this.audioEnabled ? 'activado' : 'desactivado')
      }
    },

    toggleVideo() {
      if (this.localStream) {
        this.videoEnabled = !this.videoEnabled
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = this.videoEnabled
        })
        console.log('📹 Video:', this.videoEnabled ? 'activado' : 'desactivado')
      }
    },

    async shareScreen() {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })

        const screenTrack = this.screenStream.getVideoTracks()[0]

        // Reemplazar track en todas las conexiones
        await this.replaceVideoTrackForAll(screenTrack)

        // Mostrar pantalla localmente
        this.$refs.localVideo.srcObject = this.screenStream

        // Cuando el usuario deje de compartir pantalla
        screenTrack.onended = () => {
          this.stopScreenShare()
        }

      } catch (error) {
        console.error('Error compartiendo pantalla:', error)
      }
    },

    stopScreenShare() {
      if (this.screenStream && this.localStream) {
        const cameraTrack = this.localStream.getVideoTracks()[0]

        // Volver a cámara
        this.replaceVideoTrackForAll(cameraTrack)
        this.$refs.localVideo.srcObject = this.localStream

        // Detener stream de pantalla
        this.screenStream.getTracks().forEach(track => track.stop())
        this.screenStream = null
      }
    },

    async replaceVideoTrackForAll(newTrack) {
      for (const viewer of this.viewers) {
        if (viewer.call && viewer.call.peerConnection) {
          const senders = viewer.call.peerConnection.getSenders()
          const videoSender = senders.find(s => s.track && s.track.kind === 'video')

          if (videoSender) {
            try {
              await videoSender.replaceTrack(newTrack)
              console.log('Track reemplazado para viewer:', viewer.id)
            } catch (err) {
              console.error('Error reemplazando track:', err)
            }
          }
        }
      }
    },

    showViewers() {
      const viewerList = this.viewers.map(v => v.id).join(', ')
      alert(`Viewers conectados (${this.viewers.length}): ${viewerList || 'ninguno'}`)
    },

    checkConnections() {
      console.log('=== ESTADO DEL HOST ===')
      console.log('Viewers:', this.viewers.length)
      this.viewers.forEach((v, i) => {
        console.log(`Viewer ${i + 1}:`, {
          id: v.id,
          hasVideo: v.stream?.getVideoTracks().length > 0,
          hasAudio: v.stream?.getAudioTracks().length > 0,
          connectionState: v.call?.peerConnection?.connectionState
        })
      })
    }
  },

  beforeDestroy() {
    // Limpiar todo
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop())
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(t => t.stop())
    }
    if (this.peer) {
      this.peer.destroy()
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.create-room {
  margin: 40px auto;
  text-align: center;
}

.create-room input {
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-right: 10px;
  width: 300px;
}

.create-room button {
  padding: 12px 24px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.create-room button:hover {
  background: #0056b3;
}

.room-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.video-wrapper {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-wrapper.local {
  border: 3px solid #007bff;
}

.video-wrapper.remote {
  border: 3px solid #28a745;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #2a2a2a;
}

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 2;
}

.video-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 18px;
  z-index: 3;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 50px;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: black;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.controls button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.debug-panel {
  background: #f0f0f0;
  border: 2px solid #ffc107;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
  font-family: monospace;
  position: relative;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  z-index: 100;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  margin-right: 5px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
</style>