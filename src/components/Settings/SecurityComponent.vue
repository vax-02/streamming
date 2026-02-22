<template>
<div
  v-if="isLoading"
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
  <div class="loader border-4 border-t-4 border-purple-500 rounded-full w-12 h-12 animate-spin"></div>
</div>


  <div class="flex h-screen bg-gray-900 text-white">
    <div class="flex-1 p-2 overflow-y-auto">
      <div class="w-[100%] h-[75%] md:w-[50%] md:h-[80%] max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg space-y-8">
        <h2 class="text-lg md:text-3xl font-bold mb-4 text-center">Cambiar contraseña</h2>
        <div class="bg-gray-700 p-4 rounded-lg space-y-4">          
          <div class="flex flex-col space-y-2">
            <label class="text-gray-300 text-sm">Contraseña actual</label>
            <input
              type="password"
              v-model="password.current"
              placeholder="********"
              class="bg-gray-800 px-3 py-2 rounded-lg text-white outline-none"
            />
          </div>

          <div class="flex flex-col space-y-2">
            <label class="text-gray-300 text-sm">Nueva contraseña</label>
            <input
              type="password"
              v-model="password.new"
              placeholder="********"
              minlength="8"
              maxlength="15"
              class="bg-gray-800 px-3 py-2 rounded-lg text-white outline-none"
            />
          </div>

          <div class="flex flex-col space-y-2">
            <label class="text-gray-300 text-sm">Confirmar nueva contraseña</label>
            <input
              type="password"
              v-model="password.confirm"
              placeholder="********"
               minlength="8"
              maxlength="15"
              class="bg-gray-800 px-3 py-2 rounded-lg text-white outline-none"
            />
          </div>
          <div class="flex justify-end mt-4">

            <button
            @click="changePassword"
            class="bg-blue-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition mt-2"
            >
            <LockClosedIcon class="w-5 h-5 inline-block mr-2" />
            Guardar
          </button>
        </div>
        </div>

      </div>
    </div>

    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {  LockClosedIcon } from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'
import api from '@/services/api'

const password = ref({
  current: '',
  new: '',
  confirm: ''
})
const isLoading = ref(false)
const toastRef = ref(null)


async function changePassword() {
  if (!password.value.current || !password.value.new || !password.value.confirm) {
    toastRef.value.addToast('Todos los campos son obligatorios', 'error')
    return
  }
  if (password.value.new !== password.value.confirm) {
    toastRef.value.addToast('La nueva contraseña no coincide', 'error')
    return
  }
  isLoading.value = true 
  try{
    const response = await api.put("/settings/password",{
     currentPassword : password.value.current
     , newPassword : password.value.new
    })
    if(response.data.data.success){
      toastRef.value.addToast('Contraseña cambiada correctamente', 'success')
    }else{
      toastRef.value.addToast("Contraseña actual incorrecta", 'info')
    }
    password.value = { current: '', new: '', confirm: '' }
  }catch(error){
    toastRef.value.addToast('Error al cambiar la contraseña', 'error')
    return
  }finally {
    isLoading.value = false 
  }
  
}
</script>

<style scoped>
.loader {
  border-top-color: white;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
}
</style>
