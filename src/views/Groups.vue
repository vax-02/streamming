<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Lista lateral de Grupos -->
    <div
      class="w-full md:w-[35%] lg:w-[25%] bg-gray-800 p-4 flex flex-col h-full space-y-4 overflow-y-auto"
      :class="[grupoSeleccionado ? 'hidden md:flex' : 'flex']"
    >
      <h2 class="text-lg font-bold mb-4 text-center">Grupos</h2>
      <div class="flex-1 flex flex-col space-y-2">
        <div
          v-for="chat in Grupos"
          :key="chat.id"
          @click="seleccionarChat(chat)"
          class="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition"
          :class="{ 'bg-blue-700': grupoSeleccionado && grupoSeleccionado.id === chat.id }"
        >
          <img :src="chat.photo" alt="img" class="w-10 h-10 rounded-full object-cover" />
          <div class="flex flex-col">
            <span class="font-semibold">{{ chat.nombre }}</span>
            <span class="text-xs text-gray-300 truncate">{{ chat.mensaje }}</span>
          </div>
          <span v-if="chat.nuevos > 0" class="ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full">
            {{ chat.nuevos }}
          </span>
        </div>
      </div>

      <!-- Botón flotante -->
      <div class="mt-auto flex justify-center">
        <button
          @click="modalCrearGrupo = true"
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none flex items-center justify-center"
          title="Agregar Grupo"
        >
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
      :class="[grupoSeleccionado ? 'flex' : 'hidden md:flex']"
    >
      <template v-if="grupoSeleccionado">
        <!-- Header del chat -->
        <div class="flex items-center justify-between bg-gray-800 p-2 border-b border-gray-700">
          <button
            @click="grupoSeleccionado = null"
            class="md:hidden p-2 text-gray-300 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            class="flex items-center space-x-3 hover:bg-gray-600 px-5 cursor-pointer"
            @click="mostrarPerfil = !mostrarPerfil"
          >
            <img
              :src="grupoSeleccionado.photo"
              alt="perfil"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ grupoSeleccionado.nombre }}</h2>
            </div>
          </div>
        </div>

        <!-- Historial de mensajes -->
        <div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="(msg, i) in grupoSeleccionado.mensajes"
            :key="i"
            :class="msg.sender_id === userData.id ? 'text-right' : 'text-left'"
          >
            <!-- Nombre del remitente -->
            <p class="text-xs text-gray-400 mb-1">
              {{ msg.name + ' - ' + msg.email }}
            </p>

            <!-- Mensaje -->
            <div
              :class="[
                'inline-block px-3 py-2 rounded-xl text-sm max-w-[70%] relative',
                msg.enviado ? 'bg-blue-600 ml-auto' : 'bg-gray-700',
              ]"
            >
              {{ msg.message }}

              <!-- Estado del mensaje -->
              <span
                v-if="msg.enviado"
                class="absolute bottom-1 right-2 text-[10px] text-gray-200 flex items-center space-x-1"
              >
                <svg
                  v-if="msg.visto"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{{ msg.visto ? 'Visto' : 'Enviado' }}</span>
              </span>
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
            @keyup.enter="sendMessage(grupoSeleccionado.id)"
          />
          <button
            @click="sendMessage(grupoSeleccionado.id)"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full"
          >
            ➤
          </button>
        </div>
      </template>
      <template v-else>
        <banner-messages tipo="grupo" />
      </template>
    </div>

    <transition name="slide">
      <div
        v-if="mostrarPerfil"
        class="w-full sm:w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col absolute right-0 top-0 bottom-0 z-40"
      >
        <div class="flex justify-between items-center mb-4">
          <button @click="mostrarPerfil = false" class="text-gray-400 hover:text-white">✖</button>
        </div>

        <img
          :src="grupoSeleccionado.photo"
          alt="perfil"
          class="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
        <h2 class="text-center text-xl font-semibold mb-1">{{ grupoSeleccionado.nombre }}</h2>
        <p class="text-center text-gray-400 mb-4">
          {{ grupoSeleccionado.descripcion }}
        </p>

        <div class="flex justify-between gap-2 mb-5">
          <button
            v-if="isAdmin"
            class="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-semibold"
            @click="modalEditarGrupo = true"
          >
            Editar
          </button>

          <button
            v-if="isAdmin"
            class="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg text-sm font-semibold"
            @click="modalAgregarParticipante = true"
          >
            Agregar
          </button>
          <button
            class="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm font-semibold"
            @click="showLeaveConfirm = true"
          >
            Salir
          </button>
        </div>

        <!-- === LISTA DE PARTICIPANTES === -->
        <h3 class="text-md text-gray-300 font-semibold mb-2">Participantes</h3>
        <div class="overflow-y-auto space-y-2 pr-1 mb-6" style="max-height: 50vh">
          <div
            v-for="p in grupoSeleccionado.participantes"
            :key="p.id"
            class="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <img :src="p.photo" class="w-8 h-8 rounded-full object-cover" />

              <div>
                <p class="font-semibold">
                  <span class="text-xs" v-if="p.id == userData.id">Tú: </span>
                  {{ p.name }} <br />

                  <span class="text-xs text-gray-300">
                    {{ p.email }}
                  </span>
                </p>
                  <p
                  class="text-xs"
                  :class="{
                    'text-blue-400 font-bold': p.admin === 1,
                    'text-gray-400': p.admin !== 1,
                  }"
                >
                  {{ p.admin === 1 ? 'Admin' : 'Miembro' }}
                </p>
              </div>
            </div>

            <!-- Opciones si eres admin -->
            <div class="flex gap-2" v-if="isAdmin">
              <button
                v-if="p.id !== userData.id"
                @click="hacerAdmin(p.id)"
                class="text-blue-400 hover:text-blue-200 text-xs font-semibold"
              >
                {{ p.admin ? 'Quitar admin' : 'Hacer admin' }}
              </button>

              <button
                @click="openExpelConfirm(p.id)"
                v-if="p.id !== userData.id"
                class="text-red-400 hover:text-red-200 text-xs font-semibold"
              >
                Expulsar
              </button>
            </div>
          </div>
        </div>
        <!-- Parte inferior -->
        <p class="text-center text-gray-500 text-xs mt-auto">Grupo creado el:</p>
      </div>
    </transition>

    <!-- Notificaciones -->
    <ToastNotification ref="toastRef" />
  </div>

  <!---MODAL AGREGAR AL GRUPO-->
  <div
    v-if="modalAgregarParticipante"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
      <!-- Header Modal -->
      <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
        <h2 class="text-lg font-semibold">Agregar nuevo miembro</h2>
        <button
          @click="modalAgregarParticipante = false"
          class="text-gray-400 hover:text-white text-xl font-bold"
        >
          ✖
        </button>
      </div>

      <!-- Input de búsqueda -->
      <div class="px-6 py-4">
        <div class="relative">
          <input
            type="text"
            placeholder="Buscar amigo..."
            class="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            v-model="searchFriend"
          />
          <svg
            class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      <!-- Lista de friends -->
      <ul class="max-h-64 overflow-y-auto px-6 space-y-1">
        <li
          v-for="contacto in filteredFriends"
          :key="contacto.email"
          class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition"
        >
          <div class="flex items-center space-x-3">
            <div
              class="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            >
              {{ contacto.nombre.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium flex items-center gap-2">
                {{ contacto.nombre }}
                <span
                  v-if="contacto.member"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-700 text-gray-100"
                >
                  MIEMBRO
                </span>
              </p>
              <p class="text-xs text-gray-300">{{ contacto.email }}</p>
            </div>
          </div>
          <button
            @click="addToGroup(contacto)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-semibold"
          >
            Agregar
          </button>
        </li>
        <li v-if="filteredFriends.length === 0" class="text-gray-400 text-center py-4">
          No hay amigos
        </li>
      </ul>

      <!-- Footer Modal -->
      <div class="flex justify-end px-6 py-4 border-t border-gray-700">
        <button
          @click="modalAgregarParticipante = false"
          class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!--MODAL DE EDITAR GRUPO-->
  <div
    v-if="modalEditarGrupo"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <!-- Contenedor del modal -->
    <form @submit.prevent="editGroup" class="bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">Editar Grupo</h3>
        <button
          type="button"
          @click="modalEditarGrupo = false"
          class="text-gray-400 hover:text-white"
        >
          ✖
        </button>
      </div>

      <!-- Foto del grupo -->
      <div class="flex flex-col items-center mb-4">
        <img
          :src="grupoSeleccionado.photo"
          alt="Grupo"
          class="w-24 h-24 rounded-full object-cover mb-2"
        />
        <input type="file" @change="onFileChange" class="text-sm text-gray-300" />
      </div>

      <!-- Nombre -->
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-1">Nombre del grupo</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Nombre del grupo"
          class="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <!-- Descripción -->
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-1">Descripción</label>
        <textarea
          v-model="form.description"
          type="text"
          placeholder="Describe el propósito del grupo"
          rows="3"
          class="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          required
        ></textarea>
      </div>

      <!-- Bloqueo de mensajes -->
      <div class="flex items-center gap-2">
        <!-- Switch -->
        <button
          type="button"
          @click="form.status = form.status === 1 ? 0 : 1"
          :class="form.status === 1 ? 'bg-blue-600' : 'bg-gray-700'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span
            :class="form.status === 1 ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          ></span>
        </button>
        <!-- Label -->
        <span class="text-gray-300 text-sm">Solo admins pueden enviar mensajes</span>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="modalEditarGrupo = false"
          class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
          Guardar
        </button>
      </div>
    </form>
  </div>

  <!--MODAL DE CREAR GRUPO-->
  <div
    v-if="modalCrearGrupo"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
  >
    <!-- Contenedor del modal -->
    <form @submit.prevent="newGroup" class="bg-gray-800 rounded-lg w-full max-w-md p-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-white">Crear Grupo</h3>
        <button
          type="button"
          @click="modalCrearGrupo = false"
          class="text-gray-400 hover:text-white"
        >
          ✖
        </button>
      </div>

      <!-- Foto del grupo -->
      <div class="flex flex-col items-center mb-4">
        <img src="" alt="Grupo" class="w-24 h-24 rounded-full object-cover mb-2" />
        <input type="file" @change="onFileChange" class="text-sm text-gray-300" />
      </div>
      <!-- Nombre -->
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-1">Nombre del grupo</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Nombre del grupo"
          class="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          required
        />
      </div>

      <!-- Descripción -->
      <div class="mb-4">
        <label class="block text-gray-300 text-sm font-medium mb-1">Descripción</label>
        <textarea
          v-model="form.description"
          type="text"
          placeholder="Describe el propósito del grupo"
          rows="3"
          class="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
          required
        ></textarea>
      </div>

      <!-- Bloqueo de mensajes -->
      <div class="flex items-center gap-2">
        <!-- Switch -->
        <button
          type="button"
          @click="form.status = form.status === 1 ? 0 : 1"
          :class="form.status === 1 ? 'bg-blue-600' : 'bg-gray-700'"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span
            :class="form.status === 1 ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          ></span>
        </button>
        <!-- Label -->
        <span class="text-gray-300 text-sm">Solo admins pueden enviar mensajes</span>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="modalCrearGrupo = false"
          class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500">
          Guardar
        </button>
      </div>
    </form>
  </div>

  <ConfirmationComponent
    :visible="showLeaveConfirm"
    title="Salir del grupo"
    message="¿Estás seguro de que deseas salir de este grupo?"
    @confirm="confirmLeaveGroup"
    @cancel="showLeaveConfirm = false"
  />

  <ConfirmationComponent
    :visible="showExpelConfirm"
    title="Expulsar miembro"
    message="¿Estás seguro de que deseas expulsar a este miembro?"
    @confirm="confirmExpelUser"
    @cancel="showExpelConfirm = false"
  />
</template>

<script>
import socket from '@/services/socket.js'
import { UserPlusIcon, CalendarDaysIcon, UserMinusIcon } from '@heroicons/vue/24/solid'
import bannerMessages from '@/layouts/bannerMessages.vue'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'
import ConfirmationComponent from '@/components/dialogs/confirmationComponent.vue'
import { createProgram } from 'typescript'

export default {
  components: { UserPlusIcon, CalendarDaysIcon, UserMinusIcon, bannerMessages, ToastNotification, ConfirmationComponent },
  data() {
    return {
      form: {
        id: 0,
        name: '',
        description: '',
        photo: '',
        status: false,
      },
      Grupos: [],
      grupoSeleccionado: null,
      nuevoMensaje: '',
      mostrarPerfil: false,
      addChatModal: false,
      userData: JSON.parse(localStorage.getItem('user')),

      friends: [],
      searchFriend: '',
      modalAgregarParticipante: false,
      modalEditarGrupo: false,
      modalCrearGrupo: false,
      showLeaveConfirm: false,
      showExpelConfirm: false,
      userToExpelId: null,
    }
  },
  watch: {
    modalEditarGrupo(newVal) {
      if (newVal && this.grupoSeleccionado) {
        this.form.id = this.grupoSeleccionado.id
        this.form.name = this.grupoSeleccionado.nombre
        this.form.description = this.grupoSeleccionado.descripcion
        this.form.photo = this.grupoSeleccionado.photo
        this.form.status = this.grupoSeleccionado.status || false
      }
    },
  },
  computed: {
    isAdmin() {
      return (
        this.grupoSeleccionado?.participantes?.some(
          (p) => p.id === this.userData.id && p.admin === 1,
        ) ?? false
      )
    },
    filteredFriends() {
      if (!this.searchFriend) return this.friends
      const q = this.searchFriend.toLowerCase()

      return this.friends.filter(
        (c) => c.nombre.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
      )
    },
  },
  async mounted() {
    await this.loadGroups()
    await this.loadFriends()
    this.scrollToBottom()
    this.connectToUserGroups()
    //  this.isAdmin = this.grupoSeleccionado?.admins?.some((a) => a.id === this.userData.id) ?? false
  },

  updated() {
    this.scrollToBottom()
  },
  methods: {
    async loadFriends() {
      try {
        const response = await api.get('/friends')
        this.friends = response.data.data.map((u) => ({
          id: u.id,
          nombre: u.name,
          email: u.email,
          photo: u.photo,
        }))
      } catch (error) {
        console.error('Error al cargar amigos:', error)
        this.addToast('Error al cargar amigos', 'error')
      }
    },
    async connectToUserGroups() {
      try {
        const response = await api.get('/roomsGroups')
        const rooms = response.data.rooms

        if (rooms && rooms.length > 0) {
          if (!socket.connected) {
            socket.connect()
          }
          socket.emit('room group', {
            userId: this.userData.id,
            rooms: rooms,
          })

          //Escucha de mensajes de llegada
          socket.on('newMessageGroup', (dataMessage) => {
            console.log('Nuevo mensaje recibido', dataMessage.message)
            const chat = this.Grupos.find((c) => c.id === dataMessage.id_chat)
            if (chat) {
              chat.mensajes.push({
                name: dataMessage.name,
                email: dataMessage.email,
                photo: dataMessage.photo,
                message: dataMessage.message,
                sender_id: dataMessage.sender_id,
                recibido: true,
              })
              if (this.chatSeleccionado?.id !== chat.id) {
                chat.nuevos = (chat.nuevos || 0) + 1
              }
            }
          })
        }
      } catch (error) {
        console.error('Error al obtener y conectar a las salas:', error)
        this.addToast('Error al conectar con los grupos', 'error')
      }
    },
    addToast(message, type) {
      this.$refs.toastRef.addToast(message, type)
    },

    async loadGroups() {
      try {
        const response = await api.get('/groups')
        const temp = response.data.data

        // Verificar si hay grupos sin admin y corregirlo en BD y localmente
        temp.forEach((u) => {
          if (u.participants && u.participants.length > 0) {
            const hasAdmin = u.participants.some((p) => p.admin === 1)
            if (!hasAdmin) {
              u.participants[0].admin = 1
              // Llamada a la API para guardar el cambio en la base de datos
              api.put(`/group/${u.id}/member/${u.participants[0].id}`).catch(() => {})
            }
          }
        })

        this.Grupos = temp.map((u) => {
          return {
            id: u.id,
            nombre: u.name,
            descripcion: u.description,
            f_creado: u.date_c,
            mensaje: '...',
            nuevos: 1,
            photo: u.photo,
            mensajes: u.messages,
            participantes: u.participants,
          }
        })
      } catch (error) {
        this.addToast('Error al cargar grupos', 'error')
      }
    },
    onFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.form.photo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async newGroup() {
      if (!this.form.name.trim()) {
        return this.addToast('El nombre del grupo es obligatorio', 'warning')
      }
      try {
        if (!this.form.photo) {
          this.form.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.form.name)}&background=random&color=fff`
        }
        await api.post('/group', this.form)
        await this.loadGroups()
        this.modalCrearGrupo = false
        this.addToast('Grupo creado exitosamente', 'success')
        this.form = { id: 0, name: '', description: '', photo: '', status: false }
      } catch (e) {
        this.addToast('Error al crear grupo', 'error')
      }
    },
    async editGroup() {
      if (!this.form.name.trim()) {
        return this.addToast('El nombre del grupo es obligatorio', 'warning')
      }
      try {
        await api.put(`/group/${this.form.id}`, this.form)
        await this.loadGroups()
        this.modalEditarGrupo = false
        this.addToast('Grupo editado exitosamente', 'success')
      } catch (e) {
        this.addToast('Error al editar grupo', 'error')
      }
    },
    async hacerAdmin(userId) {
      try {
        await api.put(`/group/${this.grupoSeleccionado.id}/member/${userId}`)

        let esAdmin = false
        this.grupoSeleccionado.participantes = this.grupoSeleccionado.participantes.map((p) => {
          if (p.id === userId) {
            esAdmin = p.admin !== 1
            return { ...p, admin: p.admin == 1 ? 0 : 1 }
          }
          return p
        })
        this.addToast(
          esAdmin ? 'Usuario ahora es administrador' : 'Usuario ya no es administrador',
          'success',
        )
      } catch (e) {
        this.addToast('Error al asignar admin', 'error')
      }
    },
  async confirmLeaveGroup() {
    this.showLeaveConfirm = false
    await this.expulsar(this.userData.id)
  },
  openExpelConfirm(id) {
    this.userToExpelId = id
    this.showExpelConfirm = true
  },
  async confirmExpelUser() {
    this.showExpelConfirm = false
    if (this.userToExpelId) {
      await this.expulsar(this.userToExpelId)
      this.userToExpelId = null
    }
  },
    async expulsar(userId) {
      try {
        await api.delete(`/group/${this.grupoSeleccionado.id}/member/${userId}`)
        this.grupoSeleccionado.participantes = this.grupoSeleccionado.participantes.filter(
          (p) => p.id !== userId,
        )
        if (userId === this.userData.id) {
          this.addToast('Saliste del grupo', 'success')
          this.grupoSeleccionado = null
          this.mostrarPerfil = false
          this.loadGroups()
        } else {
          this.addToast('Usuario expulsado', 'success')
        }
      } catch (e) {
        this.addToast('Error al realizar la acción', 'error')
      }
    },
    sendMessage(id) {
      if (!this.nuevoMensaje.trim()) return
      socket.emit('sendMessageGroup', {
        id_chat: id,
        senderId: this.userData.id,
        message: this.nuevoMensaje,
      })

      this.grupoSeleccionado.mensajes.push({
        message: this.nuevoMensaje,
        sender_id: this.userData.id,
        photo: this.userData.photo,
        name: this.userData.name,
        email: this.userData.email,
      })
      this.nuevoMensaje = ''
    },
    async addToGroup(contacto) {
      try {
        await api.post(`/group/${this.grupoSeleccionado.id}/member/${contacto.id}`)
        if (!this.grupoSeleccionado.participantes.some((p) => p.id === contacto.id)) {
          this.grupoSeleccionado.participantes.push({
            id: contacto.id,
            name: contacto.nombre,
            email: contacto.email,
            photo: contacto.photo,
            admin: 0,
          })
        }
        this.addToast('Se agregó exitosamente', 'success')
      } catch (e) {
        this.addToast('Error al agregar al grupo', 'error')
      }
    },
    seleccionarChat(chat) {
      this.grupoSeleccionado = chat
      console.log(this.grupoSeleccionado)
    },
    scrollToBottom() {
      const container = this.$refs.scrollContainer
      if (container) container.scrollTop = container.scrollHeight
    },
  },
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #c9aedf;
  border-radius: 4px;
}
</style>
