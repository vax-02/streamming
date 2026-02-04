<template>
  <div class="fixed top-3 right-3 flex flex-col space-y-1 z-50 items-end">
    <transition-group name="toast" tag="div" class="flex flex-col space-y-1 items-end">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-2 py-1 rounded-md shadow-sm border backdrop-blur-sm text-white flex items-center gap-2 max-w-[200px]',
          toast.type === 'success' ? 'bg-green-500/20 border-green-500/30' : '',
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/30' : '',
          toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/30' : '',
          toast.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/30' : '',
        ]"
      >
        <span class="text-[10px] font-medium leading-none truncate">{{ toast.message }}</span>
        <button 
          @click="removeToast(toast.id)" 
          class="text-white/40 hover:text-white transition-colors"
        >
          <XMarkIcon class="w-3 h-3" />
        </button>
      </div>
    </transition-group>
  </div>
</template>
<script>
import { XMarkIcon } from '@heroicons/vue/24/solid'

export default {
  name: 'ToastsComponent',
  components: {
    XMarkIcon
  },
  props: {
    toasts: {
      type: Array,
      required: true,
    },
  },
  methods: {
    removeToast(id) {
        this.$emit('remove', id)
    }
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
