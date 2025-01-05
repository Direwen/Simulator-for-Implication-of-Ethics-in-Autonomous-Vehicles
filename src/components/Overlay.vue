<template>

    <div @click="appStore.closeModal" v-if="appStore.overlay" class="fixed top-0 left-0 z-40 w-full h-screen p-2 md:py-6 lg:py-10 bg-base-100/80 overflow-hidden flex justify-center items-center">
        <div @click.stop class="w-1/2 bg-base-200 p-2 md:p-4 lg:py-6 lg:px-4">
            <slot></slot>
        </div>
    </div>

</template>

<script setup>
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
</script>