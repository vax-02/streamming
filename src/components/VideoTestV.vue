<template>
  <div class="container">
    <h2>Entrar a Reunión</h2>

    <!-- Pantalla de unión -->
    <div v-show="!isConnected" class="join-room">
      <input 
        v-model="roomId" 
        placeholder="ID de la sala" 
        :disabled="isJoining"
      />
      <button @click="joinRoom" :disabled="isJoining || !roomId">
        {{ isJoining ? 'Entrando...' : 'Entrar' }}
      </button>
    </div>

    <!-- Sala de reunión -->
    <div v-show="isConnected" class="meeting-room">
      <div class="room-info">
        <h3>Conectado a la reunión</h3>
        <p>ID: <strong>{{ roomId }}</strong></p>
      </div>

      <!-- Grid de videos -->
      <div class="videos-grid">
        <!-- Video remoto (host) -->
        <div class="video-wrapper remote">
          <video 
            ref="remoteVideo" 
            autoplay 
            playsinline 
            class="video"
            @loadedmetadata="onVideoLoaded"
          ></video>
          <div class="video-label">Host</div>
          <div class="video-status" v-show="!hostVideoEnabled">🚫 Host sin cámara</div>
        </div>

        <!-- Video local (viewer) -->
        <div class="video-wrapper local">
          <video 
            ref="localVideo" 
            autoplay 
            playsinline 
            muted 
            class="video"
          ></video>
          <div class="video-label">Tú (Viewer)</div>
          <div class="video-status" v-show="!localVideoEnabled">🚫 Cámara apagada</div>
        </div>
      </div>

      <!-- Controles del viewer -->
      <div class="controls">
        <button @click="toggleLocalAudio" :class="{ 'btn-danger': !localAudioEnabled }">
          {{ localAudioEnabled ? '🎤 Mi micrófono' : '🔇 Mi micrófono apagado' }}
        </button>

        <button @click="toggleLocalVideo" :class="{ 'btn-danger': !localVideoEnabled }">
          {{ localVideoEnabled ? '📷 Mi cámara' : '🚫 Mi cámara apagada' }}
        </button>

        <button @click="shareScreen" v-show="!screenStream" class="btn-success">
          🖥️ Compartir mi pantalla
        </button>

        <button @click="stopScreenShare" v-show="screenStream" class="btn-warning">
          📹 Volver a mi cámara
        </button>
      </div>

      <!-- Panel de debug -->
      <div v-show="debugMode" class="debug-panel">
        <h4>🔧 Debug Viewer</h4>
        <p>Host video: {{ hostVideoEnabled ? '✅' : '❌' }}</p>
        <p>Host audio: {{ hostAudioEnabled ? '✅' : '❌' }}</p>
        <p>Mi video: {{ localVideoEnabled ? '✅' : '❌' }}</p>
        <p>Mi audio: {{ localAudioEnabled ? '✅' : '❌' }}</p>
        <p>Host Peer ID: {{ hostPeerId }}</p>
        <p>Mi Peer ID: {{ myPeerId }}</p>
        <p>Dimensiones video host: {{ videoWidth }}x{{ videoHeight }}</p>
        <button @click="checkConnection" class="btn-small">Ver conexión</button>
        <button @click="forceRestartVideo" class="btn-small">Reiniciar video</button>
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
      
      // Conexión
      roomId: '',
      hostPeerId: null,
      myPeerId: null,
      call: null,
      
      // Estado UI
      isJoining: false,
      isConnected: false,
      
      // Estado medios viewer
      localAudioEnabled: true,
      localVideoEnabled: true,
      
      // Estado medios host
      hostVideoEnabled: false,
      hostAudioEnabled: false,
      
      // Debug
      debugMode: false,
      videoWidth: 0,
      videoHeight: 0,
    }
  },

  methods: {
    async joinRoom() {
      this.isJoining = true
      
      try {
        // 1️⃣ Obtener información de la sala
        const res = await axios.get(`http://localhost:3001/api/room/${this.roomId}`)
        this.hostPeerId = res.data.hostPeerId
        console.log('🎯 Host Peer ID:', this.hostPeerId)

        // 2️⃣ Obtener stream local del viewer (video + audio)
        console.log('🎥 Solicitando cámara y micrófono del viewer...')
        
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
          console.warn('Fallo configuración, intentando básica:', err)
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
        }

        // Mostrar video local
        this.$refs.localVideo.srcObject = this.localStream
        await this.$refs.localVideo.play()

        // 3️⃣ Crear peer para el viewer
        this.peer = new Peer(undefined, {
          host: 'localhost',
          port: 3001,
          path: '/peerjs',
          debug: 3
        })

        this.peer.on('open', (id) => {
          this.myPeerId = id
          console.log('🔑 Mi Peer ID:', id)
          
          // 4️⃣ Llamar al host con nuestro stream
          console.log('📞 Llamando al host...')
          this.call = this.peer.call(this.hostPeerId, this.localStream)

          // 5️⃣ Recibir stream del host
          this.call.on('stream', (remoteStream) => {
            console.log('✅ Stream del host recibido')
            
            // Verificar tracks
            this.hostVideoEnabled = remoteStream.getVideoTracks().length > 0
            this.hostAudioEnabled = remoteStream.getAudioTracks().length > 0
            
            console.log('Tracks del host:', {
              video: this.hostVideoEnabled,
              audio: this.hostAudioEnabled
            })
            
            // Asignar al elemento video
            this.$refs.remoteVideo.srcObject = remoteStream
            this.$refs.remoteVideo.play()
              .then(() => {
                console.log('✅ Video del host reproduciendo')
                this.isConnected = true
              })
              .catch(err => console.warn('Error play host:', err))
          })

          // Monitorear tracks del host
          this.call.on('track', (track, stream) => {
            console.log('Track del host:', track.kind, track.enabled)
            if (track.kind === 'video') {
              this.hostVideoEnabled = track.enabled
            } else if (track.kind === 'audio') {
              this.hostAudioEnabled = track.enabled
            }
          })

          this.call.on('error', (err) => {
            console.error('Error en llamada:', err)
          })

          this.call.on('close', () => {
            console.log('Llamada cerrada')
            this.isConnected = false
          })
        })

        this.peer.on('error', (error) => {
          console.error('Error en Peer:', error)
          alert(`Error de conexión: ${error.type}`)
        })

      } catch (error) {
        console.error('Error al unirse:', error)
        this.handleMediaError(error)
      } finally {
        this.isJoining = false
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

    toggleLocalAudio() {
      if (this.localStream) {
        this.localAudioEnabled = !this.localAudioEnabled
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = this.localAudioEnabled
        })
        console.log('🎤 Mi audio:', this.localAudioEnabled ? 'activado' : 'desactivado')
      }
    },

    toggleLocalVideo() {
      if (this.localStream) {
        this.localVideoEnabled = !this.localVideoEnabled
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = this.localVideoEnabled
        })
        console.log('📹 Mi video:', this.localVideoEnabled ? 'activado' : 'desactivado')
      }
    },

    async shareScreen() {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })

        const screenTrack = this.screenStream.getVideoTracks()[0]

        // Reemplazar track en la llamada al host
        await this.replaceVideoTrack(screenTrack)

        // Mostrar pantalla localmente
        this.$refs.localVideo.srcObject = this.screenStream

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
        this.replaceVideoTrack(cameraTrack)
        this.$refs.localVideo.srcObject = this.localStream

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

    onVideoLoaded() {
      const video = this.$refs.remoteVideo
      this.videoWidth = video.videoWidth
      this.videoHeight = video.videoHeight
      console.log('Video host cargado:', this.videoWidth, 'x', this.videoHeight)
    },

    forceRestartVideo() {
      if (this.$refs.remoteVideo && this.call) {
        const currentStream = this.$refs.remoteVideo.srcObject
        this.$refs.remoteVideo.srcObject = null
        setTimeout(() => {
          this.$refs.remoteVideo.srcObject = currentStream
          this.$refs.remoteVideo.play()
        }, 100)
      }
    },

    checkConnection() {
      console.log('=== ESTADO DEL VIEWER ===')
      console.log('Mi stream:', {
        video: this.localStream?.getVideoTracks().length,
        audio: this.localStream?.getAudioTracks().length
      })
      console.log('Host stream:', {
        video: this.hostVideoEnabled,
        audio: this.hostAudioEnabled
      })
      console.log('Conexión:', {
        state: this.call?.peerConnection?.connectionState,
        iceState: this.call?.peerConnection?.iceConnectionState
      })
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

.join-room {
  margin: 40px auto;
  text-align: center;
}

.join-room input {
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-right: 10px;
  width: 300px;
}

.join-room button {
  padding: 12px 24px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.join-room button:hover {
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

.video-wrapper.remote {
  border: 3px solid #007bff;
}

.video-wrapper.local {
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

.debug-panel {
  background: #f0f0f0;
  border: 2px solid #ffc107;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
  font-family: monospace;
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