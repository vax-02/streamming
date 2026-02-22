<template>
  <div class="flex h-screen bg-gray-800 text-white font-sans overflow-hidden">
    <!-- Sidebar de Grupos -->
    <aside
      class="w-full md:w-80 bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg z-20"
      :class="[grupoSeleccionado ? 'hidden md:flex' : 'flex']"
    >
      <div class="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-bold tracking-wide flex items-center space-x-2">
          <UserGroupIcon class="h-6 w-6 text-green-500" />
          <span>Grupos</span>
        </h2>
        <button
          @click="modalCrearGrupo = true"
          class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
          title="Crear Grupo"
        >
          <PlusIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Lista de Grupos -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
        <div
          v-for="group in Grupos"
          :key="group.id"
          @click="seleccionarChat(group)"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group"
          :class="[
            grupoSeleccionado && grupoSeleccionado.id === group.id
              ? 'bg-gray-700 text-white border-l-4 border-blue-500 shadow-md'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border-l-4 border-transparent',
          ]"
        >
          <div class="relative">
            <img
              :src="group.photo || getGroupAvatar(group.nombre)"
              alt="img"
              class="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-gray-500 transition-colors"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="font-semibold text-sm truncate">{{ group.nombre }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
              {{ group.mensaje }}
            </p>
          </div>

          <span
            v-if="group.nuevos > 0"
            class="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
          >
            {{ group.nuevos }}
          </span>
        </div>

        <div v-if="Grupos.length === 0" class="text-center py-10 px-4 text-gray-500">
          <p>No perteneces a ningún grupo.</p>
          <button
            @click="modalCrearGrupo = true"
            class="text-blue-400 text-sm hover:underline mt-2"
          >
            Crear uno nuevo
          </button>
        </div>
      </nav>
    </aside>

    <!-- Panel de conversación -->
    <div
      class="flex-1 flex flex-col bg-gray-900 min-w-0 relative"
      :class="[grupoSeleccionado ? 'flex' : 'hidden md:flex']"
    >
      <template v-if="grupoSeleccionado">
        <!-- Header del chat -->
        <header
          class="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-sm z-10"
        >
          <div class="flex items-center space-x-4">
            <button
              @click="grupoSeleccionado = null"
              class="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition"
            >
              <ChevronLeftIcon class="h-6 w-6" />
            </button>

            <div
              class="flex items-center space-x-3 cursor-pointer group"
              @click="mostrarPerfil = !mostrarPerfil"
            >
              <div class="relative">
                <img
                  :src="grupoSeleccionado.photo || 'https://via.placeholder.com/100'"
                  alt="perfil"
                  class="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-all"
                />
              </div>
              <div>
                <h2
                  class="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors"
                >
                  {{ grupoSeleccionado.nombre }}
                </h2>
                <p class="text-xs text-gray-400 font-medium">
                  {{ grupoSeleccionado.participantes ? grupoSeleccionado.participantes.length : 0 }}
                  participantes
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="mostrarPerfil = !mostrarPerfil"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
              title="Info del Grupo"
            >
              <InformationCircleIcon class="w-5 h-5" />
            </button>
          </div>
        </header>

        <!-- Historial de mensajes -->
        <div
          ref="scrollContainer"
          class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-br from-gray-900 to-gray-800/50"
        >
          <div v-for="(group, dateIndex) in groupedMessages" :key="dateIndex">
            <!-- Date Divider -->
            <div class="flex justify-center mb-4">
              <span
                class="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-700"
              >
                {{ group.dateLabel }}
              </span>
            </div>

            <!-- Messages in this group -->
            <div class="space-y-4">
              <div
                v-for="(msg, i) in group.messages"
                :key="i"
                class="flex flex-col"
                :class="msg.sender_id === userData.id ? 'items-end' : 'items-start'"
              >
                <!-- Sender Name for received messages -->

                <span
                  v-if="msg.sender_id !== userData.id"
                  class="text-[10px] text-gray-500 mb-1 ml-1 font-bold uppercase tracking-wider"
                >
                  {{ msg.name }}
                </span>

                <div
                  v-if="msg.type === 'sala'"
                  class="bg-blue-600/20 border border-blue-500 p-4 rounded-lg"
                >
                  <h4 class="text-blue-400 font-semibold mb-1">INVITACION</h4>
                  <p class="text-sm text-gray-300 mb-3">Ingres a la sala...</p>

                  <button
                    @click="modalStream(msg.message)"
                    class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
                  >
                    Unirse a la sala
                  </button>
                </div>
                <div
                  v-else
                  :class="[
                    'px-4 py-2.5 rounded-2xl text-sm max-w-[75%] shadow-md break-words relative group',
                    msg.sender_id === userData.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-700 text-gray-200 rounded-bl-none',
                  ]"
                >
                  {{ msg.message }}
                </div>
                <span class="text-[10px] text-gray-500 mt-1 px-1">{{
                  formatTime(msg.created_at)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="p-4 bg-gray-800 border-t border-gray-700">
          <!-- Restriction Notice -->
          <div
            v-if="grupoSeleccionado.status == 1 && !isAdmin"
            class="mb-3 px-4 py-2 bg-blue-900/20 border border-blue-500/20 rounded-xl flex items-center gap-3"
          >
            <ShieldCheckIcon class="w-5 h-5 text-blue-400" />
            <p class="text-xs text-blue-300 font-medium italic">
              Solo los administradores pueden enviar mensajes en este grupo.
            </p>
          </div>

          <div
            class="flex items-center space-x-2 bg-gray-900 p-1.5 rounded-xl border border-gray-600 focus-within:border-blue-500 transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': grupoSeleccionado.status == 1 && !isAdmin }"
          >
            <input
              v-model="nuevoMensaje"
              type="text"
              :placeholder="
                grupoSeleccionado.status == 1 && !isAdmin
                  ? 'Solo administradores pueden enviar mensajes'
                  : 'Escribe un mensaje al grupo...'
              "
              class="flex-1 bg-transparent text-white px-2 py-1 outline-none placeholder-gray-500 text-sm"
              :disabled="grupoSeleccionado.status == 1 && !isAdmin"
              @keyup.enter="sendMessage(grupoSeleccionado.id)"
            />

            <button
              disabled="grupoSeleccionado.status == 1 && !isAdmin"
              @click="sendMessage(grupoSeleccionado.id)"
              class="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!nuevoMensaje.trim() || (grupoSeleccionado.status == 1 && !isAdmin)"
            >
              <PaperAirplaneIcon class="w-5 h-5 transform -rotate-45 translate-x-0.5" />
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          class="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-900"
        >
          <div class="bg-gray-800 p-6 rounded-full mb-6 relative">
            <UserGroupIcon class="w-20 h-20 text-gray-700" />
            <div class="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <h3 class="text-2xl font-bold text-white mb-2">Comunidad</h3>
          <p class="max-w-md text-gray-400">
            Selecciona un grupo para ver la conversación o crea uno nuevo para invitar a tus amigos.
          </p>
          <button
            @click="modalCrearGrupo = true"
            class="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-transform hover:-translate-y-1"
          >
            Crear Nuevo Grupo
          </button>
        </div>
      </template>
    </div>

    <!-- Panel lateral derecho de perfil -->
    <transition name="slide">
      <div
        v-if="mostrarPerfil && grupoSeleccionado"
        class="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 p-6 flex flex-col z-30 shadow-2xl"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-white">Info. del Grupo</h3>
          <button
            @click="mostrarPerfil = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex flex-col items-center mb-6">
          <img
            :src="grupoSeleccionado.photo || 'https://via.placeholder.com/100'"
            alt="perfil"
            class="w-28 h-28 rounded-full object-cover border-4 border-gray-700 shadow-xl mb-4"
          />
          <h2 class="text-xl font-bold text-white text-center">{{ grupoSeleccionado.nombre }}</h2>
          <p class="text-sm text-gray-400 text-center mt-1 px-2">
            {{ grupoSeleccionado.descripcion }}
          </p>
        </div>

        <div class="flex gap-2 mb-6">
          <button
            v-if="isAdmin"
            class="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-xs font-semibold text-white transition-colors border border-gray-600"
            @click="modalEditarGrupo = true"
          >
            Editar
          </button>

          <button
            v-if="isAdmin"
            class="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-sm"
            @click="modalAgregarParticipante = true"
          >
            Agregar Miembros
          </button>
          <button
            class="flex-1 bg-red-600/20 hover:bg-red-600 hover:text-white text-red-500 py-2 rounded-lg text-xs font-semibold transition-colors border border-red-900/30"
            @click="showLeaveConfirm = true"
          >
            Salir
          </button>
        </div>

        <!-- === LISTA DE PARTICIPANTES === -->
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Participantes ({{ grupoSeleccionado.participantes.length }})
        </h3>
        <div
          v-if="grupoSeleccionado.status == 1"
          class="mb-3 px-4 py-2 bg-blue-900/20 border border-blue-500/20 rounded-xl flex items-center gap-3"
        >
          <ShieldCheckIcon class="w-5 h-5 text-blue-400" />
          <p class="text-xs text-blue-300 font-medium italic">
            Solo los administradores pueden enviar mensajes en este grupo.
          </p>
        </div>
        <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div
            v-for="p in grupoSeleccionado.participantes"
            :key="p.id"
            class="flex items-center justify-between bg-gray-700/50 hover:bg-gray-700 px-3 py-2.5 rounded-lg transition-colors group"
          >
            <div class="flex items-center gap-3">
              <img
                :src="p.photo || 'https://via.placeholder.com/40'"
                class="w-8 h-8 rounded-full object-cover"
              />

              <div class="min-w-0">
                <p class="font-semibold text-sm text-gray-200 truncate w-32">
                  <span class="text-blue-400" v-if="p.id == userData.id">Tú</span>
                  <span v-else>{{ p.name }}</span>
                </p>
                <span
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-blue-900/50 text-blue-300': p.admin === 1,
                    'text-gray-500': p.admin !== 1,
                  }"
                >
                  {{ p.admin === 1 ? 'Admin' : 'Miembro' }}
                </span>
              </div>
            </div>

            <!-- Opciones si eres admin -->
            <div
              class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              v-if="isAdmin && p.id !== userData.id"
            >
              <button
                @click="hacerAdmin(p.id)"
                class="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                :title="p.admin ? 'Quitar admin' : 'Hacer admin'"
              >
                <ShieldCheckIcon class="w-4 h-4" />
              </button>

              <button
                @click="openExpelConfirm(p.id)"
                class="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                title="Expulsar"
              >
                <UserMinusIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <p class="text-center text-gray-600 text-[10px] mt-4">
          Grupo creado el {{ grupoSeleccionado.f_creado }}
        </p>
      </div>
    </transition>

    <!-- Backdrop for Profile Sidebar -->
    <div
      v-if="mostrarPerfil && grupoSeleccionado"
      class="fixed inset-0 bg-black/50 z-20 md:hidden"
      @click="mostrarPerfil = false"
    ></div>

    <ToastNotification ref="toastRef" />
  </div>

  <!---MODAL AGREGAR PARTICIPANTE-->
  <div v-if="modalAgregarParticipante" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      @click="modalAgregarParticipante = false"
    ></div>

    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-white">Agregar Miembros</h2>
          <button
            @click="modalAgregarParticipante = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="relative mb-4">
          <MagnifyingGlassIcon class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar amigo..."
            class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            v-model="searchFriend"
          />
        </div>

        <ul class="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
          <li
            v-for="contacto in filteredFriends"
            :key="contacto.email"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors group"
          >
            <div class="flex items-center space-x-3">
              <div
                class="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
              >
                {{ contacto.nombre.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-bold text-white flex items-center gap-2">
                  {{ contacto.nombre }}
                  <span
                    v-if="contacto.member"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900 text-green-300"
                  >
                    MIEMBRO
                  </span>
                </p>
                <p class="text-xs text-gray-400">{{ contacto.email }}</p>
              </div>
            </div>
            <button
              @click="addToGroup(contacto)"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors bg-blue-600 hover:bg-blue-500 text-white shadow-sm disabled:opacity-50"
              v-if="!contacto.member"
            >
              Agregar
            </button>
            <button
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-colors bg-gray-700 text-gray-400 cursor-default"
              v-else
            >
              Agregado
            </button>
          </li>
          <li v-if="filteredFriends.length === 0" class="text-gray-500 text-center py-4 text-sm">
            No se encontraron resultados.
          </li>
        </ul>

        <div class="flex justify-end pt-4 mt-2 border-t border-gray-700">
          <button
            @click="modalAgregarParticipante = false"
            class="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!--MODAL DE EDITAR GRUPO-->
  <div v-if="modalEditarGrupo" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      @click="modalEditarGrupo = false"
    ></div>
    <!-- Contenedor del modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <form
        @submit.prevent="editGroup"
        class="bg-gray-800 rounded-2xl w-full max-w-md p-8 border border-gray-700 relative shadow-2xl"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Editar Grupo</h3>
          <button
            type="button"
            @click="modalEditarGrupo = false"
            class="text-gray-400 hover:text-white"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Foto del grupo -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative group cursor-pointer w-24 h-24 mb-3">
            <img
              :src="form.photo || 'https://via.placeholder.com/100'"
              alt="Grupo"
              class="w-full h-full rounded-full object-cover border-4 border-gray-700"
            />
            <div
              class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <PencilIcon class="w-8 h-8 text-white" />
            </div>
            <input
              type="file"
              @change="onFileChange"
              class="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p class="text-xs text-gray-500">Click para cambiar foto</p>
        </div>

        <!-- Nombre -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm font-bold mb-2">Nombre del grupo</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Nombre del grupo"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <!-- Descripción -->
        <div class="mb-6">
          <label class="block text-gray-300 text-sm font-bold mb-2">Descripción</label>
          <textarea
            v-model="form.description"
            type="text"
            placeholder="Describe el propósito del grupo"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            required
          ></textarea>
        </div>

        <!-- Bloqueo de mensajes -->
        <div
          class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-700 mb-6"
        >
          <!-- Switch -->
          <button
            type="button"
            @click="form.status = form.status === 1 ? 0 : 1"
            :class="form.status === 1 ? 'bg-blue-600' : 'bg-gray-600'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          >
            <span
              :class="form.status === 1 ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            ></span>
          </button>
          <!-- Label -->
          <span class="text-gray-300 text-sm font-medium">Solo admins envían mensajes</span>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="modalEditarGrupo = false"
            class="px-4 py-2 rounded-lg bg-transparent text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-semibold shadow-md transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>

  <!--MODAL DE CREAR GRUPO-->
  <div v-if="modalCrearGrupo" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      @click="modalCrearGrupo = false"
    ></div>
    <div class="flex min-h-full items-center justify-center p-4">
      <form
        @submit.prevent="newGroup"
        class="bg-gray-800 rounded-2xl w-full max-w-md p-8 border border-gray-700 relative shadow-2xl"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Crear Nuevo Grupo</h3>
          <button
            type="button"
            @click="modalCrearGrupo = false"
            class="text-gray-400 hover:text-white"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Foto del grupo -->
        <div class="flex flex-col items-center mb-6">
          <div
            class="bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mb-3 relative overflow-hidden group"
          >
            <UserGroupIcon v-if="!form.photo" class="w-10 h-10 text-gray-400" />
            <img v-else :src="form.photo" class="w-full h-full object-cover" />
            <input
              type="file"
              @change="onFileChange"
              class="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <p class="text-xs text-blue-400 cursor-pointer hover:underline">Subir foto</p>
        </div>

        <!-- Nombre -->
        <div class="mb-4">
          <label class="block text-gray-300 text-sm font-bold mb-2">Nombre del grupo</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ej: Amigos de la U"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <!-- Descripción -->
        <div class="mb-6">
          <label class="block text-gray-300 text-sm font-bold mb-2">Descripción</label>
          <textarea
            v-model="form.description"
            type="text"
            placeholder="¿De qué trata este grupo?"
            rows="3"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            required
          ></textarea>
        </div>

        <!-- Bloqueo de mensajes -->
        <div
          class="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-700 mb-6"
        >
          <button
            type="button"
            @click="form.status = form.status === 1 ? 0 : 1"
            :class="form.status === 1 ? 'bg-blue-600' : 'bg-gray-600'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
          >
            <span
              :class="form.status === 1 ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            ></span>
          </button>
          <span class="text-gray-300 text-sm font-medium">Solo admins envían mensajes</span>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="modalCrearGrupo = false"
            class="px-4 py-2 rounded-lg bg-transparent text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-semibold shadow-md transition-all"
          >
            Crear Grupo
          </button>
        </div>
      </form>
    </div>
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

  <!-- Stream Confirmation Modal -->
  <Transition name="modal">
    <div
      v-show="showStreamModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div
        class="bg-gray-900 border border-gray-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 text-center"
      >
        <div
          class="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <VideoCameraIcon class="w-10 h-10 text-blue-500 font-bold" />
        </div>

        <h3 class="text-2xl font-bold text-white mb-2">¿Ingresar a la reunión?</h3>
        <p class="text-gray-400 mb-8 leading-relaxed"></p>

        <div class="grid grid-cols-2 gap-4">
          <button
            @click="showStreamModal = false"
            class="px-6 py-3 rounded-2xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition-all border border-gray-700"
          >
            Cancelar
          </button>
          <button
            @click="joinStream"
            class="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
          >
            Unirse ahora
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import socket from '@/services/socket.js'
import {
  UserPlusIcon,
  CalendarDaysIcon,
  UserMinusIcon,
  UserGroupIcon,
  PlusIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/solid'
import bannerMessages from '@/layouts/bannerMessages.vue'
import api from '@/services/api.js'
import ToastNotification from '@/components/ToastNotification.vue'
import ConfirmationComponent from '@/components/dialogs/confirmationComponent.vue'
import router from '@/router'

export default {
  components: {
    VideoCameraIcon,
    UserPlusIcon,
    CalendarDaysIcon,
    UserMinusIcon,
    bannerMessages,
    ToastNotification,
    ConfirmationComponent,
    UserGroupIcon,
    PlusIcon,
    ChevronLeftIcon,
    InformationCircleIcon,
    PaperClipIcon,
    PaperAirplaneIcon,
    CheckIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    ShieldCheckIcon,
  },
  data() {
    return {
      idMeet: null,
      showStreamModal: false,
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
      userData: JSON.parse(localStorage.getItem('user')) || {},

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
    // Compute grouped messages by date
    groupedMessages() {
      if (!this.grupoSeleccionado || !this.grupoSeleccionado.mensajes) return []

      const groups = {}

      this.grupoSeleccionado.mensajes.forEach((msg) => {
        const date = msg.created_at ? new Date(msg.created_at) : new Date()
        const dateString = date.toDateString()

        if (!groups[dateString]) {
          groups[dateString] = {
            dateLabel: this.getFriendlyDateLabel(date),
            messages: [],
          }
        }
        groups[dateString].messages.push(msg)
      })

      return Object.values(groups)
    },
  },
  async mounted() {
    await this.loadGroups()
    await this.loadFriends()
    this.scrollToBottom()
    this.connectToUserGroups()
  },

  updated() {
    // Optional: Scroll to bottom on update if needed, similar to Chats
    // this.scrollToBottom()
  },
  methods: {
    getFriendlyDateLabel(date) {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer'
      } else {
        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
    },
    getGroupAvatar(name) {
      if (!name) return ''
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.scrollContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
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
          socket.emit('room-group', {
            userId: this.userData.id,
            rooms: rooms,
          })

          //Escucha de mensajes de llegada
          if (!socket.hasListeners('newMessageGroup')) {
            
            socket.on('newMessageGroup', (dataMessage) => {
              console.log('Nuevo mensaje de grupo recibido', dataMessage.message)
              const chat = this.Grupos.find((c) => c.id === dataMessage.id_chat)
              if (chat) {
                const nuevoMensaje = {
                  name: dataMessage.name,
                  email: dataMessage.email,
                  photo: dataMessage.photo,
                  message: dataMessage.message,
                  sender_id: dataMessage.sender_id,
                  recibido: true,
                  created_at: dataMessage.created_at || new Date().toISOString(),
                }

                chat.mensajes.push(nuevoMensaje)
                chat.mensaje = dataMessage.message // Actualizar último mensaje en la lista

                if (this.grupoSeleccionado?.id !== chat.id) {
                  chat.nuevos = (chat.nuevos || 0) + 1
                } else {
                  this.scrollToBottom()
                }
              }
            })
          }
        }
      } catch (error) {
        console.error('Error al obtener y conectar a las salas:', error)
        this.addToast('Error al conectar con los grupos', 'error')
      }
    },
    addToast(message, type) {
      if (this.$refs.toastRef) this.$refs.toastRef.addToast(message, type)
    },

    seleccionarChat(chat) {
      this.grupoSeleccionado = chat
      this.mostrarPerfil = false
      chat.nuevos = 0
      this.scrollToBottom()
    },
    async loadGroups() {
      try {
        const response = await api.get('/groups')
        const temp = response.data.data

        temp.forEach((u) => {
          if (u.participants && u.participants.length > 0) {
            const hasAdmin = u.participants.some((p) => p.admin === 1)
            if (!hasAdmin) {
              u.participants[0].admin = 1
              api.put(`/group/${u.id}/member/${u.participants[0].id}`).catch(() => {})
            }
          }
        })

        this.Grupos = temp.map((u) => {
          const msgs = u.messages || []

          const mensajesProcesados = msgs.map((m) => {
            const texto = m.message || ''
            const match = texto.match(/^<<<(.+?)>>>$/)

            if (match) {
              const link = match[1]

              return {
                ...m,
                type: 'sala',
                link: link,
                titulo: 'Invitación a sala',
                descripcion: 'Haz clic para unirte a la videollamada',
                created_at: m.created_at || new Date().toISOString(),
              }
            }

            return {
              ...m,
              type: 'normal',
              created_at: m.created_at || new Date().toISOString(),
            }
          })

          const ultimo =
            mensajesProcesados.length > 0 ? mensajesProcesados[mensajesProcesados.length - 1] : null

          return {
            id: u.id,
            nombre: u.name,
            descripcion: u.description,
            f_creado: u.date_c,
            mensaje: ultimo
              ? ultimo.type === 'sala'
                ? '📹 Invitación a sala'
                : ultimo.message
              : 'Sin mensajes',
            nuevos: 0,
            photo: u.photo,
            mensajes: mensajesProcesados,
            participantes: u.participants || [],
            status: u.status,
          }
        })

        if (this.grupoSeleccionado) {
          const updated = this.Grupos.find((g) => g.id === this.grupoSeleccionado.id)
          if (updated) {
            this.grupoSeleccionado = updated
          }
        }
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
    async addToGroup(contacto) {
      try {
        await api.post(`/group/${this.grupoSeleccionado.id}/member/${contacto.id}`)
        this.addToast('Participante agregado', 'success')
        // Refresh group data to show new member
        await this.loadGroups()
        // Update local selection to reflect changes (re-find the group)
        this.grupoSeleccionado = this.Grupos.find((g) => g.id === this.grupoSeleccionado.id) || null
      } catch (e) {
        this.addToast('Error al agregar miembro', 'error')
      }
    },
    async confirmLeaveGroup() {
      this.showLeaveConfirm = false
      await this.expulsar(this.userData.id)
      // If you leave, deselect
      this.grupoSeleccionado = null
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

        // Remove locally
        if (this.grupoSeleccionado) {
          this.grupoSeleccionado.participantes = this.grupoSeleccionado.participantes.filter(
            (p) => p.id !== userId,
          )
        }

        this.addToast('Miembro expulsado/salido correctamente', 'success')
      } catch (e) {
        this.addToast('Error al expulsar/salir', 'error')
      }
    },
    sendMessage(id) {
      if (!this.nuevoMensaje.trim()) return

      // Restriction Check
      if (this.grupoSeleccionado.status == 1 && !this.isAdmin) {
        this.addToast('Solo los administradores pueden enviar mensajes', 'warning')
        return
      }
      const timestamp = new Date().toISOString()

      socket.emit('sendMessageGroup', {
        id_chat: id,
        senderId: this.userData.id,
        message: this.nuevoMensaje,
        name: this.userData.name,
        email: this.userData.email,
        photo: this.userData.photo,
        created_at: timestamp,
      })

      if (this.grupoSeleccionado && this.grupoSeleccionado.mensajes) {
        this.grupoSeleccionado.mensajes.push({
          message: this.nuevoMensaje,
          sender_id: this.userData.id,
          name: this.userData.name,
          created_at: timestamp,
          enviado: true,
          visto: false,
        })
        // Actualizar el último mensaje en la lista
        this.grupoSeleccionado.mensaje = this.nuevoMensaje

        this.scrollToBottom()
      }
      this.nuevoMensaje = ''
    },
    modalStream(link) {
      this.showStreamModal = true
      this.idMeet = link
    },

    async joinStream() {
      try {
        this.idMeet = this.idMeet.slice(3, -3)
        router.push({
          name: 'request-live',
          params: { id: this.idMeet },
        })
      } catch (e) {
        this.addToast('Error al unirse a la transmisión', 'error')
        return
      }
    },
  },
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
