<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Panel izquierdo: participantes y sala de espera -->
    <aside v-show="expandirBool" class="w-[20%] bg-gray-800 p-4 flex flex-col space-y-4">
      <div class="relative flex items-center justify-center">
        <h2 class="text-lg font-bold text-center">Participantes</h2>
        <div class="absolute right-0">
          <button @click="showOptionsMenu = !showOptionsMenu" class="p-1 hover:bg-gray-600 rounded-full">
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>
          <div v-if="showOptionsMenu" class="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-lg z-20">
            <button @click="handleEndStream" class="w-full text-left px-4 py-2 hover:bg-gray-600">Finalizar</button>
            <button @click="shareStream" class="w-full text-left px-4 py-2 hover:bg-gray-600">Compartir</button>
          </div>
        </div>
      </div>

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

        <!-- Modal: Crear Encuesta (tipo WhatsApp - single choice) -->
        <div v-if="showSurveyModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto space-y-4">
            <h3 class="text-2xl font-bold text-center">Crear Encuesta</h3>

            <div>
              <label class="block text-sm text-gray-300">Pregunta</label>
              <input ref="surveyQuestionInput" v-model="surveyQuestion" type="text" placeholder="Escribe la pregunta"
                class="w-full mt-1 px-3 py-2 rounded bg-gray-700 outline-none text-white" />
              <div v-if="surveyError" class="text-sm text-red-400 mt-1">{{ surveyError }}</div>
            </div>

            <div>
              <label class="block text-sm text-gray-300">Opciones (mínimo 2)</label>
              <div class="space-y-2 mt-2">
                <div v-for="(opt, i) in surveyOptions" :key="i" class="flex items-center space-x-2">
                  <input v-model="surveyOptions[i]" type="text" placeholder="Opción" class="flex-1 px-3 py-2 rounded bg-gray-700 outline-none text-white" />
                  <button @click="removeSurveyOption(i)" class="px-2 py-1 bg-red-600 rounded text-sm">Eliminar</button>
                </div>
              </div>
              <div class="flex items-center space-x-3 mt-2">
                <button @click="addSurveyOption" class="px-3 py-1 bg-blue-600 rounded">Añadir opción</button>
              </div>
            </div>

            <div class="flex justify-end space-x-2">
              <button @click="showSurveyModal = false" class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2">
                <XMarkIcon class="w-4 h-4 text-white" />
                <span class="text-white">Cancelar</span>
              </button>
        <button
          @click.prevent="submitSurvey"
          class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <ChartBarIcon class="w-4 h-4 text-white" />
          <span class="text-white">Enviar encuesta</span>
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
          <span class="flex items-center gap-1">
            <UserGroupIcon class="w-4 h-4" />
            {{ participantes.length }} participantes
          </span>
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
        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <strong>{{ msg.usuario }}:</strong> {{ msg.mensaje }}
          </template>

          <!-- Encuesta (renderizada como texto simple) -->
          <template v-else-if="msg.tipo === 'encuesta'">
            <div>
              <strong>{{ msg.usuario }}:</strong>
              Encuesta: {{ msg.pregunta }}
              <span v-if="Array.isArray(msg.opciones)"> — Opciones: {{ msg.opciones.join(' / ') }}</span>
            </div>
          </template>

          <!-- Ejercicio -->
          <template v-else-if="msg.tipo === 'ejercicio'">
            <div class="bg-gray-800 p-3 rounded-lg">
              <div class="font-semibold">{{ msg.title }}</div>
              <div class="text-sm text-gray-300 mt-1">{{ msg.description }}</div>
              <div v-if="msg.image" class="mt-2">
                <img :src="msg.image" class="max-w-full rounded" />
              </div>
              <div class="mt-2">
                <button @click="toggleResponseInput(msg.id)" class="px-3 py-1 bg-blue-600 rounded text-sm">Responder</button>
              </div>

              <div v-if="showResponse[msg.id]" class="mt-2">
                <textarea v-model="responseText[msg.id]" rows="3" placeholder="Escribe tu respuesta" class="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none max-h-40 overflow-y-auto"></textarea>
                <div class="flex justify-end mt-2">
                  <button @click="submitExerciseResponse(msg.id)" class="px-3 py-1 bg-green-600 rounded">Enviar respuesta</button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="relative flex items-center space-x-2 mt-2">
        <!-- Menú de opciones de chat -->
        <div
          v-if="showChatMenu"
          class="absolute bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-lg p-2 space-y-1 border border-black"
        >
          <button
            @click="(showSurveyModal = true, showChatMenu = false)"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600"
          >
            <ChartBarIcon class="w-5 h-5" />
            <span>Crear Encuesta</span>
          </button>
          <button
            @click="showExerciseModal = true"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600"
          >
            <PencilSquareIcon class="w-5 h-5" />
            <span>Crear Ejercicio</span>
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
          class="flex-1 bg-gray-600 rounded-lg px-2 py-1 outline-none text-white"
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

  <!-- Modal: Crear Ejercicio -->
  <div
    v-if="showExerciseModal"
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
  >
  <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4">
      <h3 class="text-2xl font-bold text-center">Crear Ejercicio</h3>

      <div>
  <label class="block text-sm text-gray-300">Título</label>
  <input v-model="exerciseTitle" type="text" placeholder="Título del ejercicio" class="w-full mt-1 px-3 py-2 rounded bg-gray-700 outline-none text-white" />
      </div>

      <div>
  <label class="block text-sm text-gray-300">Descripción</label>
  <textarea v-model="exerciseDescription" rows="3" class="w-full mt-1 px-3 py-2 rounded bg-gray-700 outline-none text-white" placeholder="Instrucciones o enunciado"></textarea>
      </div>

      <div>
        <label class="block text-sm text-gray-300">Imagen (subir archivo)</label>
        <input @change="handleExerciseFile" type="file" accept="image/*" class="w-full mt-1 text-sm text-gray-300" />
        <div v-if="exerciseUploadProgress > 0 && exerciseUploadProgress < 100" class="mt-2">
          <div class="w-full h-2 bg-gray-600 rounded">
            <div :style="{ width: exerciseUploadProgress + '%' }" class="h-2 bg-gray-800 rounded"></div>
          </div>
          <div class="text-xs text-gray-400 mt-1">Subiendo... {{ exerciseUploadProgress }}%</div>
        </div>
        <div v-if="exerciseImageData" class="mt-2 flex flex-col sm:flex-row sm:items-start sm:space-x-4">
          <div class="max-w-full sm:max-w-xs rounded mb-2 sm:mb-0 overflow-y-auto max-h-[60vh] bg-black/30 p-1">
            <img :src="exerciseImageData" class="max-w-full rounded" />
          </div>
          <div class="flex items-start space-x-2">
            <button @click="removeExerciseImage" class="flex items-center space-x-2 bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg">
              <TrashIcon class="w-4 h-4 text-white" />
              <span class="text-white text-sm">Eliminar imagen</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm text-gray-300">Preguntas</label>
        <div class="space-y-2 mt-2">
          <div v-for="(q, i) in exerciseQuestions" :key="i" class="flex items-center space-x-2">
            <input v-model="exerciseQuestions[i]" type="text" placeholder="Pregunta" class="flex-1 px-3 py-2 rounded bg-gray-700 outline-none" />
            <button @click="removeExerciseQuestion(i)" class="px-2 py-1 bg-red-600 rounded text-sm">Eliminar</button>
          </div>
        </div>
        <button @click="addExerciseQuestion" class="mt-2 px-3 py-1 bg-blue-600 rounded">Añadir pregunta</button>
      </div>

      <div class="flex justify-end space-x-2">
        <button @click="showExerciseModal = false" class="bg-gray-700 hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center space-x-2">
          <XMarkIcon class="w-4 h-4 text-white" />
          <span class="text-white">Cancelar</span>
        </button>
        <button
          @click.prevent="submitExercise"
          :disabled="isSendingExercise"
          :class="{'opacity-60 cursor-not-allowed': isSendingExercise, 'bg-green-600 hover:bg-green-700': !isSendingExercise}"
          class="px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusCircleIcon class="w-4 h-4 text-white" />
          <span class="text-white">{{ isSendingExercise ? 'Enviando...' : 'Enviar ejercicio' }}</span>
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
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  PlayCircleIcon,
  StopCircleIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/solid'

import router from '@/router'
import { ref, onUnmounted, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

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
const showOptionsMenu = ref(false)
const showEndStreamConfirm = ref(false)

function handleEndStream() {
  showOptionsMenu.value = false
  showEndStreamConfirm.value = true
}

function confirmEndStream() {
  showEndStreamConfirm.value = false
  router.push({ name: 'dashboard' })
}

function shareStream() {
  showOptionsMenu.value = false
  alert('Funcionalidad de compartir no implementada.')
}

// (removed debug helpers)

const audioLevel = ref(0)

// Modales para ejercicios
const showExerciseModal = ref(false)

// Encuesta (modal tipo WhatsApp)
const showSurveyModal = ref(false)
const surveyQuestion = ref('')
const surveyOptions = ref(['', ''])
const surveyError = ref('')
const surveyQuestionInput = ref(null)

// focus input cuando se abre el modal
watch(showSurveyModal, async (val) => {
  if (val) {
    await nextTick()
    if (surveyQuestionInput.value && surveyQuestionInput.value.focus) surveyQuestionInput.value.focus()
  } else {
    surveyError.value = ''
  }
})

function addSurveyOption() {
  surveyOptions.value.push('')
}

function removeSurveyOption(index) {
  if (surveyOptions.value.length > 2) surveyOptions.value.splice(index, 1)
}

function submitSurvey() {
  // Build structured encuesta so the chat renderer + votePoll can handle voting
  const q = (surveyQuestion.value || '').toString().trim()
  if (!q) {
    surveyError.value = 'Introduce la pregunta de la encuesta'
    return
  }

  try {
    console.log('[submitSurvey] start', { pregunta: q, rawOptions: surveyOptions.value })
    const optsRaw = Array.isArray(surveyOptions.value) ? surveyOptions.value : ['','']
    const opts = optsRaw.map((o) => (o && o.toString().trim() ? o.toString().trim() : null)).filter(Boolean)
    while (opts.length < 2) opts.push('[vacía]')
    console.log('[submitSurvey] parsed options', opts)

  const id = nextMessageId.value++
    const encuesta = { id, tipo: 'encuesta', usuario: 'Docente', pregunta: q, opciones: opts, votos: opts.map(() => 0), multiple: false }

    // close modal first to avoid any UI blocking
    showSurveyModal.value = false
    console.log('[submitSurvey] pushing encuesta', encuesta)
    chat.value.push(encuesta)
    console.log('[submitSurvey] pushed')

    // limpiar
    surveyQuestion.value = ''
    surveyOptions.value = ['', '']
  } catch (err) {
    console.error('submitSurvey error:', err)
    try { chat.value.push({ usuario: 'Sistema', mensaje: 'No se pudo enviar la encuesta.' }) } catch { }
    surveyError.value = 'Error al enviar la encuesta'
  }
}

// Ejercicio
const exerciseTitle = ref('')
const exerciseDescription = ref('')
const exerciseImage = ref('')
const exerciseImageData = ref('')
const exerciseQuestions = ref([''])

// bandera para enviar ejercicio (evita doble click/confusión con encuesta)
const isSendingExercise = ref(false)

function addExerciseQuestion() {
  exerciseQuestions.value.push('')
}

function removeExerciseQuestion(i) {
  if (exerciseQuestions.value.length > 1) exerciseQuestions.value.splice(i, 1)
}

function submitExercise() {
  if (!exerciseTitle.value.trim()) return alert('Introduce el título del ejercicio')
  if (isSendingExercise.value) return
  isSendingExercise.value = true
  try {
    const preguntas = exerciseQuestions.value.filter(Boolean)
    const id = nextMessageId.value++
    chat.value.push({ id, tipo: 'ejercicio', usuario: 'Docente', title: exerciseTitle.value, description: exerciseDescription.value, image: exerciseImageData.value || null, preguntas })
    // limpiar y cerrar
    exerciseTitle.value = ''
    exerciseDescription.value = ''
    exerciseImage.value = ''
    exerciseImageData.value = ''
    exerciseQuestions.value = ['']
    showExerciseModal.value = false
  } finally {
    isSendingExercise.value = false
  }
}

// Message ids and voting
const nextMessageId = ref(1)
// votedPolls: map messageId -> array of selected indices (for multi) or single index
const votedPolls = ref({})

function votePoll(id, idx) {
  const m = chat.value.find((c) => c.id === id)
  if (!m || m.tipo !== 'encuesta') return
  // multiple selection
  if (m.multiple) {
    const existing = Array.isArray(votedPolls.value[id]) ? votedPolls.value[id].slice() : []
    const selected = existing
    if (selected.includes(idx)) {
      // unselect
      const next = selected.filter((s) => s !== idx)
      votedPolls.value = { ...votedPolls.value, [id]: next }
      m.votos[idx] = Math.max(0, (m.votos[idx] || 1) - 1)
    } else {
      const next = selected.concat(idx)
      votedPolls.value = { ...votedPolls.value, [id]: next }
      m.votos[idx] = (m.votos[idx] || 0) + 1
    }
  } else {
    // single selection: ignore if already voted (check !== undefined to allow index 0)
    if (votedPolls.value[id] !== undefined) return
    m.votos[idx] = (m.votos[idx] || 0) + 1
    votedPolls.value = { ...votedPolls.value, [id]: idx }
  }
  // force update so template reflects new vote counts immediately
  chat.value = [...chat.value]
}

// Exercise responses
const showResponse = ref({})
const responseText = ref({})

function toggleResponseInput(id) {
  showResponse.value[id] = !showResponse.value[id]
  if (!responseText.value[id]) responseText.value[id] = ''
}

function submitExerciseResponse(id) {
  const text = (responseText.value[id] || '').trim()
  if (!text) return alert('Escribe una respuesta')
  chat.value.push({ id: nextMessageId.value++, usuario: 'Alumno', mensaje: `Respuesta al ejercicio ${id}: ${text}` })
  responseText.value[id] = ''
  showResponse.value[id] = false
}

// File upload with progress for exercise image
const exerciseUploadProgress = ref(0)

function handleExerciseFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onprogress = (ev) => {
    if (ev.lengthComputable) {
      exerciseUploadProgress.value = Math.round((ev.loaded / ev.total) * 100)
    }
  }
  reader.onload = (ev) => {
    exerciseImageData.value = ev.target.result
    exerciseUploadProgress.value = 100
  }
  reader.readAsDataURL(file)
}

function removeExerciseImage() {
  exerciseImage.value = ''
  exerciseImageData.value = ''
  exerciseUploadProgress.value = 0
}

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
  background: #000000;
  border-radius: 4px;
}
</style>
