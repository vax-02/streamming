<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Contenido principal -->
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 class="text-3xl font-bold mb-6 text-center">Reproducción y Contenido</h2>

        <!-- Calidad de video -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Calidad de video</h3>
            <p class="text-gray-400 text-sm">Ajusta la resolución de reproducción</p>
          </div>
          <select
            v-model="config.calidadVideo"
            class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="auto">Automática</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        <!-- Subtítulos -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Subtítulos</h3>
            <p class="text-gray-400 text-sm">Activa o desactiva subtítulos y transcripciones</p>
          </div>
          <div class="flex items-center space-x-3">
            <input type="checkbox" v-model="config.subtitulos" class="toggle-checkbox" />
            <select
              v-model="config.idiomaSubtitulos"
              class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
              :disabled="!config.subtitulos"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
        </div>

        <!-- Velocidad de reproducción -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Velocidad de reproducción</h3>
            <p class="text-gray-400 text-sm">Ajusta la velocidad del video</p>
          </div>
          <select
            v-model="config.velocidad"
            class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>

        <!-- Modo visual -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Modo visual</h3>
            <p class="text-gray-400 text-sm">Tema oscuro o claro para la plataforma</p>
          </div>
          <input type="checkbox" v-model="config.modoOscuro" class="toggle-checkbox" />
        </div>

        <!-- Preferencias de contenido -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Preferencias de contenido</h3>
            <p class="text-gray-400 text-sm">Mostrar solo contenido relevante o avanzado</p>
          </div>
          <select
            v-model="config.filtroContenido"
            class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="todos">Todos</option>
            <option value="recomendados">Recomendados</option>
            <option value="solo-avanzado">Solo avanzado</option>
          </select>
        </div>

        <!-- Audio y accesibilidad -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Audio y accesibilidad</h3>
            <p class="text-gray-400 text-sm">Idioma de audio y audio descriptivo</p>
          </div>
          <div class="flex items-center space-x-3">
            <select
              v-model="config.idiomaAudio"
              class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
            <input type="checkbox" v-model="config.audioDescriptivo" class="toggle-checkbox" />
          </div>
        </div>

        <!-- Guardar cambios -->
        <div class="flex justify-end mt-4">
          <button
            @click="guardarCambios"
            class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            <BookmarkSquareIcon class="w-5 h-5 inline-block mr-2" />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BookmarkSquareIcon } from '@heroicons/vue/24/solid'

const config = ref({
  calidadVideo: 'auto',
  subtitulos: true,
  idiomaSubtitulos: 'es',
  velocidad: 1,
  modoOscuro: true,
  filtroContenido: 'recomendados',
  idiomaAudio: 'es',
  audioDescriptivo: false,
})

function guardarCambios() {
  alert('Configuración de reproducción guardada correctamente')
}
</script>

<style scoped>
.toggle-checkbox {
  width: 40px;
  height: 20px;
  -webkit-appearance: none;
  background-color: #4b5563;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s;
}
.toggle-checkbox:checked {
  background-color: #7e22ce;
}
.toggle-checkbox:before {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  top: 1px;
  left: 1px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}
.toggle-checkbox:checked:before {
  transform: translateX(20px);
}
</style>
