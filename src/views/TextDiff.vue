<template>
    <div class="text-diff">
        <el-row>
            <el-col>
                <el-form :model="form" label-width="auto">
                    <el-form-item label="文本1">
                        <el-input v-model="form.text1" type="textarea" :rows="5"/>
                    </el-form-item>
                    <el-form-item label="文本2">
                        <el-input v-model="form.text2" type="textarea" :rows="5"/>
                    </el-form-item>
                    <el-form-item style="float: right; margin-top: 5px">
                        <el-button type="primary" @click="textCheck" style="width: 100px;">比对</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>

        <el-row class="text-label">
            <el-text>比对结果：</el-text>
        </el-row>
        <el-row class="diff-result">
            <el-col :span="12">
                <div v-html="diffHtml1"/>
            </el-col>
            <el-col :span="12">
                <div v-html="diffHtml2"/>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import * as Diff from 'diff'

const form = reactive({
    text1: '',
    text2: ''
})

const diffHtml1 = ref('')
const diffHtml2 = ref('')

const textCheck = () => {
    // const text1 = form.text1.replaceAll(/(。|！|？|，|；|\.)/g, '$1\n')
    // const text2 = form.text2.replaceAll(/(。|！|？|，|；|\.)/g, '$1\n')
    const text1 = form.text1.replaceAll(/(。|！|？|\.)/g, '$1\n')
    const text2 = form.text2.replaceAll(/(。|！|？|\.)/g, '$1\n')
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
    diffHtml1.value = html1
    diffHtml2.value = html2
}

const buildValueHtml = (diffHtml, value, color) => {
    diffHtml = diffHtml + '<span style="white-space: pre-wrap; word-spacing: 0.25em; border-radius: .2em; background-color: '
        + color + '">' + value + '</span>'
    return diffHtml
}
</script>

<style scoped>
.text-label {
    margin-bottom: 15px;
}
.diff-result {
    padding-bottom: 50px;
}
.diff-result > .el-col {
    padding: 10px;
    border: 1px solid var(--el-menu-border-color);
}
</style>