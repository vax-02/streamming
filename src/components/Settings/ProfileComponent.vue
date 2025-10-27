<template>
  <div class="flex h-screen w-full bg-gray-900 text-white">
    <!-- Contenido principal -->
    <div class="flex-1 flex flex-col justify-start items-center p-8 overflow-y-auto">
      <div
        class="w-full max-w-3xl bg-gray-800 p-8 rounded-2xl flex flex-col items-center space-y-6 shadow-lg"
      >
        <h2 class="text-3xl font-bold mb-4">Configuración de Perfil</h2>

        <!-- Foto de perfil -->
        <div class="flex flex-col items-center space-y-3">
          <img
            :src="vistaPrevia || usuario.foto"
            alt="Foto de perfil"
            class="w-32 h-32 rounded-full border-4 border-blue-600 object-cover"
          />
          <label class="cursor-pointer text-blue-400 hover:underline text-sm">
            Cambiar foto
            <input type="file" class="hidden" @change="cargarFoto" accept="image/*" />
          </label>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarCambios" class="w-full flex flex-col space-y-4">
          <div>
            <label class="block text-gray-300 mb-1">Nombre</label>
            <input
              v-model="usuario.nickname"
              type="text"
              placeholder="Tu nickname"
              class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-gray-300 mb-1">Correo electrónico</label>
            <input
              v-model="usuario.correo"
              type="email"
              disabled
              class="w-full bg-gray-700 text-gray-400 rounded-lg px-4 py-2 outline-none"
            />
          </div>

          <div class="flex justify-end mt-4">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              💾 Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const usuario = ref({
  foto: 'https://randomuser.me/api/portraits/women/65.jpg',
  nickname: 'Ana_Lopez',
  correo: 'ana.lopez@correo.com',
})

const vistaPrevia = ref(null)

function cargarFoto(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      vistaPrevia.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function guardarCambios() {
  alert('✅ Cambios guardados correctamente')
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
