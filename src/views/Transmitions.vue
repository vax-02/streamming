<template>
  <div class="flex h-screen bg-gray-800 text-white">
    <aside class="w-48 bg-gray-800 border-r border-gray-800 flex flex-col">
      <h2 class="text-lg font-bold p-4 border-b border-gray-800">Transmisiones</h2>
      <nav class="flex flex-col">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = currentTab === tab.id ? null : tab.id"
          :class="[
            'text-left px-4 py-2 transition-all duration-200 border-l-4',
            currentTab === tab.id
              ? 'bg-gray-700 text-white border-blue-500'
              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent',
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </aside>

    <div class="flex-1 bg-gray-900 p-8 overflow-y-auto">
      <section v-if="currentTab === 'programadas'">
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-3xl font-bold">Transmisiones en vivo</h2>
            <button
              @click="abrirFormulario = true"
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              + Nueva transmisión
            </button>
          </div>

          <div v-if="transmisiones.length" class="space-y-4 bg-gray-900 p-4 rounded-lg">
            <div
              v-for="(trans, index) in transmisiones"
              :key="index"
              class="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700 transition"
            >
              <div>
                <h3 class="font-semibold text-lg">{{ trans.titulo }}</h3>
                <p class="text-gray-400 text-sm">{{ trans.descripcion }}</p>
                <p class="text-gray-400 text-sm">Categoría: {{ trans.categoria }}</p>
                <p class="text-gray-400 text-sm">Fecha/Hora: {{ trans.fechaHora }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="shareTransmision = !shareTransmision"
                  class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                >
                  <ShareIcon class="w-6 h-6 icon" />
                </button>

                <router-link
                  to="/live"
                  class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                >
                  <PlayIcon class="W-6 h-6 icon" />
                </router-link>

                <button
                  @click="editarTransmision(index)"
                  class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md text-sm"
                >
                  <PencilIcon class="w-6 h-6 icon" />
                </button>
                <button
                  @click="eliminarTransmision(index)"
                  class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                >
                  <TrashIcon class="w-6 h-6 icon" />
                </button>
              </div>
            </div>
          </div>

          <p v-else class="text-gray-400">No hay transmisiones programadas.</p>
        </div>
      </section>

      <section class="py-5 bg-gray-900 text-white" v-if="currentTab === 'pasadas'">
        <h3 class="text-3xl font-bold text-center mb-12">Transmisiones Pasadas</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div
            v-for="video in pastStreams"
            :key="video.id"
            class="bg-gray-800 rounded-lg overflow-hidden shadow-lg group"
          >
            <div class="relative cursor-pointer" @click="playVideo(video)">
              <img :src="video.thumbnail" alt="thumbnail" class="w-full h-48 object-cover" />
              <div
                class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PlayIcon class="w-16 h-16 text-white/80" />
              </div>
            </div>
            <div class="p-4">
              <h4 class="font-semibold text-lg mb-2">{{ video.title }}</h4>
              <p class="text-gray-400 text-sm">{{ video.date }}</p>
              <button
                @click.stop="goToVideo(video.id)"
                class="mt-3 text-sm text-blue-400 hover:text-blue-300 font-semibold"
              >
                Ver más
              </button>
            </div>
          </div>
        </div>
      </section>
      <!-- Modal/Formulario de nueva transmisión -->
      <div
        v-if="abrirFormulario"
        class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      >
        <div class="bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 relative">
          <h3 class="text-2xl font-bold text-center">Nueva Transmisión</h3>
          <button
            @click="abrirFormulario = false"
            class="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
          >
            ✖
          </button>

          <form @submit.prevent="guardarTransmision" class="space-y-4">
            <div>
              <label class="block mb-1 text-gray-300">Título</label>
              <input
                v-model="nuevaTrans.titulo"
                type="text"
                placeholder="Título de la transmisión"
                class="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label class="block mb-1 text-gray-300">Descripción</label>
              <textarea
                v-model="nuevaTrans.descripcion"
                placeholder="Descripción de la transmisión"
                class="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              ></textarea>
            </div>
            <div>
              <label class="block mb-1 text-gray-300">Tipo</label>
              <select
                v-model="nuevaTrans.categoria"
                class="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none"
                required
              >
                <option value="">Seleccione un tipo</option>
                <option value="Matemáticas">Público</option>
                <option value="Física">Privado</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-gray-300">Fecha y hora</label>
              <input
                v-model="nuevaTrans.fechaHora"
                type="datetime-local"
                class="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="abrirFormulario = false"
                class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal overlay -->

  <div
    v-if="shareTransmision"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <!-- Modal contenido -->
    <div class="bg-gray-800 text-white rounded-xl w-11/12 max-w-lg p-6 relative">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Compartir transmisión</h2>
        <button @click="shareTransmision = false" class="text-gray-400 hover:text-white">✖</button>
      </div>

      <!-- Input búsqueda -->
      <div class="mb-4">
        <input
          type="text"
          placeholder="Buscar grupo..."
          v-model="search"
          class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Lista de grupos filtrados -->
      <div class="max-h-60 overflow-y-auto mb-4">
        <div
          v-for="grupo in filteredGrupos"
          :key="grupo.id"
          class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
          @click="toggleGrupo(grupo.id)"
        >
          <span>{{ grupo.nombre }}</span>
          <input type="checkbox" :checked="selectedGrupos.includes(grupo.id)" readonly />
        </div>
        <div v-if="filteredGrupos.length === 0" class="text-gray-400 text-sm text-center py-4">
          No se encontraron grupos
        </div>
      </div>

      <!-- Link de transmisión -->
      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium">Link de transmisión</label>
        <input
          type="text"
          :value="linkTransmision"
          readonly
          class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed"
        />
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-2">
        <button
          @click="shareTransmision = false"
          class="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          @click="enviarTransmision"
          :disabled="selectedGrupos.length === 0"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          Compartir
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ShareIcon, PencilIcon, TrashIcon, PlayIcon } from '@heroicons/vue/24/solid'
import VideoPlayer from '@/components/video/VideoPlayerComponent.vue'
import router from '@/router'
import api from '@/services/api.js'
export default {
  components: {
    VideoPlayer,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    PlayIcon,
  },

  data() {
    return {
      currentTab: 'programadas',
      tabs: [
        { id: 'programadas', name: 'Programadas' },
        { id: 'pasadas', name: 'Pasadas' },
      ],
      transmisiones: [],
      shareTransmision: false,
      abrirFormulario: false,
      nuevaTrans: {
        titulo: '',
        descripcion: '',
        categoria: '',
        fechaHora: '',
      },
      pastStreams: [
        {
          id: 1,
          title: 'Clase de Matemáticas - Álgebra',
          url: '/videos/matematicas-algebra.mp4',
          date: '10 de Noviembre, 2025',
        },
      ],
      grupos: [
        { id: 1, nombre: 'Grupo A' },
        { id: 2, nombre: 'Grupo B' },
        { id: 3, nombre: 'Grupo C' },
        { id: 4, nombre: 'Grupo D' },
      ],

      selectedGrupos: [],
      search: '',
      linkTransmision: 'https://miapp.com/transmision/abc123',
    }
  },
  computed: {
    filteredGrupos() {
      return grupos.value.filter((g) => g.nombre.toLowerCase().includes(search.value.toLowerCase()))
    },
  },
  mounted() {
    this.loadTransmissions()
  },
  methods: {
    async loadTransmissions() {
      try {
        alert('eje')
        const response = await api.get('/transmissions')
        console.log(response)
        const temp = response.data.data

        this.transmisiones = temp.map((u) => ({
          id: u.id,
          titulo: u.name,
          descripcion: u.description,
          categoria: ((u.type == 0)? 'Privado' : 'Publico') ,
          fechaHora: u.date_t + ' '+ u.time_t,
          status : u.status,
          link: u.link
        }))
      } catch (error) {
        console.log('Error al cargar los t' + error)
      }
    },
    guardarTransmision() {
      transmisiones.value.push({ ...nuevaTrans.value })
      // Limpiar formulario
      nuevaTrans.value = { titulo: '', descripcion: '', categoria: '', fechaHora: '' }
      abrirFormulario.value = false
    },

    // Editar transmisión (simple ejemplo)
    editarTransmision(index) {
      const trans = transmisiones.value[index]
      nuevaTrans.value = { ...trans }
      abrirFormulario.value = true
      // Eliminamos la antigua para reemplazar al guardar
      transmisiones.value.splice(index, 1)
    },

    // Eliminar transmisión
    eliminarTransmision(index) {
      if (confirm('¿Deseas eliminar esta transmisión?')) {
        transmisiones.value.splice(index, 1)
      }
    },

    compartirTransmision(trans) {
      shareTransmision = !shareTransmision
    },
    toggleGrupo(id) {
      if (selectedGrupos.value.includes(id)) {
        selectedGrupos.value = selectedGrupos.value.filter((g) => g !== id)
      } else {
        selectedGrupos.value.push(id)
      }
    },

    enviarTransmision() {
      alert(`Enviando link a grupos: ${selectedGrupos.value.join(', ')}`)
      shareTransmision.value = false
      selectedGrupos.value = []
      search.value = ''
    },
    goToVideo(id) {
      alert(`Navegando a video con ID: ${id}`)
      router.push({ name: 'video', params: { id } })
    },

    playVideo(video) {
      alert(`Iniciando reproducción directa del video: ${video.title}`)
      // Aquí podrías navegar a una ruta de reproducción directa, por ejemplo:
      // router.push({ name: 'player', params: { url: video.url } })
    },
  },
}
</script>

<style scoped>
/* Scroll si hay muchas transmisiones */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #7e22ce;
  border-radius: 4px;
}

.flex-1.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}
.flex-1.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}
</style>
