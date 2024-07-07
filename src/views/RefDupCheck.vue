<template>
    <div class="ref-dup-check">
        <el-row class="pdf-upload">
            <el-col>
                <el-upload ref="pdfFile" :auto-upload="false" :limit="1" :on-change="loadPdfData" :on-exceed="fileReplace">
                    <el-button type="primary">上传文件</el-button>
                </el-upload>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-col :span="12">
                <el-text tag="b">PDF原文：</el-text>
            </el-col>
            <el-col :span="12">
                <el-text tag="b">检测结果：</el-text>
            </el-col>
        </el-row>
        <el-row class="diff-pdf">
            <el-col :span="12">
                <div ref="pdfDiv">
                    <VuePdfEmbed text-layer :source="pdfData" :page="pageNumber" @loaded="loadPdfDoc"/>
                </div>
            </el-col>
            <el-col :span="12">
                <el-scrollbar :height="pdfHeigh">
                    <div v-html="diffHtml"/>
                </el-scrollbar>
            </el-col>
        </el-row>
        <el-row class="diff-pdf-page" v-if="pageSize">
            <el-col :span="12">
                <el-text class="mx-1">文件-共{{pageSize}}页-页码：</el-text>
                <el-input-number v-model="pageNumber" :min="1" :max="pageSize" :precision="0"/>
            </el-col>
            <el-col :span="12">
                <el-text class="mx-1">页码范围：</el-text>
                <el-input-number v-model="checkStartPage" :min="1" :max="pageSize" :precision="0" :controls="false" style="width: 75px"/> ~
                <el-input-number v-model="checkEndPage" :min="1" :max="pageSize" :precision="0" :controls="false" style="width: 75px"/>
                <el-button type="primary" :loading="textLoading" :disabled="textLoading" @click="textCheck" style="width: 100px; margin-left: 20px">去重</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'

// 对象属性
const pdfFile = ref()
const pdfData = ref()
let pdfDoc = null
let pageNumber = ref(1)
let pageSize = ref(0)
let checkStartPage = ref(1)
let checkEndPage = ref(1)
let diffHtml = ref('')

// 组件效果
let pdfDiv = ref(0)
let pdfHeigh = ref(0)
let textLoading = ref(false)

// PDF数据加载
const loadPdfData = (uploadFile) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile.raw)
    reader.onload = () => {
        pdfData.value = reader.result
        pageNumber.value = 1
        pageSize.value = 0
    }
}

// PDF文件替换
const fileReplace = (files) => {
    pdfFile.value?.clearFiles()
    pdfFile.value?.handleStart(files[0])
}

// PDF文档获取
const loadPdfDoc = (pdf) => {
    pdfDoc = pdf
    pageSize.value = pdf.numPages
}

// PDF文本比对
const textCheck = () => {
    // 设置文本滚动高度
    pdfHeigh.value = pdfDiv.value.offsetHeight

    textLoading.value = true
    parsePdfTexts().then(pdfTexts => {
        let pdfText = pdfTexts.join('\n')
        diffHtml.value = parseDiffHtml(pdfText)
    }).catch(error => {
        ElMessage.error(error.message)
    }).finally(() => {
        textLoading.value = false
    })
}

const parseDiffHtml = (pdfText) => {
    // 解决PDF读取中文标点转英文的问题
    pdfText = toSBC(pdfText)

    let textItems = pdfText.split('\n')
    // 找出重复项
    let dupMap = {}
    textItems.forEach((textItem) => {
        // 去掉引用开头的[1]
        let newTextItem = textItem.replaceAll(/^\[.*?\]/g, '')
        if (dupMap[newTextItem] == null) {
            dupMap[newTextItem] = false
        } else if (dupMap[newTextItem] == false) {
            dupMap[newTextItem] = true
        }
    })

    // html拼接
    let html = ''
    textItems.forEach((textItem) => {
        let newTextItem = textItem.replaceAll(/^\[.*?\]/g, '')
        if (dupMap[newTextItem]) {
            html = buildValueHtml(html, textItem, '#ffb6ba')
        } else {
            html = buildValueHtml(html, textItem, '#fff')
        }
        html = html + '<br/>'
    });
    return html
}

// 加载多页文本
const parsePdfTexts = () => {
    if (checkStartPage.value > checkEndPage.value) {
        throw new Error(`开始页不能大于结束页`)
    }

    let promises = []
    for (let pageNo = checkStartPage.value; pageNo <= checkEndPage.value; pageNo++) {
        promises.push(new Promise((resolve, reject) => {
            pdfDoc.getPage(pageNo).then((page) => {
                page.getTextContent().then((textContent) => {
                    // console.log(textContent)
                    let pdfText = parsePdfText(textContent)
                    resolve(pdfText)
                })
            }).catch(error => {
                ElMessage.error(error.message)
            })
        }))
    }
    return Promise.all(promises)
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
                && (itemXCoord < maxXCoord - 10)) {
                text = text + '\n'
            }
        }
    }
    return text
}

const toSBC = (str) => {
    let newStr = ""
    for(let i = 0; i < str.length; i++){
        switch (str[i]) {
            case '.': newStr += '。';break;
            case ',': newStr += '，';break;
            case ';': newStr += '；';break;
            case ':': newStr += '：';break;
            case '!': newStr += '！';break;
            case '?': newStr += '？';break;
            default: newStr += str[i]
        }
    }
    return newStr
}

const buildValueHtml = (diffHtml, value, color) => {
    diffHtml = diffHtml + '<span style="white-space: pre-wrap; border-radius: .2em; background-color: '
        + color + '">' + value + '</span>'
    return diffHtml
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
    padding-bottom: 50px;
}
.diff-pdf-page > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
</style>