<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white font-sans">
    <!-- Header superior con Pestañas -->
    <header class="bg-gray-800 border-b border-gray-700 shadow-xl z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between py-4 gap-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <VideoCameraIcon class="h-6 w-6 text-blue-500" />
            </div>
            <span class="text-xl font-bold tracking-wide">Transmisiones</span>
          </div>

          <nav
            class="flex items-center bg-gray-900/50 p-1 rounded-2xl border border-gray-700 overflow-x-auto custom-scrollbar no-scrollbar"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold whitespace-nowrap',
                currentTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              ]"
            >
              <component :is="getTabIcon(tab.id)" class="h-4 w-4" />
              <span class="hidden md:block">{{ tab.name }}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <!-- Header Section -->
        <header
          v-if="currentTab === 'programadas'"
          class="flex justify-between items-center mb-8 pb-4 border-b border-gray-800"
        >
          <div>
            <h1 class="text-md md:text-2xl font-bold text-white">Transmisiones Programadas</h1>
            <p class="hidden md:block text-gray-400 text-sm mt-1">Gestiona tus próximos eventos en vivo.</p>
          </div>
          <button
            @click="abrirNuevoFormulario"
            class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusIcon class="h-5 w-5" />
          </button>
        </header>

        <header v-if="currentTab === 'publicas'" class="mb-8 pb-4 border-b border-gray-800">
          <h1 class="text-md md:text-2xl font-bold text-white">Explorar Transmisiones Públicas</h1>
          <p class="hidden md:block text-gray-400 text-sm mt-1">Descubre contenido de otros creadores.</p>
        </header>

        <header v-if="currentTab === 'pasadas'" class="mb-8 pb-4 border-b border-gray-800">
          <h1 class="text-md md:text-2xl font-bold text-white">Historial de Transmisiones</h1>
          <p class="hidden md:block text-gray-400 text-sm mt-1">Revive tus eventos pasados.</p>
        </header>

        <!-- Tab: Programadas -->
        <section v-if="currentTab === 'programadas'" class="space-y-4">
          <div v-if="transmisiones.length" class="grid gap-4">
            <div
              v-for="(trans, index) in transmisiones"
              :key="index"
              class="bg-gray-800 border border-gray-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-750 transition-colors shadow-sm hover:shadow-md"
            >
              <div class="mb-4 md:mb-0">
                <div class="flex items-center space-x-3 mb-1">
                  <span
                    class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                    :class="
                      trans.categoria === 'Publico'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-yellow-900 text-yellow-300'
                    "
                  >
                    {{ trans.categoria }}
                  </span>
                  <h3 class="font-bold text-lg text-white">{{ trans.titulo }}</h3>
                </div>
                <p class="text-gray-400 text-sm mb-2 max-w-xl">{{ trans.descripcion }}</p>
                <div class="flex items-center text-gray-500 text-sm">
                  <CalendarIcon class="w-4 h-4 mr-1.5" />
                  {{ formatFechaHora(trans.fechaHora) }}
                </div>
              </div>

              <div class="flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  @click="toLive(trans.id)"
                  class="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                  title="Iniciar Live"
                >
                  <PlayIcon class="w-4 h-4" />
                  <span class="md:hidden lg:inline">Iniciar</span>
                </button>

                <button
                  @click="editarTransmision(index)"
                  class="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                  title="Editar"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="openDeleteConfirm(trans.id, index)"
                  class="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                  title="Eliminar"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700"
          >
            <VideoCameraSlashIcon class="w-16 h-16 mb-4 opacity-40" />
            <p class="text-center text-md md:text-lg font-medium">No hay transmisiones programadas</p>
            <p class="text-center text-sm md:text-sm opacity-70">Crea una nueva para comenzar a transmitir</p>
          </div>
        </section>

        <!-- Tab: Pasadas -->
        <section v-if="currentTab === 'pasadas'" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Lista de videos -->
            <template v-if="pastStreams && pastStreams.length">
              <div
                v-for="video in pastStreams"
                :key="video.id"
                class="group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-gray-600 transform hover:-translate-y-1"
              >
                <div class="relative cursor-pointer aspect-video bg-gray-900 group">
                  <!-- Placeholder if no thumbnail -->
                  <div
                    v-if="!video.thumbnail && !video.url"
                    class="absolute inset-0 flex items-center justify-center text-gray-600"
                  >
                    <FilmIcon class="w-12 h-12 opacity-30" />
                  </div>
                  <img
                    v-else
                    :src="video.thumbnail || 'https://placehold.co/600x400?text=Hello\nWorld'"
                    alt="Video"
                    class="w-full h-full object-cover"
                  />

                  <div
                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <div
                      class="bg-blue-600 p-3 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform"
                    >
                      <a :href="video.url" target="_blank">
                        <PlayIcon class="w-8 h-8 text-white ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <h4 class="font-bold text-white text-lg mb-1 line-clamp-1" :title="video.title">
                    {{ video.title }}
                  </h4>

                  <div class="flex flex-col text-gray-400 text-xs mb-3">
                    <span class="mb-1">{{ video.descripcion }}</span>
                    <div class="flex items-center gap-1">
                      <ClockIcon class="w-3.5 h-3.5" />
                      <span>{{ video.fechaHora }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Mensaje cuando no hay videos -->
            <div
              v-else
              class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700"
            >
              <GlobeAltIcon class="w-16 h-16 mb-4 opacity-40" />
              <p class="text-md md:text-lg font-medium">No hay transmisiones pasadas disponibles</p>
            </div>
          </div>
        </section>

        <!-- Tab: Publicas -->
        <section v-if="currentTab === 'publicas'" class="space-y-4">
          <div v-if="publicStreams.length" class="grid gap-4">
            <div
              v-for="(trans, index) in publicStreams"
              :key="index"
              class="bg-gray-800 border border-gray-700 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-750 transition-colors shadow-sm hover:shadow-md"
            >
              <div class="mb-4 md:mb-0">
                <div class="flex items-center space-x-3 mb-1">
                  <span
                    class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-900 text-green-300"
                  >
                    {{ trans.categoria }}
                  </span>
                  <h3 class="font-bold text-lg text-white">{{ trans.titulo }}</h3>
                </div>
                <p class="text-gray-400 text-sm mb-2 max-w-xl">{{ trans.descripcion }}</p>
                <div class="flex items-center text-gray-500 text-sm">
                  <CalendarIcon class="w-4 h-4 mr-1.5" />
                  {{ trans.fechaHora }}
                </div>
              </div>

              <div class="flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0">
                <button
                  @click="requestLive(trans.id)"
                  class="flex-1 md:flex-none flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                >
                  <EyeIcon class="w-4 h-4" />
                  <span class="md:hidden lg:inline">Ver Transmisión</span>
                </button>
              </div>
            </div>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700"
          >
            <GlobeAltIcon class="w-16 h-16 mb-4 opacity-40" />
            <p class="text-center text-sm md:text-lg font-medium">No hay transmisiones públicas disponibles</p>
          </div>
        </section>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="abrirFormulario" class="fixed inset-0 z-50 overflow-y-auto">
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        @click="cancelarFormulario"
      ></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-white">
              {{ nuevaTrans.id ? 'Editar Transmisión' : 'Nueva Transmisión' }}
            </h3>
            <button
              @click="cancelarFormulario"
              class="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <form @submit.prevent="guardarTransmision" class="space-y-5">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">Título</label>
              <input
                v-model="nuevaTrans.titulo"
                type="text"
                placeholder="Ej: Clase de Matemáticas"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">Descripción</label>
              <textarea
                v-model="nuevaTrans.descripcion"
                placeholder="Describe el contenido..."
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
                required
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">Tipo</label>
                <select
                  v-model="nuevaTrans.categoria"
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Publico">Público</option>
                  <option value="Privado">Privado</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-300">Fecha y Hora</label>
                <input
                  v-model="nuevaTrans.fechaHora"
                  type="datetime-local"
                  class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div class="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                @click="cancelarFormulario"
                class="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium border border-gray-600 hover:border-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                {{ nuevaTrans.id ? 'Guardar Cambios' : 'Crear Transmisión' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
    <ConfirmationComponent
      :visible="showDeleteConfirm"
      title="Eliminar transmisión"
      message="¿Estás seguro de que deseas eliminar este contenido? Esta acción no se puede deshacer."
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script>
// Components
import {
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  VideoCameraSlashIcon,
  FilmIcon,
  GlobeAltIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  PaperAirplaneIcon,
} from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'
import ConfirmationComponent from '@/components/dialogs/confirmationComponent.vue'
import api from '@/services/api.js'
import router from '@/router'

export default {
  components: {
    ToastNotification,
    ConfirmationComponent,
    // Icons
    VideoCameraIcon,
    CalendarIcon,
    ClockIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
    PlusIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    XMarkIcon,
    VideoCameraSlashIcon,
    FilmIcon,
    GlobeAltIcon,
    EyeIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    PaperAirplaneIcon,
  },

  data() {
    const userData = JSON.parse(localStorage.getItem('user')) || {}
    return {
      userData,
      currentTab: 'programadas',
      tabs: [
        { id: 'programadas', name: 'Programadas' },
        { id: 'pasadas', name: 'Pasadas' },
        { id: 'publicas', name: 'Públicas' },
      ],
      transmisiones: [],
      publicStreams: [],
      abrirFormulario: false,
      nuevaTrans: {
        id: null,
        titulo: '',
        descripcion: '',
        categoria: '',
        fechaHora: '',
      },
      pastStreams: [],
      grupos: [],
      selectedGrupos: [],
      search: '',
      linkTransmision: '',
      selectedTransmission: null,
      showDeleteConfirm: false,
      transmitionToDelete: null,

      // Video Player Logic
      activeVideo: null,
    }
  },
  computed: {
    filteredGrupos() {
      return this.grupos.filter((g) => g.nombre.toLowerCase().includes(this.search.toLowerCase()))
    },
  },
  mounted() {
    this.loadTransmissions()
    this.loadPublicTransmissions()
    this.loadPastTransmissions()
  },
  methods: {
    getTabIcon(id) {
      const icons = {
        programadas: 'CalendarIcon',
        pasadas: 'ClockIcon',
        publicas: 'GlobeAltIcon',
      }
      return icons[id] || 'CalendarIcon'
    },
    toLive(id) {
      localStorage.setItem('live_id', id)
      // Determinar si el usuario actual es el propietario de esta transmisión
      const transmission = this.transmisiones.find((t) => t.id === id)

      if (transmission && transmission.id_user === this.userData.id) {
        // El usuario es el propietario -> enviar a LiveHost
        router.push(`/liveHost/${id}`)
      } else {
        // El usuario es un viewer -> enviar a LiveViewer
        router.push(`/liveViewer/${id}`)
      }
    },
    requestLive(id) {
      router.push({
        name: 'request-live',
        params: { id: id },
      })
    },
    async loadTransmissions() {
      try {
        const response = await api.get('/transmissions')
        const temp = response.data.data || []

        this.transmisiones = temp.map((u) => ({
          id: u.id,
          id_user: u.id_user,
          titulo: u.name,
          descripcion: u.description,
          categoria: u.type == 0 ? 'Privado' : 'Publico',
          fechaHora: u.date_t + ' ' + u.time_t,
          status: u.status,
          link: u.link,
        }))
      } catch (error) {
        console.error('Error al cargar transmisiones:', error)
      }
    },
    formatFechaHora(fechaHoraString) {
      if (!fechaHoraString) return ''

      // Separar por espacio
      const [fechaStr, horaStr] = fechaHoraString.split(' ')

      // Formatear fecha
      const fecha = new Date(fechaStr)

      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })

      // Formatear hora (03:00:00 → 03:00)
      const horaFormateada = horaStr ? horaStr.slice(0, 5) : ''

      return `${fechaFormateada} ${horaFormateada}`
    },

    formatFechaCorta(date) {
      const d = new Date(date)

      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
    formatHoraCorta(time) {
      if (!time) return ''

      return time.slice(0, 5) // 04:54:00 → 04:54
    },
    async loadPublicTransmissions() {
      try {
        const response = await api.get('/publicTransmissions')
        const temp = response.data.data || []
        this.publicStreams = temp.map((u) => ({
          id: u.id,
          user_id: u.id_user,
          titulo: u.name,
          descripcion: u.description,
          categoria: u.type == 0 ? 'Privado' : 'Publico',
          fechaHora: this.formatFechaCorta(u.date_t) + ' - ' + this.formatHoraCorta(u.time_t),
          status: u.status,
          link: u.link,
        }))
      } catch (error) {
        console.error('Error al cargar transmisiones públicas:', error)
      }
    },
    async loadPastTransmissions() {
      try {
        const response = await api.get('/pastTransmissions')
        const temp = response.data.data || []
        this.pastStreams = [
          ...temp.map((u) => ({
            id: u.id,
            user_id: u.id_user,
            title: u.name,
            descripcion: u.description,
            fechaHora: this.formatFechaCorta(u.date_t) + ' - ' + this.formatHoraCorta(u.time_t),
            url: u.link,
            thumbnail: 'https://placehold.co/600x400/black/gray?text=Ver video',
          })),
        ]
      } catch (error) {
        console.error('Error al cargar transmisiones pasadas:', error)
      }
    },
    async guardarTransmision() {
      const isEdit = !!this.nuevaTrans.id
      try {
        // Prepare payload
        let datePart = ''
        let timePart = ''

        if (this.nuevaTrans.fechaHora) {
          const parts = this.nuevaTrans.fechaHora.split('T')
          datePart = parts[0]
          timePart = parts[1]
          if (timePart.length === 5) {
            timePart += ':00'
          }
        }

        // Find original status/link if editing
        const original = isEdit ? this.transmisiones.find((t) => t.id === this.nuevaTrans.id) : null
        const originalStatus = original ? original.status : 0
        const originalLink = original ? original.link : ''

        const payload = {
          id_user: this.userData.id,
          name: this.nuevaTrans.titulo,
          description: this.nuevaTrans.descripcion,
          type: this.nuevaTrans.categoria == 'Privado' ? 0 : 1,
          date_t: datePart,
          time_t: timePart,
          status: originalStatus,
          link: originalLink,
        }

        if (isEdit) {
          await api.put(`/transmissions/${this.nuevaTrans.id}`, payload)
          this.addToast('Transmisión actualizada correctamente', 'success')

          // Update local list (Splice approach from user)
          const index = this.transmisiones.findIndex((t) => t.id === this.nuevaTrans.id)
          if (index !== -1) {
            this.transmisiones.splice(index, 1, {
              ...this.transmisiones[index],
              titulo: this.nuevaTrans.titulo,
              descripcion: this.nuevaTrans.descripcion,
              categoria: this.nuevaTrans.categoria,
              fechaHora: this.nuevaTrans.fechaHora.replace('T', ' '),
            })
          }
        } else {
          const response = await api.post('/transmissions', payload)
          this.addToast('Transmisión creada correctamente', 'success')

          // Add to local list
          this.transmisiones.push({
            id: response.data.data?.insertId || Date.now(), // Fallback ID if needed
            id_user: this.userData.id,
            titulo: this.nuevaTrans.titulo,
            descripcion: this.nuevaTrans.descripcion,
            categoria: this.nuevaTrans.categoria,
            fechaHora: this.nuevaTrans.fechaHora.replace('T', ' '),
            status: 0,
            link: '',
          })
        }

        this.cancelarFormulario()
      } catch (e) {
        console.error('Error saving transmission:', e)
        let msg = e.response?.data?.message || e.response?.data || 'Error al guardar la transmisión'
        if (typeof msg === 'string' && msg.includes('<!DOCTYPE html>')) {
          msg = 'Error de conexión o ruta no encontrada'
        }
        this.addToast(msg, 'error')
      }
    },
    editarTransmision(index) {
      // Logic adjusted to receive INDEX as per user preference in last diff
      const trans = this.transmisiones[index]
      if (!trans) return

      this.nuevaTrans = { ...trans, id: trans.id }

      if (this.nuevaTrans.fechaHora) {
        const formatted = this.nuevaTrans.fechaHora.replace(' ', 'T').substring(0, 16)
        this.nuevaTrans.fechaHora = formatted
      }

      this.abrirFormulario = true
    },
    abrirNuevoFormulario() {
      // Reset form
      this.nuevaTrans = { id: null, titulo: '', descripcion: '', categoria: '', fechaHora: '' }
      this.abrirFormulario = true
    },
    cancelarFormulario() {
      this.abrirFormulario = false
      setTimeout(() => {
        this.nuevaTrans = { id: null, titulo: '', descripcion: '', categoria: '', fechaHora: '' }
      }, 300)
    },
    openDeleteConfirm(id, index) {
      this.transmitionToDelete = { id, index }
      this.showDeleteConfirm = true
    },
    async confirmDelete() {
      if (!this.transmitionToDelete) return
      const { id, index } = this.transmitionToDelete
      try {
        await api.delete(`/transmissions/${id}`)

        if (this.currentTab === 'programadas') {
          this.transmisiones.splice(index, 1)
        } else if (this.currentTab === 'publicas') {
          this.publicStreams.splice(index, 1)
        }

        this.addToast('Transmisión eliminada correctamente', 'success')
      } catch (e) {
        this.addToast('Error al eliminar', 'error')
      } finally {
        this.showDeleteConfirm = false
        this.transmitionToDelete = null
      }
    },

    addToast(message, type) {
      this.$refs.toastRef.addToast(message, type)
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
</style>
