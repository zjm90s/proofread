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

.diff-item {
    white-space: pre-wrap;
    border-radius: .2em;
    background-color: #fff;
 }
.diff-item-add {
    white-space: pre-wrap;
    border-radius: .2em;
    background-color: #97f295;
}
.diff-item-remove {
    white-space: pre-wrap;
    border-radius: .2em;
    background-color: #ffb6ba;
}
.diff-item-error {
    white-space: pre-wrap;
    border-radius: .2em;
    background-color: #5df2ef;
}
.diff-item-similar {
    white-space: pre-wrap;
    border-radius: .2em;
    background-color: #f6fa7e;
}
</style>