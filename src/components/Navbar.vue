<template>

    <div class="navbar shadow bg-base-100">
        <div class="flex-1">
            <section class="w-9/12 lg:w-1/2">
                <img src="../assets/logo.png" alt="logo" class="w-full lg:w-1/2">
            </section>
        </div>
        <div class="flex-none flex gap-4">
            <div class="tooltip tooltip-bottom font-bold" data-tip="Entities Count">
                <span class="cursor-pointer font-extrabold text-2xl tracking-tighter">{{ appStore.placedEntities.length }} / {{
                    appStore.maxEntities }}
                </span>
            </div>
            <ThemeController />
        </div>
    </div>

</template>

<script setup>
import ThemeController from './ThemeController.vue';
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
</script>