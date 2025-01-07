<template>
  <div class="flex flex-col">

    <Overlay>
      <component :is="appStore.modalComponent" v-bind="appStore.modalProps"></component>
    </Overlay>

    <ThemeController />

    <p v-for="(each, index) in appStore.placedEntities" :key="index">{{index}}-{{ each }}</p>

    <!-- Container for draggable entities -->
    <Navbar />
    <!-- Board -->
    <GameBoard />

    <section class="flex justify-center items-center gap-2 p-4">
      <button v-if="!appStore.playMode && !appStore.showClearButton" @click="appStore.startPlayMode()" class="btn">
        {{ !appStore.playMode ? "Play" : "Stop" }}
      </button>

      <button v-if="appStore.showClearButton" class="btn" @click="appStore.restartSimulation()">Restart</button>

      <button v-if="appStore.showClearButton" class="btn" @click="appStore.clearEntities()">Clear</button>

    </section>
  </div>
</template>

<script setup>
import ThemeController from './components/ThemeController.vue';
import Navbar from './components/Navbar.vue';
import GameBoard from './components/GameBoard.vue';
import Overlay from './components/Overlay.vue';
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();
</script>
