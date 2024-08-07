<template>
    <div class="pdf-check" v-if="$globalState.vip">
        <el-row class="pdf-upload">
            <el-col>
                <el-upload ref="pdfFile" :auto-upload="false" :limit="1" :on-change="loadPdfData" :on-exceed="fileReplace">
                    <el-button type="primary">上传文件</el-button>
                </el-upload>
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
                <el-input-number v-model="fileObj1.pageNumber" :min="1" :max="fileObj1.pageSize" :precision="0" :disabled="textLoading" @change="pageTurning1"/>
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
import { ref, reactive, inject } from 'vue'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import OpenAI from 'openai'
import * as Diff from 'diff'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'

const $globalState = inject('$globalState')

// 开关
// 是否保留句子换行（即句子到达最右端的换行）
let keepLineBreak = false

// 对象属性
const pdfFile = ref()
let pdfDoc1 = null
let pdfDoc2 = null
const fileObj1 = reactive({
    pageNumber: 1,
    pageSize: 0,
    pdfData: null,
    pdfTextLoad: false,
    pdfText: '',
    diffHtml: ''
})
const fileObj2 = reactive({
    pageNumber: 2,
    pageSize: 0,
    pdfData: null,
    pdfTextLoad: false,
    pdfText: '',
    diffHtml: ''
})
const resultCache = {}

// 组件效果
const textLoading = ref(false)

// PDF数据加载
const loadPdfData = (uploadFile) => {
    loadPdfData0(uploadFile, fileObj1, true)
    loadPdfData0(uploadFile, fileObj2, false)
}
const loadPdfData0 = (uploadFile, fileObj, isMainFile) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile.raw)
    reader.onload = () => {
        fileObj.pdfData = reader.result
        fileObj.pageSize = 0
        if (isMainFile) {
            fileObj.pageNumber = 1
        } else {
            fileObj.pageNumber = 2
        }
    }
}

// PDF文件替换
const fileReplace = (files) => {
    pdfFile.value?.clearFiles()
    pdfFile.value?.handleStart(files[0])
}

// PDF翻页
const pageTurning1 = () => {
    fileObj2.pageNumber = fileObj1.pageNumber + 1
    if (fileObj2.pageNumber > fileObj2.pageSize) {
        fileObj2.pageNumber = fileObj2.pageSize
    }
    loadPdfText(pdfDoc1, fileObj1)
    loadPdfText(pdfDoc2, fileObj2)
}

// PDF文本获取
const loadPdfText1 = (pdfDoc) => {
    pdfDoc1 = pdfDoc
    loadPdfText(pdfDoc1, fileObj1)
}
const loadPdfText2 = (pdfDoc) => {
    pdfDoc2 = pdfDoc
    loadPdfText(pdfDoc2, fileObj2)
}
const loadPdfText = (pdfDoc, fileObj) => {
    if (fileObj.pageSize == 0) {
        fileObj.pageSize = pdfDoc.numPages
    }

    textLoading.value = true
    fileObj.pdfTextLoad = false
    pdfDoc.getPage(fileObj.pageNumber).then((page) => {
        page.getTextContent().then((textContent) => {
            fileObj.pdfText = parsePdfText(textContent)
            fileObj.pdfTextLoad = true
            textLoading.value = !(fileObj1.pdfTextLoad && fileObj2.pdfTextLoad)
        })
    }).catch(error => {
        textLoading.value = false
        ElMessage.error(error.message)
    })
}

const parsePdfText = (textContent) => {
    // 计算最大横坐标
    let maxXCoord = 0
    for(let i = 0; i < textContent.items.length; i++) {
        let item = textContent.items[i]
        let itemXCoord = item.transform[4] + item.width
        if (itemXCoord > maxXCoord) {
            maxXCoord = itemXCoord
        }
    }

    // 获取文本
    let text = ''
    for(let i = 0; i < textContent.items.length; i++) {
        let item = textContent.items[i]
        text = text + item.str
        // 添加换行符
        if (i < textContent.items.length - 1) {
            let nextItem = textContent.items[i+1]
            let itemXCoord = item.transform[4] + item.width
            if ((item.transform[5] - nextItem.transform[5] > item.height)
                && (keepLineBreak || itemXCoord < maxXCoord - 10)) {
                text = text + '\n'
            }
        }
    }
    return text
}

// PDF文本比对
const textCheck = async () => {
    try {
        textLoading.value = true
        await textCheck0(fileObj1)
    } catch (e) {
        let error = e.message.replaceAll('bewildcard', 'xxx').replaceAll('wildcard', 'xxx')
        ElMessage.error(error)
        return
    } finally {
        textLoading.value = false
    }

    if (fileObj2.pageNumber == fileObj1.pageNumber + 1) {
        let nextText = aiCheck(fileObj2.pageNumber, fileObj2.pdfText)
        resultCache[fileObj2.pageNumber] = nextText
    }
}

const textCheck0 = async (fileObj) => {
    let text1 = fileObj.pdfText
    // 解决PDF读取中文标点转英文的问题
    text1 = toSBC(text1)
    text1 = text1.replaceAll(/(。|！|？|!|\?)/g, '$1\n')
    text1 = textTrim(text1)
    let text2 = await aiCheck(fileObj.pageNumber, fileObj.pdfText)
    text2 = text2.replaceAll(/(。|！|？|!|\?)/g, '$1\n')
    text2 = aiTextTrim(text2)

    // 差异比较
    const diffItems = Diff.diffChars(text1, text2)

    let html1 = ''
    let html2 = ''
    diffItems.forEach((part) => {
        if (part.added) {
            html2 = buildValueHtml(html2, part.value, '#97f295')
        } else if (part.removed) {
            html1 = buildValueHtml(html1, part.value, '#ffb6ba')
        } else {
            html1 = buildValueHtml(html1, part.value, '#fff')
            html2 = buildValueHtml(html2, part.value, '#fff')
        }
    });

    html1 = html1.replaceAll("\n", "<br/>")
    html2 = html2.replaceAll("\n", "<br/>")
    fileObj1.diffHtml = html1
    fileObj2.diffHtml = html2
}

const buildValueHtml = (diffHtml, value, color) => {
    diffHtml = diffHtml + '<span style="white-space: pre-wrap; border-radius: .2em; background-color: '
        + color + '">' + value + '</span>'
    return diffHtml
}

const toSBC = (str) => {
    let newStr = ''
    for(let i = 0; i < str.length; i++){
        switch (str[i]) {
            case '.':
                if (i != 0 && !/^[0-9]$/.test(str[i-1])) {
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

const aiCheck = async (pageNumber, text) => {
    let result = resultCache[pageNumber]
    if (result) {
        return result
    }

    let apiKey = Cookies.get('ai_secret_key')
    if (apiKey == null || apiKey == '') {
        throw new Error('秘钥未设置')
    }
    const openai = new OpenAI({
        baseURL: 'https://api.gptsapi.net/v1',
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    })
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        // model: "gpt-4o-mini",
        temperature: 0,
        messages: [
            {"role": "system", "content": "作为专业编辑，帮我校对以下内容，纯文本返回"},
            {"role": "user", "content": text}
        ]
    })
    return completion.choices[0].message.content
}
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