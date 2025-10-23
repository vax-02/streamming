<template>
  <div
    class="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
  >
    <!-- Logo con animación -->
    <div class="relative">
      <!-- Círculo animado de fondo -->
      <div class="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-40 animate-ping"></div>

      <!-- Imagen del logo -->

      <img :src="Logo" alt="Logo" class="relative w-20 h-20 object-contain animate-bounce" />
    </div>
    
    <!-- Texto -->
    <h1 class="mt-6 text-3xl font-semibold tracking-wide animate-fade-in">
      Bienvenido a <span class="text-blue-400">EduStream</span>
    </h1>

    <!-- Subtexto -->
    <p class="mt-3 text-gray-400 animate-fade-in delay-200">Plataforma de educación...</p>
  </div>
</template>
<script setup>
import Logo from '@/assets/logo.png'
</script>
