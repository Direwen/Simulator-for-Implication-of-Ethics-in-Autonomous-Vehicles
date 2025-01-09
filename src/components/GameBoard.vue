<template>

    <div class="shadow-2xl rounded border grid grid-cols-3 w-9/12 md:w-1/2 lg:w-2/5 xl:w-5/12 mx-auto">
        <div v-for="index in appStore.totalRows * appStore.totalColumns"
            :title="appStore.isStartingLine(index) ? `Starting Position (${index})` : `Position (${index})`"
            :key="index" :data-index="index"
            class="min-h-8 xl:min-h-12 hover:bg-neutral-content cursor-pointer text-center relative flex justify-center items-center"
            :class="{
                'bg-gradient-to-b from-indigo-900 to-purple-600': appStore.isStartingLine(index),
                'dropzone': !appStore.isFinishLine(index),
                'bg-cover bg-center bg-[url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLo-4Uv7Vs7hs7mND0siLLBydBKq5wQy8xTA&s)]': appStore.isFinishLine(index)
            }" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop="(event) => onDrop(event, index)"
            @click="clickCell(index)">
            <span v-for="entity in appStore.placedEntities.filter(e => e.position === index)"
                :key="entity.id + '-' + entity.position" class="text-2xl xl:text-5xl">
                {{ appStore.entities[entity.id]?.content }}
            </span>
        </div>
    </div>



</template>

<script setup>
import { useAppStore } from '../stores/appStore';
import { useToast } from 'vue-toastification';
import EntityModal from './EntityModal.vue';

const toast = useToast();
const appStore = useAppStore();

function clickCell(index) {
    if (appStore.playMode) {
        toast.error("Not allowed to modify Entity Properties during the play mode");
        return;
    }

    if (appStore.placedEntities.filter(e => e.position === index).length != 0) {
        appStore.openModal(EntityModal, { 'cellIndex': index })
    } else {
        toast.error('No Entity Found')
    }

}

// Handle the dragover event to allow dropping
const onDragOver = (event) => {
    event.preventDefault(); // Prevent the default behavior to allow dropping
    const cell = event.target;

    if (cell.classList.contains('dropzone')) {
        cell.classList.add('bg-yellow-500');
    }

};

// Handle the dragleave event to reset the visual feedback
const onDragLeave = (event) => {
    event.preventDefault(); // Prevent the default behavior to allow dropping

    const cell = event.target;
    if (cell.classList.contains('dropzone')) {
        cell.classList.remove('bg-yellow-500');
    }
};

const onDrop = (event, cellIndex) => {
    event.preventDefault();
    const cell = event.target;

    if (appStore.playMode) {
        toast.error('Please Reset');
        cell.classList.remove('bg-yellow-500');
        return;
    }

    if (!cell.classList.contains('dropzone')) {
        toast.error('Invalid Drop Zone');
        cell.classList.remove('bg-yellow-500');
        return;
    }

    if (appStore.isMaxed()) {
        toast.error('Maxium Entities');
        cell.classList.remove('bg-yellow-500');
        return;
    }

    if (appStore.placedEntities.find(e => e.position === cellIndex)) {
        toast.error('Remove the existing entity first');
        cell.classList.remove('bg-yellow-500');
        return;
    }

    const entityId = event.dataTransfer.getData('text');
    const entity = appStore.entities[entityId];

    if (!appStore.allowedToBePlaced(entity.id, cellIndex)) {
        toast.error("Only one AV is allowed");
        cell.classList.remove('bg-yellow-500');
        return;
    }

    if (entity) {

        appStore.placeEntity(entityId, cellIndex);
        cell.classList.remove('bg-yellow-500');
    } else {
        console.log("not entity");
    }
}

</script>

<style scoped>
.entity:active {
    cursor: grabbing;
}
</style>