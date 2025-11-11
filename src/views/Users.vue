<template>
  <div class="flex-col h-screen p-3 bg-gray-800">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-200">Gestión de Usuarios</h1>
    </div>

    <!-- Buscador -->

    <div class="mb-[8vh] flex items-center justify-between mb-4">
      <input
        type="text"
        v-model="search"
        placeholder="Buscar por nombre, correo o rol..."
        class="w-full max-w-md px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        class="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold"
        @click="addUserModal = true"
      >
        Nuevo Usuario
      </button>
    </div>

    <!-- Tabla -->
    <table class="min-w-full border border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-800 text-gray-300 uppercase text-sm">
        <tr>
          <th class="px-6 py-3 text-center">Nombre</th>
          <th class="px-6 py-3 text-center">Correo</th>
          <th class="px-6 py-3 text-center">Rol</th>
          <th class="px-6 py-3 text-center">Acciones</th>
        </tr>
      </thead>

      <tbody class="bg-gray-900 text-gray-200 divide-y divide-gray-700">
        <tr v-for="user in paginatedUsers" :key="user.id" class="hover:bg-gray-800 transition">
          <td class="px-6 py-3">{{ user.nombre }}</td>
          <td class="px-6 py-3">{{ user.correo }}</td>
          <td class="px-6 py-3">{{ user.rol }}</td>
          <td class="px-6 py-3 text-center">
            <div class="flex justify-center items-center space-x-3">
              <button class="text-blue-500 hover:text-blue-700" @click="editarUsuario(user.id)">
                <PencilIcon class="h-5 w-5" />
              </button>
              <button class="text-red-500 hover:text-red-700" @click="eliminarUsuarioModal(user.id)">
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
    <transition name="fade">
      <form @submit.prevent="guardarUsuario">
        <div
          v-if="addUserModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
        >
          <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md">
            <!-- Header -->
            <div class="flex justify-between items-center border-b border-gray-700 px-6 py-4">
              <h2 class="text-lg font-semibold">Agregar Nuevo Usuario</h2>
              <button
                @click="addUserModal = false"
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
                  v-model="newUser.nombre"
                  type="text"
                  placeholder="Nombre completo"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Correo</label>
                <input
                  v-model="newUser.correo"
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
                  <option value="Administrador">Administrador</option>
                  <option value="Docente">Docente</option>
                  <option value="Estudiante">Estudiante</option>
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

    <transition name="fade">
      <form @submit.prevent="modificarUsuario">
        <div
          v-if="editUserModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
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
                  v-model="updateUser.nombre"
                  type="text"
                  placeholder="Nombre completo"
                  class="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-gray-300 mb-1">Correo</label>
                <input
                  v-model="updateUser.correo"
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
                  <option value="Administrador">Administrador</option>
                  <option value="Docente">Docente</option>
                  <option value="Estudiante">Estudiante</option>
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

  <!-- Contenedor de toasts en la esquina superior derecha -->
  <div class="fixed top-5 right-5 flex flex-col space-y-2 z-50 py-2 pt-0">
    <transition-group name="toast" tag="div">
      <div
        v-for="(toast, index) in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-2 rounded-lg shadow-lg text-white  px-4 py-2 flex items-center justify-between min-w-[200px]',
          toast.type === 'success' ? 'bg-green-300/30' : '',
          toast.type === 'error' ? 'bg-red-300/30' : '',
          toast.type === 'info' ? 'bg-blue-300/30' : '',
        ]"
      >
        <span>{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="ml-2">x</button>
      </div>
    </transition-group>
  </div>

  <ConfirmationComponent
    :visible="removeUserModal"
    title="Confirmar eliminación"
    message="¿Estás seguro de que deseas eliminar este usuario?"
    @confirm="eliminarUsuario"
    @cancel="removeUserModal = false"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { PencilIcon, TrashIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import ConfirmationComponent from '@/components/dialogs/confirmationComponent.vue'
const users = ref([
  { id: 1, nombre: 'Ana Pérez', correo: 'ana@gmail.com', rol: 'Administrador', status: true },
  { id: 2, nombre: 'Carlos Gómez', correo: 'carlos@gmail.com', rol: 'Docente', status: true },
  { id: 3, nombre: 'Lucía Torres', correo: 'lucia@gmail.com', rol: 'Estudiante', status: false },
  { id: 4, nombre: 'Mario López', correo: 'mario@gmail.com', rol: 'Estudiante', status: true },
  { id: 5, nombre: 'Laura Méndez', correo: 'laura@gmail.com', rol: 'Docente', status: false },
  { id: 6, nombre: 'Pedro Ramírez', correo: 'pedro@gmail.com', rol: 'Administrador', status: true },
])
const addUserModal = ref(false)
const editUserModal = ref(false)
const removeUserModal = ref(false)
// Nuevo usuario

const idUser = ref(null)
const newUser = ref({
  nombre: '',
  correo: '',
  rol: '',
})
const updateUser = ref(newUser)
const guardarUsuario = () => {
  const id = users.value.length ? users.value[users.value.length - 1].id + 1 : 1
  users.value.push({ ...newUser.value, id })

  addToast('Usuario agregado correctamente', 'success')
  newUser.value = { nombre: '', correo: '', rol: '' }
  addUserModal.value = false
}

function modificarUsuario() {
  const index = users.value.findIndex((u) => u.id === updateUser.value.id)
  if (index !== -1) {
    users.value[index] = { ...updateUser.value }
    addToast('Usuario modificado correctamente', 'success')
    editUserModal.value = false
  }
}
// Filtrado
const search = ref('')

// Paginación
const currentPage = ref(1)
const perPage = 8

const filteredUsers = computed(() => {
  return users.value.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.value.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.value.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.value.toLowerCase()),
  )
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / perPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredUsers.value.slice(start, end)
})

const editarUsuario = (id) => {
  const user = users.value.find((u) => u.id === id)
  editUserModal.value = true
  updateUser.value = { ...user }
}

function lockUser(id) {
  const user = users.value.find((u) => u.id === id)
  user.status = !user.status

  const statusMessage = user.status ? 'desbloqueado' : 'bloqueado'
  addToast(`Usuario ${statusMessage} correctamente`, 'info')
}



const toasts = ref([])

const addToast = (message, type = 'info', duration = 3000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    removeToast(id)
  }, duration)
}


function eliminarUsuarioModal(id) {
  removeUserModal.value = true
  idUser.value = id
}
function eliminarUsuario() {
  removeUserModal.value = false
  users.value = users.value.filter((u) => u.id !== idUser.value)
  addToast('Usuario eliminado correctamente', 'success')
}
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}
</script>
