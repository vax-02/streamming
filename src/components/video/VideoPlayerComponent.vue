<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <h2 class="text-3xl font-bold mb-8 text-center">Transmisiones Pasadas</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <div
        v-for="video in pastStreams"
        :key="video.id"
        class="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition transform"
        @click="selectVideo(video)"
      >
        <img
          :src="video.thumbnail"
          alt="Miniatura"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h4 class="font-semibold text-lg mb-1">{{ video.title }}</h4>
          <p class="text-gray-400 text-sm">{{ video.date }}</p>
        </div>
      </div>
    </div>

    <!-- Modal para reproducir video -->
    <div
      v-if="activeVideo"
      class="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 p-4"
    >
      <div class="bg-gray-900 w-full max-w-6xl rounded-lg flex flex-col md:flex-row p-4">
        <!-- Video -->
        <div class="flex-1 flex flex-col justify-center items-center">
          <h2 class="text-3xl font-bold mb-4">{{ activeVideo.title }}</h2>
          <video
            ref="videoRef"
            class="w-full max-h-[80vh] rounded-lg"
            :src="activeVideo.url"
            controls
            autoplay
          ></video>
          <p class="text-gray-400 mt-2">{{ activeVideo.date }}</p>
        </div>

        <!-- Comentarios -->
        <div class="w-full md:w-1/3 md:ml-6 mt-6 md:mt-0 flex flex-col">
          <h3 class="text-2xl font-semibold mb-4">Comentarios</h3>
          <div class="flex-1 overflow-y-auto bg-gray-800 p-4 rounded mb-4 max-h-[80vh]">
            <ul>
              <li
                v-for="comment in activeVideo.comments"
                :key="comment.id"
                class="mb-3"
              >
                <span class="font-semibold">{{ comment.user }}:</span>
                <span>{{ comment.text }}</span>
              </li>
            </ul>
          </div>
          <div class="flex space-x-2">
            <input
              v-model="newComment"
              @keyup.enter="addComment"
              type="text"
              placeholder="Escribe un comentario..."
              class="flex-1 p-2 rounded bg-gray-700 text-white"
            />
            <button
              @click="addComment"
              class="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Enviar
            </button>
          </div>
        </div>

        <!-- Cerrar modal -->
        <button
          @click="activeVideo = null"
          class="absolute top-4 right-4 text-white text-2xl font-bold hover:text-red-500"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const videoRef = ref(null)
const newComment = ref('')
const activeVideo = ref(null)

// Ejemplo de videos pasados
const pastStreams = ref([
  {
    id: 1,
    title: 'Clase de Matemáticas - Álgebra',
    url: '/videos/matematicas-algebra.mp4',
    thumbnail: '/thumbnails/matematicas.webp',
    date: '10 de Noviembre, 2025',
    comments: [
      { id: 1, user: 'Ana', text: 'Muy buena explicación!' },
      { id: 2, user: 'Carlos', text: 'Gracias por la clase!' }
    ]
  },
  {
    id: 2,
    title: 'Física - Termodinámica',
    url: '/videos/fisica.mp4',
    thumbnail: '/thumbnails/fisica.webp',
    date: '08 de Noviembre, 2025',
    comments: []
  },
  {
    id: 3,
    title: 'Química - Reacciones químicas',
    url: '/videos/quimica.mp4',
    thumbnail: '/thumbnails/quimica.webp',
    date: '05 de Noviembre, 2025',
    comments: []
  }
])

function selectVideo(video) {
  activeVideo.value = video
  newComment.value = ''
}

function addComment() {
  if (!newComment.value.trim() || !activeVideo.value) return
  activeVideo.value.comments.push({
    id: Date.now(),
    user: 'Usuario', // reemplazar por usuario real
    text: newComment.value
  })
  newComment.value = ''
}
</script>

<style scoped>
/* Scroll suave en comentarios */
.flex-1.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}
.flex-1.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}
</style>

