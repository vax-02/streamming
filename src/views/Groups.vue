<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Lista lateral de chats -->
    <div
      class="w-full md:w-[35%] lg:w-[25%] bg-gray-800 p-4 flex-col space-y-4 overflow-y-auto absolute md:static h-full z-30 transition-transform duration-300"
      :class="[
        chatSeleccionado && 'hidden md:flex',
        !chatSeleccionado && 'flex',
      ]"
    >
      <h2 class="text-lg font-bold mb-4 text-center">Grupos</h2>
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="seleccionarChat(chat)"
        class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
        :class="{ 'bg-blue-700': chatSeleccionado && chatSeleccionado.id === chat.id }"
      >
        <img :src="chat.foto" alt="perfil" class="w-10 h-10 rounded-full object-cover" />
        <div class="flex flex-col">
          <span class="font-semibold">{{ chat.nombre }}</span>
          <span class="text-xs text-gray-300 truncate">{{ chat.mensaje }}</span>
        </div>
        <span v-if="chat.nuevos > 0" class="ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full">
          {{ chat.nuevos }}
        </span>
      </div>

      <!-- Botón flotante -->
      <div class="absolute bottom-4 right-4 md:left-4">
        <button
          @click="addChatModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center"
          title="Agregar chat"
        >
          <!-- Icono + (puedes cambiarlo por un SVG) -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Panel de conversación -->

    <div
      class="flex-1 flex flex-col bg-gray-900 transition-transform duration-300 w-full md:w-auto"
      :class="[
        chatSeleccionado && 'flex',
        !chatSeleccionado && 'hidden md:flex',
      ]"
    >
      <router-view v-if="$route.name === 'calling'"></router-view>

      <template v-else-if="chatSeleccionado">
        <!-- Header del chat -->
        <div class="flex items-center justify-between bg-gray-800 p-2 border-b border-gray-700">
          <button @click="chatSeleccionado = null" class="md:hidden p-2 text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            class="flex items-center space-x-3 hover:bg-gray-600 px-5 cursor-pointer"
            @click="mostrarPerfil = !mostrarPerfil"
          >
            <img
              :src="chatSeleccionado.foto"
              alt="perfil"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ chatSeleccionado.nombre }}</h2>
            </div>
          </div>
        </div>

        <!-- Historial de mensajes -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="(msg, i) in chatSeleccionado.mensajes"
            :key="i"
            :class="msg.enviado ? 'text-right' : 'text-left'"
          >
            <div
              :class="[
                'inline-block px-3 py-2 rounded-xl text-sm max-w-[70%]',
                msg.enviado ? 'bg-blue-600 ml-auto' : 'bg-gray-700',
              ]"
            >
              {{ msg.texto }}
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="p-4 bg-gray-800 flex items-center space-x-3 border-t border-gray-700">
          <input
            v-model="nuevoMensaje"
            type="text"
            placeholder="Escribe un mensaje..."
            class="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full outline-none"
            @keyup.enter="enviarMensaje"
          />
          <button
            @click="enviarMensaje"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full"
          >
            ➤
          </button>
        </div>
      </template>
      <!-- Vista inicial -->
      <template v-else>
        <banner-messages tipo="grupo" />
      </template>
    </div>
  </div>

  <div
    v-if="addChatModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <!-- Modal -->
    <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
        <h2 class="text-lg font-semibold">Crea un nuevo grupo</h2>
        <button
          @click="addChatModal = false"
          class="text-gray-400 hover:text-white text-xl font-bold"
        >
          ✖
        </button>
      </div>

      <!-- Formulario -->
      <div class="px-6 py-4 space-y-4">
        <!-- Nombre del grupo -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Nombre del grupo</label>
          <input
            type="text"
            placeholder="Ej: Proyecto Alpha"
            v-model="nuevoGrupo.nombre"
            class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Descripción</label>
          <textarea
            placeholder="Describe el propósito del grupo..."
            v-model="nuevoGrupo.descripcion"
            rows="2"
            class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Buscador de miembros -->
        <div>
          <label class="block text-sm text-gray-300 mb-1">Agregar miembros</label>
          <div class="relative">
            <input
              type="text"
              placeholder="Buscar contacto..."
              v-model="searchContact"
              class="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.65 13.65z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- Lista de contactos filtrados -->
        <ul class="max-h-48 overflow-y-auto mt-2 space-y-1">
          <li
            v-for="contacto in filteredContacts"
            :key="contacto.email"
            class="flex items-center justify-between p-2 rounded-lg hover:bg-blue-600 cursor-pointer"
            @click="toggleMiembro(contacto)"
          >
            <div class="flex items-center space-x-3">
              <div
                class="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {{ contacto.nombre.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-medium">{{ contacto.nombre }}</p>
                <p class="text-xs text-gray-300">{{ contacto.email }}</p>
              </div>
            </div>
            <span v-if="miembroSeleccionado(contacto)" class="text-green-400 text-sm font-semibold"
              >Agregado</span
            >
            <span v-else class="text-gray-300 hover:text-white text-sm font-semibold">Agregar</span>
          </li>
          <li v-if="filteredContacts.length === 0" class="text-gray-400 text-center py-4">
            No se encontraron contactos
          </li>
        </ul>

        <!-- Miembros agregados -->
        <div v-if="nuevoGrupo.miembros.length > 0" class="mt-4">
          <h4 class="text-sm text-gray-300 mb-2">Miembros añadidos:</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(miembro, index) in nuevoGrupo.miembros"
              :key="index"
              class="bg-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {{ miembro.nombre }}
              <button
                @click.stop="eliminarMiembro(miembro)"
                class="text-red-300 hover:text-red-400"
              >
                ✖
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 px-6 py-4 border-t border-gray-700">
        <button
          @click="addChatModal = false"
          class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
        <button @click="crearGrupo" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
          Crear grupo
        </button>
      </div>
    </div>
  </div>

  <!-- Panel lateral derecho de perfil -->
  <transition name="slide">
    <div
      v-if="mostrarPerfil"
      class="w-full sm:w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col absolute right-0 top-0 bottom-0 z-40"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">Grupo</h3>
        <button @click="mostrarPerfil = false" class="text-gray-400 hover:text-white">✖</button>
      </div>

      <!-- Imagen y datos -->
      <img
        :src="chatSeleccionado.foto"
        alt="perfil"
        class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
      />
      <h2 class="text-center text-xl font-semibold mb-1 text-white">
        {{ chatSeleccionado.nombre }}
      </h2>
      <div class="text-gray-300 mb-4">
        <p><strong>Fecha creación:</strong> 01/01/2023</p>
        <p><strong>Descripción:</strong> Grupo de trabajo</p>
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-around mb-6">
        <button
          @click="abrirModalAgregar = true"
          class="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <UserPlusIcon class="w-6 h-6" />
          <span class="text-sm">Agregar</span>
        </button>

        <button
          @click="abrirModalEvento = true"
          class="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <CalendarDaysIcon class="w-6 h-6" />
          <span class="text-sm">Evento</span>
        </button>
      </div>

      <!-- Lista de miembros -->
      <div class="flex-1 overflow-y-auto">
        <h4 class="text-gray-400 uppercase text-sm mb-2">Miembros</h4>
        <ul class="space-y-2">
          <li
            v-for="(miembro, i) in displayMembers"
            :key="i"
            class="flex justify-between items-center text-gray-300 bg-gray-700 rounded-lg p-2"
          >
            <span>{{ miembro.nombre }}</span>
            <button class="text-red-400 hover:text-red-300" @click="expulsar(miembro)">
              <UserMinusIcon class="w-5 h-5" />
            </button>
          </li>
        </ul>
      </div>

      <!-- Botón salir del grupo -->
      <button
        @click="salirGrupo"
        class="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
      >
        Dejar grupo
      </button>
    </div>
  </transition>

  <!-- Modal agregar gente -->
  <div
    v-if="abrirModalAgregar"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div class="bg-gray-900 p-6 rounded-lg w-80">
      <h3 class="text-lg font-semibold text-white mb-4">Agregar persona</h3>
      <input
        type="text"
        placeholder="Buscar usuario..."
        v-model="nuevoMiembro"
        class="w-full p-2 rounded bg-gray-800 text-white mb-2"
      />

      <!-- Sugerencias dinámicas basadas en lo que escribe el usuario -->
      <ul v-if="suggestions.length > 0" class="max-h-40 overflow-y-auto mt-2 mb-2 rounded bg-gray-800">
        <li
          v-for="s in suggestions"
          :key="s.email"
          class="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer"
          @click="agregarConContacto(s)"
        >
          <div>
            <div class="font-medium">{{ s.nombre }}</div>
            <div class="text-xs text-gray-400">{{ s.email }}</div>
          </div>
          <div class="text-blue-400 text-sm">Añadir</div>
        </li>
      </ul>
      <div class="flex justify-end space-x-2">
        <button @click="abrirModalAgregar = false" class="text-gray-300 hover:text-white">
          Cancelar
        </button>
        <button
          @click="agregarMiembro"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Agregar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal crear evento -->
  <div
    v-if="abrirModalEvento"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
  >
    <div class="bg-gray-900 p-6 rounded-lg w-80">
      <h3 class="text-lg font-semibold text-white mb-4">Crear evento</h3>
      <input
        type="text"
        placeholder="Título del evento"
        v-model="eventoTitulo"
        class="w-full p-2 rounded bg-gray-800 text-white mb-2"
      />
      <input
        type="date"
        v-model="eventoFecha"
        class="w-full p-2 rounded bg-gray-800 text-white mb-4"
      />
      <div class="flex justify-end space-x-2">
        <button @click="abrirModalEvento = false" class="text-gray-300 hover:text-white">
          Cancelar
        </button>
        <button
          @click="crearEvento"
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          Crear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  PhoneIcon,
  VideoCameraIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  UserMinusIcon,
} from '@heroicons/vue/24/solid'
import router from '@/router'
import bannerMessages from '@/layouts/bannerMessages.vue'

const chats = ref([
  {
    id: 1,
    nombre: 'LIN - 3',
    mensaje: '...',
    nuevos: 1,
    foto: 'https://randomuser.me/api/portraits/men/70.jpg',
    mensajes: [
      { texto: 'Hola 😄', enviado: false },
      { texto: '¿Revisaste el proyecto?', enviado: false },
      { texto: 'Sí, te paso el link ahora.', enviado: true },
    ],
  },
  {
    id: 2,
    nombre: 'WEB - 1',
    mensaje: '¿Revisaste el proyecto?',
    nuevos: 2,
    foto: 'https://randomuser.me/api/portraits/men/66.jpg',
    mensajes: [
      { texto: 'Hola 😄', enviado: false },
      { texto: '¿Revisaste el proyecto?', enviado: false },
      { texto: 'Sí, te paso el link ahora.', enviado: true },
    ],
  },
])

const chatSeleccionado = ref()
const nuevoMensaje = ref('')

const miembros = ref([{ nombre: 'Javier' }, { nombre: 'María' }, { nombre: 'Carlos' }])

const abrirModalAgregar = ref(false)
const abrirModalEvento = ref(false)
const nuevoMiembro = ref('')
const eventoTitulo = ref('')
const eventoFecha = ref('')



// Mostrar miembros: si hay un chat seleccionado y tiene miembros, mostrar esos;
// en caso contrario usar la lista global `miembros`.
const displayMembers = computed(() => {
  return chatSeleccionado && chatSeleccionado.value && chatSeleccionado.value.miembros
    ? chatSeleccionado.value.miembros
    : miembros.value
})

function agregarMiembro() {
  const term = nuevoMiembro.value.trim()
  if (!term) return

  // Buscar el contacto por email exacto o nombre (case-insensitive, permite coincidencias parciales en nombre)
  const encontrado = contactos.value.find((c) => {
    const t = term.toLowerCase()
    return (
      (c.email && c.email.toLowerCase() === t) ||
      (c.nombre && c.nombre.toLowerCase() === t) ||
      (c.nombre && c.nombre.toLowerCase().includes(t))
    )
  })

  if (!encontrado) {
    alert('Usuario no encontrado entre las personas disponibles. Escribe el nombre o email exacto de un contacto existente.')
    return
  }

  const nuevo = { nombre: encontrado.nombre, email: encontrado.email }

  // Si estamos viendo el perfil de un grupo seleccionado, agregar al grupo
  if (chatSeleccionado && chatSeleccionado.value) {
    if (!chatSeleccionado.value.miembros) chatSeleccionado.value.miembros = []
    // prevenir duplicados por email
    const existe = chatSeleccionado.value.miembros.some((m) => m.email === nuevo.email)
    if (!existe) chatSeleccionado.value.miembros.push(nuevo)
  } else {
    // sino agregar a la lista global de miembros (mantener email si disponible)
    const existe = miembros.value.some((m) => m.nombre === nuevo.nombre || m.email === nuevo.email)
    if (!existe) miembros.value.push(nuevo)
  }

  nuevoMiembro.value = ''
  abrirModalAgregar.value = false
}

// Sugerencias dinámicas para el modal "Agregar persona" basadas en lo escrito
const suggestions = computed(() => {
  const term = nuevoMiembro.value.trim().toLowerCase()
  if (!term) return []
  return contactos.value.filter((c) => {
    return (
      (c.nombre && c.nombre.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    )
  })
})

// Añadir contacto directamente desde la lista de sugerencias
function agregarConContacto(contacto) {
  const nuevo = { nombre: contacto.nombre, email: contacto.email }
  if (chatSeleccionado && chatSeleccionado.value) {
    if (!chatSeleccionado.value.miembros) chatSeleccionado.value.miembros = []
    const existe = chatSeleccionado.value.miembros.some((m) => m.email === nuevo.email)
    if (!existe) chatSeleccionado.value.miembros.push(nuevo)
  } else {
    const existe = miembros.value.some((m) => m.nombre === nuevo.nombre || m.email === nuevo.email)
    if (!existe) miembros.value.push(nuevo)
  }
  nuevoMiembro.value = ''
  abrirModalAgregar.value = false
}

function crearEvento() {
  if (eventoTitulo.value && eventoFecha.value) {
    alert(`Evento "${eventoTitulo.value}" creado para ${eventoFecha.value}`)
    eventoTitulo.value = ''
    eventoFecha.value = ''
    abrirModalEvento.value = false
  }
}

function expulsar(miembro) {
  // Si hay un chat seleccionado con miembros, expulsar desde ese grupo
  if (chatSeleccionado && chatSeleccionado.value && chatSeleccionado.value.miembros) {
    chatSeleccionado.value.miembros = chatSeleccionado.value.miembros.filter((m) => m !== miembro)
    return
  }

  // Sino expulsar de la lista global
  miembros.value = miembros.value.filter((m) => m !== miembro)
}

function salirGrupo() {
  alert('Has salido del grupo.')
  mostrarPerfil.value = false
}
function seleccionarChat(chat) {
  chatSeleccionado.value = chat
}

function enviarMensaje() {
  if (!nuevoMensaje.value.trim()) return
  chatSeleccionado.value.mensajes.push({
    texto: nuevoMensaje.value,
    enviado: true,
  })
  nuevoMensaje.value = ''
}
const mostrarPerfil = ref(false)

import { ref, computed } from 'vue'

const addChatModal = ref(false)
const searchContact = ref('')

const contactos = ref([
  { nombre: 'Ana López', email: 'ana@example.com' },
  { nombre: 'Carlos Pérez', email: 'carlos@example.com' },
  { nombre: 'María Gómez', email: 'maria@example.com' },
  { nombre: 'Juan Díaz', email: 'juan@example.com' },
])

const nuevoGrupo = ref({
  nombre: "",
  descripcion: "",
  miembros: [],
});
// Filtrar contactos según búsqueda
const filteredContacts = computed(() => {
  if (!searchContact.value) return contactos.value
  return contactos.value.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchContact.value.toLowerCase()) ||
      c.email.toLowerCase().includes(searchContact.value.toLowerCase()),
  )
})

// Función para iniciar chat
function startChat(contacto) {
  alert(`Iniciando chat con ${contacto.nombre}`)
  addChatModal.value = false
}

function toggleMiembro(contacto) {
  const yaExiste = nuevoGrupo.value.miembros.some(
    (m) => m.email === contacto.email
  );
  if (yaExiste) {
    nuevoGrupo.value.miembros = nuevoGrupo.value.miembros.filter(
      (m) => m.email !== contacto.email
    );
  } else {
    nuevoGrupo.value.miembros.push(contacto);
  }
}

function miembroSeleccionado(contacto) {
  return nuevoGrupo.value.miembros.some((m) => m.email === contacto.email);
}

function eliminarMiembro(contacto) {
  nuevoGrupo.value.miembros = nuevoGrupo.value.miembros.filter(
    (m) => m.email !== contacto.email
  );
}

function crearGrupo() {
  // Validación mínima
  if (!nuevoGrupo.value.nombre) {
    alert("Por favor, ingresa un nombre para el grupo");
    return;
  }

  // Crear nuevo grupo y añadirlo a la lista lateral (chats)
  const nextId = Math.max(0, ...chats.value.map((c) => c.id)) + 1
  const nuevo = {
    id: nextId,
    nombre: nuevoGrupo.value.nombre,
    mensaje: nuevoGrupo.value.descripcion || '',
    nuevos: 0,
    foto: `https://ui-avatars.com/api/?name=${encodeURIComponent(nuevoGrupo.value.nombre)}&background=1f2937&color=fff`,
    mensajes: [],
    miembros: [...nuevoGrupo.value.miembros],
  }

  chats.value.push(nuevo)
  // Seleccionar el grupo recién creado y limpiar el formulario
  chatSeleccionado.value = nuevo
  nuevoGrupo.value.nombre = ''
  nuevoGrupo.value.descripcion = ''
  nuevoGrupo.value.miembros = []
  addChatModal.value = false
}
</script>

<style scoped>
/* Scroll suave */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #c9aedf;
  border-radius: 4px;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
.animate-fade-in.delay-200 {
  animation-delay: 0.2s;
}
/* Animación de entrada del panel lateral */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
