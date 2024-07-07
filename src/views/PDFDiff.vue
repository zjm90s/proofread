<template>
    <div class="pdf-diff">
        <el-row class="pdf-upload">
            <el-col :span="12">
                <el-upload ref="pdfFile1" :auto-upload="false" :limit="1" :on-change="loadPdfData1" :on-exceed="fileReplace1">
                    <el-button type="primary">上传文件1</el-button>
                </el-upload>
            </el-col>
            <el-col :span="12">
                <el-upload ref="pdfFile2" :auto-upload="false" :limit="1" :on-change="loadPdfData2" :on-exceed="fileReplace2">
                    <el-button type="primary">上传文件2</el-button>
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
        <el-row class="diff-pdf-page" v-if="fileObj1.pageSize || fileObj2.pageSize">
            <el-col :span="7">
                <div v-if="fileObj1.pageSize">
                    <el-text class="mx-1">文件1-共{{fileObj1.pageSize}}页-页码：</el-text>
                    <el-input-number v-model="fileObj1.pageNumber" :min="1" :max="fileObj1.pageSize" :precision="0" @change="pageTurning1" style="width: 130px"/>
                </div>
            </el-col>
            <el-col :span="10">
                <div v-if="fileObj1.pageSize && fileObj2.pageSize">
                    <el-text class="mx-1">文件1和2-页码：</el-text>
                    <el-input-number v-model="bothPageNumber" :min="1" :precision="0" @change="bothPageTurning" style="width: 130px"/>
                </div>
            </el-col>
            <el-col :span="7">
                <div v-if="fileObj2.pageSize">
                    <el-text class="mx-1">文件2-共{{fileObj2.pageSize}}页-页码：</el-text>
                    <el-input-number v-model="fileObj2.pageNumber" :min="1" :max="fileObj2.pageSize" :precision="0" @change="pageTurning2" style="width: 130px"/>
                </div>
            </el-col>
        </el-row>
        <el-row class="diff-pdf-page" v-if="fileObj1.pageSize && fileObj2.pageSize">
            <el-col>
                <el-text class="mx-1">文件1页码：</el-text>
                <el-input-number v-model="fileObj1.checkStartPage" :min="1" :max="fileObj1.pageSize" :precision="0" :controls="false" style="width: 75px"/> ~
                <el-input-number v-model="fileObj1.checkEndPage" :min="1" :max="fileObj1.pageSize" :precision="0" :controls="false" style="width: 75px"/>
                <el-text class="mx-1" style="margin-left: 50px">文件2页码：</el-text>
                <el-input-number v-model="fileObj2.checkStartPage" :min="1" :max="fileObj2.pageSize" :precision="0" :controls="false" style="width: 75px"/> ~
                <el-input-number v-model="fileObj2.checkEndPage" :min="1" :max="fileObj2.pageSize" :precision="0" :controls="false" style="width: 75px"/>
                <el-button type="primary" :loading="allTextLoading" :disabled="allTextLoading" @click="allTextCheck" style="width: 100px; margin-left: 50px">章节比对</el-button>
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as Diff from 'diff'
import VuePdfEmbed from 'vue-pdf-embed'
import 'vue-pdf-embed/dist/style/index.css'
import 'vue-pdf-embed/dist/style/textLayer.css'

// 开关
// 是否保留句子换行（即句子到达最右端的换行）
let keepLineBreak = false

// 对象属性
const pdfFile1 = ref()
const pdfFile2 = ref()
let pdfDoc1 = null
let pdfDoc2 = null
const bothPageNumber = ref(1)
const fileObj1 = reactive({
    pageNumber: 1,
    pageSize: 0,
    checkStartPage: 1,
    checkEndPage: 1,
    pdfData: null,
    pdfText: '',
    diffHtml: ''
})
const fileObj2 = reactive({
    pageNumber: 1,
    pageSize: 0,
    checkStartPage: 1,
    checkEndPage: 1,
    pdfData: null,
    pdfText: '',
    diffHtml: ''
})

// 组件效果
let allTextLoading = ref(false)

// PDF数据加载
const loadPdfData1 = (uploadFile) => {
    loadPdfData(uploadFile, fileObj1)
}
const loadPdfData2 = (uploadFile) => {
    loadPdfData(uploadFile, fileObj2)
}
const loadPdfData = (uploadFile, fileObj) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile.raw)
    reader.onload = () => {
        fileObj.pdfData = reader.result
        fileObj.pageNumber = 1
        fileObj.pageSize = 0
        fileObj.checkStartPage = 1
        fileObj.checkEndPage = 1
    }
}

// PDF文件替换
const fileReplace1 = (files) => {
    fileReplace(pdfFile1, files)
}
const fileReplace2 = (files) => {
    fileReplace(pdfFile2, files)
}
const fileReplace = (pdfFile, files) => {
    pdfFile.value?.clearFiles()
    pdfFile.value?.handleStart(files[0])
}

// PDF翻页
const pageTurning1 = () => {
    loadPdfText(pdfDoc1, fileObj1)
}
const pageTurning2 = () => {
    loadPdfText(pdfDoc2, fileObj2)
}
const bothPageTurning = () => {
    fileObj1.pageNumber = bothPageNumber.value
    fileObj2.pageNumber = bothPageNumber.value
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

    pdfDoc.getPage(fileObj.pageNumber).then((page) => {
        page.getTextContent().then((textContent) => {
            fileObj.pdfText = parsePdfText(textContent)
        }).then((res) => {
            textCheck(fileObj1.pdfText, fileObj2.pdfText)
        })
    }).catch(error => {
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
const textCheck = (pdfText1, pdfText2) => {
    // let text1 = pdfText1.replaceAll(/(\.|!|\?|,|;)/g, '$1\n')
    // let text2 = pdfText2.replaceAll(/(\.|!|\?|,|;)/g, '$1\n')
    let text1 = pdfText1.replaceAll(/(\.|!|\?)/g, '$1\n')
    let text2 = pdfText2.replaceAll(/(\.|!|\?)/g, '$1\n')

    // 解决PDF读取中文标点转英文的问题
    text1 = toSBC(text1)
    text2 = toSBC(text2)

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

const allTextCheck = () => {
    allTextLoading.value = true
    let pdfTextsP1 = parsePdfTexts(pdfDoc1, fileObj1.checkStartPage, fileObj1.checkEndPage)
    let pdfTextsP2 = parsePdfTexts(pdfDoc2, fileObj2.checkStartPage, fileObj2.checkEndPage)
    Promise.all([pdfTextsP1, pdfTextsP2]).then(res => {
        let pdfText1 = res[0].join('\n')
        let pdfText2 = res[1].join('\n')
        textCheck(pdfText1, pdfText2)
    }).finally(() => {
        allTextLoading.value = false
    })
}

const parsePdfTexts = (pdfDoc, startPage, endPage) => {
    let promises = []
    for (let pageNo = startPage; pageNo <= endPage; pageNo++) {
        promises.push(new Promise((resolve, reject) => {
            pdfDoc.getPage(pageNo).then((page) => {
                page.getTextContent().then((textContent) => {
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

const buildValueHtml = (diffHtml, value, color) => {
    diffHtml = diffHtml + '<span style="white-space: pre-wrap; border-radius: .2em; background-color: '
        + color + '">' + value + '</span>'
    return diffHtml
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