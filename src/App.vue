<template>
  <div class="flex flex-col">

    <Overlay>
      <component :is="appStore.modalComponent" v-bind="appStore.modalProps"></component>
    </Overlay>

    <Navbar />
    <EntitiesDisplayContainer />
    <!-- Container for draggable entities -->
    <!-- Board -->
    <div class="flex flex-col xl:flex-row xl:justify-center xl:items-center mx-4">
      <GameBoard class="w-9/12 md:w-1/2 lg:w-2/5 xl:w-5/12 " />

      <LogsContainer class="flex-1" />
    </div>

    <section class="flex justify-center items-center gap-2 p-4 w-fit mx-auto">
      <button v-if="!appStore.playMode && !appStore.showClearButton" @click="appStore.startPlayMode()" class="btn btn-wide btn-outline rounded-lg">
        Play
      </button>

      <button class="btn btn-outline" v-if="appStore.playMode && !appStore.showClearButton" @click="appStore.stopPlayMode()">Stop</button>

      <button v-if="appStore.showClearButton" class="btn btn-outline rounded-lg md:btn-wide" @click="appStore.restartSimulation()">Restart</button>

      <button v-if="appStore.showClearButton" class="btn btn-outline rounded-lg md:btn-wide" @click="appStore.clearEntities()">Clear</button>

    </section>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import EntitiesDisplayContainer from './components/EntitiesDisplayContainer.vue';
import GameBoard from './components/GameBoard.vue';
import Overlay from './components/Overlay.vue';
import LogsContainer from './components/LogsContainer.vue';
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();
</script>
