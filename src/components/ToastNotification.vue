<template>
  <div class="fixed top-6 right-6 flex flex-col space-y-3 z-[100] max-w-sm w-full pointer-events-none">
    <transition-group 
      name="toast" 
      tag="div" 
      class="flex flex-col space-y-3 items-end"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-stretch w-full overflow-hidden rounded-xl bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-2xl transition-all duration-300 transform"
        :class="getTypeStyles(toast.type)"
      >
        <!-- Icon section -->
        <div class="flex items-center justify-center px-4" :class="getIconBg(toast.type)">
             <component :is="getIcon(toast.type)" class="w-6 h-6 text-white" />
        </div>

        <!-- Content section -->
        <div class="flex-1 p-4 flex flex-col justify-center">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
            {{ getTitle(toast.type) }}
          </h4>
          <p class="text-sm font-medium text-white leading-relaxed">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close button -->
        <button 
          @click="removeToast(toast.id)" 
          class="px-3 py-2 text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <!-- Progress bar timer -->
        <div 
            class="absolute bottom-0 left-0 h-1 transition-all duration-100 linear"
            :class="getIconBg(toast.type)"
            :style="{ width: toast.progress + '%' }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { 
    CheckCircleIcon, 
    ExclamationCircleIcon, 
    InformationCircleIcon, 
    ExclamationTriangleIcon,
    XMarkIcon 
} from '@heroicons/vue/24/solid'

export default {
  name: 'ToastNotification',
  components: {
    XMarkIcon
  },
  data() {
    return {
      toasts: [],
    }
  },
  methods: {
    addToast(message, type = 'info', duration = 4000) {
      const id = Date.now()
      const toast = { 
          id, 
          message, 
          type, 
          duration, 
          progress: 100,
          startTime: Date.now()
      }
      
      this.toasts.push(toast)

      // Animation for progress bar
      const interval = 10
      const step = (interval / duration) * 100
      
      const timer = setInterval(() => {
          const index = this.toasts.findIndex(t => t.id === id)
          if (index === -1) {
              clearInterval(timer)
              return
          }
          
          this.toasts[index].progress -= step
          
          if (this.toasts[index].progress <= 0) {
              this.removeToast(id)
              clearInterval(timer)
          }
      }, interval)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    getTypeStyles(type) {
        switch(type) {
            case 'success': return 'border-l-4 border-l-green-500'
            case 'error': return 'border-l-4 border-l-red-500'
            case 'warning': return 'border-l-4 border-l-orange-500'
            case 'info': return 'border-l-4 border-l-blue-500'
            default: return 'border-l-4 border-l-blue-500'
        }
    },
    getIconBg(type) {
        switch(type) {
            case 'success': return 'bg-green-600'
            case 'error': return 'bg-red-600'
            case 'warning': return 'bg-orange-600'
            case 'info': return 'bg-blue-600'
            default: return 'bg-blue-600'
        }
    },
    getIcon(type) {
        switch(type) {
            case 'success': return CheckCircleIcon
            case 'error': return ExclamationCircleIcon
            case 'warning': return ExclamationTriangleIcon
            case 'info': return InformationCircleIcon
            default: return InformationCircleIcon
        }
    },
    getTitle(type) {
        switch(type) {
            case 'success': return 'Éxito'
            case 'error': return 'Error'
            case 'warning': return 'Advertencia'
            case 'info': return 'Información'
            default: return 'Mensaje'
        }
    }
  },
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.toast-move {
  transition: transform 0.4s ease;
}
</style>
