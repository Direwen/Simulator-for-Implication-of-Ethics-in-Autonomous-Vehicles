<template>
  <div class="flex flex-col">

    <Overlay>
      <component :is="appStore.modalComponent" v-bind="appStore.modalProps"></component>
    </Overlay>

    <ThemeController />

    <p>{{ appStore.placedEntities }}</p>

    <!-- Container for draggable entities -->
    <Navbar />
    <!-- Board -->
    <GameBoard />

    <section class="flex justify-center items-center gap-2">

      <button @click="play" class="btn my-6">PLAY</button>

    </section>
  </div>
</template>

<script setup>
import ThemeController from './components/ThemeController.vue';
import Navbar from './components/Navbar.vue';
import GameBoard from './components/GameBoard.vue';
import Overlay from './components/Overlay.vue';
import { useAppStore } from './stores/appStore';
import { useToast } from "vue-toastification";

const appStore = useAppStore();
const toast = useToast();

const play = () => {
  appStore.moveEntities()
}
</script>
