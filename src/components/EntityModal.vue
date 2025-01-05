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
                <div class="flex justify-between items-center font-semibold uppercase">
                    <span>Societal Value</span>
                    <input type="number" :value="entityDetails?.societalValue" @input="updateSocietalValue($event.target.value)">
                </div>
                <div class="flex justify-between items-center font-semibold uppercase">
                    <span>Speed</span>
                    <input type="number" :value="entityDetails?.speed" @input="updateSpeed($event.target.value)" class="max-w-1/4 bg-transparent border px-2 py-1 rounded">
                </div>
            </section>
            <div class="divider"></div>
        </template>

        <template #footer>
            <button class="btn btn-error"
                @click="appStore.removeEntity(cellIndex); appStore.closeModal();">Remove</button>
        </template>

    </ModalTemplate>

</template>


<script setup>
import { onMounted, ref } from 'vue';
import { useAppStore } from '../stores/appStore';
import ModalTemplate from './ModalTemplate.vue';

const appStore = useAppStore();
const props = defineProps(['cellIndex']);
const entityDetails = ref(null);

onMounted(() => {
    const placedEntity = appStore.placedEntities.filter(en => en.position == props.cellIndex);
    entityDetails.value = appStore.entities[placedEntity[0].entityId];
});

const updateSocietalValue = (value) => {
    entityDetails.value.societalValue = value;
    const placedEntity = appStore.placedEntities.find(en => en.position == props.cellIndex);
    appStore.entities[placedEntity.entityId].societalValue = value;
};

const updateSpeed = (value) => {
    entityDetails.value.speed = value;
    const placedEntity = appStore.placedEntities.find(en => en.position == props.cellIndex);
    appStore.entities[placedEntity.entityId].speed = value;
};
</script>