<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-200 mb-4">👥 Gestión de Usuarios</h1>

    <!-- Botón para agregar nuevo usuario -->
    <div class="mb-4">
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
        @click="agregarUsuario"
      >
        ➕ Nuevo Usuario
      </button>
    </div>

    <!-- Tabla de usuarios -->
    <table class="min-w-full border border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-800 text-gray-300 uppercase text-sm">
        <tr>
          <th class="px-6 py-3 text-left">Nombre</th>
          <th class="px-6 py-3 text-left">Rol</th>
          <th class="px-6 py-3 text-center">Acciones</th>
        </tr>
      </thead>

      <tbody class="bg-gray-900 text-gray-200 divide-y divide-gray-700">
        <tr v-for="user in users" :key="user.id" class="hover:bg-gray-800 transition">
          <td class="px-6 py-3">{{ user.nombre }}</td>
          <td class="px-6 py-3">{{ user.rol }}</td>
          <td class="px-6 py-3 text-center space-x-2">
            <button
              class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
              @click="editarUsuario(user.id)"
            >
              ✏️ Editar
            </button>
            <button
              class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
              @click="eliminarUsuario(user.id)"
            >
              🗑️ Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Datos simulados de usuarios
const users = ref([
  { id: 1, nombre: 'Ana Pérez', rol: 'Administrador' },
  { id: 2, nombre: 'Carlos Gómez', rol: 'Docente' },
  { id: 3, nombre: 'Lucía Torres', rol: 'Estudiante' },
])

// Funciones de ejemplo
const agregarUsuario = () => {
  alert('Aquí podrías abrir un modal para agregar un usuario')
}

const editarUsuario = (id) => {
  const user = users.value.find(u => u.id === id)
  alert(`Editar usuario: ${user.nombre}`)
}

const eliminarUsuario = (id) => {
  users.value = users.value.filter(u => u.id !== id)
}
</script>
