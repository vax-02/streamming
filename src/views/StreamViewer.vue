<template>
  <div>
    <h2>Viewer</h2>
    <video ref="videoEl" autoplay playsinline></video>
    <button @click="joinRoom">Unirse a Sala</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import socket from '@/services/socket.js'

const videoEl = ref(null)
let socket
let pc

const joinRoom = async () => {
  const roomId = '123'

  socket.emit('join-room', { roomId })

  socket.on('room-not-found', () => alert('Sala no existe'))

  //pc = new RTCPeerConnection()
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // STUN público de Google
    ],
  })

  pc.ontrack = (event) => {
    videoEl.value.srcObject = event.streams[0]
  }

  socket.on('signal', async ({ from, data }) => {
    if (data.type === 'offer') {
      await pc.setRemoteDescription(data)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('signal', { targetId: from, data: answer })
    } else if (data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      } catch (err) {
        console.error(err)
      }
    }
  })

  pc.onicecandidate = (event) => {
    if (event.candidate) socket.emit('signal', { targetId: null, data: event.candidate })
  }
}
</script>
