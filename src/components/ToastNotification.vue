<template>
  <div class="fixed top-5 right-5 flex flex-col space-y-2 z-50 py-2 pt-0">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-2 rounded-lg shadow-lg text-white flex items-center justify-between min-w-[200px]',
          toast.type === 'success' ? 'bg-green-300/30' : '',
          toast.type === 'error' ? 'bg-red-300/30' : '',
          toast.type === 'info' ? 'bg-blue-300/30' : '',
          toast.type === 'warning' ? 'bg-orange-500' : '',
        ]"
      >
        <span>{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="ml-2 hover:text-gray-200">x</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  data() {
    return {
      toasts: [],
    }
  },
  methods: {
    addToast(message, type = 'info', duration = 3000) {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
