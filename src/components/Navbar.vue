<template>
  <div id="container" class="w-full p-2 overflow-x-scroll overflow-y-hidden flex flex-nowrap gap-2">

    <span 
      v-for="each in appStore.entities" 
      :key="each.id" 
      class="entity text-6xl cursor-grab" 
      :id="each.id"
      draggable="true" 
      @dragstart="onDragStart"
      >
      {{ each.content }}
    </span>

  </div>
</template>

<script setup>
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();

// Handle the dragging event to set the entity ID when dragging starts
const onDragStart = (event) => {
    const entity = event.target;
    event.dataTransfer.setData('text', entity.id);
};
</script>
