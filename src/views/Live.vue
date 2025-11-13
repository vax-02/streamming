<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Panel izquierdo: participantes y sala de espera -->

    <aside
      v-show="expandirBool"
      class="w-[22%] bg-gray-900 text-white p-4 flex flex-col space-y-5 border-l border-gray-800 shadow-xl"
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
            v-if="showOptionsMenu"
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
              @click="openShareModal"
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
            <span class="font-medium text-sm">{{ user }}</span>
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
            :key="i"
            class="flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <UserCircleIcon class="w-5 h-5 text-blue-400" />
              <span class="text-sm font-medium">{{ p.nombre }}</span>
            </div>

            <div class="flex items-center gap-2">
              <MicrophoneIcon v-if="p.estado === 'Activo'" class="w-5 h-5 text-green-500" />
              <MicrophoneIcon v-else class="w-5 h-5 text-red-500 opacity-60" />

              <div class="relative">
                <button
                  @click="toggleMenu(i)"
                  class="p-1 hover:bg-gray-500 rounded-full transition"
                >
                  <EllipsisHorizontalIcon class="w-4 h-4 text-gray-300" />
                </button>

                <div
                  v-if="menuAbierto === i"
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

    <div class="flex-1 flex flex-col justify-between p-4">
      <!-- Video principal -->
      <div class="relative bg-gray-700 rounded-xl flex-1 mb-4 flex justify-center items-center">
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
            micAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'
          ]"
        >
          <MicrophoneIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="toggleCamara"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            camaraAct ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'
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
          @click="(togglePantalla(), shareScreen())"
          :class="[
            'p-3 rounded-full transition-all duration-200',
            pantallaAct ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
          ]"
        >
          <ComputerDesktopIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="expandir"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowsPointingOutIcon class="w-6 h-6 text-white" />
        </button>

        <button
          @click="modalTest = true"
          class="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
        >
          <EllipsisHorizontalIcon class="w-6 h-6 text-white" />
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
                        ? (votedPolls[msg.id] || []).includes(idx) ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : votedPolls[msg.id] === idx ? 'bg-blue-700 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600',
                      !msg.multiple && votedPolls[msg.id] !== undefined ? 'cursor-not-allowed' : 'cursor-pointer'
                    ]"
                    :disabled="!msg.multiple && votedPolls[msg.id] !== undefined"
                  >
                    <!-- Checkbox/Radio visual -->
                    <div class="w-4 h-4 rounded-full border-2 flex-shrink-0" :class="[
                      msg.multiple ? 'rounded-sm' : 'rounded-full',
                      (msg.multiple ? (votedPolls[msg.id] || []).includes(idx) : votedPolls[msg.id] === idx)
                        ? 'bg-blue-500 border-blue-400'
                        : 'border-gray-500'
                    ]"></div>

                    <div class="flex justify-between items-center">
                      <span>{{ opcion }}</span>
                      <span v-if="msg.multiple ? (votedPolls[msg.id] || []).includes(idx) : votedPolls[msg.id] === idx" class="text-green-400">
                        <CheckIcon class="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                  <div v-if="votedPolls[msg.id] !== undefined" class="mt-1 flex items-center gap-2">
                    <div class="w-full bg-gray-600 rounded-full h-1.5">
                      <div class="bg-blue-500 h-1.5 rounded-full" :style="{ width: `${(msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100}%` }"></div>
                    </div>
                    <span class="text-xs text-gray-400">{{ Math.round((msg.votos[idx] / (msg.votos.reduce((a, b) => a + b, 0) || 1)) * 100) }}%</span>
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
                    <div v-if="block.responses && block.responses.length > 0" class="border-t border-gray-600/50 pt-2 space-y-2">
                      <div v-for="(response, rIdx) in block.responses" :key="rIdx" class="text-xs">
                        <strong class="text-blue-300">{{ response.user }}:</strong>
                        <span class="text-gray-300">{{ response.text }}</span>
                      </div>
                    </div>

                    <!-- Formulario para responder -->
                    <div class="flex items-center gap-2">
                      <input
                        v-model="responseText[`${msg.id}-${blockIdx}`]"
                        type="text"
                        placeholder="Escribe tu respuesta..."
                        class="flex-1 px-3 py-1.5 rounded bg-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        @keyup.enter="submitExerciseResponse(msg.id, blockIdx)"
                      />
                      <button @click="submitExerciseResponse(msg.id, blockIdx)" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Enviar</button>
                    </div>
                  </div>
                  <img v-if="block.type === 'image'" :src="block.src" class="max-w-full rounded-md mt-2" />
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
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
  >
    <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-6 relative shadow-lg">
      <!-- Título -->
      <h3 class="text-2xl font-bold text-center">Configuración de Audio y Video</h3>

      <!-- Cerrar modal -->
      <button
        @click="modalTest = false"
        class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
      >
        ✖
      </button>

      <!-- Video de prueba -->
      <div class="relative w-full">
        <video
          ref="modalVideoRef"
          autoplay
          muted
          class="w-full h-48 bg-black rounded-lg object-cover"
        ></video>
        <div
          v-if="!camaraAct"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg"
        >
          <UserCircleIcon class="w-16 h-16 text-gray-400" />
          <span class="absolute bottom-2 text-gray-300 text-sm">Cámara apagada</span>
        </div>
      </div>

      <!-- Configuración de audio y video -->
      <div class="space-y-3">
        <!-- Micrófono -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-300 mb-1 flex items-center gap-2">
            <MicrophoneIcon class="w-5 h-5" /> Micrófono
          </label>
          <select v-model="selectedMic" class="w-full p-2 rounded bg-gray-700 text-white">
            <option v-for="mic in micList" :key="mic.deviceId" :value="mic.deviceId">{{ mic.label }}</option>
          </select>
          <input type="range" min="0" max="100" v-model="micVolume" class="mt-1 w-full" />
        </div>

        <!-- Altavoz -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-300 mb-1 flex items-center gap-2">
            <SpeakerWaveIcon class="w-5 h-5" /> Altavoz
          </label>
          <select v-model="selectedSpeaker" class="w-full p-2 rounded bg-gray-700 text-white">
            <option v-for="spk in speakerList" :key="spk.deviceId" :value="spk.deviceId">{{ spk.label }}</option>
          </select>
          <input type="range" min="0" max="100" v-model="speakerVolume" class="mt-1 w-full" />
          <button @click="testSpeaker" class="mt-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">Probar Altavoz</button>
        </div>

        <!-- Cámara -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-300 mb-1 flex items-center gap-2">
            <CameraIcon class="w-5 h-5" /> Cámara
          </label>
          <select v-model="selectedCam" class="w-full p-2 rounded bg-gray-700 text-white">
            <option v-for="cam in camList" :key="cam.deviceId" :value="cam.deviceId">{{ cam.label }}</option>
          </select>
          <div class="mt-1 flex items-center gap-2">
            <button @click="toggleCamara" class="px-3 py-1 rounded bg-gray-700 hover:bg-blue-600 text-sm">
              {{ camaraAct ? 'Apagar Camara' : 'Encender Camara' }}
            </button>
            <select v-model="cameraResolution" class="p-1 rounded bg-gray-700 text-white text-sm">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <!-- Mic On/Off rápido -->
        <div class="flex justify-around mt-2 space-x-4">
          <button
            @click="toggleMic"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 transition"
          >
            <MicrophoneIcon class="w-5 h-5" />
            {{ micAct ? 'Mic On' : 'Mic Off' }}
          </button>
          <button
            @click="toggleCamara"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-blue-600 transition"
          >
            <CameraIcon class="w-5 h-5" />
            {{ camaraAct ? 'Cam On' : 'Cam Off' }}
          </button>
        </div>
      </div>
      <!-- Aceptar -->
      <button
        @click="modalTest = false"
        class="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded-lg font-semibold transition"
      >
        Aceptar
      </button>
    </div>
  </div>

    <!-- Modal: Compartir -->
    <div v-if="showShareModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 text-white rounded-xl w-full max-w-lg p-6 relative shadow-lg flex flex-col max-h-[90vh]">
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
            <button @click="copyLink" class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500">Copiar</button>
          </div>
        </div>
        
        <div class="flex justify-center mb-4">
            <button @click="shareOnWhatsApp" class="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004 1.559 2.563-1.56 1.559-3.808 1.001 1.002-3.807z"/></svg>
              WhatsApp
            </button>
        </div>

        <div class="border-t border-gray-700 pt-4 flex-1 flex flex-col min-h-0">
          <h3 class="text-md font-semibold mb-2">Compartir en la aplicación</h3>
          
          <!-- Pestañas -->
          <div class="flex border-b border-gray-700 mb-2">
            <button @click="shareTab = 'friends'" :class="['px-4 py-2 text-sm', shareTab === 'friends' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400']">Amigos</button>
            <button @click="shareTab = 'groups'" :class="['px-4 py-2 text-sm', shareTab === 'groups' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400']">Grupos</button>
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
                  <input type="checkbox" :checked="selectedShareTargets.some(t => t.id === item.id)" class="pointer-events-none rounded" />
                </div>
                <div v-if="filteredFriends.length === 0" class="text-gray-400 text-sm text-center py-4">No se encontraron amigos</div>
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
                  <input type="checkbox" :checked="selectedShareTargets.some(t => t.id === item.id)" class="pointer-events-none rounded" />
                </div>
                <div v-if="filteredGroups.length === 0" class="text-gray-400 text-sm text-center py-4">No se encontraron grupos</div>
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
            <div v-for="(opcion, index) in surveyOptions" :key="index" class="flex items-center space-x-2 mb-2">
              <input
                v-model="surveyOptions[index]"
                type="text"
                :placeholder="'Opción ' + (index + 1)"
                class="flex-1 px-3 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button v-if="surveyOptions.length > 2" @click="removeSurveyOption(index)" class="text-gray-400 hover:text-red-400">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
            <button @click="addSurveyOption" class="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold">
              + Añadir opción
            </button>
          </div>
        </div>
        
        <!-- Selección Múltiple -->
        <div class="flex items-center space-x-2 pt-2">
          <input type="checkbox" v-model="surveyMultipleChoice" id="multiple-choice-checkbox" class="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600">
          <label for="multiple-choice-checkbox" class="text-sm text-gray-300">Permitir selección múltiple</label>
        </div>


        <!-- Botones de acción -->
        <div class="flex justify-end space-x-2 pt-2">
          <button @click="showSurveyModal = false" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg">Cancelar</button>
          <button @click="submitSurvey" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold">
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

  <!-- Modal: Crear Ejercicio -->
  <div
    v-if="showExerciseModal"
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
  >
    <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-xl flex flex-col shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-white">Crear Ejercicio</h3>
        <button @click="showExerciseModal = false" class="text-gray-400 hover:text-white">✖</button>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[70vh]">
        <!-- Título del Ejercicio -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Título</label>
          <input
            v-model="exerciseTitle"
            type="text"
            placeholder="Ej: Repaso de Álgebra"
            class="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Bloques de Contenido Dinámico -->
        <div v-for="(block, index) in exerciseContent" :key="index" class="bg-gray-900/50 p-3 rounded-lg relative">
          <!-- Botón para eliminar bloque -->
          <button @click="exerciseContent.splice(index, 1)" class="absolute top-2 right-2 text-gray-500 hover:text-red-400">
            <XMarkIcon class="w-4 h-4" />
          </button>

          <!-- Bloque de Texto/Pregunta -->
          <div v-if="block.type === 'text'">
            <label class="block text-xs text-gray-400 mb-1">Pregunta o Texto</label>
            <textarea
              v-model="block.question"
              rows="2"
              class="w-full px-3 py-2 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe una pregunta o instrucción..."
            ></textarea>
          </div>

          <!-- Bloque de Imagen -->
          <div v-if="block.type === 'image'">
            <label class="block text-xs text-gray-400 mb-1">Imagen</label>
            <img :src="block.src" class="max-w-full max-h-60 rounded-md mx-auto" />
          </div>
        </div>

        <!-- Input de archivo oculto -->
        <input type="file" ref="fileInput" @change="handleExerciseFile" accept="image/*" class="hidden" />
      </div>

      <!-- Acciones para añadir bloques -->
      <div class="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-2">
        <button @click="addContentBlock('text')" class="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors">
          <PencilSquareIcon class="w-5 h-5" />
          Añadir Pregunta
        </button>
        <button @click="addContentBlock('image')" class="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors">
          <PhotoIcon class="w-5 h-5" />
          Añadir Imagen
        </button>
      </div>

      <!-- Botones de Envío/Cancelación -->
      <div class="flex justify-end space-x-2 mt-6">
        <button @click="showExerciseModal = false" class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg">
          Cancelar
        </button>
        <button
          @click.prevent="submitExercise"
          :disabled="isSendingExercise"
          :class="{ 'opacity-60 cursor-not-allowed': isSendingExercise, 'bg-blue-600 hover:bg-blue-700': !isSendingExercise }"
          class="px-4 py-2 rounded-lg font-semibold"
        >
          {{ isSendingExercise ? 'Enviando...' : 'Enviar Ejercicio' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  ShareIcon,
  UserIcon,
  ChevronRightIcon,
  PhotoIcon,
} from '@heroicons/vue/24/solid'

import router from '@/router'
import { ref, onUnmounted, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'

const miniVideoRef = ref(null)
let stream = null
const videoRef = ref(null)
const modalVideoRef = ref(null)

const micAct = ref(false)
const camaraAct = ref(false)
const pantallaAct = ref(false)
const grabando = ref(false)
const modalTest = ref(false)


const audioLevel = ref(0)

// Dispositivos simulados
const micList = ref([{ deviceId: 'mic1', label: 'Micrófono 1' }, { deviceId: 'mic2', label: 'Micrófono 2' }])
const speakerList = ref([{ deviceId: 'spk1', label: 'Altavoz 1' }, { deviceId: 'spk2', label: 'Altavoz 2' }])
const camList = ref([{ deviceId: 'cam1', label: 'Cámara 1' }, { deviceId: 'cam2', label: 'Cámara 2' }])

const selectedMic = ref('mic1')
const selectedSpeaker = ref('spk1')
const selectedCam = ref('cam1')
const cameraResolution = ref('medium')
const micVolume = ref(80)
const speakerVolume = ref(80)


function testSpeaker() {
  alert('Reproduciendo sonido de prueba en el altavoz seleccionado.')
}

// Simulación de nivel de audio
setInterval(() => {
  audioLevel.value = micAct.value ? Math.floor(Math.random() * 100) : 0
}, 200)


const salaEspera = ref(['Alumno1', 'Alumno2'])
const participantes = ref([
  { nombre: 'Alumno3', estado: 'Inactivo' },
  { nombre: 'Alumno4', estado: 'Inactivo' },
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
    const optsRaw = Array.isArray(surveyOptions.value) ? surveyOptions.value : ['', '']
    const opts = optsRaw
      .map((o) => (o && o.toString().trim() ? o.toString().trim() : null))
      .filter(Boolean)
    while (opts.length < 2) opts.push('[vacía]')
    console.log('[submitSurvey] parsed options', opts)

    const id = nextMessageId.value++
    const encuesta = {
      id,
      tipo: 'encuesta',
      usuario: 'Docente',
      pregunta: q,
      opciones: opts,
      votos: opts.map(() => 0),
      multiple: surveyMultipleChoice.value,
    }

    // close modal first to avoid any UI blocking
    showSurveyModal.value = false
    console.log('[submitSurvey] pushing encuesta', encuesta)
    chat.value.push(encuesta)
    console.log('[submitSurvey] pushed')

    // limpiar
    surveyQuestion.value = ''
    surveyOptions.value = ['', '']
    surveyMultipleChoice.value = false
  } catch (err) {
    console.error('submitSurvey error:', err)
    try {
      chat.value.push({ usuario: 'Sistema', mensaje: 'No se pudo enviar la encuesta.' })
    } catch {}
    surveyError.value = 'Error al enviar la encuesta'
  }
}

function resetSurveyModal() {
  showSurveyModal.value = false
  surveyQuestion.value = ''
  surveyOptions.value = ['', '']
  surveyError.value = ''
  surveyMultipleChoice.value = false
  showSurveyModal.value = false
}

// Ejercicio
const exerciseTitle = ref('')
const exerciseDescription = ref('')
const exerciseImage = ref('')
const exerciseImageData = ref('')
const exerciseQuestions = ref(['']) // Mantenido por si se necesita en otro lugar.
const exerciseContent = ref([{ type: 'text', question: '', responses: [] }])

// bandera para enviar ejercicio (evita doble click/confusión con encuesta)
const isSendingExercise = ref(false)

const fileInput = ref(null)

function addContentBlock(type) {
  if (type === 'image') {
    fileInput.value.click()
  } else {
    exerciseContent.value.push({ type: 'text', question: '', responses: [] })
  }
}

function submitExercise() {
  if (!exerciseTitle.value.trim()) return alert('Introduce el título del ejercicio')
  if (isSendingExercise.value) return
  isSendingExercise.value = true
  try {
    const preguntas = exerciseQuestions.value.filter(Boolean)
    const content = exerciseContent.value.filter(block => {
      if (block.type === 'text') {
        return block.question.trim();
      }
      return block.type === 'image';
    });

    if (content.length === 0) {
      alert('El ejercicio debe tener al menos una pregunta o imagen.');
      return;
    }

    const id = nextMessageId.value++
    chat.value.push({
      id,
      tipo: 'ejercicio',
      usuario: 'Docente',
      title: exerciseTitle.value,
      content: content, // Usamos la nueva estructura de contenido
    })
    // limpiar y cerrar
    exerciseTitle.value = ''
    exerciseContent.value = [{ type: 'text', question: '', responses: [] }]
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

function submitExerciseResponse(exerciseId, blockIndex) {
  const responseKey = `${exerciseId}-${blockIndex}`;
  const text = (responseText.value[responseKey] || '').trim()
  if (!text) return alert('Escribe una respuesta')

  const exercise = chat.value.find(msg => msg.id === exerciseId);
  if (!exercise) return;

  // Calcular el número de pregunta real, contando solo los bloques de texto.
  let questionNumber = 0;
  for (let i = 0; i <= blockIndex; i++) {
    if (exercise.content[i].type === 'text') {
      questionNumber++;
    }
  }

  chat.value.push({
    id: nextMessageId.value++,
    usuario: 'Alumno',
    mensaje: `Respuesta a la pregunta #${questionNumber} del ejercicio: ${text}`,
  })
  // Limpiar el campo de texto para esa pregunta específica
  responseText.value[responseKey] = ''
}

// Lógica para compartir
const showShareModal = ref(false)
const streamLink = ref('https://edustream.app/live/xyz-123') // Enlace falso
const shareTab = ref('friends') // 'friends' o 'groups'
const shareSearch = ref('')
const selectedShareTargets = ref([])

// Datos simulados de amigos y grupos
const friendsList = ref([
  { id: 'friend-1', name: 'Laura García', tipo: 'friend', avatar: 'https://i.pravatar.cc/100?img=6' },
  { id: 'friend-2', name: 'José Martínez', tipo: 'friend', avatar: 'https://i.pravatar.cc/100?img=15' },
])
const groupsList = ref([
  { id: 'group-1', nombre: 'LIN - 3', tipo: 'group', foto: 'https://ui-avatars.com/api/?name=LIN' },
  { id: 'group-2', nombre: 'WEB - 1', tipo: 'group', foto: 'https://ui-avatars.com/api/?name=WEB' },
])

const filteredFriends = computed(() => {
  if (!shareSearch.value) return friendsList.value
  return friendsList.value.filter(f => f.name.toLowerCase().includes(shareSearch.value.toLowerCase()))
})

const filteredGroups = computed(() => {
  if (!shareSearch.value) return groupsList.value
  return groupsList.value.filter(g => g.nombre.toLowerCase().includes(shareSearch.value.toLowerCase()))
})

function openShareModal() {
  showOptionsMenu.value = false
  showShareModal.value = true
  // Resetear estado del modal de compartir
  shareSearch.value = ''
  selectedShareTargets.value = []
  shareTab.value = 'friends'
}

function toggleShareTarget(target) {
  const index = selectedShareTargets.value.findIndex(t => t.id === target.id)
  if (index > -1) {
    selectedShareTargets.value.splice(index, 1)
  } else {
    selectedShareTargets.value.push(target)
  }
}

function copyLink() {
  navigator.clipboard.writeText(streamLink.value).then(() => {
    alert('Enlace copiado al portapapeles')
  })
}

function shareOnWhatsApp() {
  const message = `¡Únete a mi transmisión en vivo! ${streamLink.value}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

function sendToSelected() {
  if (selectedShareTargets.value.length === 0) return
  const targetNames = selectedShareTargets.value.map(t => t.name || t.nombre).join(', ')
  alert(`Enlace enviado a: ${targetNames}`)
  showShareModal.value = false
}

// File upload with progress for exercise image
const exerciseUploadProgress = ref(0)

function handleExerciseFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    exerciseContent.value.push({
      type: 'image',
      src: ev.target.result
    });
    // Reset file input so the same file can be selected again
    e.target.value = '';
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

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    if (miniVideoRef.value) {
      miniVideoRef.value.srcObject = stream
    }
  } catch (error) {
    console.error('Error al acceder a la cámara:', error)
    alert('No se pudo acceder a la cámara. Verifica los permisos.')
  }
}

// Detener cámara
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
}

// Detener cámara al salir del componente
onBeforeUnmount(() => {
  stopCamera()
})
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
  p.estado = false
  menuAbierto.value = null
}

function expulsar(p) {
  participantes.value = participantes.value.filter((part) => part.nombre !== p.nombre)
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
