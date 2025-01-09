<template>
<div id="container" 
  class="my-4 w-10/12 md:w-8/12 mx-auto rounded bg-gradient-to-b from-indigo-900 to-purple-600 px-4 pb-6 pt-10 
         overflow-x-scroll overflow-y-hidden whitespace-nowrap flex flex-nowrap justify-start items-center gap-2 
         custom-scrollbar">
>
  <div 
    v-for="each in appStore.entities" 
    :key="each.id" 
    class="tooltip tooltip-top" 
    :data-tip="each.name.toUpperCase()"
  >
    <span   
      class="entity text-4xl lg:text-6xl cursor-grab transition-all ease-in-out duration-300 hover:-translate-y-2 hover:scale-125" 
      :id="each.id"
      draggable="true"
      @click="appStore.openModal(EntityModal, {id: each.id})" 
      @dragstart="onDragStart"
    >
      {{ each.content }}
    </span>
  </div>
</div>

</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import EntityModal from './EntityModal.vue';

const appStore = useAppStore();

// Handle the dragging event to set the entity ID when dragging starts
const onDragStart = (event) => {
    const entity = event.target;
    event.dataTransfer.setData('text', entity.id);
};
</script>
