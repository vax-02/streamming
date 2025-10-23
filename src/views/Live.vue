<template>
  <div class="flex h-screen bg-gray-900 text-white">

    <!-- Panel izquierdo: participantes y sala de espera -->
    <aside class="w-[20%] bg-gray-800 p-4 flex flex-col space-y-4">
      <h2 class="text-lg font-bold text-center">Participantes</h2>

      <!-- Sala de espera -->
      <div>
        <h3 class="font-semibold text-sm text-gray-400 mb-1">Sala de espera</h3>
        <div v-for="(user, i) in salaEspera" :key="i" class="flex justify-between items-center bg-gray-700 rounded-lg px-2 py-1 mb-1">
          <span>{{ user }}</span>
          <div class="flex space-x-1">
            <button @click="admitir(user)" class="bg-green-600 px-2 rounded text-xs">✔️</button>
            <button @click="rechazar(user)" class="bg-red-600 px-2 rounded text-xs">❌</button>
          </div>
        </div>
      </div>

      <!-- Lista de participantes -->
      <div>
        <h3 class="font-semibold text-sm text-gray-400 mb-1">En la reunión</h3>
        <div v-for="(p, i) in participantes" :key="i" class="flex justify-between items-center bg-gray-700 rounded-lg px-2 py-1 mb-1">
          <span>{{ p.nombre }}</span>
          <span class="text-gray-400 text-xs">{{ p.estado }}</span>
        </div>
      </div>
    </aside>

    <!-- Panel central: video principal y controles -->
    <div class="flex-1 flex flex-col justify-between p-4">

      <!-- Video principal -->
      <div class="relative bg-black rounded-xl flex-1 mb-4 flex justify-center items-center">
        <video
          ref="videoRef"
          autoplay
          muted
          class="w-full h-full object-cover rounded-xl"
        ></video>

        <div class="absolute top-3 left-3 bg-purple-600 px-3 py-1 rounded-full flex items-center space-x-2 text-sm font-semibold">
          <span>10:02</span>
        </div>

        <!-- Contador de participantes -->
        <div class="absolute top-3 right-3 bg-purple-600 px-3 py-1 rounded-full flex items-center space-x-2 text-sm font-semibold">
          👁️ <span>{{ participantes.length }}</span>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex justify-center space-x-4 mb-2">
        <button @click="toggleMic" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2">
             <span>{{ micAct ? 'Mic Encendido' : 'Mic Apagado' }}</span>
        </button>
        <button @click="toggleMic" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2">
          🎤 <span>{{ micAct ? 'Mic Encendido' : 'Mic Apagado' }}</span>
        </button>
        
        <button @click="toggleCamara" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2">
          🎥 <span>{{ camaraAct ? 'Cámara Encendida' : 'Cámara Apagada' }}</span>
        </button>
        <button @click="togglePantalla" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2">
          🖥️ <span>{{ pantallaAct ? 'Deteniendo' : 'Compartir Pantalla' }}</span>
        </button>
        <button @click="toggleGrabacion" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2">
          💾 <span>{{ grabando ? 'Grabando' : 'Iniciar Grabación' }}</span>
        </button>
        <button @click="expandir" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2">
          🔍 <span>Agrandar</span>
        </button>
      </div>
    </div>

    <!-- Panel derecho: chat -->
    <aside class="w-[20%] bg-gray-800 p-4 flex flex-col space-y-2">
      <h2 class="text-lg font-bold text-center">Chat en vivo</h2>
      <div class="flex-1 overflow-y-auto bg-gray-700 p-2 rounded-lg space-y-1">
        <div v-for="(msg, i) in chat" :key="i" class="text-sm">
          <strong>{{ msg.usuario }}:</strong> {{ msg.mensaje }}
        </div>
      </div>
      <div class="flex space-x-2 mt-2">
        <input v-model="mensaje" type="text" placeholder="Escribe un mensaje..." class="flex-1 bg-gray-600 rounded-lg px-2 py-1 outline-none"/>
        <button @click="enviarMensaje" class="bg-purple-600 px-4 py-1 rounded-lg">Enviar</button>
      </div>
    </aside>

    <!-- Modal: prueba de audio/cámara -->
    <div v-if="modalTest" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 relative">
        <h3 class="text-2xl font-bold text-center">Prueba de Audio y Cámara</h3>
        <button @click="modalTest=false" class="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold">✖</button>
        <video autoplay muted class="w-full h-40 bg-black rounded-lg"></video>
        <div class="flex justify-around mt-2">
          <button @click="toggleMic" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg">Mic {{ micAct ? 'On' : 'Off' }}</button>
          <button @click="toggleCamara" class="bg-gray-700 hover:bg-purple-600 px-4 py-2 rounded-lg">Cam {{ camaraAct ? 'On' : 'Off' }}</button>
        </div>
        <button @click="modalTest=false" class="bg-purple-600 hover:bg-purple-700 w-full py-2 rounded-lg font-semibold">Aceptar</button>
      </div>
    </div>

  </div>
</template>

<script setup>


import { ref } from 'vue'
const videoRef = ref(null)

// Controles
const micAct = ref(false)
const camaraAct = ref(false)
const pantallaAct = ref(false)
const grabando = ref(false)
const modalTest = ref(true) // Abrir modal al iniciar

// Participantes
const salaEspera = ref(['Alumno1','Alumno2'])
const participantes = ref([{nombre:'Alumno3', estado:'Activo'}, {nombre:'Alumno4', estado:'Activo'}])

// Chat
const chat = ref([])
const mensaje = ref('')

// Funciones
function toggleMic(){ micAct.value = !micAct.value }
function toggleCamara(){ camaraAct.value = !camaraAct.value }
function togglePantalla(){ pantallaAct.value = !pantallaAct.value }
function toggleGrabacion(){ grabando.value = !grabando.value }
function expandir(){ alert('Expandir video a pantalla completa') }

function enviarMensaje(){
  if(!mensaje.value) return
  chat.value.push({usuario:'Docente', mensaje: mensaje.value})
  mensaje.value = ''
}

// Sala de espera
function admitir(user){
  participantes.value.push({nombre:user, estado:'Activo'})
  salaEspera.value = salaEspera.value.filter(u=>u!==user)
}
function rechazar(user){
  salaEspera.value = salaEspera.value.filter(u=>u!==user)
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
