<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Panel izquierdo: participantes y sala de espera -->
    <aside v-show="expandirBool" class="w-[20%]  bg-gray-800 p-4 flex flex-col space-y-4">
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
            <button
              @click="admitir(user)"
              class="bg-green-600 p-1 rounded text-xs hover:bg-green-700"
            >
              <CheckIcon class="w-9 h-4 text-white" />
            </button>
            <button @click="rechazar(user)" class="bg-red-600 p-1 rounded text-xs hover:bg-red-700">
              <XMarkIcon class="w-9 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de participantes -->
      <!-- Lista de participantes -->
      <div class="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col h-[90vh]">
        <h3 class="font-semibold text-sm text-gray-300 mb-2 flex items-center gap-2">
          <UserGroupIcon class="w-5 h-5 text-blue-500" />
          En la reunión
        </h3>

        <!-- Lista con scroll -->
        <div class="flex-1 overflow-y-auto pr-1 h-[90vh] custom-scrollbar">
          <div
            v-for="(p, i) in participantes"
            :key="i"
            class="flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg mb-1 relative"
          >
            <!-- Nombre e icono -->
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-5 h-5 text-blue-400" />
              <span class="font-medium text-sm">{{ p.nombre }}</span>
            </div>

            <!-- Estado, micrófono y opciones -->
            <div class="flex items-center gap-3">
              <!-- Estado -->
              <span
                class="text-xs font-semibold"
                :class="p.estado === 'Activo' ? 'text-green-400' : 'text-red-400'"
              >
                <MicrophoneIcon class="w-6 h-6 text-green-600" />
              </span>

              <!-- Opciones -->
              <div class="relative">
                <button
                  @click="toggleMenu(i)"
                  class="p-1 hover:bg-gray-500 rounded-full transition"
                >
                  <EllipsisHorizontalIcon class="w-5 h-5 text-gray-300" />
                </button>

                <!-- Menú desplegable -->
                <div
                  v-if="menuAbierto === i"
                  class="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg w-28 text-sm py-1 z-10"
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

        <!-- Barra inferior fija -->
        <div
          class="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-sm text-gray-400"
        >
          <span>👥 {{ participantes.length }} participantes</span>
        </div>
      </div>
    </aside>

    <!-- Panel central: video principal y controles -->
     
    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-black rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video ref="videoRef" autoplay muted class="w-90 h-90 object-cover rounded-xl"></video>

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
              ref="miniVideoRef"
              autoplay
              muted
              class="w-full h-full object-cover rounded-lg"
            ></video>
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg"
            >
              <UserCircleIcon class="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <!-- Nombre -->
          <span class="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
            Tú
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
              <MicrophoneIcon class="w-6 h-6 text-red-400" />
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
            <VideoCameraSlashIcon class="w-6 h-6 text-red-400" />
          </template>
        </button>
        <button
          @click="(togglePantalla(), shareScreen())"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <template v-if="pantallaAct">
            <ComputerDesktopIcon class="w-6 h-6 text-green-600" />
          </template>
          <template v-else>
            <ComputerDesktopIcon class="w-6 h-6 text-gray-400" />
          </template>

          <template v-if="pantallAct">
            <ComputerDesktopIcon class="w-6 h-6" /> aca
          </template>
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
        </button>
        <button
          @click="expandir"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-gray-300" />
        </button>

        <router-link
          :to="{ name: 'transmitions' }"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <XMarkIcon class="w-6 h-6 text-red-600" />
        </router-link>

        <button
          @click="modalTest = true"
          class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <EllipsisHorizontalIcon class="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>

    <!-- Panel derecho: chat -->
    <aside v-show="expandirBool" class="w-[25%] bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black">
      <h2 class="text-lg font-bold text-center">Chat en vivo</h2>
      <div class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1">
        <div v-for="(msg, i) in chat" :key="i" class="text-sm">
          <strong>{{ msg.usuario }}:</strong> {{ msg.mensaje }}
        </div>
      </div>
      <div class="relative flex items-center space-x-2 mt-2">
        <!-- Menú de opciones de chat -->
        <div
          v-if="showChatMenu"
          class="absolute bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-lg p-2 space-y-1 border border-black"
        >
          <button
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600"
          >
            <ChartBarIcon class="w-5 h-5" />
            <span>Crear Encuesta</span>
          </button>
          <button
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600"
          >
            <PencilSquareIcon class="w-5 h-5" />
            <span>Enviar Ejercicio</span>
          </button>
        </div>

        <!-- Botón para abrir el menú -->
        <button
          @click="showChatMenu = !showChatMenu"
          class="text-gray-400 hover:text-blue-400 p-1 rounded-full"
        >
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
        <button @click="enviarMensaje" class="bg-blue-600 px-3 py-1 rounded-lg text-sm">
          Enviar
        </button>
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
  EllipsisHorizontalIcon,
  MicrophoneIcon,
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
  UserGroupIcon,
} from '@heroicons/vue/24/solid'

import { ref, onUnmounted, onMounted, onBeforeUnmount } from 'vue'

const videoRef = ref(null)
const modalVideoRef = ref(null)

const micAct = ref(false)
const camaraAct = ref(false)
const pantallaAct = ref(false)
const grabando = ref(false)
const modalTest = ref(false) 

const salaEspera = ref(['Alumno1', 'Alumno2'])
const participantes = ref([
  { nombre: 'Alumno3', estado: 'Activo' },
  { nombre: 'Alumno4', estado: 'Activo' },
])

const chat = ref([])
const mensaje = ref('')
const showChatMenu = ref(false)
const expandirBool = ref(true)

const audioLevel = ref(0)

let audioContext
let audioAnalyser
let audioStream
let audioSource
let animationFrameId
let videoStream = null

function visualize() {
  if (!audioAnalyser) return

  const bufferLength = audioAnalyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  audioAnalyser.getByteFrequencyData(dataArray)

  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }
  const average = sum / bufferLength

  const level = Math.min(100, (average / 128) * 100 * 1.5)
  audioLevel.value = level

  animationFrameId = requestAnimationFrame(visualize)
}

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
    stopVisualization()
  }
}

const tiempo = ref(0) // tiempo en segundos
const tiempoFormateado = ref('00:00')
let intervalo = null

function formatTime(segundos) {
  const min = Math.floor(segundos / 60)
    .toString()
    .padStart(2, '0')
  const sec = (segundos % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

onMounted(() => {
  intervalo = setInterval(() => {
    tiempo.value++
    tiempoFormateado.value = formatTime(tiempo.value)
  }, 1000)
})

function terminarReunion() {
  clearInterval(intervalo)
  tiempo.value = 0
  tiempoFormateado.value = formatTime(tiempo.value)
}

onBeforeUnmount(() => {
  clearInterval(intervalo)
})
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
  expandirBool.value = !expandirBool.value
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

onUnmounted(() => {
  stopVisualization()
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop())
  }
})

const menuAbierto = ref(null)

function toggleMenu(index) {
  menuAbierto.value = menuAbierto.value === index ? null : index
}

function silenciar(p) {
  p.audioActivo = false
  menuAbierto.value = null
}

function expulsar(p) {
  alert(`Expulsando a ${p.nombre}...`)
  menuAbierto.value = null
}
async function shareScreen() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    const video = document.querySelector('video')
    video.srcObject = stream
  } catch (err) {
    console.error('Error al compartir pantalla:', err)
  }
}
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
