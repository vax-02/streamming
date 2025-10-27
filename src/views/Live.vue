<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Panel izquierdo: participantes y sala de espera -->
    <aside class="w-[20%] bg-gray-800 p-4 flex flex-col space-y-4">
      <h2 class="text-lg font-bold text-center">Participantes</h2>

      <!-- Sala de espera -->
      <div>
        <h3 class="font-semibold text-sm text-gray-400 mb-1">Sala de espera</h3>
        <div
          v-for="(user, i) in salaEspera"
          :key="i"
          class="flex justify-between items-center bg-gray-700 rounded-lg px-2 py-1 mb-1"
        >
          <span>{{ user }}</span>
          <div class="flex space-x-1">
            <button @click="admitir(user)" class="bg-green-600 p-1 rounded text-xs hover:bg-green-700">
              <CheckIcon class="w-9 h-4 text-white" />
            </button>
            <button @click="rechazar(user)" class="bg-red-600 p-1 rounded text-xs hover:bg-red-700">
              <XMarkIcon class="w-9 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de participantes -->
      <div>
        <h3 class="font-semibold text-sm text-gray-400 mb-1">En la reunión</h3>
        <div class="max-h-48 overflow-y-auto pr-1">
          <div
            v-for="(p, i) in participantes"
            :key="i"
            class="flex justify-between items-center bg-gray-700 rounded-lg px-2 py-1 mb-1"
          >
            <span>{{ p.nombre }}</span>
            <span class="text-gray-400 text-xs">{{ p.estado }}</span>
          </div>
        </div>
        <div class="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
          <span class="text-sm text-gray-400">{{ participantes.length }} participantes</span>
          <button class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-xs flex items-center space-x-1">
            <UserPlusIcon class="w-4 h-4" />
            <span>Invitar</span>
          </button>
          <button class="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-lg text-xs flex items-center space-x-1">
            <UserGroupIcon class="w-4 h-4" />
            <span>Administrar</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Panel central: video principal y controles -->
    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-black rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video ref="videoRef" autoplay muted class="w-full h-full object-cover rounded-xl"></video>

        <div
          class="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-full flex items-center space-x-2 text-sm font-semibold"
        >
          <span>10:02</span>
        </div>

        <!-- Contador de participantes -->
        <div
          class="absolute top-3 right-3 bg-blue-600 px-3 py-1 rounded-full flex  space-x-2 text-sm font-semibold"
        >
          <span class="flex items-center space-x-1">
            <EyeIcon class="w-5 h-5" /><span>{{ participantes.length }}</span>
          </span>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex justify-center space-x-4 mb-2">
        <button
          @click="toggleMic"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>
            <template v-if="micAct">
              <MicrophoneIcon class="w-6 h-6 text-green-600" />
              
            </template>
            <template v-else>
              <MicrophoneIcon class="w-6 h-6 text-gray-400" />
            </template>
          </span>

        </button>
        
        <button
          @click="toggleCamara"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
        
          <template v-if="camaraAct">
            <VideoCameraIcon class="w-6 h-6 text-green-600" />
          </template>
          <template v-else>
            <VideoCameraSlashIcon class="w-6 h-6 text-gray-400" />
          </template>
          <span>{{ camaraAct ? 'Cámara Encendida' : 'Cámara Apagada' }}</span>
        
        </button>
        <button
          @click="togglePantalla"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <template v-if="pantallaAct">
            <ComputerDesktopIcon class="w-6 h-6 text-green-600" />
          </template>
          <template v-else>
            <ComputerDesktopIcon class="w-6 h-6 text-gray-400" />
          </template>
          <span>{{ pantallaAct ? 'Deteniendo' : 'Compartir Pantalla' }}</span>
        </button>
        <button
          @click="toggleGrabacion"
          class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <template v-if="grabando">
            <StopCircleIcon class="w-6 h-6 text-white" />
          </template>
          <template v-else>
            <PlayCircleIcon class="w-6 h-6 text-white" />
          </template>
          <span>{{ grabando ? 'Grabando' : 'Iniciar Grabación' }}</span>
        </button>
        <button
          @click="expandir"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-gray-300" />
          <span>Agrandar</span>
        </button>
                <button
          @click="modalTest = true"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <WrenchScrewdriverIcon class="w-6 h-6 text-gray-300" />
          <span>Prueba de cámara y audio</span>
        </button>
      </div>
    </div>

    <!-- Panel derecho: chat -->
    <aside class="w-[20%] bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black">
      <h2 class="text-lg font-bold text-center">Chat en vivo</h2>
      <div class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1">
        <div v-for="(msg, i) in chat" :key="i" class="text-sm">
          <strong>{{ msg.usuario }}:</strong> {{ msg.mensaje }}
        </div>
      </div>
      <div class="relative flex items-center space-x-2 mt-2">
        <!-- Menú de opciones de chat -->
        <div v-if="showChatMenu" class="absolute bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-lg p-2 space-y-1 border border-black">
          <button class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600">
            <ChartBarIcon class="w-5 h-5" />
            <span>Crear Encuesta</span>
          </button>
          <button class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600">
            <PencilSquareIcon class="w-5 h-5" />
            <span>Enviar Ejercicio</span>
          </button>
        </div>

        <!-- Botón para abrir el menú -->
        <button @click="showChatMenu = !showChatMenu" class="text-gray-400 hover:text-blue-400 p-1 rounded-full">
          <PlusCircleIcon class="w-6 h-6" />
        </button>

        <!-- Input de mensaje -->
        <input
          v-model="mensaje"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 bg-gray-600 rounded-lg px-2 py-1 outline-none"
          @focus="showChatMenu = false"
        />
        <button @click="enviarMensaje" class="bg-blue-600 px-3 py-1 rounded-lg text-sm">Enviar</button>
      </div>
    </aside>

    <!-- Modal: prueba de audio/cámara -->
    <div
      v-if="modalTest"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 relative">
        <h3 class="text-2xl font-bold text-center">Prueba de Audio y Cámara</h3>
        <button
          @click="modalTest = false"
          class="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
        >
          ✖
        </button>
        <video ref="modalVideoRef" autoplay muted class="w-full h-40 bg-black rounded-lg"></video>
        <!-- En el modal de prueba, debajo del <video> -->
<div class="w-full bg-gray-600 rounded-full h-2.5 mt-2">
  <div
    class="bg-green-500 h-2.5 rounded-full transition-all duration-75"
    :style="{ width: `${audioLevel}%` }"
  ></div>
</div>

        <div class="flex justify-around mt-2">
          <button @click="toggleMic" class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg">
            Micro {{ micAct ? 'On' : 'Off' }}
          </button>
          <button @click="toggleCamara" class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg">
            Camara {{ camaraAct ? 'On' : 'Off' }}
          </button>
        </div>
        <button
          @click="modalTest = false"
          class="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-lg font-semibold"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MicrophoneIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  ChartBarIcon,
  PencilSquareIcon,
  UserPlusIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  PlayCircleIcon,
  StopCircleIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/vue/24/solid'

import { ref, onUnmounted } from 'vue'
const videoRef = ref(null)
const modalVideoRef = ref(null)

// Controles
const micAct = ref(false)
const camaraAct = ref(false)
const pantallaAct = ref(false)
const grabando = ref(false)
const modalTest = ref(false) // Abrir modal al iniciar

// Participantes
const salaEspera = ref(['Alumno1', 'Alumno2'])
const participantes = ref([
  { nombre: 'Alumno3', estado: 'Activo' },
  { nombre: 'Alumno4', estado: 'Activo' },
])

// Chat
const chat = ref([])
const mensaje = ref('')
const showChatMenu = ref(false)

// --- INICIA CÓDIGO NUEVO ---

// Ref para el nivel de audio (controlará el ancho de la barra)
const audioLevel = ref(0)

// Variables para la API de Audio
let audioContext
let audioAnalyser
let audioStream
let audioSource
let animationFrameId
let videoStream = null

// Función que se ejecuta en bucle para dibujar la barra
function visualize() {
  if (!audioAnalyser) return

  const bufferLength = audioAnalyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  audioAnalyser.getByteFrequencyData(dataArray)

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }
  const average = sum / bufferLength

  // Normalizamos el valor para que sea un porcentaje (0-100)
  // Multiplicamos por 1.5 para hacerlo más sensible
  const level = Math.min(100, (average / 128) * 100 * 1.5)
  audioLevel.value = level

  // Volvemos a llamar a la función en el siguiente frame
  animationFrameId = requestAnimationFrame(visualize)
}

// Detiene la visualización y libera los recursos del micrófono
function stopVisualization() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop())
  }
  if (audioContext) {
    audioContext.close().catch(() => {})
  }
  audioLevel.value = 0
}

// --- FINALIZA CÓDIGO NUEVO ---

// Funciones
async function toggleMic() {
  micAct.value = !micAct.value
  if (micAct.value) {
    try {
      // Pedimos acceso al micrófono
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Configuramos el analizador de audio
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioSource = audioContext.createMediaStreamSource(audioStream)
      audioAnalyser = audioContext.createAnalyser()
      audioAnalyser.fftSize = 256
      audioSource.connect(audioAnalyser)

      // Iniciamos la visualización
      visualize()
    } catch (err) {
      console.error('Error al acceder al micrófono:', err)
      micAct.value = false // Revertimos el estado si hay un error
    }
  } else {
    // Detenemos todo si el micrófono se apaga
    stopVisualization()
  }
}
async function toggleCamara() {
  camaraAct.value = !camaraAct.value
  if (camaraAct.value) {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (modalVideoRef.value) {
        modalVideoRef.value.srcObject = videoStream
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      camaraAct.value = false
    }
  } else {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
    }
    if (modalVideoRef.value) {
      modalVideoRef.value.srcObject = null
    }
  }
}
function togglePantalla() {
  pantallaAct.value = !pantallaAct.value
}
function toggleGrabacion() {
  grabando.value = !grabando.value
}
function expandir() {
  alert('Expandir video a pantalla completa')
}

function enviarMensaje() {
  if (!mensaje.value) return
  chat.value.push({ usuario: 'Docente', mensaje: mensaje.value })
  mensaje.value = ''
}

// Sala de espera
function admitir(user) {
  participantes.value.push({ nombre: user, estado: 'Activo' })
  salaEspera.value = salaEspera.value.filter((u) => u !== user)
}
function rechazar(user) {
  salaEspera.value = salaEspera.value.filter((u) => u !== user)
}

// Asegúrate de limpiar todo cuando el componente se desmonte
onUnmounted(() => {
  stopVisualization()
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop())
  }
})

</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #7e22ce;
  border-radius: 4px;
}
</style>
