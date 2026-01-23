<template>
  <div class="flex-col h-screen p-3 bg-gray-800">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-200">Gestión de Usuarios</h1>
    </div>
    <div class="mb-[8vh] flex items-center justify-between mb-4">
      <input
        type="text"
        v-model="search"
        placeholder="Buscar por nombre o correo"
        class="w-full max-w-md px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        class="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold"
        @click="addUserModal = true"
      >
        <PlusIcon class="h-5 w-5" />
      </button>
    </div>

    <table class="min-w-full border border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-800 text-gray-300 uppercase text-sm">
        <tr>
          <th class="px-6 py-3 text-center">Perfil</th>
          <th class="px-6 py-3 text-center">Nombre</th>
          <th class="px-6 py-3 text-center">Correo</th>
          <th class="px-6 py-3 text-center">Rol</th>
          <th class="px-6 py-3 text-center">Acciones</th>
        </tr>
      </thead>

      <tbody class="bg-gray-900 text-gray-200 divide-y divide-gray-700">
        <tr v-if="loading" v-for="n in perPage" :key="n">
          <td class="px-6 py-3">
            <div class="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
          </td>
          <td class="px-6 py-3">
            <div class="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
          </td>
          <td class="px-6 py-3">
            <div class="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
          </td>
          <td class="px-6 py-3">
            <div class="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
          </td>
          <td class="px-6 py-3">
            <div class="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
          </td>
        </tr>

        <tr v-else v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-800 transition">
          <td class="px-6 py-3">
            <img class="w-6 h-6 rounded-full object-cover" :src="user.photo" alt=""> 
          </td>  
          <td class="px-6 py-3">{{ user.name }}</td>
          <td class="px-6 py-3">{{ user.email }}</td>
          <td class="px-6 py-3">{{ roles[user.rol - 1] }}</td>
          <td class="px-6 py-3 text-center">
            <div class="flex justify-center items-center space-x-3">
              <button class="text-blue-500 hover:text-blue-700" @click="editarUsuario(user.id)">
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                class="text-red-500 hover:text-red-700"
                @click="eliminarUsuarioModal(user.id)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>

              <button
                :class="
                  user.status
                    ? 'text-green-500 hover:text-green-700'
                    : 'text-red-500 hover:text-red-700'
                "
                @click="lockUser(user.id)"
              >
                <LockClosedIcon class="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="paginatedUsers.length === 0">
          <td colspan="4" class="text-center py-4 text-gray-400">No se encontraron usuarios</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginador -->
    <div class="flex justify-center items-center mt-auto space-x-2 py-4">
      <button
        class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Anterior
      </button>

      <span class="text-gray-300"> Página {{ currentPage }} de {{ totalPages }} </span>

      <button
        class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Siguiente
      </button>
    </div>
  </div>

  <div>
    <!-- Modal -->
    <transition name="modal">
      <form @submit.prevent="guardarUsuario">
        <div
          v-if="addUserModal"
          class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
            <!-- Header -->
            <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
              <h2 class="text-lg font-semibold">Agregar rio</h2>
              <button
                @click="addUserModal = false"
                class="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✖
              </button>
            </div>

            <!-- Formulario -->
            <div class="px-6 py-4 space-y-4">
              <div class="flex flex-col items-center">
                <div class="relative">
                  <img
                    :src="newUserPhotoPreview || '/images/user-default.png'"
                    alt="Foto de usuario"
                    class="w-24 h-24 rounded-full object-cover border-4 border-gray-700 shadow-md"
                  />
                  <label class="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-sm">
                    <PencilIcon class="w-4 h-4 text-white" />
                    <input type="file" class="hidden" @change="handleNewUserPhoto" accept="image/*" />
                  </label>
                </div>
                <span class="text-xs text-gray-400 mt-2">Foto de perfil (Opcional)</span>
              </div>
              <div>
                <label class="block text-gray-300 mb-1">Nombre</label>
                <input
                  v-model="newUser.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Nombre completo"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Correo</label>
                <input
                  v-model="newUser.email"
                  type="email"
                  placeholder="correo@example.com"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Rol</label>
                <select
                  v-model="newUser.rol"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="1">Administrador</option>
                  <option value="2">Docente</option>
                  <option value="3">Estudiante</option>
                </select>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end px-6 py-4 border-t border-gray-700 space-x-2">
              <button
                class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                @click="addUserModal = false"
              >
                Cancelar
              </button>
              <button class="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-lg" type="submit">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </form>
    </transition>

    <transition name="modal">
      <form @submit.prevent="modificarUsuario">
        <div
          v-if="editUserModal"
          class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        >
          <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
            <!-- Header -->
            <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
              <h2 class="text-lg font-semibold">Editar Usuario</h2>
              <button
                @click="editUserModal = false"
                class="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✖
              </button>
            </div>

            <!-- Formulario -->
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="block text-gray-300 mb-1">Nombre</label>
                <input
                  v-model="updateUser.name"
                  type="text"
                  autocomplete="name"
                  placeholder="Nombre completo"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Correo</label>
                <input
                  v-model="updateUser.email"
                  type="email"
                  placeholder="correo@example.com"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Rol</label>
                <select
                  v-model="updateUser.rol"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="1">Administrador</option>
                  <option value="2">Docente</option>
                  <option value="3">Estudiante</option>
                </select>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end px-6 py-4 border-t border-gray-700 space-x-2">
              <button
                class="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                @click="editUserModal = false"
              >
                Cancelar
              </button>
              <button class="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded-lg" type="submit">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </form>
    </transition>
  </div>

  <!-- Componente de notificaciones -->
  <ToastNotification ref="toastRef" />

  <ConfirmationComponent
    :visible="removeUserModal"
    title="Confirmar eliminación"
    message="¿Estás seguro de que deseas eliminar este usuario?"
    @confirm="eliminarUsuario"
    @cancel="removeUserModal = false"
  />
</template>

<script>
import { PlusIcon, PencilIcon, TrashIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import ConfirmationComponent from '@/components/dialogs/confirmationComponent.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import api from '@/services/api.js'

export default {
  components: {
    PlusIcon,
    ConfirmationComponent,
    PencilIcon,
    TrashIcon,
    LockClosedIcon,
    ToastNotification,
  },

  data() {
    return {
      loading : true,
      users: [],
      roles: ['Administrador', 'Docente', 'Estudiante'],
      addUserModal: false,
      editUserModal: false,
      removeUserModal: false,
      idUser: null,
      newUser: {
        name: '',
        email: '',
        rol: '',
        status: true,
      },
      updateUser: {},
      newUserPhotoPreview: null,
      search: '',
      currentPage: 1,
      perPage: 8,
    }
  },

  computed: {
    filteredUsers() {
  return this.users.filter(u => {
    const searchLower = this.search.toLowerCase()
    
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) 
        )
  })
}
,
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.perPage)
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredUsers.slice(start, end)
    },
  },

  mounted() {
    this.loadUsers()
  },
  watch: {
    search() {
      this.currentPage = 1
    },
  },
  methods: {
    async loadUsers() {
      try {
        const response = await api.get('/users')
        const temp = response.data.data // ⚡ Axios ya convierte a JSON
        this.users = temp.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          rol: u.rol,
          photo: u.photo,
          status: u.status,
        }))
        this.loading = false
      } catch (error) {
        this.addToast('Error al cargar los usuarios', 'error')
        const mensaje = error.response?.data || 'Error al cargar los usuarios';
        this.addToast(mensaje, 'error')
      }
    },

    handleNewUserPhoto(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.newUserPhotoPreview = e.target.result
          this.newUser.photo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    async guardarUsuario() {
      try {
        const photo =
          this.newUser.photo ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(this.newUser.name)}&background=random&color=fff`

        const response = await api.post('/user', {
          name: this.newUser.name,
          email: this.newUser.email,
          password: this.newUser.email, // Asignar una contraseña por defecto o generar una
          rol: this.newUser.rol,
          photo: photo,
        })
        if (response.status === 200) {
          this.addToast('Usuario agregado correctamente', 'success')
        } else {
          this.addToast('Error al agregar el usuario', 'error')
        }
        const id = response.data.data.id
        this.users.push({ ...this.newUser, id, photo })

        this.newUser = { name: '', email: '', rol: '', status: true }
        this.newUserPhotoPreview = null
        this.addUserModal = false
      } catch (error) {
        this.addToast('Error al agregar el usuario', 'error')
      }
    },

    async modificarUsuario() {
      try {
        await api.put(`/user/${this.updateUser.id}`, {
          name: this.updateUser.name,
          email: this.updateUser.email,
          rol: this.updateUser.rol,
        })
        const index = this.users.findIndex((u) => u.id === this.updateUser.id)

        if (index !== -1) {
          this.users[index] = { ...this.updateUser }
          this.addToast('Usuario modificado correctamente', 'success')
          this.editUserModal = false
        }
      } catch (error) {
        this.addToast('Error al modificar el usuario', 'error')
      }
    },

    editarUsuario(id) {
      const user = this.users.find((u) => u.id === id)
      this.updateUser = { ...user }
      this.editUserModal = true
    },

    async lockUser(id) {
      try {
        const response = await api.get('/user/lock-unlock/' + id)
        if (response.status == 200) {
          const user = this.users.find((u) => u.id === id)
          user.status = !user.status
          const statusMessage = user.status ? 'desbloqueado' : 'bloqueado'
          this.addToast(`Usuario ${statusMessage} correctamente`, 'info')
        } else {
          this.addToast('Error al bloquear/desploquear usuario', 'error')
        }
      } catch (error) {}
    },

    eliminarUsuarioModal(id) {
      this.idUser = id
      this.removeUserModal = true
    },

    async eliminarUsuario() {
      this.users = this.users.filter((u) => u.id !== this.idUser)
      this.removeUserModal = false
      try {
        const response = await api.delete(`/user/${this.idUser}`)
        if (response.status === 200) {
          this.addToast('Usuario eliminado correctamente', 'success')
        } else {
          this.addToast('Error al eliminar el usuario', 'error')
        }
      } catch (error) {
        this.addToast('Error al eliminar el usuario', 'error')
      }
    },

    addToast(message, type = 'info', duration = 3000) {
      // Llamamos al método del componente hijo usando la referencia
      this.$refs.toastRef.addToast(message, type, duration)
    },
  },
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-gray-800 {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .bg-gray-800 {
  transform: scale(0.9) translateY(20px);
}
</style>
