<template>
  <div class="flex h-screen w-full bg-gray-900 text-white">
    <div class="flex-1 flex flex-col justify-start items-center p-8 overflow-y-auto">
      <div
        class="w-full max-w-3xl bg-gray-800 p-8 rounded-2xl flex flex-col items-center space-y-6 shadow-lg"
      >
        <h2 class="text-3xl font-bold mb-4">Configuración de Perfil</h2>
        <div class="flex flex-col items-center space-y-3">
          <img
            :src="vistaPrevia || user.photo"
            alt="Foto de perfil"
            class="w-32 h-32 rounded-full border-4 border-blue-600 object-cover"
          />
          <div class="flex gap-3">
            <label class="cursor-pointer text-blue-400 hover:underline text-sm">
              Cambiar foto
              <input type="file" class="hidden" @change="cargarFoto" accept="image/*" />
            </label>
            <button
              @click="eliminarFoto"
              class="text-red-400 hover:underline text-sm cursor-pointer"
            >
              Eliminar foto
            </button>
          </div>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarCambios" class="w-full flex flex-col space-y-4">
          <div>
            <label class="block text-gray-300 mb-1">Nombre</label>
            <input
              v-model="user.nickname"
              type="text"
              placeholder="Tu nickname"
              class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-gray-300 mb-1">Correo electrónico</label>
            <input
              v-model="user.email"
              type="email"
              disabled
              class="w-full bg-gray-700 text-gray-400 rounded-lg px-4 py-2 outline-none"
            />
          </div>

          <div class="flex justify-end mt-4">
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <ArchiveBoxArrowDownIcon class="w-6 h-6" /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script>
import { ArchiveBoxArrowDownIcon } from '@heroicons/vue/24/solid'
import ToastNotification from '@/components/ToastNotification.vue'
export default {
  components: {
    ArchiveBoxArrowDownIcon,
    ToastNotification,
  },
  data() {
    return {
      userData: JSON.parse(localStorage.getItem('user')),
      user: {
        photo: '',
        nickname: '',
        email: '',
      },
      vistaPrevia: null,
    }
  },
  mounted() {
    this.user.photo = this.userData.photo
    this.user.nickname = this.userData.name
    this.user.email = this.userData.email
  },
  methods: {
    cargarFoto(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.vistaPrevia = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    eliminarFoto() {
      this.vistaPrevia = null
      this.user.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.nickname)}&background=random&color=fff`
    },

    guardarCambios() {
      this.addToast('Cambios guardados correctamente', 'success')
    },
    addToast(message, type) {
      this.$refs.toastRef.addToast(message, type)
    },
  },
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
