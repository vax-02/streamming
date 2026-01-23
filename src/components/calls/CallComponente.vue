<template>
  <div class="relative h-screen bg-black overflow-hidden text-white font-sans">
    
    <!-- State: Calling (outgoing) -->
    <CallingComponent 
      v-if="callState === 'calling'" 
      :contactName="targetName" 
      :contactPhoto="targetPhoto"
      @hangup="endCall" 
    />

    <!-- State: In Call (Active) -->
    <div v-else class="flex flex-col h-full relative z-10">
      
      <!-- BACKGROUND BLUR EFFECT -->
      <div class="absolute inset-0 z-0 overflow-hidden">
        <img 
          :src="targetPhoto || 'https://ui-avatars.com/api/?name=' + targetName" 
          class="w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      </div>

      <!-- TOP SECTION: Status & Timer -->
      <div class="relative z-20 pt-16 flex flex-col items-center animate-fade-in-down">
        <!-- Minimize Button -->
        <button 
          @click="minimizeCall"
          class="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all duration-200"
          title="Minimizar"
        >
          <ChevronDownIcon class="w-6 h-6" />
        </button>

        <div class="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2 mb-2">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-semibold tracking-widest uppercase opacity-80">En llamada</span>
        </div>
        <h2 class="text-3xl font-bold tracking-tight mb-1">{{ targetName }}</h2>
        <div class="text-xl font-mono opacity-90">{{ formatTime(callDuration) }}</div>
      </div>

      <!-- MIDDLE SECTION: Avatar & Interaction -->
      <div class="flex-grow flex flex-col items-center justify-center relative z-10 px-6">
        <div class="relative">
          <!-- Dynamic Aura -->
          <div class="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl scale-150 animate-pulse-slow"></div>
          
          <div class="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-4 border-white/10 p-2 backdrop-blur-sm bg-white/5 shadow-2xl overflow-hidden ring-4 ring-blue-500/30">
            <img 
              :src="targetPhoto || 'https://ui-avatars.com/api/?name=' + targetName" 
              alt="Contact" 
              class="w-full h-full rounded-full object-cover shadow-inner"
            >
          </div>
          
          <!-- Call Details Overlay -->
          <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg flex items-center gap-1 border border-blue-400/50">
            <LockClosedIcon class="w-3 h-3" />
            Cifrado de extremo a extremo
          </div>
        </div>
      </div>

      <!-- VIDEO ELEMENTS (Hidden for Audio Call) -->
      <div v-show="false">
          <video ref="remoteVideo" class="w-full h-full object-cover" autoplay playsinline></video>
          <video ref="localVideo" class="w-full h-full object-cover transform -scale-x-100" autoplay playsinline muted></video>
      </div>

      <!-- BOTTOM SECTION: Controls -->
      <div class="relative z-20 pb-16 flex flex-col items-center">
        
        <div class="flex items-center gap-6 md:gap-10 bg-white/10 backdrop-blur-xl px-8 py-6 rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <!-- Mic Toggle -->
          <button 
            @click="toggleAudio" 
            class="group flex flex-col items-center gap-2"
          >
            <div 
              class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300"
              :class="isAudioEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'"
            >
              <MicrophoneIcon v-if="isAudioEnabled" class="w-6 h-6 md:w-7 md:h-7" />
              <MicrophoneIconSlash v-else class="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span class="text-[10px] uppercase font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              {{ isAudioEnabled ? 'Silencio' : 'Activado' }}
            </span>
          </button>
          <!-- END CALL -->
          <button 
            @click="endCall" 
            class="group flex flex-col items-center gap-2"
          >
            <div class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(220,38,38,0.5)] transform hover:scale-110 active:scale-95 transition-all duration-300">
              <PhoneXMarkIcon class="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span class="text-[10px] uppercase font-bold tracking-widest text-red-400 group-hover:text-red-300 transition-colors">Finalizar</span>
          </button>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import socket from '@/services/socket.js'
import CallingComponent from './CallingComponent.vue'
import { 
    MicrophoneIcon, 
    VideoCameraIcon, 
    PhoneXMarkIcon, 
    ComputerDesktopIcon,
    LockClosedIcon,
    SpeakerWaveIcon,
    Squares2X2Icon,
    ChevronDownIcon
} from '@heroicons/vue/24/solid'
import { MicrophoneIcon as MicrophoneIconSlash } from '@heroicons/vue/24/outline'
import { callStore } from '@/stores/callStore.js'

const route = useRoute()
const router = useRouter()

// Refs
const localVideo = ref(null)
const remoteVideo = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const peerConnection = ref(null)

// State
const callState = ref('calling') // 'calling', 'connected'
const isAudioEnabled = ref(true)
const isVideoEnabled = ref(true)
const callDuration = ref(0)
const timerInterval = ref(null)
const callStatus = ref('Conectando...')

// Info from Route
const targetId = route.params.id
const targetName = route.query.name || 'Usuario'
const targetPhoto = route.query.photo || null
const isIncoming = route.query.incoming === 'true' // If we navigated here from an incoming call

// WebRTC Config
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
}

// Socket Connection
onMounted(async () => {
    const userData = JSON.parse(localStorage.getItem('user'))
    const myId = userData?.id

    if (!socket.connected) {
      socket.connect()
    }

    // Join my signaling room
    socket.emit('join-video-room', myId)

    // Check if we're restoring a minimized call
    if (callStore.isInCall && !callStore.isMinimized) {
        // Restore existing call state
        localStream.value = callStore.callData.localStream
        remoteStream.value = callStore.callData.remoteStream
        peerConnection.value = callStore.callData.peerConnection
        callDuration.value = callStore.callData.callDuration
        isAudioEnabled.value = callStore.callData.isAudioEnabled
        
        if(localVideo.value && localStream.value) {
            localVideo.value.srcObject = localStream.value
        }
        if(remoteVideo.value && remoteStream.value) {
            remoteVideo.value.srcObject = remoteStream.value
        }
        
        callState.value = 'connected'
        startTimer()
    } else {
        // Initialize new call
        callStore.startCall(targetId, targetName, targetPhoto)

        // Setup Media
        await setupLocalMedia()

        if (isIncoming) {
            // If we are answering
            callState.value = 'connected'
            callStatus.value = 'Conectado'
            startTimer()
            
            const signalData = route.query.signal
            if(signalData) {
                const offer = JSON.parse(atob(signalData))
                handleReceiveCall(offer)
            }
        } else {
            // We are the caller
            callState.value = 'calling'
            startCall()
        }
    }

    // Socket Listeners
    socket.on('call-answered', async (data) => {
        if (callState.value === 'calling') {
            callState.value = 'connected'
            callStatus.value = 'Conectada'
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.signal))
            startTimer()
        }
    })

    socket.on('ice-candidate', async (data) => {
        if (peerConnection.value) {
            try {
                await peerConnection.value.addIceCandidate(new RTCIceCandidate(data.candidate))
            } catch (e) {
                console.error('Error adding ice candidate', e)
            }
        }
    })

    socket.on('call-rejected', () => {
        alert('Llamada rechazada')
        router.push({ name: 'chats' }) // Or back
    })
    
    socket.on('call-ended', () => {
        endCall(false) // Don't emit hangup again
    })
})

onBeforeUnmount(() => {
    // Only cleanup if we're actually ending the call, not just minimizing
    if (!callStore.isMinimized) {
        if(timerInterval.value) clearInterval(timerInterval.value)
        if(localStream.value) {
            localStream.value.getTracks().forEach(track => track.stop())
        }
        if(peerConnection.value) peerConnection.value.close()
    }
    
    // Always remove socket listeners
    socket.off('call-answered')
    socket.off('ice-candidate')
    socket.off('call-rejected')
    socket.off('call-ended')
})


// --- Media & Peer Logic ---

async function setupLocalMedia() {
    try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        if(localVideo.value) localVideo.value.srcObject = localStream.value
        
        // Sync with call store
        callStore.setStreams(localStream.value, null)
    } catch (error) {
        console.error('Error accessing media', error)
        alert('No se pudo acceder a la cámara/micrófono')
    }
}

function createPeerConnection() {
    peerConnection.value = new RTCPeerConnection(servers)

    // Add local tracks
    localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value)
    })

    // Handle remote tracks
    peerConnection.value.ontrack = (event) => {
        remoteStream.value = event.streams[0]
        if(remoteVideo.value) remoteVideo.value.srcObject = remoteStream.value
        
        // Sync with call store
        callStore.setStreams(localStream.value, remoteStream.value)
    }

    // Handle ICE
    peerConnection.value.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                to: targetId
            })
        }
    }
    
    // Store peer connection in call store
    callStore.setPeerConnection(peerConnection.value)
}

async function startCall() {
    createPeerConnection()
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    
    const userData = JSON.parse(localStorage.getItem('user'))
    
    socket.emit('call-user', {
        userToCall: targetId,
        signalData: offer,
        from: userData.id,
        name: userData.name,
        avatar: userData.photo
    })
}

async function handleReceiveCall(offerSignal) {
    createPeerConnection()
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(offerSignal))
    const answer = await peerConnection.value.createAnswer()
    await peerConnection.value.setLocalDescription(answer)
    
    socket.emit('make-answer', {
        signal: answer,
        to: targetId // In this case targetId is the CALLER ID from route params
    })
}

// --- UI Logic ---

function toggleAudio() {
    isAudioEnabled.value = !isAudioEnabled.value
    localStream.value.getAudioTracks().forEach(track => track.enabled = isAudioEnabled.value)
}

function toggleVideo() {
    isVideoEnabled.value = !isVideoEnabled.value
    localStream.value.getVideoTracks().forEach(track => track.enabled = isVideoEnabled.value)
}

function endCall(emitEvent = true) {
    if(emitEvent && socket) {
        socket.emit('end-call', { to: targetId })
    }
    callStore.endCall()
    router.go(-1) // Go back
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function startTimer() {
    timerInterval.value = setInterval(() => {
        callDuration.value++
        callStore.updateCallDuration(callDuration.value)
    }, 1000)
}

function minimizeCall() {
    callStore.minimizeCall()
    router.push({ name: 'chats' }) // Navigate to chats or previous page
}

</script>

<style scoped>
/* --- Animaciones personalizadas --- */

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.25;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 4s infinite ease-in-out;
}

/* Flip local video */
.transform-scale-x-neg {
    transform: scaleX(-1);
}
</style>
