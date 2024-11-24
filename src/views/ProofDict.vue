<template>
    <div class="proof-dict" v-show="$globalState.vip">
        <el-row class="dict-upload">
            <el-col :span="12">
                <el-upload ref="dictFile" :auto-upload="false" :limit="1" :on-change="loadDictData" :on-exceed="fileReplace">
                    <el-button type="primary">上传自定义词典</el-button>
                </el-upload>
            </el-col>
            <el-col :span="12">
                <el-text class="text-tip">词典格式：<br/>正确词 错误词1,错误词2</el-text>
            </el-col>
        </el-row>
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
    </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElMessage } from "element-plus";
import EventBus from '@/EventBus.js'
import { USER_PROOF_DICT_KEY } from '@/constants/constant.js'

import sxcDictData from '@/dict/现代汉语词典-首选词.txt?raw'
import cyzyDictData from '@/dict/常用中药名称.txt?raw'
import yhDictData from '@/dict/用户词典.txt?raw'

const $globalState = inject('$globalState')

// 对象属性
const dictFile = ref()
const proofDict = ref('')
const userProofDict = ref('')

const parseDictData = (...dictDatas) => {
    if (!dictDatas) {
        return ''
    }
    let result = ''
    let id = 0
    for (let dictData of dictDatas) {
        if (!dictData) {
            console.warn('当前字典为空，未解析')
            continue
        }
        for (let line of dictData.split('\n')) {
            if (line.trim().startsWith('#')) {
                line = `<b>${line}</b>`
            }
            result += `<span class="auto-incr-id">${++id}</span>${line}<br/>`
        }
        result += `<span class="auto-incr-id">${++id}</span><br/>`
        result += `<span class="auto-incr-id">${++id}</span><br/>`
    }
    return result
}

const loadDictData = (uploadFile) => {
    let reader = new FileReader();
    reader.readAsText(uploadFile.raw)
    reader.onload = () => {
        userProofDict.value = parseDictData(reader.result)
        localStorage[USER_PROOF_DICT_KEY] = reader.result
        EventBus.emit('loadUserProofDict', reader.result)
        ElMessage.success('自定义词典加载完成')
    }
}

const fileReplace = (files) => {
    dictFile.value?.clearFiles()
    dictFile.value?.handleStart(files[0])
}

// 初始化
proofDict.value = parseDictData(
    sxcDictData,
    cyzyDictData,
    yhDictData
)
userProofDict.value = parseDictData(localStorage[USER_PROOF_DICT_KEY])
</script>

<style scoped>
.text-label {
    margin-top: 30px;
    margin-bottom: 10px;
}
.dict-upload > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
.text-dict {
    white-space: pre-wrap;
    word-spacing: 0.5em;
}
.text-dict > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
.text-tip {
    font-weight: bold;
    color: var(--el-color-primary);
}
</style>