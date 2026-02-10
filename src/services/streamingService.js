/**
 * Servicio centralizado para manejar lógica de streaming WebRTC
 * Proporciona funciones auxiliares para configuración de media, screen sharing, y manejo de streams
 */

const STUN_SERVERS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
]

const RTCConfig = {
  iceServers: STUN_SERVERS.map(url => ({ urls: url }))
}

/**
 * Inicializar RTCPeerConnection con configuración estándar
 */
export function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: RTCConfig.iceServers
  })
}

/**
 * Obtener flujo de usuario (audio y/o video)
 */
export async function getUserMedia(constraints = {}) {
  const defaultConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
  }

  const merged = {
    audio: constraints.audio !== undefined ? constraints.audio : defaultConstraints.audio,
    video: constraints.video !== undefined ? constraints.video : defaultConstraints.video,
  }

  try {
    return await navigator.mediaDevices.getUserMedia(merged)
  } catch (error) {
    console.error('Error al obtener medios del usuario:', error)
    throw error
  }
}

/**
 * Obtener pantalla compartida
 */
export async function getDisplayMedia(constraints = {}) {
  const defaultConstraints = {
    video: {
      cursor: 'always',
    },
    audio: false,
  }

  const merged = {
    ...defaultConstraints,
    ...constraints
  }

  try {
    return await navigator.mediaDevices.getDisplayMedia(merged)
  } catch (error) {
    console.error('Error al obtener pantalla compartida:', error)
    throw error
  }
}

/**
 * Agregar tracks de un stream a una conexión RTC
 */
export function addStreamToPeerConnection(pc, stream) {
  if (!pc || !stream) return

  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream)
  })
}

/**
 * Reemplazar track de audio o video en una conexión RTC
 */
export async function replaceTrackInPeerConnection(pc, kind, newTrack) {
  if (!pc) return

  const sender = pc.getSenders().find(s => s.track && s.track.kind === kind)
  
  if (sender) {
    await sender.replaceTrack(newTrack)
  } else if (newTrack) {
    const stream = new MediaStream([newTrack])
    pc.addTrack(newTrack, stream)
  }
}

/**
 * Reemplazar múltiples tracks en todos los peers (para broadcast)
 */
export async function replaceTracksInAllPeers(peersMap, newStream) {
  if (!newStream) return

  const videoTrack = newStream.getVideoTracks()[0]
  const audioTrack = newStream.getAudioTracks()[0]

  for (const pc of Object.values(peersMap)) {
    if (!pc) continue

    if (videoTrack) {
      await replaceTrackInPeerConnection(pc, 'video', videoTrack)
    }
    if (audioTrack) {
      await replaceTrackInPeerConnection(pc, 'audio', audioTrack)
    }
  }
}

/**
 * Detener todos los tracks de un stream
 */
export function stopStream(stream) {
  if (!stream) return

  stream.getTracks().forEach(track => {
    track.stop()
  })
}

/**
 * Crear Offer SDP para un viewer
 */
export async function createOffer(pc) {
  try {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    return offer
  } catch (error) {
    console.error('Error al crear offer:', error)
    throw error
  }
}

/**
 * Crear Answer SDP respondiendo a un Offer
 */
export async function createAnswer(pc) {
  try {
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    return answer
  } catch (error) {
    console.error('Error al crear answer:', error)
    throw error
  }
}

/**
 * Establecer descripción remota
 */
export async function setRemoteDescription(pc, description) {
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(description))
  } catch (error) {
    console.error('Error al establecer descripción remota:', error)
    throw error
  }
}

/**
 * Agregar candidato ICE
 */
export async function addIceCandidate(pc, candidate) {
  try {
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
    return true
  } catch (error) {
    console.warn('Error al agregar candidato ICE:', error)
    return false
  }
}

/**
 * Establecer análisis de audio para visualización de nivel
 */
export function setupAudioAnalyzer(track) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioContext.createMediaStreamSource(new MediaStream([track]))
    const analyzer = audioContext.createAnalyser()
    analyzer.fftSize = 256
    source.connect(analyzer)
    return { audioContext, analyzer }
  } catch (error) {
    console.error('Error al configurar analizador de audio:', error)
    return null
  }
}

/**
 * Obtener nivel de audio actual
 */
export function getAudioLevel(analyzer) {
  if (!analyzer) return 0

  const bufferLength = analyzer.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyzer.getByteFrequencyData(dataArray)

  let sum = 0
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i]
  }
  const average = sum / bufferLength
  return Math.min(100, (average / 128) * 100 * 1.5)
}

/**
 * Validar soporte de WebRTC
 */
export function isWebRTCSupported() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  )
}

/**
 * Validar soporte de screen sharing
 */
export function isScreenSharingSupported() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia
  )
}

export default {
  createPeerConnection,
  getUserMedia,
  getDisplayMedia,
  addStreamToPeerConnection,
  replaceTrackInPeerConnection,
  replaceTracksInAllPeers,
  stopStream,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate,
  setupAudioAnalyzer,
  getAudioLevel,
  isWebRTCSupported,
  isScreenSharingSupported,
  RTCConfig,
}
