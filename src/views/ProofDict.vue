<template>
    <div class="proof-dict" v-show="$globalState.vip">
        <el-row class="dict-upload">
            <el-col>
                <el-upload ref="dictFile" :auto-upload="false" :limit="1" :on-change="loadDictData" :on-exceed="fileReplace">
                    <el-button type="primary">上传词典</el-button>
                </el-upload>
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

import yxscDictData from '@/dict/医学作者手册词典.txt?raw'
import sxcDictData from '@/dict/首选词－现代汉语词典.txt?raw'
import yxchDictData from '@/dict/医学词汇大全.txt?raw'

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
    for (let dictData of dictDatas) {
        if (!dictData) {
            console.warn('当前字典为空，未解析')
            continue
        }
        for (let line of dictData.split('\n')) {
            if (line.trim().startsWith('#')) {
                line = `<b>${line}</b>`
            }
            result += line + '<br/>'
        }
        result += '<br/><br/>'
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
        ElMessage.success('用户词典加载完成')
    }
}

const fileReplace = (files) => {
    dictFile.value?.clearFiles()
    dictFile.value?.handleStart(files[0])
}

// 初始化
proofDict.value = parseDictData(yxscDictData, sxcDictData, yxchDictData)
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
    word-spacing: 1em;
}
.text-dict > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
</style>