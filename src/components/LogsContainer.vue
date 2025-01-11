<template>

<div class="px-1 py-4 xl:px-4 xl:py-6 max-h-[400px] mx-4 roudned overflow-y-scroll shadow">
        <h1 class="text-2xl lg:text-3xl font-semibold underline underline-offset-4 mb-4 tracking-tighter">Action Logs</h1>

        <section class="text-xs md:text-sm lg:text-base">
          <section v-for="log in appStore.actionLogs.slice().reverse()" :key="log.id" class="transition-all duration-200 ease-in-out cursor-pointer hover:bg-gradient-to-b hover:from-indigo-900 hover:to-purple-600 hover:text-white px-3 py-2 rounded border-b border-gray-300">
            <p>{{ log }}</p>
          </section>

          <p class="text-center font-semibold uppercase tracking-tighter" v-show="appStore.actionLogs.length == 0">No Logs Found</p>
        </section>
      </div>

</template>

<script setup>
import { useAppStore } from '../stores/appStore';

const appStore = useAppStore();
</script>