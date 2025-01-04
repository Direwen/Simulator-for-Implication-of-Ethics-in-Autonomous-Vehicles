<template>
  <div class="flex flex-col">
    <label class="grid cursor-pointer place-items-center">
      <input
        type="checkbox"
        value="acid"
        class="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1" />
      <svg
        class="stroke-base-100 fill-base-100 col-start-1 row-start-1"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path
          d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <svg
        class="stroke-base-100 fill-base-100 col-start-2 row-start-1"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
    <!-- Container for draggable entities -->
    <div id="container" class="w-full p-2 overflow-x-scroll overflow-y-hidden flex flex-nowrap gap-2">

      <span v-for="each in entities" :key="each.id" class="entity text-6xl cursor-grab" :id="each.id" draggable="true" @dragstart="onDragStart">{{ each.content }}</span>
      
    </div>


    <!-- Board -->
    <div class="grid grid-rows-10 grid-cols-5">
      <div v-for="(each, index) in 50" :key="index" class="border p-4 text-center"
        :class="{ 'bg-green-600 dropzone': isEntityAllowed(index) }"
        @dragover.prevent="onDragOver" 
        @dragleave="onDragLeave"
        @drop="onDrop"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const totalColumns = 5;
const totalRows = 10;
const entities = [
  {
    id: "entity-pedestrain",
    name: "pedestrain",
    content: "🚶"
  },
  {
    id: "entity-cyclist",
    name: "cyclist",
    content: "🚴"
  },
]

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

// Handle the dragging event to set the entity ID when dragging starts
const onDragStart = (event) => {
  const entity = event.target;
  event.dataTransfer.setData('text', entity.id);
};

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

const onDrop = (event) => {
  event.preventDefault();

  const cell = event.target;
  if (cell.classList.contains('dropzone') && !cell.hasChildNodes()) {
    const entityId = event.dataTransfer.getData('text');
    const entity = entities.find(e => e.id === entityId);

    if (entity) {
      // Create a new span element to hold the entity emoji
      const entityElement = document.createElement('span');
      entityElement.textContent = entity.content;
      entityElement.classList.add('text-2xl'); // You can add any classes for styling

      // Append the entity element to the dropped cell
      cell.appendChild(entityElement);
      cell.classList.remove("p-4")
  
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
