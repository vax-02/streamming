<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Panel lateral izquierdo (participantes, sala espera) -->
    <aside
      v-show="expandirBool"
      :class="[
        // Base (mobile)
        'fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 transform transition-transform duration-300',

        // Si está abierto en mobile
        showParticipants ? 'translate-x-0' : '-translate-x-full',

        // Desktop override
        'md:relative md:translate-x-0 md:w-[20%] md:flex',
      ]"
      class="p-4 flex flex-col space-y-5 border-r border-gray-800 shadow-xl"
    >
      <!-- Encabezado -->
      <div class="relative flex items-center justify-between">
        <h2 class="text-lg font-bold tracking-wide">Participantes</h2>
        <div class="relative">
          <button
            @click="showOptionsMenu = !showOptionsMenu"
            class="p-2 rounded-full hover:bg-gray-700 transition"
          >
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>

          <div
            v-show="showOptionsMenu"
            class="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden"
          >
            <button
              @click="handleEndStream"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
            >
              <PowerIcon class="w-4 h-4 text-red-500" />
              <span>Finalizar transmisión</span>
            </button>
            <button
              @click="showShareModal = true"
              class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center space-x-2"
            >
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
        <div
          v-if="salaEspera.length"
          class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar"
        >
          <div
            v-for="(user, i) in salaEspera"
            :key="i"
            class="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2"
          >
            <span class="font-medium text-sm">{{ user.name }}</span>
            <div class="flex space-x-1">
              <button
                @click="admitir(user)"
                class="bg-green-600 hover:bg-green-700 p-1 rounded"
                title="Admitir"
              >
                <CheckIcon class="w-5 h-5" />
              </button>
              <button
                @click="rechazar(user)"
                class="bg-red-600 hover:bg-red-700 p-1 rounded"
                title="Rechazar"
              >
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
          <div
            v-for="(p, i) in participantes"
            :key="p.idSocket || i"
            class="flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-5 h-5 text-blue-400" />
              <span class="text-sm font-medium">{{ p.name || p.email }}</span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Icono de micrófono según estado real -->
              <MicrophoneIcon v-if="getViewerAudioState(p)" class="w-5 h-5 text-green-500" />
              <MicrophoneIcon v-else class="w-5 h-5 text-red-500 opacity-60" />

              <div class="relative">
                <button
                  @click="menuAbierto = menuAbierto === i ? null : i"
                  class="p-1 hover:bg-gray-500 rounded-full transition"
                >
                  <EllipsisHorizontalIcon class="w-4 h-4 text-gray-300" />
                </button>

                <div
                  v-show="menuAbierto === i"
                  class="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-28 text-sm py-1 z-10"
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
      </div>
    </aside>

    <!-- Panel central: video principal y controles -->
    <div class="flex-1 min-h-0 flex flex-col p-4">
      <!-- Video principal (pantalla completa del seleccionado) -->
      <div
        class="relative bg-gray-700 rounded-xl flex-1 min-h-0 mb-4 flex justify-center items-center cursor-pointer"
        @dblclick="exitFullscreen"
      >
        <video
          ref="mainVideo"
          autoplay
          :muted="mainVideoMuted"
          class="w-full h-full object-contain rounded-xl"
        ></video>

        <!-- Overlay cuando no hay video en principal -->
        <div
          v-if="!mainVideoActive"
          class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 rounded-xl"
        >
          <UserCircleIcon class="w-24 h-24 text-gray-500 mb-2" />
          <p class="text-gray-400">{{ mainVideoLabel }}</p>
        </div>

        <!-- Tiempo -->
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

        <!-- Mini video del host (cuando comparte pantalla) -->
        <div
          v-show="pantallaAct && camaraAct"
          class="absolute bottom-3 right-3 bg-gray-800 rounded-xl shadow-lg p-1 w-32 h-20 border-2 border-blue-500 cursor-pointer hover:border-blue-400 transition"
          @click="setMainVideo('host')"
        >
          <video
            ref="videoUserRef"
            autoplay
            muted
            class="w-full h-full bg-black rounded-lg object-cover"
          ></video>
          <span class="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-1 py-0.5 rounded">
            Tú
          </span>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex justify-center items-center space-x-2 mb-2">
        <button v-if="isMobile" @click="showParticipants = true" class="p-3 rounded-full transition-all duration-200 bg-gray-700 hover:bg-gray-600">
          <UserGroupIcon class="w-6 h-6 text-white" />
        </button>

        <button v-if="isMobile" @click="showChat = true" class="p-3 rounded-full transition-all duration-200 bg-gray-700 hover:bg-gray-600">
          <ChatBubbleLeftRightIcon class="h-6 w-6 text-white" />
        </button>
       
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
          <VideoCameraIcon v-if="camaraAct" class="w-6 h-6 text-white" />
          <VideoCameraSlashIcon v-else class="w-6 h-6 text-white" />
        </button>

        <button
          @click="toggleScreenShare"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            pantallaAct ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600',
          ]"
        >
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button
          v-show="screenMobil == false"
          @click="expandirBool = !expandirBool"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>

        <!-- NUEVO: Botón de grabación con api.video -->
        <button
          @click="toggleRecording"
          :class="[
            'w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ',
            isRecording
              ? 'bg-red-600 hover:bg-red-500 border-red-400'
              : 'bg-blue-600 hover:bg-blue-700 border-blue-400',
          ]"
          :title="isRecording ? 'Detener grabación' : 'Iniciar grabación'"
        >
          <!-- Estado NO grabando -->
          <div v-if="!isRecording" class="w-4 h-4 bg-white rounded-full"></div>

          <!-- Estado grabando -->
          <StopIcon v-else class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    <!-- Panel derecho: miniaturas de participantes activos -->
    <div v-show="screenMobil == false" class="w-[13%] flex flex-col border-l border-gray-800">
      <!-- Header -->
      <div class="p-4 border-b border-gray-800">
        <h3
          class="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2"
        >
          <UserGroupIcon class="w-4 h-4 text-blue-400" />
          Activos ({{ viewers.length + 1 }})
        </h3>
      </div>

      <!-- Grid de miniaturas con scroll -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <!-- Miniatura del host -->
        <div
          class="relative bg-gray-800 rounded-xl overflow-hidden border-2 aspect-video cursor-pointer transition-all hover:border-blue-500"
          :class="{ 'border-blue-500': mainVideoSource === 'host' }"
          @click="setMainVideo('host')"
        >
          <video ref="videoRef" autoplay muted class="w-full h-full object-cover bg-black"></video>

          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-white">Tú (Host)</span>
              <MicrophoneIcon v-if="micAct" class="w-3 h-3 text-green-500" />
              <MicrophoneIcon v-else class="w-3 h-3 text-red-500" />
            </div>
          </div>

          <div
            v-if="!camaraAct"
            class="absolute inset-0 flex items-center justify-center bg-gray-700/90"
          >
            <UserCircleIcon class="w-8 h-8 text-gray-500" />
          </div>

          <!-- Indicador de pantalla compartida -->
          <div
            v-if="pantallaAct"
            class="absolute top-1 right-1 bg-blue-600 rounded-full p-1"
            title="Compartiendo pantalla"
          >
            <ComputerDesktopIcon class="w-3 h-3 text-white" />
          </div>
        </div>

        <!-- Miniaturas de viewers -->
        <div
          v-for="viewer in viewers"
          :key="viewer.id"
          class="relative bg-gray-800 rounded-xl overflow-hidden border-2 aspect-video cursor-pointer transition-all hover:border-blue-500"
          :class="{ 'border-blue-500': mainVideoSource === viewer.id }"
          @click="setMainVideo(viewer.id)"
        >
          <video
            :ref="'viewerVideo_' + viewer.id"
            autoplay
            playsinline
            class="w-full h-full object-cover bg-black"
          ></video>

          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-white truncate max-w-[100px]">
                {{ viewer.name }}
              </span>
              <MicrophoneIcon
                v-if="viewer.audioEnabled"
                class="w-3 h-3 text-green-500 flex-shrink-0"
              />
              <MicrophoneIcon v-else class="w-3 h-3 text-red-500 flex-shrink-0" />
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

    <!-- Panel derecho: chat (opcional, se muestra cuando expandirBool está activo) -->

    <ChatStreamComponent
      :class="[
        'fixed top-0 right-0 h-full w-80 bg-gray-900 z-50 transform transition-transform duration-300',

        showChat ? 'translate-x-0' : 'translate-x-full',

        'md:relative md:translate-x-0 md:w-[20%]',
      ]"
      v-if="expandirBool"
      :room-id="roomId"
      :user-data="userData"
      :is-host="true"
      :is-expanded="expandirBool"
    />

    <!-- Modal de confirmación para finalizar stream -->
    <div
      v-show="showEndStreamConfirm"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
        <h3 class="text-lg font-semibold text-center">Finalizar Stream</h3>
        <p class="text-center text-gray-300">¿Estás seguro de que deseas finalizar el stream?</p>
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

  <div
    v-if="showChat"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
    @click="showChat = false"
  ></div>
  
  <div
    v-if="showParticipants"
    class="fixed inset-0 bg-black/50 z-40 md:hidden"
    @click="showParticipants = false"
  ></div>
  <ToastNotification ref="toastRef" />

  <!-- Modal Compartir -->
  <Teleport to="body">
    <div
      v-if="showShareModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[50] p-4"
    >
      <div
        class="bg-gray-800 text-white rounded-xl w-full max-w-lg p-6 relative shadow-lg flex flex-col max-h-[90vh]"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Compartir transmisión</h2>
          <button
            @click="showShareModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            ✖
          </button>
        </div>

        <div class="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
          <div class="flex-1 flex flex-col min-h-0">
            <div class="mb-2">
              <input
                type="text"
                :placeholder="`Buscar grupo...`"
                v-model="shareSearch"
                class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div
                v-for="item in filteredGroups"
                :key="item.id"
                class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
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
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-700">
          <button
            @click="showShareModal = false"
            class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="sendToSelected"
            :disabled="selectedShareTargets.length === 0"
            class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal para mostrar el resultado de la grabación -->
  <div
    v-if="showRecordingModal"
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 text-white"
  >
    <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4">
      <!-- Título -->
      <h3 class="text-xl font-bold text-center text-white">Grabación lista</h3>

      <!-- Descripción -->
      <p class="text-center text-white">Tu grabación ya está disponible en api.video</p>

      <!-- Link -->
      <div class="bg-gray-700 p-4 rounded-lg">
        <p class="text-sm text-white mb-1 font-medium">Link del video:</p>

        <a
          :href="recordingData.playerUrl"
          target="_blank"
          class="text-gray-300 hover:text-gray-100 hover:underline break-all transition"
        >
          {{ recordingData.playerUrl }}
        </a>
      </div>

      <!-- Vista previa -->
      <div v-if="recordingData.iframe" class="mt-2">
        <p class="text-sm text-white mb-1 font-medium">Vista previa:</p>

        <div class="bg-black rounded-lg overflow-hidden" v-html="recordingData.iframe"></div>
      </div>

      <!-- Botones -->
      <div class="flex justify-center space-x-4 pt-2">
        <button
          @click="copyRecordingLink"
          class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white transition"
        >
          Copiar enlace
        </button>

        <button
          @click="showRecordingModal = false"
          class="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg text-white transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
  <!-- 🎯 NUEVO: Modal de progreso de subida -->
  <Teleport to="body">
    <div
      v-if="showUploadProgress"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      @click.self="showUploadProgress = false"
    >
      <div class="bg-gray-800 rounded-xl p-6 w-80 shadow-2xl border border-gray-700">
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-blue-600/20 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-blue-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="{2}"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h3 class="text-white text-lg font-semibold">Subiendo grabación</h3>
        </div>

        <div class="space-y-3">
          <!-- Barra de progreso -->
          <div class="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>

          <!-- Porcentaje y tamaño -->
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">{{ uploadProgress }}%</span>
          </div>

          <!-- Estado actual -->
          <p class="text-xs text-gray-500 text-center">
            {{ uploadStatus }}
          </p>

          <!-- Botón cancelar (opcional) -->
          <button
            v-if="uploadProgress < 100"
            @click="cancelUpload"
            class="w-full mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="isStarting"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm"
    >
      <div
        class="bg-gray-900 rounded-2xl p-6 w-80 shadow-xl border border-gray-700 flex flex-col items-center"
      >
        <!-- Icono + Texto -->
        <div class="flex flex-col items-center gap-4">
          <!-- Icono giratorio -->
          <div class="bg-blue-600/20 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-white animate-spin-slow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          <!-- Texto -->
          <h3 class="text-white text-lg font-semibold text-center">Iniciando reunión</h3>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import {
  ChatBubbleLeftRightIcon,
  StopIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon,
  MicrophoneIcon,
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
import Peer from 'peerjs'
import axios from 'axios'

export default {
  name: 'LiveView',
  components: {
    ChatBubbleLeftRightIcon,
    StopIcon,
    ToastNotification,
    ChatStreamComponent,
    UserCircleIcon,
    EllipsisHorizontalIcon,
    MicrophoneIcon,
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
      showParticipants: false,
      showChat: false,
      showDropdown: false,
      showMessageMobile: false,
      screenMobil: false,
      isStarting: false,
      //api.video
      mediaRecorder: null,
      recordedChunks: [],
      isRecording: false,
      showRecordingModal: false,
      recordingData: null,
      uploadToken: null,

      //subiendo
      showUploadProgress: false,
      uploadProgress: 0,
      uploadedSize: 0,
      totalSize: 0,
      uploadStatus: 'Preparando...',
      uploadCancelToken: null,

      // Peer y streams (WebRTC)
      peer: null,
      localStream: null,
      screenStream: null,
      viewers: [], // { id, call, stream, videoEnabled, audioEnabled, name, socketId }

      // Estado de medios
      audioEnabled: true,
      videoEnabled: true,
      micAct: true,
      camaraAct: true,
      pantallaAct: false,

      // Video principal
      mainVideoSource: 'host', // 'host' o id del viewer
      mainVideoMuted: false,

      // Estado de la sala
      roomId: localStorage.getItem('live_id'),
      roomName: '',
      peerId: null,
      link: 'no link',

      // Participantes (para UI)
      salaEspera: [],
      participantes: [],

      // UI
      isStarting: false,
      expandirBool: true,
      showOptionsMenu: false,
      showEndStreamConfirm: false,
      menuAbierto: null,

      // Tiempo
      tiempo: 0,
      startTime: null,
      tiempoFormateado: '00:00',
      intervalo: null,

      // Share
      shareTab: 'friends',
      shareSearch: '',
      selectedShareTargets: [],
      friendsList: [],
      groupsList: [],
      showShareModal: false,

      // Usuario
      userData: JSON.parse(localStorage.getItem('user') || '{}'),
    }
  },

  computed: {
    mainVideoActive() {
      if (this.mainVideoSource === 'host') {
        return this.camaraAct || this.pantallaAct
      } else {
        const viewer = this.viewers.find((v) => v.id === this.mainVideoSource)
        return viewer?.videoEnabled || false
      }
    },
    mainVideoLabel() {
      if (this.mainVideoSource === 'host') {
        return this.pantallaAct ? 'Compartiendo pantalla' : 'Cámara apagada'
      } else {
        const viewer = this.viewers.find((v) => v.id === this.mainVideoSource)
        return viewer ? `${viewer.name} - Cámara apagada` : 'Sin video'
      }
    },
    filteredGroups() {
      if (!this.shareSearch) return this.groupsList
      return this.groupsList.filter((g) =>
        g.nombre.toLowerCase().includes(this.shareSearch.toLowerCase()),
      )
    },
  },

  async mounted() {
    this.isStarting = true

    try {
      await api.put(`/transmissions/${this.roomId}/status`, { status: 1 })
      await this.startMeeting()

      socket.emit('start-stream', { roomId: this.roomId, link: this.link, dataHost: this.userData })

      socket.on('stream-started', (data) => {
        this.startTime = Number(data.startTime)
        this.iniciarContador()
      })

      socket.on('pending-request', (data) => {
        this.salaEspera.push(data.viewerData)
      })

      socket.on('left-room', (data) => {
        this.participantes = this.participantes.filter((p) => p.id !== parseInt(data.viewerId))
        // También eliminar de viewers
        this.viewers = this.viewers.filter((v) => v.socketId !== data.viewerId)

        // Si el video principal era de este viewer, volver al host
        if (this.mainVideoSource === data.viewerId) {
          this.setMainVideo('host')
        }
      })

      this.loadGroups()
      this.addToast('Stream iniciado')
    } catch (e) {
      console.error('Error en mounted:', e)
      this.addToast('Error al iniciar el stream', 'error')
    }

    this.isStarting = false
    this.isMobile()
  },
  watch: {
    // Para debug - ver cuando cambia pantallaAct
    pantallaAct(newVal, oldVal) {
      console.log('🔄 pantallaAct cambió:', oldVal, '→', newVal)
    },

    screenStream(newVal) {
      console.log('🔄 screenStream cambió:', newVal ? '✅ existe' : '❌ null')
    },
  },
  methods: {
    // Devuelve true si estamos en móvil (por ejemplo <768px)
    isMobile() {
      this.screenMobil = window.innerWidth < 768
    },
    // ========== CONTROL DE VIDEO PRINCIPAL ==========
    setMainVideo(source) {
      this.mainVideoSource = source

      this.$nextTick(() => {
        const video = this.$refs.mainVideo

        if (source === 'host') {
          // Mostrar stream del host (propio)
          video.srcObject = this.pantallaAct ? this.screenStream : this.localStream
          this.mainVideoMuted = true
        } else {
          // Mostrar stream de un viewer
          const viewer = this.viewers.find((v) => v.id === source)
          if (viewer?.stream) {
            video.srcObject = viewer.stream
            this.mainVideoMuted = false
          }
        }
      })
    },

    exitFullscreen() {
      this.setMainVideo('host')
    },

    // ========== WEBRTC ==========
    async startMeeting() {
      this.isStarting = true

      try {
        // 1️⃣ Obtener stream local
        console.log('Solicitando cámara y micrófono...')

        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 640 },
              height: { ideal: 480, max: 480 },
              frameRate: { ideal: 15, max: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          })
        } catch (err) {
          console.warn('Fallo configuración, intentando básica:', err)
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
        }

        console.log('Stream obtenido:', {
          video: this.localStream.getVideoTracks().length,
          audio: this.localStream.getAudioTracks().length,
        })

        // Mostrar videos locales
        this.$refs.videoRef.srcObject = this.localStream
        this.$refs.videoUserRef.srcObject = this.localStream
        this.$refs.mainVideo.srcObject = this.localStream

        await this.$refs.videoRef.play()
        await this.$refs.videoUserRef.play()
        await this.$refs.mainVideo.play()

        // 2️⃣ Crear Peer
        this.peer = new Peer(undefined, {
          host: 'localhost',
          port: 3001,
          path: '/peerjs',
          debug: 3,
        })

        // 3️⃣ Manejar llamadas entrantes
        this.peer.on('call', (call) => {
          console.log('📞 Nuevo viewer conectándose:', call.peer)

          const viewerInfo = this.salaEspera.find(
            (v) => v.socketId === call.metadata?.socketId,
          ) || { name: 'Viewer', email: 'viewer' }

          call.answer(this.localStream)

          const viewer = {
            id: call.peer,
            call: call,
            stream: null,
            videoEnabled: true,
            audioEnabled: true,
            name: viewerInfo.name || viewerInfo.email || 'Viewer',
            socketId: call.metadata?.socketId,
          }

          call.on('stream', (remoteStream) => {
            console.log('📹 Recibiendo stream del viewer:', call.peer)

            viewer.stream = remoteStream
            viewer.videoEnabled = remoteStream.getVideoTracks().length > 0
            viewer.audioEnabled = remoteStream.getAudioTracks().length > 0

            this.$nextTick(() => {
              const videoRef = this.$refs['viewerVideo_' + viewer.id]
              if (videoRef && videoRef[0]) {
                videoRef[0].srcObject = remoteStream
                videoRef[0].play().catch((e) => console.warn('Error play viewer:', e))
              }
            })
          })

          call.on('track', (track, stream) => {
            console.log('Track del viewer:', track.kind, track.enabled)
            if (track.kind === 'video') {
              viewer.videoEnabled = track.enabled
            } else if (track.kind === 'audio') {
              viewer.audioEnabled = track.enabled
            }
          })

          call.on('close', () => {
            console.log('👋 Viewer desconectado:', call.peer)
            this.viewers = this.viewers.filter((v) => v.id !== call.peer)
          })

          call.on('error', (err) => {
            console.error('Error con viewer:', call.peer, err)
          })

          this.viewers.push(viewer)
        })

        // 4️⃣ Cuando el peer esté listo, crear sala
        this.peer.on('open', async (id) => {
          this.peerId = id
          console.log('🔑 Peer ID:', id)

          try {
            const res = await axios.post('http://localhost:3001/api/create-room', {
              name: this.roomId,
              hostPeerId: this.peerId,
            })

            this.link = res.data.roomId
            console.log('✅ Sala creada con ID:', this.link)
          } catch (error) {
            console.error('Error creando sala:', error)
            this.addToast('Error al crear la sala', 'error')
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

    getViewerAudioState(participant) {
      // Buscar si el participante está en viewers y obtener su estado de audio real
      const viewer = this.viewers.find((v) => v.socketId === participant.socketId)
      return viewer ? viewer.audioEnabled : participant.estado === 'Activo'
    },

    handleMediaError(error) {
      if (error.name === 'NotAllowedError') {
        this.addToast(
          'Permiso denegado. Por favor, permite el acceso en la URL del navegador',
          'error',
        )
      } else if (error.name === 'NotFoundError') {
        this.addToast('No se encontró cámara/micrófono', 'error')
      } else if (error.name === 'NotReadableError') {
        this.addToast('El dispositivo está siendo usado por otra aplicación', 'error')
      } else {
        this.addToast(`Error: ${error.message}`, 'error')
      }
    },

    toggleMic() {
      if (this.localStream) {
        this.audioEnabled = !this.audioEnabled
        this.localStream.getAudioTracks().forEach((track) => {
          track.enabled = this.audioEnabled
        })
        this.micAct = this.audioEnabled
        console.log('🎤 Audio:', this.audioEnabled ? 'activado' : 'desactivado')
      }
    },

    toggleCamara() {
      if (this.localStream) {
        this.videoEnabled = !this.videoEnabled
        this.localStream.getVideoTracks().forEach((track) => {
          track.enabled = this.videoEnabled
        })
        this.camaraAct = this.videoEnabled
        console.log('📹 Video:', this.videoEnabled ? 'activado' : 'desactivado')
      }
    },

    async toggleScreenShare() {
      if (this.pantallaAct) {
        await this.stopScreenShare()
      } else {
        await this.startScreenShare()
      }
    },
    async startScreenShare() {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })

        const screenTrack = this.screenStream.getVideoTracks()[0]

        console.log('🖥️ Stream de pantalla creado:', {
          enabled: screenTrack.enabled,
          settings: screenTrack.getSettings(),
        })

        // ✅ IMPORTANTE: Actualizar pantallaAct ANTES de reemplazar tracks
        this.pantallaAct = true

        // Verificar que pantallaAct se actualizó
        console.log('📊 Estado actualizado - pantallaAct:', this.pantallaAct)

        // Reemplazar track en todas las conexiones
        await this.replaceVideoTrackForAll(screenTrack)

        // Mostrar pantalla localmente
        this.$refs.videoRef.srcObject = this.screenStream
        this.$refs.videoUserRef.srcObject = this.screenStream

        // Cuando el usuario deja de compartir
        screenTrack.onended = () => {
          console.log('🖥️ Compartir pantalla terminado por el usuario')
          this.stopScreenShare()
        }

        // Si está grabando, actualizar automáticamente
        if (this.isRecording) {
          console.log('🎥 Grabando - actualizando fuente a PANTALLA')
          this.handleRecordingSourceChange()
        }
      } catch (error) {
        console.error('Error compartiendo pantalla:', error)
        this.pantallaAct = false
        this.screenStream = null
      }
    },
    // NUEVO: Manejar cambio de fuente durante grabación
    handleRecordingSourceChange() {
      if (this.isRecording && this.mediaRecorder) {
        console.log('🔄 Cambiando fuente de grabación...')

        // Guardar el tipo de fuente actual
        const fuenteAnterior = this.pantallaAct ? 'pantalla' : 'cámara'
        console.log('📹 Fuente anterior:', fuenteAnterior)

        // Detener grabación actual
        this.mediaRecorder.stop()

        // La nueva grabación empezará en onstop
        // Porque uploadToApiVideo() se llama y luego...

        // Mostrar mensaje
        const nuevaFuente = this.pantallaAct ? 'PANTALLA' : 'CÁMARA'
        this.addToast(`⏸️ Cambiando a grabación de ${nuevaFuente}...`, 'info')
      }
    },
    async stopScreenShare() {
      if (this.screenStream) {
        console.log('🖥️ Deteniendo compartir pantalla')

        // Detener todos los tracks
        this.screenStream.getTracks().forEach((track) => {
          track.stop()
        })

        this.screenStream = null

        // ✅ IMPORTANTE: Actualizar pantallaAct a false
        this.pantallaAct = false

        console.log('📊 Estado actualizado - pantallaAct:', this.pantallaAct)

        // Volver a cámara
        if (this.localStream) {
          const cameraTrack = this.localStream.getVideoTracks()[0]
          if (cameraTrack) {
            await this.replaceVideoTrackForAll(cameraTrack)
            this.$refs.videoRef.srcObject = this.localStream
            this.$refs.videoUserRef.srcObject = this.localStream
          }
        }

        // Si está grabando, actualizar automáticamente
        if (this.isRecording) {
          console.log('🎥 Grabando - actualizando fuente a CÁMARA')
          this.handleRecordingSourceChange()
        }
      }
    },

    async replaceVideoTrackForAll(newTrack) {
      for (const viewer of this.viewers) {
        if (viewer.call && viewer.call.peerConnection) {
          const senders = viewer.call.peerConnection.getSenders()
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video')

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

    // ========== SOCKET.IO (gestión de sala) ==========
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
          this.participantes = this.participantes.filter((p) => p.id !== user.id)
          socket.emit('expel-viewer', { id: user.id, socketId: user.socketId, roomId: this.roomId })
          this.addToast('Participante eliminado')
        } catch (error) {
          this.addToast('Error al eliminar', 'error')
        }
      }
      this.participantes = this.participantes.filter((p) => p.socketId !== user.socketId)

      // Cerrar conexión WebRTC
      const viewer = this.viewers.find((v) => v.socketId === user.socketId)
      if (viewer && viewer.call) {
        viewer.call.close()
        this.viewers = this.viewers.filter((v) => v.id !== viewer.id)
      }
      this.menuAbierto = null
    },

    // ========== TIEMPO ==========
    iniciarContador() {
      if (!this.startTime) return
      const startMs = this.startTime < 10000000000 ? this.startTime * 1000 : this.startTime

      if (this.intervalo) clearInterval(this.intervalo)

      const actualizar = () => {
        const ahora = Date.now()
        const diffInMs = ahora - startMs
        const segundosTranscurridos = Math.floor(diffInMs / 1000)
        this.tiempo = segundosTranscurridos > 0 ? segundosTranscurridos : 0
        this.tiempoFormateado = this.formatTime(this.tiempo)
      }
      actualizar()
      this.intervalo = setInterval(actualizar, 1000)
    },

    formatTime(segundosTotal) {
      const horas = Math.floor(segundosTotal / 3600)
      const minutos = Math.floor((segundosTotal % 3600) / 60)
      const segundos = segundosTotal % 60
      const hh = horas > 0 ? `${horas.toString().padStart(2, '0')}:` : ''
      const mm = minutos.toString().padStart(2, '0')
      const ss = segundos.toString().padStart(2, '0')
      return `${hh}${mm}:${ss}`
    },

    // ========== SHARE ==========
    copyLink() {
      navigator.clipboard.writeText(this.link).then(() => {
        this.addToast('Enlace copiado al portapapeles')
      })
    },

    toggleShareTarget(target) {
      const index = this.selectedShareTargets.findIndex((t) => t.id === target.id)
      if (index > -1) {
        this.selectedShareTargets.splice(index, 1)
      } else {
        this.selectedShareTargets.push(target)
      }
    },

    async sendToSelected() {
      if (this.selectedShareTargets.length === 0) return
      const ids = this.selectedShareTargets.map((t) => t.id)
      try {
        await api.post('/messages/share', {
          ids,
          senderId: this.userData.id,
          message: '<<<' + this.roomId + '>>>',
        })
        this.addToast('Enlace enviado')
        this.showOptionsMenu = false
        this.showShareModal = false
        this.selectedShareTargets = []
      } catch (error) {
        this.addToast('Error al compartir el enlace', 'error')
      }
    },

    async loadGroups() {
      try {
        const response = await api.get('/groups')
        const temp = response.data.data
        console.log('laodgrupos', temp[0])
        this.groupsList = temp.map((u) => ({
          id: u.id,
          nombre: u.name,
          foto: u.photo,
        }))
      } catch (error) {
        this.addToast('Error al cargar grupos', 'error')
      }
    },

    // ========== FINALIZAR STREAM ==========
    handleEndStream() {
      this.showOptionsMenu = false
      this.showEndStreamConfirm = true
    },

    async confirmEndStream() {
      try {
        // Detener streams
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => track.stop())
          this.localStream = null
        }
        if (this.screenStream) {
          this.screenStream.getTracks().forEach((track) => track.stop())
          this.screenStream = null
        }

        // Notificar a participantes
        for (const user of this.participantes) {
          socket.emit('expel-viewer', {
            id: user.id,
            socketId: user.socketId,
            roomId: this.roomId,
          })
        }

        // Cerrar conexiones WebRTC
        this.viewers.forEach((viewer) => {
          if (viewer.call) viewer.call.close()
        })
        this.viewers = []

        socket.emit('end-stream', { roomId: this.roomId })

        //flag
        await api.put(`/transmissions/${this.roomId}/status`, { status: 2 })
        await api.put(`/transmissions/link/${this.roomId}`, {
          playerUrl: this.recordingData.playerUrl,
        })
        this.addToast('Transmisión finalizada con éxito', 'success')
        router.push({ name: 'transmitions' })
      } catch (error) {
        console.error('Error al cerrar el stream:', error)
        this.addToast('Hubo un problema al cerrar la conexión', 'error')
        router.push({ name: 'transmitions' })
      }
    },

    // ========== UTILS ==========
    addToast(message, type = 'info', duration = 3000) {
      this.$refs.toastRef?.addToast(message, type, duration)
    },

    // ========== GRABACIÓN CON API.VIDEO ==========
    async toggleRecording() {
      if (this.isRecording) {
        await this.stopRecording()
      } else {
        await this.startRecording()
      }
    },

    async getUploadToken() {
      try {
        const response = await axios.post(
          'http://localhost:3001/api/apivideo/generate-upload-token',
        )
        console.log('Respuesta token:', response.data)
        if (response.data.success) {
          this.uploadToken = response.data.token
          console.log('✅ Token de subida obtenido:', this.uploadToken)
          return this.uploadToken
        } else {
          throw new Error(response.data.error)
        }
      } catch (error) {
        console.error('Error obteniendo token:', error)
        this.addToast('Error al preparar la grabación', 'error')
        return null
      }
    },

    // Función para verificar qué codecs soporta el navegador
    getSupportedMimeType() {
      const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4',
      ]

      for (const type of possibleTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log('Usando codec:', type)
          return type
        }
      }

      console.warn('Usando formato por defecto')
      return '' // Dejar que el navegador elija
    },

    async startRecording() {
      try {
        console.log('🎥 Iniciando grabación sobre screenStream existente')

        // ✅ Verificar que ya existe el screenStream
        if (!this.screenStream) {
          this.addToast('No hay pantalla compartida para grabar', 'error')
          return
        }

        // ✅ Verificar que tenga video
        const hasVideo = this.screenStream.getVideoTracks().length > 0
        if (!hasVideo) {
          this.addToast('El stream no tiene video activo', 'error')
          return
        }

        // 1️⃣ Obtener token
        const token = await this.getUploadToken()
        if (!token) return

        // 2️⃣ Preparar MediaRecorder
        this.recordedChunks = []

        const mimeType = this.getSupportedMimeType()
        const options = mimeType ? { mimeType } : {}

        this.mediaRecorder = new MediaRecorder(this.screenStream, options)

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          console.log('Grabación finalizada')
          this.uploadToApiVideo()
        }

        this.mediaRecorder.onerror = (error) => {
          console.error('Error en MediaRecorder:', error)
          this.addToast('Error durante la grabación', 'error')
          this.isRecording = false
        }

        // 🔥 Si el usuario deja de compartir pantalla → detener grabación
        this.screenStream.getVideoTracks()[0].onended = () => {
          if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop()
            this.isRecording = false
          }
        }

        // 3️⃣ Iniciar grabación
        this.mediaRecorder.start(1000)
        this.isRecording = true

        this.addToast('Grabando pantalla y audio...', 'info')
      } catch (error) {
        console.error('Error starting recording:', error)
        this.addToast('Error al iniciar grabación', 'error')
      }
    },

    async uploadToApiVideo() {
      try {
        if (this.recordedChunks.length === 0) {
          this.addToast('No se grabó ningún dato', 'error')
          return
        }

        // Crear blob con el tipo correcto
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm'
        const blob = new Blob(this.recordedChunks, { type: mimeType })

        console.log('📦 Blob creado:', {
          size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
          type: blob.type,
        })

        // Crear FormData para la subida
        const formData = new FormData()
        formData.append('file', blob, `reunion-${this.roomId}-${Date.now()}.webm`)

        // Mostrar progreso
        this.addToast('Subiendo a api.video...', 'info')

        // Subir directamente a api.video usando el token delegado
        const response = await axios.post(
          `https://ws.api.video/upload?token=${this.uploadToken}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              )
              //flag
              this.showUploadProgress = true
              this.uploadProgress = percentCompleted
              console.log(`Subiendo: ${percentCompleted}%`)
              // Opcional: mostrar progreso en UI
            },
          },
        )
        this.showUploadProgress = false

        console.log('Respuesta de api.video:', response.data)

        // La respuesta incluye el videoId
        const videoId = response.data.videoId

        // Obtener detalles del video (links de reproducción)
        const detailsResponse = await axios.get(
          `http://localhost:3001/api/apivideo/video/${videoId}`,
        )

        if (detailsResponse.data.success) {
          this.recordingData = detailsResponse.data.video
          this.showRecordingModal = true
          this.addToast('Grabación subida exitosamente a api.video', 'success')

          // Guardar en historial local
          this.saveToHistory(this.recordingData)
        }
      } catch (error) {
        console.error('Error uploading to api.video:', error)

        if (error.response) {
          console.error('Detalles del error:', error.response.data)
          this.addToast(`Error: ${error.response.data.message || 'Error en la subida'}`, 'error')
        } else {
          this.addToast('Error al subir la grabación: ' + error.message, 'error')
        }
      } finally {
        this.recordedChunks = []
      }
    },
    async stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
        this.isRecording = false
        this.addToast('Procesando grabación y subiendo a api.video...', 'info')
      }
    },

    saveToHistory(videoData) {
      const history = JSON.parse(localStorage.getItem('recordingHistory') || '[]')
      history.push({
        videoId: videoData.videoId,
        title: videoData.title || `Reunión ${this.roomId}`,
        playerUrl: videoData.playerUrl,
        date: new Date().toISOString(),
        roomId: this.roomId,
      })
      localStorage.setItem('recordingHistory', JSON.stringify(history))
    },

    copyRecordingLink() {
      navigator.clipboard.writeText(this.recordingData.playerUrl).then(() => {
        this.addToast('Enlace copiado al portapapeles', 'success')
      })
    },
    openOptions() {
      this.showDropdown = !this.showDropdown
    },
  },

  beforeDestroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop())
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop())
    }
    if (this.peer) {
      this.peer.destroy()
    }
    if (this.intervalo) {
      clearInterval(this.intervalo)
    }
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

/* Estilo para miniaturas */
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
