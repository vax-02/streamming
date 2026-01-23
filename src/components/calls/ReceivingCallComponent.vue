<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-700">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white text-lg font-medium">Conectando...</p>
        </div>
      </div>

      <!-- Call Modal -->
      <div v-else class="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center border border-gray-700 relative overflow-hidden">
        
        <!-- Background Animation -->
        <div class="absolute inset-0 bg-blue-500/10 animate-pulse-slow"></div>

        <div class="relative z-10">
          <div class="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 shadow-lg overflow-hidden mb-4">
            <img :src="callerAvatar || 'https://ui-avatars.com/api/?name=User&background=random'" alt="Caller" class="w-full h-full object-cover">
          </div>
          
          <h2 class="text-2xl font-bold text-white mb-1">{{ callerName || 'Desconocido' }}</h2>
          <p class="text-blue-400 animate-pulse font-medium">Llamada entrante...</p>

          <div class="flex justify-center gap-6 mt-8">
            <button 
              @click="reject"
              class="flex flex-col items-center gap-2 group"
            >
              <div class="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-700 transition transform group-hover:scale-110">
                 <PhoneXMarkIcon class="w-6 h-6 text-white" />
              </div>
              <span class="text-sm text-gray-400 group-hover:text-white transition">Rechazar</span>
            </button>

            <button 
              @click="accept"
              class="flex flex-col items-center gap-2 group"
            >
              <div class="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-green-600 transition transform group-hover:scale-110 animate-bounce-short">
                 <PhoneIcon class="w-6 h-6 text-white" />
              </div>
              <span class="text-sm text-gray-400 group-hover:text-white transition">Contestar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Hidden Audio Element for Ringtone -->
      <audio ref="ringtoneAudio" loop>
        <source src="https://www.soundjay.com/phone/sounds/phone-calling-1.mp3" type="audio/mpeg">
      </audio>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  visible: Boolean,
  callerName: String,
  callerAvatar: String
})

const emit = defineEmits(['accept', 'reject'])

const ringtoneAudio = ref(null)
const isLoading = ref(false)

// Watch for visibility changes to play/stop ringtone
watch(() => props.visible, (newVal) => {
  if (newVal) {
    playRingtone()
  } else {
    stopRingtone()
  }
})

function playRingtone() {
  if (ringtoneAudio.value) {
    ringtoneAudio.value.play().catch(err => {
      console.error('Error playing ringtone:', err)
    })
  }
}

function stopRingtone() {
  if (ringtoneAudio.value) {
    ringtoneAudio.value.pause()
    ringtoneAudio.value.currentTime = 0
  }
}

function accept() {
  stopRingtone()
  isLoading.value = true
  
  // Simulate a brief loading before navigating
  setTimeout(() => {
    emit('accept')
    isLoading.value = false
  }, 500)
}

function reject() {
  stopRingtone()
  emit('reject')
}

onBeforeUnmount(() => {
  stopRingtone()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}
.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

@keyframes bounce-short {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce-short {
  animation: bounce-short 1s infinite;
}
</style>
