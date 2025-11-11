<template>
  <div class="flex h-screen bg-gray-800 text-gray-200">
    <main class="flex-1 overflow-y-auto p-6 space-y-10">
      <section id="panel" class="space-y-4">
        <h2 class="text-2xl font-semibold">Panel General</h2>
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-gray-900 p-4 rounded-xl text-center">
            <UserGroupIcon class="w-6 h-6 text-green-500" />
            <p>Usuarios Activos</p>
            <h3 class="text-2xl font-bold">120</h3>
          </div>
          <div class="bg-gray-900 p-4 rounded-xl text-center">
            <VideoCameraIcon class="w-6 h-6 text-red-500" />
            <p>Streams en Vivo</p>
            <h3 class="text-2xl font-bold">8</h3>
          </div>
          <div class="bg-gray-900 p-4 rounded-xl text-center">
            <ChatBubbleLeftIcon class="w-6 h-6 text-blue-400" />
            <p>Mensajes Hoy</p>
            <h3 class="text-2xl font-bold">450</h3>
          </div>
          <div class="bg-gray-900 p-4 rounded-xl text-center">
            <ChatBubbleLeftRightIcon class="w-6 h-6 text-green-400" />
            <p>Grupos Activos</p>
            <h3 class="text-2xl font-bold">25</h3>
          </div>
        </div>
      </section>

      <div class="flex gap-4">
        <section id="streams" class="flex-1 space-y-4">
          <h2 class="text-2xl font-semibold">Transmisiones</h2>

          <div class="grid grid-cols-3 gap-4 bg-gray-900 p-4 rounded-xl">
            <div class="bg-gray-800 rounded-xl p-3">
              <div class="aspect-video bg-gray-700 rounded-lg mb-2"></div>
              <h3 class="font-bold">Clase de Física II</h3>
              <p class="text-sm text-gray-400">🟢 En vivo · Prof. Rojas</p>
            </div>
          </div>
        </section>
        <section id="grupos" class="flex-1 space-y-4">
          <h2 class="text-2xl font-semibold">Grupos y Clases</h2>
          <div class="grid grid-cols-1 gap-4 bg-gray-900 p-4 rounded-xl">
            <div class="bg-gray-800 p-4 rounded-xl">
              <h3 class="font-bold">📘 Matemáticas I</h3>
              <p>Docente: Ana Flores</p>
              <p>Miembros: 30</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-xl">
              <h3 class="font-bold">🧪 Química</h3>
              <p>Docente: Luis Paz</p>
              <p>Miembros: 25</p>
            </div>
          </div>
        </section>
      </div>

      <section id="biblioteca" class="space-y-4">
        <h2 class="text-2xl font-semibold">Biblioteca</h2>

        <!-- Grid de 4 columnas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-900 p-4 rounded-xl">
          <!-- Recurso 1 -->
          <div class="bg-gray-800 p-4 rounded-xl flex flex-col items-center space-y-2 text-center">
            <div class="text-4xl">📄</div>
            <p class="font-semibold text-gray-100">Apuntes Física II.pdf</p>
            <p class="text-gray-400 text-sm">Docente: Prof. Rojas</p>
            <p class="text-gray-400 text-sm">Media de asistencia: 87%</p>
            <p class="text-gray-400 text-sm">Duración: 1h 30min</p>
          </div>

          <!-- Recurso 2 -->
          <div class="bg-gray-800 p-4 rounded-xl flex flex-col items-center space-y-2 text-center">
            <div class="text-4xl">🎞️</div>
            <p class="font-semibold text-gray-100">Clase Intro.mp4</p>
            <p class="text-gray-400 text-sm">Docente: Prof. López</p>
            <p class="text-gray-400 text-sm">Media de asistencia: 92%</p>
            <p class="text-gray-400 text-sm">Duración: 2h 10min</p>
          </div>

          <!-- Recurso 3 -->
          <div class="bg-gray-800 p-4 rounded-xl flex flex-col items-center space-y-2 text-center">
            <div class="text-4xl">📄</div>
            <p class="font-semibold text-gray-100">Apuntes Química.pdf</p>
            <p class="text-gray-400 text-sm">Docente: Prof. Paz</p>
            <p class="text-gray-400 text-sm">Media de asistencia: 80%</p>
            <p class="text-gray-400 text-sm">Duración: 1h 15min</p>
          </div>

          <!-- Recurso 4 -->
          <div class="bg-gray-800 p-4 rounded-xl flex flex-col items-center space-y-2 text-center">
            <div class="text-4xl">🎞️</div>
            <p class="font-semibold text-gray-100">Clase Avanzada.mp4</p>
            <p class="text-gray-400 text-sm">Docente: Prof. Rojas</p>
            <p class="text-gray-400 text-sm">Media de asistencia: 88%</p>
            <p class="text-gray-400 text-sm">Duración: 1h 50min</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
<script>
import MainLayout from '@/layouts/MainLayout.vue'
import {
  VideoCameraIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/solid'
export default {
  components: {
    MainLayout,
    VideoCameraIcon,
    UserGroupIcon,
    ChatBubbleLeftIcon,
    ChatBubbleLeftRightIcon,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped></style>
