<template>
    <div v-html="proofDict"/>
</template>

<script setup>
import proofDictData from '@/dict/proof_dict.txt?raw'

let proofDict = proofDictData.replaceAll('\n', '<br/>')
</script>

<style scoped>

</style>