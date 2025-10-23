<template>
  <div class="flex h-screen bg-gray-900 text-white">

    <!-- Contenido principal -->
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 class="text-3xl font-bold mb-4 text-center">Privacidad y Contenido</h2>

        <!-- Estado en línea -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Estado en línea</h3>
            <p class="text-gray-400 text-sm">Controla si otros pueden ver cuando estás activo</p>
          </div>
          <input type="checkbox" v-model="privacidad.enLinea" class="toggle-checkbox" />
        </div>

        <!-- Visibilidad del perfil -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Visibilidad del perfil</h3>
            <p class="text-gray-400 text-sm">Decide quién puede ver tu perfil y actividad</p>
          </div>
          <select
            v-model="privacidad.visibilidad"
            class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="todos">Todos</option>
            <option value="solo-contactos">Solo contactos</option>
            <option value="nadie">Nadie</option>
          </select>
        </div>

      

        <!-- Notificaciones -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Notificaciones de mensajes y cursos</h3>
            <p class="text-gray-400 text-sm">Activa o desactiva alertas</p>
          </div>
          <input type="checkbox" v-model="privacidad.notificaciones" class="toggle-checkbox" />
        </div>

        <!-- Guardar cambios -->
        <div class="flex justify-end mt-4">
          <button
            @click="guardarCambios"
            class="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            💾 Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const privacidad = ref({
  enLinea: true,
  visibilidad: 'solo-contactos',
  calidadVideo: 'auto',
  notificaciones: true,
})

function guardarCambios() {
  alert('✅ Cambios de privacidad guardados correctamente')
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
