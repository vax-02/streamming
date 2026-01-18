<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Contenido principal -->
    <div class="flex-1 p-8 overflow-y-auto">
      <div class="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 class="text-3xl font-bold mb-4 text-center">user y Notificaciones</h2>

        <!-- Estado en línea -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Estado en línea</h3>
            <p class="text-gray-400 text-sm">Controla si otros pueden ver cuando estás activo</p>
          </div>
          <input type="checkbox" v-model="user.online" class="toggle-checkbox" />
        </div>

        <!-- visibility del perfil -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">visibility del perfil</h3>
            <p class="text-gray-400 text-sm">Decide quién puede ver tu perfil y actividad</p>
          </div>
          <select
            v-model="user.visibility"
            class="bg-gray-800 text-white rounded-lg px-3 py-2 outline-none"
          >
            <option value="1">Todos</option>
            <option value="2">Solo contactos</option>
            <option value="3">Nadie</option>
          </select>
        </div>

        <!-- Notificaciones -->
        <div class="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 class="font-semibold">Notificaciones de mensajes y cursos</h3>
            <p class="text-gray-400 text-sm">Activa o desactiva alertas</p>
          </div>
          <input type="checkbox" v-model="user.notifications" class="toggle-checkbox" />
        </div>

        <!-- Guardar cambios -->
        <div class="flex justify-end mt-4">
          <button
            @click="guardarCambios"
            class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            <ArchiveBoxArrowDownIcon class="w-5 h-5 inline-block mr-2" />
            Guardar
          </button>
        </div>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref ,onMounted,reactive} from 'vue'
import { ArchiveBoxArrowDownIcon } from '@heroicons/vue/24/solid'
import api from '@/services/api.js'

import ToastNotification from '@/components/ToastNotification.vue'
const toastRef = ref(null)
const user = reactive({
  online: false,
  visibility: 'todos',
  notifications: true
})


onMounted(()=>{
loadInfo()
})
async function loadInfo(){
  try {
    const response = await api.get("/settings/privacity-notifi")
    console.log(response.data.data)
    const data = response.data.data
    user.online = data.online ==1 ? true : false
user.visibility = data.visibility
user.notifications = data.notification ==1 ? true : false

  } catch (error) {
    
  }
}
async function guardarCambios() {
  try{
    await api.put("/settings/privacity-notifi",{
      showOnline: user.online ? 1 : 0,
      profilePhotoView: user.visibility,
      notifications: user.notifications ? 1 : 0
    })
    addToast('Cambios de user guardados correctamente', 'success')
  }catch(error){
    addToast('Error al guardar los cambios', 'error')
    return
  }
}
function addToast(message, type) {
  toastRef.value.addToast(message, type)
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
  background-color: #1ad333;
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
