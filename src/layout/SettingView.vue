<template>
    <el-dialog v-model="$globalState.settingVisible" title="设置" width="500">
        <el-form :model="form">
            <el-form-item label="ChatGPT秘钥" :label-width="formLabelWidth">
                <el-input v-model="form.chatGptSecretKey" type="password" autocomplete="new-password"/>
            </el-form-item>
            <el-form-item label="DeepSeek秘钥" :label-width="formLabelWidth">
                <el-input v-model="form.deepSeekSecretKey" type="password" autocomplete="new-password"/>
            </el-form-item>
            <el-form-item label="模型" :label-width="formLabelWidth">
                <el-select v-model="form.aiModel" default="gpt-4o">
                    <el-option label="ChatGPT" value="gpt-4o-mini"/>
                    <el-option label="DeepSeek" value="deepseek-chat"/>
                </el-select>
            </el-form-item>
            <el-form-item label="提示语" :label-width="formLabelWidth">
                <el-input v-model="form.aiPrompt"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div>
                <el-button @click="$globalState.settingVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmit">保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, inject } from 'vue'
import Cookies from 'js-cookie'
import { CHAT_GPT_SECRET_KEY, DEEP_SEEK_SECRET_KEY, AI_MODEL_KEY, AI_PROMPT_KEY } from '@/constants/constant'

const $globalState = inject('$globalState')

const formLabelWidth = '110'

const form = reactive({
    chatGptSecretKey: Cookies.get(CHAT_GPT_SECRET_KEY) ?? '',
    deepSeekSecretKey: Cookies.get(DEEP_SEEK_SECRET_KEY) ?? '',
    aiModel: Cookies.get(AI_MODEL_KEY) ?? 'gpt-4o-mini',
    aiPrompt: Cookies.get(AI_PROMPT_KEY) ?? ''
})

const onSubmit = () => {
    $globalState.settingVisible = false
    Cookies.set(CHAT_GPT_SECRET_KEY, form.chatGptSecretKey, { expires: 7 })
    Cookies.set(DEEP_SEEK_SECRET_KEY, form.deepSeekSecretKey, { expires: 7 })
    Cookies.set(AI_MODEL_KEY, form.aiModel, { expires: 7 })
    Cookies.set(AI_PROMPT_KEY, form.aiPrompt, { expires: 7 })
}
</script>
