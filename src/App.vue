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
      <GameBoard />

      <div class="flex-1 px-1 py-4 xl:px-4 xl:py-6 max-h-[400px] bg-base-200 mx-4 roudned overflow-y-scroll shadow">
        <h1 class="text-2xl lg:text-3xl font-bold underline underline-offset-4 mb-4">Action Logs</h1>

        <section class="text-lg lg:text-xl">
          <section v-for="log in appStore.actionLogs.slice().reverse()" :key="log.id" class="transition-all duration-200 ease-in-out cursor-pointer hover:bg-gradient-to-b hover:from-indigo-900 hover:to-purple-600 hover:text-white px-2 py-1">
            <p>{{ log }}</p>
          </section>

          <p class="text-center" v-show="appStore.actionLogs.length == 0">No Logs Found</p>
        </section>
      </div>
    </div>

    <section class="flex justify-center items-center gap-2 p-4 w-fit mx-auto">
      <button v-if="!appStore.playMode && !appStore.showClearButton" @click="appStore.startPlayMode()" class="btn btn-wide btn-outline rounded-lg">
        {{ !appStore.playMode ? "Play" : "Stop" }}
      </button>

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
import { useAppStore } from './stores/appStore';

const appStore = useAppStore();
</script>
