<template>
    <div class="text-diff">
        <el-row class="pdf-upload">
            <el-col :span="12">
                <el-upload ref="pdfFile1" :auto-upload="false" :limit="1" :on-change="handleFileChange1" :on-exceed="handleFileExceed1">
                    <el-button type="primary">上传文件1</el-button>
                </el-upload>
            </el-col>
            <el-col :span="12">
                <el-upload ref="pdfFile2" :auto-upload="false" :limit="1" :on-change="handleFileChange2" :on-exceed="handleFileExceed2">
                    <el-button type="primary">上传文件2</el-button>
                </el-upload>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-text tag="b">PDF原文：</el-text>
        </el-row>
        <el-row class="diff-pdf">
            <el-col :span="12">
                <VuePdfEmbed text-layer :source="fileObj1.pdfData" :page="fileObj1.pageNumber" @loaded="handlePdfLoaded1"/>
            </el-col>
            <el-col :span="12">
                <VuePdfEmbed text-layer :source="fileObj2.pdfData" :page="fileObj2.pageNumber" @loaded="handlePdfLoaded2"/>
            </el-col>
        </el-row>
        <el-row class="diff-pdf-page" v-if="fileObj1.pdfText || fileObj2.pdfText">
            <el-col :span="8">
                <div v-if="fileObj1.pdfText">
                    <el-text class="mx-1">文件1-共{{fileObj1.pageSize}}页-页码：</el-text>
                    <el-input-number v-model="fileObj1.pageNumber" :min="1" @change="handPageNumberChange1"/>
                </div>
            </el-col>
            <el-col :span="8">
                <div v-if="fileObj1.pdfText && fileObj2.pdfText">
                    <el-text class="mx-1">文件1和2-页码：</el-text>
                    <el-input-number v-model="bothPageNumber" :min="1" @change="handBothPageNumberChange"/>
                </div>
            </el-col>
            <el-col :span="8">
                <div v-if="fileObj2.pdfText">
                    <el-text class="mx-1">文件2-共{{fileObj2.pageSize}}页-页码：</el-text>
                    <el-input-number v-model="fileObj2.pageNumber" :min="1" @change="handPageNumberChange2"/>
                </div>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-text tag="b">比对结果：</el-text>
        </el-row>
        <el-row class="diff-result">
            <el-col :span="12">
                <div v-html="fileObj1.diffHtml"/>
            </el-col>
            <el-col :span="12">
                <div v-html="fileObj2.diffHtml"/>
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

// 对象属性
const pdfFile1 = ref()
const pdfFile2 = ref()
let pdfDoc1 = {}
let pdfDoc2 = {}
const bothPageNumber = ref(1)
const fileObj1 = reactive({
    pageNumber: 1,
    pageSize: 0,
    pdfData: {},
    pdfText: '',
    diffHtml: ''
})
const fileObj2 = reactive({
    pageNumber: 1,
    pageSize: 0,
    pdfData: {},
    pdfText: '',
    diffHtml: ''
})

// PDF数据加载
const handleFileChange1 = (uploadFile) => {
    handleFileChange(uploadFile, fileObj1)
}
const handleFileChange2 = (uploadFile) => {
    handleFileChange(uploadFile, fileObj2)
}
const handleFileChange = (uploadFile, fileObj) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(uploadFile.raw)
    reader.onload = () => {
        fileObj.pdfData = reader.result
    }
}

// PDF文件替换
const handleFileExceed1 = (files) => {
    fileReplace(pdfFile1, files)
}
const handleFileExceed2 = (files) => {
    fileReplace(pdfFile2, files)
}
const fileReplace = (pdfFile, files) => {
    pdfFile.value?.clearFiles()
    pdfFile.value?.handleStart(files[0])
}

// PDF翻页
const handPageNumberChange1 = () => {
    handlePdfLoaded(pdfDoc1, fileObj1)
}
const handPageNumberChange2 = () => {
    handlePdfLoaded(pdfDoc2, fileObj2)
}
const handBothPageNumberChange = () => {
    fileObj1.pageNumber = bothPageNumber.value
    fileObj2.pageNumber = bothPageNumber.value
    handlePdfLoaded(pdfDoc1, fileObj1)
    handlePdfLoaded(pdfDoc2, fileObj2)
}

// PDF文本获取
const handlePdfLoaded1 = (pdfDoc) => {
    pdfDoc1 = pdfDoc
    handlePdfLoaded(pdfDoc1, fileObj1)
}
const handlePdfLoaded2 = (pdfDoc) => {
    pdfDoc2 = pdfDoc
    handlePdfLoaded(pdfDoc2, fileObj2)
}
const handlePdfLoaded = (pdfDoc, fileObj) => {
    if (fileObj.pageSize == 0) {
        fileObj.pageSize = pdfDoc.numPages
    }
    if (fileObj.pageNumber > fileObj.pageSize) {
        ElMessage.error(`不能超过最大页数${fileObj.pageSize}`)
        return
    }
    pdfDoc.getPage(fileObj.pageNumber).then((page) => {
        page.getTextContent().then(function(textContent) {
            let text = ''
            for(let i = 0; i < textContent.items.length; i++) {
                let item = textContent.items[i]
                let preItem = textContent.items[i-1]
                let sign = (i > 0 && preItem.transform[5] - item.transform[5] > item.height) ? '\n' : ''
                text = text + sign + item.str
            }
            fileObj.pdfText = text

            // 文本比对
            textCheck()
        })
    }).catch(error => {
        ElMessage.error(error.message)
    })
}

// PDF文本比对
const textCheck = () => {
    // let text1 = fileObj1.pdfText.replaceAll(/(\.|!|\?|,|;)/g, '$1\n')
    // let text2 = fileObj2.pdfText.replaceAll(/(\.|!|\?|,|;)/g, '$1\n')
    let text1 = fileObj1.pdfText.replaceAll(/(\.|!|\?)/g, '$1\n')
    let text2 = fileObj2.pdfText.replaceAll(/(\.|!|\?)/g, '$1\n')

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