<template>
  <div class="flex flex-col">
    
    <ThemeController />
    <!-- Container for draggable entities -->
    <Navbar />
    <!-- Board -->
    <GameBoard />

    <button @click="appStore.moveEntities()" class="btn my-6">Play</button>
  </div>
</template>

<script setup>
import ThemeController from './components/ThemeController.vue';
import Navbar from './components/Navbar.vue';
import GameBoard from './components/GameBoard.vue';
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();

</script>
