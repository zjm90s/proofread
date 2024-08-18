<template>
    <el-row class="text-label">
        <el-col :span="12">
            <el-text tag="b">内置词典：</el-text>
        </el-col>
        <el-col :span="12">
            <el-text tag="b">自定义词典：</el-text>
        </el-col>
    </el-row>
    <el-row class="text-dict">
        <el-col :span="12">
            <el-scrollbar max-height="600px">
                <div v-html="proofDict"/>
            </el-scrollbar>
        </el-col>
        <el-col :span="12">
            <el-scrollbar max-height="600px">
                <div v-html="userProofDict"/>
            </el-scrollbar>
        </el-col>
    </el-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EventBus from '@/EventBus.js'
import proofDictData from '@/dict/proof_dict.txt?raw'

let proofDict = ref('')
let userProofDict = ref('')

const parseDictData = (dictData) => {
    let result = ''
    for (let line of dictData.split('\n')) {
        if (line.trim().startsWith('#')) {
            line = `<b>${line}</b>`
        }
        result += line + '<br/>'
    }
    return result
}

const updateProofDict = (dictData) => {
    userProofDict.value = parseDictData(dictData)
}

// 初始化
proofDict.value = parseDictData(proofDictData)
onMounted(() => {
    EventBus.on('updateProofDict', updateProofDict)
})
</script>

<style scoped>
.text-label {
    margin-bottom: 10px;
}
.text-dict {

}
.text-dict > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
</style>