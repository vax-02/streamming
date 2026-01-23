import { reactive } from 'vue'

export const callStore = reactive({
    isInCall: false,
    isMinimized: false,
    callData: {
        targetId: null,
        targetName: '',
        targetPhoto: null,
        callDuration: 0,
        isAudioEnabled: true,
        peerConnection: null,
        localStream: null,
        remoteStream: null
    },

    startCall(targetId, targetName, targetPhoto) {
        this.isInCall = true
        this.isMinimized = false
        this.callData.targetId = targetId
        this.callData.targetName = targetName
        this.callData.targetPhoto = targetPhoto
        this.callData.callDuration = 0
    },

    minimizeCall() {
        this.isMinimized = true
    },

    maximizeCall() {
        this.isMinimized = false
    },

    endCall() {
        this.isInCall = false
        this.isMinimized = false
        this.callData = {
            targetId: null,
            targetName: '',
            targetPhoto: null,
            callDuration: 0,
            isAudioEnabled: true,
            peerConnection: null,
            localStream: null,
            remoteStream: null
        }
    },

    updateCallDuration(duration) {
        this.callData.callDuration = duration
    },

    toggleAudio() {
        this.callData.isAudioEnabled = !this.callData.isAudioEnabled
    },

    setPeerConnection(pc) {
        this.callData.peerConnection = pc
    },

    setStreams(local, remote) {
        this.callData.localStream = local
        this.callData.remoteStream = remote
    }
})
