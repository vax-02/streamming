<template>
  <div class="video-wrapper">
    <div ref="jitsiContainer" id="jitsi-meet-viewport"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';

const props = defineProps({
  roomName: String,
  userData: Object // Recibe { name, isAdmin, photo }
});

const jitsiContainer = ref(null);
let api = null;

onMounted(() => {
  console.log(props.userData);
  const domain = "meet.jit.si";
  const options = {
    roomName: props.roomName,
    parentNode: jitsiContainer.value,
    width: '100%',
    height: 600,
    userInfo: {
      displayName: props.userData.name,
      avatarUrl: props.userData.photo
    },
    configOverwrite: {
      startWithAudioMuted: true,
      prejoinPageEnabled: true, // Salta la pantalla de pre-entrada
      // Si no es admin, no puede silenciar a los demás
      disableRemoteMute: !props.userData.isAdmin,
    },
    interfaceConfigOverwrite: {
      // Personalización de botones según el Rol
      TOOLBAR_BUTTONS: props.userData.isAdmin 
        ? ['microphone', 'camera', 'desktop', 'chat', 'mute-everyone', 'security', 'invite', 'fullscreen'] 
        : ['microphone', 'camera', 'chat', 'raisehand', 'fullscreen']
    }
  };

  // Inicializar la API
  api = new window.JitsiMeetExternalAPI(domain, options);

  // Opcional: Escuchar cuando la reunión termina
  api.addEventListener('videoConferenceLeft', () => {
    alert("Has salido de la reunión");
  });
});

onBeforeUnmount(() => {
  if (api) api.dispose(); // Limpia el iframe al destruir el componente
});
</script>

<style scoped>
#jitsi-meet-viewport {
  width: 100%;
  height: 600px;
  background: #000;
}
</style>