<template>
    <router-view/>
</template>

<script setup>
import { inject } from 'vue'

const $globalState = inject('$globalState')

document.onkeydown = (event) => {
    let key = window.event.keyCode;
    if (event.ctrlKey && key === 75) {
        $globalState.vip = !$globalState.vip
    }
}
</script>

<style>
body {
    margin: 0;
}
#app {
    color: var(--el-text-color-primary);
}
</style>