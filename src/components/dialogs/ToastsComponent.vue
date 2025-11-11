<template>
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
</template>
<script>
    export default {
  name: 'ToastsComponent',
    props: {
        toasts: {
        type: Array,
        required: true,
        },
    },
    methods: {
        addToast (message, type = 'info', duration = 3000){
            const id = Date.now()
            toasts.value.push({ id, message, type })

            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }
}
</script>
