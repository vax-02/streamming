<template>
  <div 
    class="relative w-full h-full bg-black flex flex-col items-center justify-center group overflow-hidden select-none"
    @mousemove="handleMouseMove"
    @mouseleave="hideControls"
  >
    <!-- Video Element -->
    <video
      ref="videoRef"
      class="w-full h-full object-contain"
      :src="src"
      @click="togglePlay"
      @timeupdate="updateProgress"
      @loadedmetadata="onLoadedMetadata"
      autoplay
    ></video>

    <!-- Overlay / Controls -->
    <div 
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-6 transition-opacity duration-300"
      :class="{ 'opacity-0 pointer-events-none': !showControls && isPlaying }"
    >
      <!-- Top Bars: Title & Close -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <h3 class="text-xl font-bold text-white drop-shadow-lg">{{ title }}</h3>
          <p class="text-sm text-gray-300 drop-shadow-md">{{ date }}</p>
        </div>
        <button 
          @click="$emit('close')"
          class="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Center Play Button (Big) -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button 
          v-if="!isPlaying"
          @click="togglePlay"
          class="p-8 bg-blue-600/20 rounded-full text-white pointer-events-auto hover:scale-110 transition-transform backdrop-blur-sm border border-white/20"
        >
          <PlayIcon class="w-16 h-16 fill-current" />
        </button>
      </div>

      <!-- Bottom Controls -->
      <div class="space-y-4">
        <!-- Progress Bar -->
        <div class="relative group/progress">
          <div 
            class="h-1.5 w-full bg-white/20 rounded-full cursor-pointer relative overflow-hidden"
            @click="seek"
          >
            <div 
              class="h-full bg-blue-500 rounded-full transition-all duration-100"
              :style="{ width: `${(currentTime / duration) * 100}%` }"
            ></div>
          </div>
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            :style="{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }"
          ></div>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <!-- Play/Pause -->
            <button @click="togglePlay" class="text-white hover:text-blue-400 transition-colors">
              <PauseIcon v-if="isPlaying" class="w-7 h-7" />
              <PlayIcon v-else class="w-7 h-7" />
            </button>

            <!-- Time -->
            <span class="text-sm font-medium text-white tabular-nums">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>

            <!-- Volume (Simplified) -->
             <div class="flex items-center gap-2 group/volume">
                <SpeakerWaveIcon class="w-5 h-5 text-gray-300" />
                <div class="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                    <input type="range" min="0" max="1" step="0.1" v-model="volume" @input="updateVolume" class="w-20" />
                </div>
             </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Speed Selector -->
            <div class="relative group/menu">
              <button class="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-colors">
                <span>{{ currentSpeed }}x</span>
                <ChevronUpIcon class="w-3 h-3" />
              </button>
              <div class="absolute bottom-full right-0 mb-2 w-24 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                <button 
                  v-for="speed in speeds" 
                  :key="speed"
                  @click="setSpeed(speed)"
                  class="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white"
                  :class="{ 'text-blue-400 font-bold': currentSpeed === speed }"
                >
                  {{ speed }}x
                </button>
              </div>
            </div>

            <!-- Quality Selector -->
            <div class="relative group/menu">
              <button class="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white transition-colors">
                <AdjustmentsHorizontalIcon class="w-4 h-4" />
                <span>{{ currentQuality }}</span>
              </button>
              <div class="absolute bottom-full right-0 mb-2 w-24 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                <button 
                  v-for="q in qualities" 
                  :key="q"
                  @click="currentQuality = q"
                  class="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white"
                  :class="{ 'text-blue-400 font-bold': currentQuality === q }"
                >
                  {{ q }}
                </button>
              </div>
            </div>

            <!-- Subtitles Toggle -->
            <button 
                @click="subtitles = !subtitles"
                class="p-1 px-2 rounded text-xs font-bold border transition-colors"
                :class="subtitles ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/10 border-transparent text-gray-400'"
            >
                CC
            </button>

            <!-- Fullscreen -->
            <button @click="toggleFullScreen" class="text-white hover:text-blue-400 transition-colors">
                <ArrowsPointingOutIcon v-if="!isFullScreen" class="w-6 h-6" />
                <ArrowsPointingInIcon v-else class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  PlayIcon, 
  PauseIcon, 
  XMarkIcon, 
  ChevronUpIcon, 
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/vue/24/solid';

const props = defineProps({
  src: String,
  title: String,
  date: String
});

const emit = defineEmits(['close']);

const videoRef = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const showControls = ref(true);
const isFullScreen = ref(false);
const currentSpeed = ref(1);
const currentQuality = ref('1080p');
const subtitles = ref(false);

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
const qualities = ['1080p', '720p', '480p', '360p'];

let hideTimeout = null;

const handleMouseMove = () => {
    showControls.value = true;
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideControls, 3000);
};

const hideControls = () => {
    if (isPlaying.value) {
        showControls.value = false;
    }
};

const togglePlay = () => {
    if (videoRef.value.paused) {
        videoRef.value.play();
        isPlaying.value = true;
    } else {
        videoRef.value.pause();
        isPlaying.value = false;
    }
};

const onLoadedMetadata = () => {
    duration.value = videoRef.value.duration;
};

const updateProgress = () => {
    currentTime.value = videoRef.value.currentTime;
};

const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.value.currentTime = pos * duration.value;
};

const updateVolume = () => {
    videoRef.value.volume = volume.value;
};

const setSpeed = (speed) => {
    currentSpeed.value = speed;
    videoRef.value.playbackRate = speed;
};

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        videoRef.value.parentElement.requestFullscreen();
        isFullScreen.value = true;
    } else {
        document.exitFullscreen();
        isFullScreen.value = false;
    }
};

const formatTime = (time) => {
    if (!time) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

onMounted(() => {
    if (videoRef.value) {
        volume.value = videoRef.value.volume;
    }
});

onUnmounted(() => {
    clearTimeout(hideTimeout);
});
</script>

<style scoped>
input[type=range] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  background: white;
  margin-top: -4px;
  border-radius: 50%;
}
</style>
