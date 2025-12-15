<template>
  <div>
    <h2>Host Stream</h2>
    <video ref="videoEl" autoplay playsinline></video>
    <button @click="startStream">Iniciar Stream</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { io } from "socket.io-client";

const videoEl = ref(null);
let socket;
let pc;
let localStream;

const startStream = async () => {
  socket = io("http://localhost:3001");
  const roomId = "123"; // ID fijo de la sala

  // Captura cámara
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  videoEl.value.srcObject = localStream;

  socket.emit("start-stream", { roomId });

  // Cuando entra un viewer
  socket.on("viewer-joined", async ({ viewerId }) => {
    pc = new RTCPeerConnection();

    // Añadir tracks al peer connection
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("signal", { targetId: viewerId, data: { candidate: event.candidate } });
      }
    };

    // Crear offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("signal", { targetId: viewerId, data: offer });
  });

  // Recibir señales del viewer
  socket.on("signal", async ({ from, data }) => {
    if (data.type === "answer") {
      await pc.setRemoteDescription(data);
    } else if (data.candidate) {
      await pc.addIceCandidate(data.candidate);
    }
  });

  
/*
const startStream = async () => {
  //scket = io("http://localhost:3001");
  //  const roomId = "123"; // ID fijo de la sala

  // Captura cámara
  //  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //captura de video pantalla
  localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })

  videoRef.value.srcObject = localStream

  socket.emit('start-stream', { roomId })

  // Cuando entra un viewer
  socket.on('viewer-joined', async ({ viewerId }) => {
    pc = new RTCPeerConnection()

    // Añadir tracks al peer connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { targetId: viewerId, data: { candidate: event.candidate } })
      }
    }

    // Crear offer
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socket.emit('signal', { targetId: viewerId, data: offer })
  })


  // Recibir señales del viewer
  socket.on('signal', async ({ from, data }) => {
    if (data.type === 'answer') {
      await pc.setRemoteDescription(data)
    } else if (data.candidate) {
      await pc.addIceCandidate(data.candidate)
    }
  })
}*/

};
</script>
