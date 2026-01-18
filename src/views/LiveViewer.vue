<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Panel central: video principal y controles -->

    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video
          ref="videoRef"
          autoplay
          playsinline
          class="w-full h-full object-cover rounded-xl"
        ></video>
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
              ref="modalVideoRef"
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
          @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="handleEndStream"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
          title="Salir"
        >
          <PowerIcon class="w-6 h-6 text-red-500" />
        </button>
      </div>
    </div>

    <!-- Panel derecho: chat -->
    <aside
      v-show="expandirBool"
      class="w-[25%] bg-gray-800 p-4 flex flex-col space-y-2 border-l-2 border-black"
    >
      <h2 class="text-lg font-bold text-center">Chat en vivo</h2>
      <div class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1">
        <div v-for="(msg, i) in chat" :key="msg.id || i" class="text-sm">
          <!-- Mensaje simple -->
          <template v-if="!msg.tipo">
            <strong>{{ msg.usuario }}:</strong> {{ msg.mensaje }}
          </template>

          <!-- Encuesta (renderizada como texto simple) -->
          <template v-else-if="msg.tipo === 'encuesta' && Array.isArray(msg.opciones)">
            <div class="bg-gray-800 p-3 rounded-lg my-2">
              <div class="font-semibold mb-3">
                <ChartBarIcon class="w-5 h-5 inline-block mr-2 text-blue-400" />
                {{ msg.pregunta }}
              </div>
              <div class="space-y-2">
                <div v-for="(opcion, idx) in msg.opciones" :key="idx">
                  <button
                    @click="votePoll(msg.id, idx)"
                    :class="[
                      'w-full text-left p-2 rounded-md border transition-all flex items-center gap-3',
                      msg.multiple
                        ? (votedPolls[msg.id] || []).includes(idx)
                          ? 'bg-blue-700 border-blue-500'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : votedPolls[msg.id] === idx
                          ? 'bg-blue-700 border-blue-500'
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600',
                      !msg.multiple && votedPolls[msg.id] !== undefined
                        ? 'cursor-not-allowed'
                        : 'cursor-pointer',
                    ]"
                    :disabled="!msg.multiple && votedPolls[msg.id] !== undefined"
                  >
                    <!-- Checkbox/Radio visual -->
                    <div
                      class="w-4 h-4 rounded-full border-2 flex-shrink-0"
                      :class="[
                        msg.multiple ? 'rounded-sm' : 'rounded-full',
                        (
                          msg.multiple
                            ? (votedPolls[msg.id] || []).includes(idx)
                            : votedPolls[msg.id] === idx
                        )
                          ? 'bg-blue-500 border-blue-400'
                          : 'border-gray-500',
                      ]"
                    ></div>

                    <div class="flex justify-between items-center">
                      <span>{{ opcion }}</span>
                      <span
                        v-if="
                          msg.multiple
                            ? (votedPolls[msg.id] || []).includes(idx)
                            : votedPolls[msg.id] === idx
                        "
                        class="text-green-400"
                      >
                        <CheckIcon class="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                  <div v-if="votedPolls[msg.id] !== undefined" class="mt-1 flex items-center gap-2">
                    <div class="w-full bg-gray-600 rounded-full h-1.5">
                      <div
                        class="bg-blue-500 h-1.5 rounded-full"
                        :style="{
                          width: `${(msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100}%`,
                        }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-400"
                      >{{
                        Math.round(
                          (msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100,
                        )
                      }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Ejercicio -->
          <template v-else-if="msg.tipo === 'ejercicio'">
            <div class="bg-gray-800 rounded-lg my-2 overflow-hidden">
              <div class="bg-gray-900/50 p-3 border-b border-gray-700">
                <div class="font-semibold text-base">
                  <PencilSquareIcon class="w-5 h-5 inline-block mr-2 text-yellow-400" />
                  Ejercicio: {{ msg.title }}
                </div>
              </div>
              <div class="p-3 space-y-3">
                <!-- Renderizado dinámico de contenido -->
                <div v-for="(block, blockIdx) in msg.content" :key="blockIdx">
                  <div v-if="block.type === 'text'" class="bg-gray-700/50 p-3 rounded-md space-y-3">
                    <p class="text-gray-200 whitespace-pre-wrap">{{ block.question }}</p>

                    <!-- Lista de respuestas -->
                    <div
                      v-if="block.responses && block.responses.length > 0"
                      class="border-t border-gray-600/50 pt-2 space-y-2"
                    >
                      <div v-for="(response, rIdx) in block.responses" :key="rIdx" class="text-xs">
                        <strong class="text-blue-300">{{ response.user }}:</strong>
                        <span class="text-gray-300">{{ response.text }}</span>
                      </div>
                    </div>
                  </div>
                  <img
                    v-if="block.type === 'image'"
                    :src="block.src"
                    class="max-w-full rounded-md mt-2"
                  />
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
            @click="((showSurveyModal = true), (showChatMenu = false))"
            class="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-blue-600"
          >
            <ChartBarIcon class="w-5 h-5" />
            <span>Crear Encuesta</span>
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

    <!-- Modal: Compartir -->
    <div
      v-if="showShareModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-gray-800 text-white rounded-xl w-full max-w-lg p-6 relative shadow-lg flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Compartir transmisión</h2>
          <button @click="showShareModal = false" class="text-gray-400 hover:text-white">✖</button>
        </div>

        <!-- Link de transmisión y botones de redes -->
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium">Enlace de la transmisión</label>
          <div class="flex gap-2">
            <input
              type="text"
              :value="streamLink"
              readonly
              class="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed"
            />
            <button @click="copyLink" class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500">
              Copiar
            </button>
          </div>
        </div>

        <div class="flex justify-center mb-4">
          <button
            @click="shareOnWhatsApp"
            class="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004 1.559 2.563-1.56 1.559-3.808 1.001 1.002-3.807z"
              />
            </svg>
            WhatsApp
          </button>
        </div>

        <div class="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
          <h3 class="text-md font-semibold mb-2">Compartir en la aplicación</h3>

          <!-- Pestañas -->
          <div class="flex border-b border-gray-700 mb-2">
            <button
              @click="shareTab = 'friends'"
              :class="[
                'px-4 py-2 text-sm',
                shareTab === 'friends' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400',
              ]"
            >
              Amigos
            </button>
            <button
              @click="shareTab = 'groups'"
              :class="[
                'px-4 py-2 text-sm',
                shareTab === 'groups' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400',
              ]"
            >
              Grupos
            </button>
          </div>

          <!-- Contenido de Pestañas -->
          <div class="flex-1 flex flex-col min-h-0">
            <!-- Input búsqueda -->
            <div class="mb-2">
              <input
                type="text"
                :placeholder="`Buscar ${shareTab === 'friends' ? 'amigo' : 'grupo'}...`"
                v-model="shareSearch"
                class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Lista de amigos/grupos filtrados -->
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div v-if="shareTab === 'friends'">
                <div
                  v-for="item in filteredFriends"
                  :key="item.id"
                  class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                  @click="toggleShareTarget(item)"
                >
                  <div class="flex items-center gap-3">
                    <img :src="item.avatar" class="w-8 h-8 rounded-full object-cover" />
                    <span>{{ item.name }}</span>
                  </div>
                  <input
                    type="checkbox"
                    :checked="selectedShareTargets.some((t) => t.id === item.id)"
                    class="pointer-events-none rounded"
                  />
                </div>
                <div
                  v-if="filteredFriends.length === 0"
                  class="text-gray-400 text-sm text-center py-4"
                >
                  No se encontraron amigos
                </div>
              </div>

              <div v-if="shareTab === 'groups'">
                <div
                  v-for="item in filteredGroups"
                  :key="item.id"
                  class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
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
                <div
                  v-if="filteredGroups.length === 0"
                  class="text-gray-400 text-sm text-center py-4"
                >
                  No se encontraron grupos
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
          <button
            @click="showShareModal = false"
            class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            @click="sendToSelected"
            :disabled="selectedShareTargets.length === 0"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Crear Encuesta -->
    <div
      v-if="showSurveyModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 relative shadow-lg">
        <h3 class="text-xl font-bold text-center">Crear Encuesta</h3>

        <!-- Cerrar modal -->
        <button
          @click="showSurveyModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
        >
          ✖
        </button>

        <!-- Formulario de encuesta -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-300 mb-1">Pregunta</label>
            <input
              ref="surveyQuestionInput"
              v-model="surveyQuestion"
              type="text"
              placeholder="Haz una pregunta..."
              class="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="surveyError" class="text-red-400 text-xs mt-1">{{ surveyError }}</p>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Opciones</label>
            <div
              v-for="(opcion, index) in surveyOptions"
              :key="index"
              class="flex items-center space-x-2 mb-2"
            >
              <input
                v-model="surveyOptions[index]"
                type="text"
                :placeholder="'Opción ' + (index + 1)"
                class="flex-1 px-3 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                v-if="surveyOptions.length > 2"
                @click="removeSurveyOption(index)"
                class="text-gray-400 hover:text-red-400"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
            <button
              @click="addSurveyOption"
              class="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold"
            >
              + Añadir opción
            </button>
          </div>
        </div>

        <!-- Selección Múltiple -->
        <div class="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            v-model="surveyMultipleChoice"
            id="multiple-choice-checkbox"
            class="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
          />
          <label for="multiple-choice-checkbox" class="text-sm text-gray-300"
            >Permitir selección múltiple</label
          >
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-2 pt-2">
          <button
            @click="showSurveyModal = false"
            class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            @click="submitSurvey"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para finalizar stream -->
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

export default {
  name: 'LiveView',
  components: {
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
      userData : JSON.parse(localStorage.getItem('user')),

      viewerId: null,
      pc: null,
      // ID del Host, necesario para enviar la Answer y los ICE candidates
      hostId: null,
      candidateBuffer: [],

      tiempo: 0, // tiempo en segundos
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
      chat: [],
      mensaje: '',

      showChatMenu: false,
      expandirBool: true,
      showOptionsMenu: false,
      showEndStreamConfirm: false,

      miniVideoRef: null,
      modalVideoRef: null,

      pc: null,
      localStream: null,
      stream: null,

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

      showSurveyModal: false,
      surveyQuestion: '',
      surveyOptions: ['', ''],
      surveyMultipleChoice: false,
      surveyError: '',

      fileInput: null,

      nextMessageId: 1,
      votedPolls: {},
      showResponse: {},
      responseText: {},

      showShareModal: false,
      streamLink: 'https://edustream.app/live/xyz-123',
      shareTab: 'friends',
      shareSearch: '',
      selectedShareTargets: [],

      friendsList: [
        {
          id: 'friend-1',
          name: 'Laura García',
          tipo: 'friend',
          avatar: 'https://i.pravatar.cc/100?img=6',
        },
        {
          id: 'friend-2',
          name: 'José Martínez',
          tipo: 'friend',
          avatar: 'https://i.pravatar.cc/100?img=15',
        },
      ],

      groupsList: [
        {
          id: 'group-1',
          nombre: 'LIN - 3',
          tipo: 'group',
          foto: 'https://ui-avatars.com/api/?name=LIN',
        },
        {
          id: 'group-2',
          nombre: 'WEB - 1',
          tipo: 'group',
          foto: 'https://ui-avatars.com/api/?name=WEB',
        },
      ],

      menuAbierto: null,
      roomId: this.$route.params.id,
      hostId: this.$route.params.idH,

      viewerId: this.$route.params.idV,
    }
  },

  computed: {
    filteredFriends() {
      if (!this.shareSearch) return this.friendsList
      return this.friendsList.filter((f) =>
        f.name.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },

    filteredGroups() {
      if (!this.shareSearch) return this.groupsList
      return this.groupsList.filter((g) =>
        g.nombre.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },
  },

  mounted() {
    this._handleSignalBound = this._handleSignal.bind(this)
    socket.removeAllListeners('signal')
    socket.on('signal', this._handleSignalBound)
    this.initViewer()
  },

  beforeUnmount() {
    if (this._handleSignalBound) {
      socket.off('signal', this._handleSignalBound)
    }
  },

  methods: {   
    initViewer() {
      if (this.pc) return
      this.pc = new RTCPeerConnection({ iceServers: [/*
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.ekiga.net' },
        {
          urls: 'turn:turnserver.20steps.com',
          username: 'webrtc',
          credential: 'webrtc'
        },
        {
          urls: ['turn:numb.viagenie.ca'],
          username: 'webrtc@example.com',
          credential: 'webrtc'
        }*/
      ] })

      this.pc.addTransceiver('video', { direction: 'recvonly' })
      this.pc.addTransceiver('audio', { direction: 'recvonly' })

      this.pc.ontrack = (event) => {
        if (this.$refs.videoRef) {
          this.$refs.videoRef.srcObject = event.streams[0] || new MediaStream([event.track])
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
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(new RTCSessionDescription(answer))
        console.log("ANSWER CREADO")
        socket.emit('signal', { targetId: from, data: answer })
      } else if (data.candidate) {
        // 3️⃣ Agregar candidatos ICE
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(data))
        } catch (err) {
          console.warn('Error agregando candidato ICE', err)
        }
      }
    },
    handleEndStream() {
      this.showOptionsMenu = false
      this.showEndStreamConfirm = true
    },
    async confirmEndStream() {
      router.push({ name: 'transmitions' })
    },
    addSurveyOption() {
      this.surveyOptions.push('')
    },
    removeSurveyOption(index) {
      if (this.surveyOptions.length > 2) this.surveyOptions.splice(index, 1)
    },

    submitSurvey() {
      // Build structured encuesta so the chat renderer + votePoll can handle voting
      const q = (this.surveyQuestion || '').toString().trim()
      if (!q) {
        this.surveyError = 'Introduce la pregunta de la encuesta'
        return
      }

      try {
        console.log('[submitSurvey] start', { pregunta: q, rawOptions: this.surveyOptions })
        const optsRaw = Array.isArray(this.surveyOptions) ? this.surveyOptions : ['', '']
        const opts = optsRaw
          .map((o) => (o && o.toString().trim() ? o.toString().trim() : null))
          .filter(Boolean)
        while (opts.length < 2) opts.push('[vacía]')
        console.log('[submitSurvey] parsed options', opts)

        const id = this.nextMessageId++
        const encuesta = {
          id,
          tipo: 'encuesta',
          usuario: 'Docente',
          pregunta: q,
          opciones: opts,
          votos: opts.map(() => 0),
          multiple: this.surveyMultipleChoice,
        }

        // close modal first to avoid any UI blocking
        this.showSurveyModal = false
        console.log('[submitSurvey] pushing encuesta', encuesta)
        this.chat.push(encuesta)
        console.log('[submitSurvey] pushed')

        // limpiar
        this.surveyQuestion = ''
        this.surveyOptions = ['', '']
        this.surveyMultipleChoice = false
      } catch (err) {
        console.error('submitSurvey error:', err)
        try {
          this.chat.push({ usuario: 'Sistema', mensaje: 'No se pudo enviar la encuesta.' })
        } catch {}
        this.surveyError = 'Error al enviar la encuesta'
      }
    },

    votePoll(id, idx) {
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
    },

    openShareModal() {
      this.showOptionsMenu = false
      this.showShareModal = true
      // Resetear estado del modal de compartir
      this.shareSearch = ''
      this.selectedShareTargets = []
      this.shareTab = 'friends'
    },

    toggleShareTarget(target) {
      const index = selectedShareTargets.value.findIndex((t) => t.id === target.id)
      if (index > -1) {
        selectedShareTargets.value.splice(index, 1)
      } else {
        selectedShareTargets.value.push(target)
      }
    },

    copyLink() {
      navigator.clipboard.writeText(streamLink.value).then(() => {
        alert('Enlace copiado al portapapeles')
      })
    },

    shareOnWhatsApp() {
      const message = `¡Únete a mi transmisión en vivo! ${streamLink.value}`
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    },

    sendToSelected() {
      if (selectedShareTargets.value.length === 0) return
      const targetNames = selectedShareTargets.value.map((t) => t.name || t.nombre).join(', ')
      alert(`Enlace enviado a: ${targetNames}`)
      showShareModal.value = false
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
        this.audioContext.close().catch(() => {})
      }
      this.audioLevel = 0
    },

    async toggleMic() {
      this.micAct = !this.micAct
      if (this.micAct) {
        try {
          // Pedimos acceso al micrófono
          this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

          // Configuramos el analizador de audio
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          this.audioSource = this.audioContext.createMediaStreamSource(this.audioStream)
          this.audioAnalyser = this.audioContext.createAnalyser()
          this.audioAnalyser.fftSize = 256
          this.audioSource.connect(this.audioAnalyser)
          // Iniciamos la visualización
          this.visualize()
        } catch (err) {
          console.error('Error al acceder al micrófono:', err)
          this.micAct = false // Revertimos el estado si hay un error
        }
      } else {
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

    terminarReunion() {
      clearInterval(intervalo)
      tiempo.value = 0
      tiempoFormateado.value = formatTime(tiempo.value)
    },
    async toggleCamara() {
      this.camaraAct = !this.camaraAct
      if (this.camaraAct) {
        try {
          this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
          await this.$nextTick()
          if (this.$refs.modalVideoRef) {
            this.$refs.modalVideoRef.srcObject = this.videoStream
          }
        } catch (err) {
          alert('Error al acceder a la cámara:', err)
          this.camaraAct = false
        }
      } else {
        if (this.videoStream) {
          this.videoStream.getTracks().forEach((track) => track.stop())
        }
        if (this.$refs.modalVideoRef) {
          this.$refs.modalVideoRef.srcObject = null
        }
      }
    },

    enviarMensaje() {
      if (!this.mensaje) return
      this.chat.push({ usuario: 'Docente', mensaje: this.mensaje })
      this.mensaje = ''
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
  background: #1f2937; /* bg-gray-800 */
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563; /* bg-gray-600 */
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* bg-gray-500 */
}
</style>
