<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Sidebar -->
    <aside class="w-[15%] bg-gray-800 p-4 flex flex-col space-y-4">
      <h2 class="text-lg font-bold mb-4 text-center">Opciones</h2>
      <router-link
        to="/settings/profile"
        class="p-2 rounded-md bg-purple-600 text-center font-semibold"
        >Perfil</router-link
      >
      <router-link
        to="/settings/security"
        class="p-2 rounded-md hover:bg-purple-600 text-center transition"
        >Seguridad y Privacidad</router-link
      >

      <router-link
        to="/settings/notifications"
        class="p-2 rounded-md hover:bg-purple-600 text-center transition"
        >Reproduccion y contenido</router-link
      >
    </aside>

    <!-- Contenido principal -->
    <div class="flex-1 bg-gray-900 overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const usuario = ref({
  nombre: 'Ana López',
  profesion: 'Ingeniera de Software',
  especialidad: 'Desarrollo Web',
  rol: 'docente',
  correo: 'ana.lopez@correo.com',
  foto: 'https://randomuser.me/api/portraits/women/65.jpg',
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
