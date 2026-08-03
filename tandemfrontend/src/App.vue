<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
// ✅ Ajusta esta ruta según dónde tengas realmente el archivo del navbar
// (ej. '@/components/Navbar.vue' o '@/components/layout/Navbar.vue')
import Navbar from '@/layout/Navbar.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0f1724;
  color: #ffffff;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>