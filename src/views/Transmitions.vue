<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Contenido principal -->
    <div class="flex-1 p-8 overflow-y-auto">
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

        <!-- Lista de transmisiones -->
        <div v-if="transmisiones.length" class="space-y-4">
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
              <router-link
                to="/live"
                class="bg-green-600 hover:bg-yellow-700 px-3 py-1 rounded-md text-sm"
              >
                Iniciar
              </router-link>

              <button
                @click="editarTransmision(index)"
                class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md text-sm"
              >
                ✏️ Editar
              </button>
              <button
                @click="eliminarTransmision(index)"
                class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-400">No hay transmisiones programadas.</p>
      </div>

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
              <label class="block mb-1 text-gray-300">Categoría</label>
              <select
                v-model="nuevaTrans.categoria"
                class="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none"
                required
              >
                <option value="">Seleccione una categoría</option>
                <option value="Matemáticas">Matemáticas</option>
                <option value="Física">Física</option>
                <option value="Programación">Programación</option>
                <option value="Electrónica">Electrónica</option>
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
                💾 Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref } from 'vue'

const transmisiones = ref([])

const abrirFormulario = ref(false)

const nuevaTrans = ref({
  titulo: '',
  descripcion: '',
  categoria: '',
  fechaHora: '',
})

// Guardar nueva transmisión
function guardarTransmision() {
  transmisiones.value.push({ ...nuevaTrans.value })
  // Limpiar formulario
  nuevaTrans.value = { titulo: '', descripcion: '', categoria: '', fechaHora: '' }
  abrirFormulario.value = false
}

// Editar transmisión (simple ejemplo)
function editarTransmision(index) {
  const trans = transmisiones.value[index]
  nuevaTrans.value = { ...trans }
  abrirFormulario.value = true
  // Eliminamos la antigua para reemplazar al guardar
  transmisiones.value.splice(index, 1)
}

// Eliminar transmisión
function eliminarTransmision(index) {
  if (confirm('¿Deseas eliminar esta transmisión?')) {
    transmisiones.value.splice(index, 1)
  }
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
</style>
