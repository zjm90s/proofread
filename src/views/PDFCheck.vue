<template>
    <div class="pdf-check" v-show="$globalState.vip">
        <el-row class="pdf-upload">
            <el-col :span="12">
                <el-upload ref="pdfFile" :auto-upload="false" :limit="1" :on-change="loadPdfData" :on-exceed="fileReplace">
                    <el-button type="primary">上传文件</el-button>
                </el-upload>
            </el-col>
            <el-col :span="12">
                <el-text tag="b">移除页眉：</el-text>
                <el-switch v-model="configure.removeHeader" @change="removeHeaderChange"/>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-text tag="b">PDF原文：</el-text>
        </el-row>
        <el-row class="diff-pdf">
            <el-col :span="12">
                <VuePdfEmbed text-layer :source="fileObj1.pdfData" :page="fileObj1.pageNumber" @loaded="loadPdfText1"/>
            </el-col>
            <el-col :span="12">
                <VuePdfEmbed text-layer :source="fileObj2.pdfData" :page="fileObj2.pageNumber" @loaded="loadPdfText2"/>
            </el-col>
        </el-row>
        <el-row class="diff-pdf-page" v-if="fileObj1.pageSize">
            <el-col :span="12">
                <el-text class="mx-1">共{{fileObj1.pageSize}}页 - 页码：</el-text>
                <el-input-number v-model="fileObj1.pageNumber" :min="1" :max="fileObj1.pageSize" :precision="0" @change="pageTurning1" :disabled="textLoading"/>
            </el-col>
            <el-col :span="12">
                <el-button type="primary" :loading="textLoading" :disabled="textLoading" @click="textCheck" style="width: 100px; margin-left: 20px">校对</el-button>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-text tag="b">比对结果：</el-text>
        </el-row>
        <el-row class="diff-result">
            <el-col :span="12">
                <el-scrollbar max-height="600px">
                    <div v-html="fileObj1.diffHtml"/>
                </el-scrollbar>
            </el-col>
            <el-col :span="12">
                <el-scrollbar max-height="600px">
                    <div v-html="fileObj2.diffHtml"/>
                </el-scrollbar>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import OpenAI from 'openai'
import * as Diff from 'diff'
import { Segment, useDefault } from 'segmentit'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/styles/textLayer.css'

import EventBus from '@/EventBus.js'
import { AI_SECRET_KEY, AI_MODEL_KEY, AI_PROMPT_KEY, USER_PROOF_DICT_KEY } from '@/constants/constant.js'

import xingjinDictData from '@/dict/[近似语料库]-形近字.txt?raw'
import yinjinDictData from '@/dict/[近似语料库]-音近字.txt?raw'
import sxcDictData from '@/dict/现代汉语词典-首选词.txt?raw'
import yxscDictData from '@/dict/医学作者手册词典.txt?raw'
import qhyxDictData from '@/dict/清华开放词库-医学.txt?raw'

const $globalState = inject('$globalState')
const segmentit = useDefault(new Segment())
const segmentDict = JSON.parse(JSON.stringify(segmentit.DICT['TABLE']))
const loadedCutDict = new Set()

// 页面配置
const configure = reactive({
    removeHeader: true
})

// 开关
const enableAiCheck = true
const enableCache = true
const fixCompatibilityIdeographs = false
const similarCheckVersion = 1

// 组件效果
const textLoading = ref(false)
// 页面坐标
let globalMaxYCoord = -1
// 缓存
const resultCache = new Map()

// 数据字典
// 易错词词典（错误词: 正确词）
const errorDict = new Map()
// 正确词词典（正确词: 词频）
const correctDict = new Map()
// 形近/音近字典（原字: 形近/音近字）
const similarDict = new Map()
// 正确词集合-相近字
const similarChars = new Set()
// 兼容表意字典（错误: 正确）
const ciDict = new Map([
    ['⽣', '生'], ['⼩', '小'], ['⽟', '玉'], ['⼤', '大'], ['⽉', '月'],
    ['⽜', '牛'], ['⾼', '高'], ['⼉', '儿'], ['⼆', '二'], ['⾦', '金'],
    ['⽂', '文'], ['⼭', '山'], ['⾹', '香'], ['⾉', '艮'], ['⽴', '立'],
    ['⼋', '八'], ['⽥', '田'], ['⽕', '火'], ['⼦', '子'], ['⽤', '用']
])

// 用户字典文件
const dictFile = ref()

// 对象属性
const pdfFile = ref()
let pdfDoc1 = null
let pdfDoc2 = null
const _fileObj = {
    pageNumber: 1,
    pageSize: 0,
    pdfData: null,
    pdfTextLoad: false,
    pdfTextItems: null,
    pdfText: '',
    diffHtml: ''
}
const fileObj1 = reactive({ ..._fileObj })
const fileObj2 = reactive({ ..._fileObj })
const fileObj3 = reactive({ ..._fileObj })

// 数据重置
const resetData = () => {
    // 组件效果
    textLoading.value = false
    // 页面坐标
    globalMaxYCoord = -1
    // 缓存
    resultCache.clear()
    // 对象属性
    Object.assign(fileObj1, { ..._fileObj })
    Object.assign(fileObj2, { ..._fileObj })
    Object.assign(fileObj3, { ..._fileObj })
}

// 配置变更
const removeHeaderChange = () => {
    resultCache.clear()
    fileObj1.pdfText = parsePdfText(fileObj1.pdfTextItems)
    fileObj2.pdfText = parsePdfText(fileObj2.pdfTextItems)
    fileObj3.pdfText = parsePdfText(fileObj3.pdfTextItems)
}

// 文件替换
const fileReplace = (files) => {
    pdfFile.value?.clearFiles()
    pdfFile.value?.handleStart(files[0])
    resetData()
}

// 校对字典加载
const loadAllProofDict = (userDictData) => {
    loadProofDict(
        sxcDictData,
        yxscDictData
    )
    if (userDictData) {
        loadProofDict(userDictData)
    }
    loadSimilarChars()
}

const loadProofDict = (...dictDatas) => {
    if (!dictDatas) {
        return
    }
    for (let dictData of dictDatas) {
        let lines = dictData.split('\n')
        for (let line of lines) {
            line = line.trim()
            if (line == '' || line.startsWith('#') || line.startsWith('//')) {
                continue
            }
            let keyValue = line.split(/\s+/)
            if (keyValue.length == 2) {
                let value = keyValue[1]
                if (isNaN(value)) {
                    let errorWords = value.split(',')
                    for (let errorWord of errorWords) {
                        errorDict.set(errorWord, buildValueHtml(keyValue[0], 'error'))
                    }
                } else {
                    correctDict.set(keyValue[0], value)
                }
            } else {
                correctDict.set(line, 1000)
            }
        }
    }
}

// 根据正确词集合加载相近字
const loadSimilarChars = () => {
    for (const [word, weight] of correctDict.entries()) {
        for (let char of word.split('')) {
            similarChars.add(char)
            let simChars = similarDict.get(char)
            if (!simChars) {
                continue
            }
            for (let similarChar of simChars.split('')) {
                similarChars.add(similarChar)
            }
        }
    }
}

// 形近/音近字字典加载
const loadSimilarDict = (...dictDatas) => {
    if (!dictDatas) {
        return
    }
    for (let dictData of dictDatas) {
        let lines = dictData.split('\n')
        for (let line of lines) {
            line = line.trim()
            if (line == '' || line.startsWith('#') || line.startsWith('//')) {
                continue
            }
            let keyValue = line.split(/\s+/)
            if (keyValue.length == 1) {
                continue
            }
            if (similarDict.has(keyValue[0])) {
                let similarItems = similarDict.get(keyValue[0]) + keyValue[1]
                similarItems = Array.from(new Set(similarItems)).join('')
                similarDict.set(keyValue[0], similarItems)
            } else {
                similarDict.set(keyValue[0], keyValue[1])
            }
        }
    }
}

// 用户词典加载
const loadUserProofDict = (dictData) => {
    errorDict.clear()
    loadAllProofDict(dictData)
    resultCache.clear()
}

// PDF数据加载
const loadPdfData = (uploadFile) => {
    loadPdfData0(uploadFile, fileObj1)
    loadPdfData0(uploadFile, fileObj2)
}
const loadPdfData0 = (uploadFile, fileObj) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile.raw)
    reader.onload = () => {
        fileObj.pdfData = reader.result
    }
}

// PDF翻页
const pageTurning1 = () => {
    fileObj2.pageNumber = fileObj1.pageNumber + 1
    if (fileObj2.pageNumber > fileObj2.pageSize) {
        fileObj2.pageNumber = fileObj2.pageSize
    }
    fileObj3.pageNumber = fileObj2.pageNumber + 1
    if (fileObj3.pageNumber > fileObj3.pageSize) {
        fileObj3.pageNumber = fileObj3.pageSize
    }
    loadPdfText(pdfDoc1, fileObj1)
    loadPdfText(pdfDoc2, fileObj2)
    loadPdfText(pdfDoc2, fileObj3)
}

// PDF文本获取
const loadPdfText1 = (pdfDoc) => {
    pdfDoc1 = pdfDoc
    loadPdfText(pdfDoc1, fileObj1, 1)
}
const loadPdfText2 = (pdfDoc) => {
    pdfDoc2 = pdfDoc
    loadPdfText(pdfDoc2, fileObj2, 2)
    loadPdfText(pdfDoc2, fileObj3, 3)
}
const loadPdfText = (pdfDoc, fileObj, pageNumber) => {
    if (fileObj.pageSize == 0) {
        fileObj.pageNumber = pageNumber > pdfDoc.numPages ? pdfDoc.numPages : pageNumber
        fileObj.pageSize = pdfDoc.numPages
    }

    textLoading.value = true
    fileObj.pdfTextLoad = false
    pdfDoc.getPage(fileObj.pageNumber).then((page) => {
        page.getTextContent().then((textContent) => {
            fileObj.pdfTextItems = textContent
            fileObj.pdfText = parsePdfText(textContent)
            fileObj.pdfTextLoad = true
            textLoading.value = !(fileObj1.pdfTextLoad && fileObj2.pdfTextLoad && fileObj3.pdfTextLoad)
        })
    }).catch(error => {
        textLoading.value = false
        ElMessage.error(error.message)
    })
}

// PDF内容解析
const parsePdfText = (textContent) => {
    // 最右端坐标
    let maxXCoord = 0
    // 最上方坐标
    let maxYCoord = 0
    // 最下方坐标
    let minYCoord = 1_0000_0000
    // 文本行
    let textLines = new Map()
    // 是否包含结束符
    let containStopSign = false
    for(let i = 0; i < textContent.items.length; i++) {
        let item = textContent.items[i]
        let itemXCoord = Math.trunc(item.transform[4] + item.width)
        let itemYCoord = Math.trunc(item.transform[5])

        if (itemXCoord > maxXCoord) {
            maxXCoord = itemXCoord
        }
        if (itemYCoord < minYCoord) {
            minYCoord = itemYCoord
        }
        if (itemYCoord > maxYCoord) {
            maxYCoord = itemYCoord
        }

        if (textLines.has(itemYCoord)) {
            textLines.set(itemYCoord, {
                "str": textLines.get(itemYCoord)['str'] + item.str,
                "maxXCoord": itemXCoord
            })
        } else {
            textLines.set(itemYCoord, {
                "str": item.str,
                "maxXCoord": itemXCoord
            })
        }

        if (!containStopSign && toSBC(item.str).includes('。')) {
            containStopSign = true
        }
    }

    // 获取文本
    let text = ''
    for(const [itemYCoord, textLine] of textLines) {
        let lineText = textLine['str']
        if (itemYCoord == maxYCoord) {
            if (configure.removeHeader && maxYCoord >= globalMaxYCoord
                && (/^.*第.+章(?!.*[􀪋…]).*$/.test(lineText) || maxYCoord == globalMaxYCoord)) {
                // console.log(`"页眉"移除, itemYCoord: ${itemYCoord}, textLine: ${lineText}`)
                if (maxYCoord > globalMaxYCoord) {
                    globalMaxYCoord = maxYCoord
                }
                continue
            }
        } else if (itemYCoord == minYCoord) {
            if (/^[0-9 ·０１２３４５６７８９]+$/.test(lineText)) {
                continue
            }
        }
        text = text + lineText
        // 添加换行符
        if (textLine['maxXCoord'] < maxXCoord - 10 || !containStopSign) {
            text = text + '\n'
        }
    }
    return text.trim()
}

// PDF文本比对
const textCheck = async () => {
    try {
        textLoading.value = true
        await textCheck0(fileObj1, fileObj2)
    } catch (e) {
        let error = e.message.replaceAll(/bewildcard|wildcard/g, 'xxx')
        ElMessage.error(error)
        return
    } finally {
        textLoading.value = false
    }

    // 缓存第二页
    if (enableCache && fileObj2.pageNumber == fileObj1.pageNumber + 1) {
        let fullText = toSBC(fileObj2.pdfText)
        if (fullText.includes('。') && !fullText.endsWith('。') && fileObj3.pageNumber == fileObj2.pageNumber + 1) {
            let nextPdfText = toSBC(fileObj3.pdfText)
            let nextPdfTextIndex = nextPdfText.indexOf('。')
            nextPdfTextIndex = nextPdfTextIndex != -1 ? nextPdfTextIndex + 1 : nextPdfText.length
            fullText = fullText + nextPdfText.substring(0, nextPdfTextIndex)
        }
        let nextText = aiCheck(fileObj2.pageNumber, fullText)
        resultCache.set(fileObj2.pageNumber, nextText)
    }
}

const textCheck0 = async (fileObj, fileObjNext) => {
    let fullText1 = toSBC(fileObj.pdfText)
    if (fullText1.includes('。') && !fullText1.endsWith('。') && fileObjNext.pageNumber == fileObj.pageNumber + 1) {
        let nextPdfText = toSBC(fileObjNext.pdfText)
        let nextPdfTextIndex = nextPdfText.indexOf('。')
        nextPdfTextIndex = nextPdfTextIndex != -1 ? nextPdfTextIndex + 1 : nextPdfText.length
        fullText1 = fullText1 + nextPdfText.substring(0, nextPdfTextIndex)
    }
    let text1 = fullText1.replaceAll(/(。|！|？|!|\?)/g, '$1\n')
    text1 = textTrim(text1)
    let text2 = await aiCheck(fileObj.pageNumber, fullText1)
    text2 = text2.replaceAll(/(。|！|？|!|\?)/g, '$1\n')
    text2 = aiTextTrim(text2)

    // 差异比较
    const diffItems = Diff.diffChars(text1, text2)

    let html1 = ''
    let html2 = ''
    let inSpan = false
    for (let part of diffItems) {
        let value = part.value
        if (value.includes('<span ')) {
            inSpan = true
        }

        if (part.added) {
            if (inSpan) {
                html2 = html2 + value
            } else {
                html2 = html2 + buildValueHtml(value, 'add')
            }
        } else if (part.removed) {
            html1 = html1 + buildValueHtml(value, 'remove')
        } else {
            html1 = html1 + buildValueHtml(value)
            html2 = html2 + buildValueHtml(value)
        }

        if (value.includes('</span>')) {
            inSpan = false
        }
    }

    html1 = html1.replaceAll('\n', '<br/>')
    html2 = html2.replaceAll('\n', '<br/>')
    fileObj1.diffHtml = html1
    fileObj2.diffHtml = html2
}

const buildValueHtml = (value, type) => {
    // type: add,remove,error
    let css = type ? 'diff-item-' + type : 'diff-item'
    return `<span class="${css}">${value}</span>`
}

// 解决PDF读取中文标点转英文的问题
const toSBC = (str) => {
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        switch (str[i]) {
            case '.':
                if (i != 0 && !/^[0-9a-zA-Z]$/.test(str[i-1])) {
                    newStr += '。';
                } else {
                    newStr += str[i]
                }
                break;
            case ',': newStr += '，';break;
            case ';': newStr += '；';break;
            case ':': newStr += '：';break;
            case '!': newStr += '！';break;
            case '?': newStr += '？';break;
            case '(': newStr += '（';break;
            case ')': newStr += '）';break;
            default: newStr += str[i]
        }
    }
    return newStr
}

const textTrim = (str) => {
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        switch (str[i]) {
            case ' ':
                if (i > 0 && i < str.length - 1 && /^[A-Za-z]$/.test(str[i-1]) && /^[A-Za-z]$/.test(str[i+1])) {
                    newStr += ' '
                }
                break;
            case '\n':
                if (i > 1 && '\n' == str[i] && '\n' != str[i-2]) {
                    newStr += '\n'
                }
                break;
            default: newStr += str[i]
        }
    }
    return newStr
}

const aiTextTrim = (str) => {
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        switch (str[i]) {
            case '\n':
                if (i > 1 && '\n' == str[i] && '\n' != str[i-2]) {
                    newStr += '\n'
                }
                break;
            default: newStr += str[i]
        }
    }
    return newStr
}

// AI校对
const aiCheck = async (pageNumber, text) => {
    if (!enableAiCheck) {
        return checkWithDict(text)
    }

    if (text == null || text.trim() == '') {
        return ''
    }
    let result = resultCache.get(pageNumber)
    if (result) {
        return result
    }

    let apiKey = Cookies.get(AI_SECRET_KEY)
    if (!apiKey) {
        throw new Error('秘钥未设置')
    }
    let model = Cookies.get(AI_MODEL_KEY)
    if (!model) {
        model = 'gpt-4o-mini'
    }
    let prompt = Cookies.get(AI_PROMPT_KEY)
    if (!prompt) {
        prompt = '作为专业编辑，帮我校对以下内容，纯文本返回不要使用Markdown语法'
    }

    const openai = new OpenAI({
        baseURL: 'https://api.gptsapi.net/v1',
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    })
    const completion = await openai.chat.completions.create({
        model: model,
        temperature: 0,
        messages: [
            {"role": "user", "content": `${prompt}：${text}`}
        ]
    })
    let content = completion.choices[0].message.content
    content = checkWithDict(content)
    return content
}

// 基于字典校对
const checkWithDict = (content) => {
    // 兼容表意文字替换
    if (fixCompatibilityIdeographs && ciDict.size > 0) {
        const keys = Array.from(ciDict.keys()).join('|')
        const regex = new RegExp(keys, 'g');
        content = content.replace(regex, (matched) => ciDict.get(matched))
    }
    // 使用易错词词典校对
    if (errorDict.size > 0) {
        const keys = Array.from(errorDict.keys()).join('|')
        const regex = new RegExp(keys, 'g');
        content = content.replace(regex, (matched) => errorDict.get(matched))
    }

    // 使用正确词词库校对
    // 文本拆分以降低时间复杂度
    let newContent = ''
    let sentences = content.split(/(?<=[。])/)
    let sentenceMerge = ''
    for (const [i, sentence] of sentences.entries()) {
        sentenceMerge += sentence
        if (sentenceMerge.length < 100 && i + 1 < sentences.length) {
            continue
        }
        // 获取文中实际出现的相近字
        let realSimilarChars = new Set()
        for (let char of similarChars) {
            if (sentenceMerge.includes(char)) {
                realSimilarChars.add(char)
            }
        }

        // 生成校对词典
        let pageProofDict = new Map()
        for (const [word, weight] of correctDict.entries()) {
            buildPageProofDict(pageProofDict, realSimilarChars, word, word, '', weight)
        }

        if (similarCheckVersion == 1) { // 基于正则
            // 修正错误词
            if (pageProofDict.size > 0) {
                const keys = Array.from(pageProofDict.keys()).join('|')
                const regex = new RegExp(keys, 'g');
                sentenceMerge = sentenceMerge.replace(regex, (matched) => pageProofDict.get(matched)[0])
            }
            newContent += sentenceMerge
            sentenceMerge = ''
        } else if (similarCheckVersion == 2) { // 基于分词
            // 生成分词词典
            let pageCutDict = ''
            for (const [errorWord, correctItem] of pageProofDict.entries()) {
                if (loadedCutDict.has(errorWord)) {
                    continue
                }
                pageCutDict += `${errorWord}|0x100000|${correctItem[1]}\n`
                loadedCutDict.add(errorWord)
            }
            if (pageCutDict) {
                segmentit.loadDict(pageCutDict)
            }

            // 修正错误词
            let sentenceResult = ''
            const words = segmentit.doSegment(sentenceMerge)
            for (let wordItem of words) {
                let word = wordItem['w']
                if (!segmentDict[word] && pageProofDict.has(word)) {
                    sentenceResult += buildValueHtml(pageProofDict.get(word)[0], 'error')
                } else {
                    if (sentenceResult.endsWith('<span') && word == 'class') {
                        sentenceResult += ' ' + word
                    } else {
                        sentenceResult += word
                    }
                }
            }
            newContent += sentenceResult
            sentenceMerge = ''
        }
    }
    return newContent
}

// 构建页面级校对词典
const buildPageProofDict = (pageProofDict, realSimilarChars, word, leftWord, prefix, weight) => {
    let similarChars = similarDict.get(leftWord[0])
    similarChars = similarChars ? leftWord[0] + similarChars : leftWord[0]
    for (let similarChar of similarChars.split('')) {
        if (!realSimilarChars.has(similarChar)) {
            continue
        }
        if (leftWord.length > 1) {
            buildPageProofDict(pageProofDict, realSimilarChars, word, leftWord.substring(1), prefix + similarChar, weight)
        } else {
            let similarWord = prefix + similarChar
            if (similarWord != word) {
                pageProofDict.set(similarWord, [buildValueHtml(word, 'error'), weight])
            }
        }
    }
}

// 初始化
loadSimilarDict(xingjinDictData, yinjinDictData)
loadAllProofDict(localStorage[USER_PROOF_DICT_KEY])
onMounted(() => {
    EventBus.on('loadUserProofDict', loadUserProofDict)
})
</script>

<style scoped>
.text-label {
    margin-top: 30px;
    margin-bottom: 10px;
}
.pdf-upload > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
.diff-pdf > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
.diff-pdf-page {
    text-align: center;
    border: 1px solid var(--el-menu-border-color);
}
.diff-pdf-page > .el-col {
    padding: 10px;
}
.diff-result {
    padding-bottom: 50px;
}
.diff-result > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
</style>