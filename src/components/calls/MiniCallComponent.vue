<template>
  <div
    @click="maximize"
    class="fixed bottom-6 right-6 w-80 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl flex items-center p-4 space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200 border border-gray-700 z-50"
  >
    <!-- Avatar with pulse animation -->
    <div class="relative">
      <img
        :src="contactPhoto || 'https://ui-avatars.com/api/?name=' + contactName"
        alt="Contact"
        class="w-14 h-14 rounded-full object-cover border-2 border-green-500"
      />
      <div class="absolute -inset-1 border-2 border-green-500/30 rounded-full animate-ping-slow"></div>
    </div>

    <!-- Call Info -->
    <div class="flex-1 min-w-0">
      <p class="font-semibold truncate text-lg">{{ contactName }}</p>
      <div class="flex items-center gap-2 text-sm text-gray-300">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>{{ formattedDuration }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2">
      <!-- Mute Toggle -->
      <button
        @click.stop="toggleMute"
        class="p-2 rounded-full transition-colors"
        :class="isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'"
        :title="isMuted ? 'Activar micrófono' : 'Silenciar'"
      >
        <MicrophoneIcon v-if="!isMuted" class="w-5 h-5" />
        <MicrophoneIconSlash v-else class="w-5 h-5" />
      </button>

      <!-- End Call -->
      <button
        @click.stop="endCall"
        class="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
        title="Finalizar llamada"
      >
        <PhoneXMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MicrophoneIcon, PhoneXMarkIcon } from '@heroicons/vue/24/solid'
import { MicrophoneIcon as MicrophoneIconSlash } from '@heroicons/vue/24/outline'

const props = defineProps({
  contactName: {
    type: String,
    default: 'Usuario'
  },
  contactPhoto: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['maximize', 'endCall', 'toggleMute'])

const formattedDuration = computed(() => {
  const mins = Math.floor(props.duration / 60)
  const secs = props.duration % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

function maximize() {
  emit('maximize')
}

function endCall() {
  emit('endCall')
}

function toggleMute() {
  emit('toggleMute')
}
</script>

<style scoped>
@keyframes ping-slow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0;
  }
}
.animate-ping-slow {
  animation: ping-slow 2s infinite;
}
</style>

