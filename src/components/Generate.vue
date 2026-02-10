<template>
  <div class="setup-container">
    <h2>Configuración de la Clase</h2>
    
    <div class="form-group">
      <label>Nombre del usuario:</label>
      <input v-model="form.name" type="text" placeholder="Ej: Juan Pérez">
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" v-model="form.isAdmin"> 
        Ingresar como Profesor (Moderador)
      </label>
    </div>

    <button v-if="!joined" @click="joined = true">Entrar a la reunión</button>

    <hr v-if="joined">

    <JitsiMeet 
      v-if="joined"
      :roomName="'EduStream_Clase_101'" 
      :userData="form" 
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import JitsiMeet from './JitsiRoom.vue'

const joined = ref(false)

const form = reactive({
  name: 'Juan Pérez',
  isAdmin: true,
  photo: 'https://i.pravatar.cc/150?u=juan' // Foto aleatoria de prueba
})
</script>

<style scoped>
.setup-container { padding: 20px; font-family: sans-serif; }
.form-group { margin-bottom: 15px; }
button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
</style>