<template>

    <div class="border bg-gray-300 grid grid-rows-10 grid-cols-5">
        <div 
            v-for="(each, index) in 50" 
            :key="index" 
            :data-index="index"
            class=" text-center relative flex"
            :class="{ 'bg-green-600 dropzone': isEntityAllowed(index), 'p-4' : appStore.placedEntities.length == 0 }" 
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave" 
            @drop="(event) => onDrop(event, index)"
            @click="appStore.removeEntity(index)"
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

const appStore = useAppStore();
const totalColumns = 5;
const totalRows = 10;

function isEntityAllowed(index) {

    // Calculate the row and column based on index
    const row = Math.floor(index / totalColumns);
    const col = index % totalColumns;

    // Return true if the cell is in the first row, last row, first column, or last column
    // and not the first or last cell of the first and last rows
    return (
        (row === 0 || row === totalRows - 1 || col === 0 || col === totalColumns - 1) &&
        !(
            (row === 0 && (col === 0 || col === totalColumns - 1)) || // First row, first or last cell
            (row === totalRows - 1 && (col === 0 || col === totalColumns - 1)) // Last row, first or last cell
        )
    );
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
    if (cell.classList.contains('dropzone') && !appStore.placedEntities.find(e => e.position === cellIndex)) {
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