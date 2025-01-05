<template>

    <div class="border bg-gray-300 grid grid-rows-10 grid-cols-5">
        <div 
            v-for="(each, index) in (appStore.totalColumns * appStore.totalRows)" 
            :key="index" 
            :data-index="index"
            class="border cursor-pointer text-center relative flex justify-center items-center"
            :class="{ 'bg-green-600 dropzone': isEntityAllowed(index), 'p-4' : appStore.placedEntities.length == 0 }" 
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave" 
            @drop="(event) => onDrop(event, index)"
            @click="clickCell(index)"
            >

            <span 
                v-for="entity in appStore.placedEntities.filter(e => e.position === index)"
                :key="entity.entityId + '-' + entity.position"
                class="text-2xl"
            >
                {{ appStore.entities[entity.entityId]?.content }}
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

function isEntityAllowed(index) {

    // Calculate the row and column based on index
    const row = Math.floor(index / appStore.totalColumns);
    const col = index % appStore.totalColumns;

    // Return true if the cell is in the first row, last row, first column, or last column
    // and not the first or last cell of the first and last rows
    return (
        (row === 0 || row === appStore.totalRows - 1 || col === 0 || col === appStore.totalColumns - 1) &&
        !(
            (row === 0 && (col === 0 || col === appStore.totalColumns - 1)) || // First row, first or last cell
            (row === appStore.totalRows - 1 && (col === 0 || col === appStore.totalColumns - 1)) // Last row, first or last cell
        )
    );
}

function clickCell(index) {
    if (appStore.playMode) return;

    if (appStore.placedEntities.filter(e => e.position === index).length != 0) {
        appStore.openModal(EntityModal, {'cellIndex': index})
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
    if (!appStore.playMode && cell.classList.contains('dropzone') && !appStore.placedEntities.find(e => e.position === cellIndex)) {
        const entityId = event.dataTransfer.getData('text');
        const entity = appStore.entities[entityId];

        if (entity) {
            
            appStore.placeEntity(entityId, cellIndex);
            cell.classList.remove('bg-yellow-500');
        } else {
            console.log("not entity");
        }
    } else {
        console.log("not dropzone");
    }
}

</script>

<style scoped>
.entity:active {
    cursor: grabbing;
}
</style>