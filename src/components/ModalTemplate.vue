<template>

    <div class="flex flex-col gap-2">
        <slot name="header"></slot>
        <slot name="content"></slot>

        <div class="flex justify-end gap-1">

            <button class="btn" @click="useAppStore().closeModal">Close</button>
            <slot name="footer"></slot>
        </div>
    </div>

</template>

<script setup>
import { useAppStore } from '../stores/appStore';
</script>