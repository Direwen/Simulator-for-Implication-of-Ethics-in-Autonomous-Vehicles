<template>
    <ModalTemplate>
        <template #header>
            <section class="text-3xl md:text-4xl lg:text-6xl animate-bounce text-center">
                {{ entityDetails?.content }}
            </section>
            <div class="divider"></div>
        </template>

        <template #content>
            <section class="flex flex-col gap-2">
                <div class="flex justify-between items-center font-semibold uppercase">
                    <span>Name</span>
                    <span>{{ entityDetails?.name }}</span>
                </div>

                <!-- Conditionally show Societal Value -->
                <div 
                  v-if="entityDetails?.societalValue !== Infinity" 
                  class="flex justify-between items-center font-semibold uppercase"
                >
                    <span>Societal Value</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        :value="entityDetails?.societalValue"
                        @input="updateSocietalValue($event.target.value)"
                    >
                </div>

                

                <!-- Conditionally show Speed -->
                <div 
                  v-if="entityDetails?.canMove" 
                  class="flex justify-between items-center font-semibold uppercase"
                >
                    <span>Speed</span>
                    <input
                        type="number"
                        min="50"
                        max="500"
                        :value="entityDetails?.speed"
                        @input="updateSpeed($event.target.value)"
                        class="max-w-1/4 bg-transparent border px-2 py-1 rounded"
                    >
                </div>

                <div v-else>
                    <p class="text-red-700 text-sm lg:text-base text-left tracking-tighter">Notice: This Entity is considered an object which is the least important among entities.</p>
                </div>
            </section>
            <div class="divider"></div>
        </template>

        <template #footer>
            <button 
              v-if="cellIndex" 
              class="btn btn-error"
              @click="appStore.removeEntity(cellIndex); appStore.closeModal();"
            >
                Remove
            </button>
        </template>
    </ModalTemplate>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAppStore } from '../stores/appStore';
import ModalTemplate from './ModalTemplate.vue';

const appStore = useAppStore();
const props = defineProps(['cellIndex', 'id']);
const entityDetails = ref(null);

onMounted(() => {
    if (props.id) {
        entityDetails.value = appStore.entities[props.id];
        return;
    }
    const placedEntity = appStore.placedEntities.filter(
        (en) => en.position == props.cellIndex
    );
    entityDetails.value = appStore.entities[placedEntity[0].id];
});

const updateSocietalValue = (value) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    entityDetails.value.societalValue = clampedValue;

    // Update the entity in the appStore
    if (props.id) {
        appStore.entities[props.id].societalValue = clampedValue;
    } else if (props.cellIndex) {
        const placedEntity = appStore.placedEntities.find(
            (en) => en.position == props.cellIndex
        );
        if (placedEntity) {
            appStore.entities[placedEntity.id].societalValue = clampedValue;
        }
    }
};

const updateSpeed = (value) => {
    const clampedValue = Math.max(50, Math.min(500, value));
    entityDetails.value.speed = clampedValue;

    // Update the entity in the appStore
    if (props.id) {
        appStore.entities[props.id].speed = clampedValue;
    } else if (props.cellIndex) {
        const placedEntity = appStore.placedEntities.find(
            (en) => en.position == props.cellIndex
        );
        if (placedEntity) {
            appStore.entities[placedEntity.id].speed = clampedValue;
        }
    }
};

</script>
